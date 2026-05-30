import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

type Instructor = {
  id: string;
  user_id: string | null;
  email: string;
  country: string | null;
  stripe_connect_account_id: string | null;
};

function stripeAuthHeader() {
  return `Basic ${Buffer.from(`${stripeSecretKey}:`).toString("base64")}`;
}

async function getSignedInUser(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data } = await supabase.auth.getUser(token);
  return data.user || null;
}

export async function POST(request: Request) {
  if (!supabaseUrl || !serviceRoleKey || !stripeSecretKey) {
    return NextResponse.json(
      {
        error:
          "Stripe Connect setup is missing. Add SUPABASE_SERVICE_ROLE_KEY and STRIPE_SECRET_KEY to .env.local.",
      },
      { status: 500 }
    );
  }

  const user = await getSignedInUser(request);
  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: instructor, error } = await supabase
    .from("instructors")
    .select("id,user_id,email,country,stripe_connect_account_id")
    .or(`user_id.eq.${user.id},email.eq.${user.email}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !instructor) {
    return NextResponse.json(
      { error: error?.message || "Instructor profile not found." },
      { status: 404 }
    );
  }

  const instructorRow = instructor as Instructor;

  if (instructorRow.stripe_connect_account_id) {
    return NextResponse.json({ accountId: instructorRow.stripe_connect_account_id });
  }

  const country = instructorRow.country === "New Zealand" ? "NZ" : "AU";
  const params = new URLSearchParams();
  params.set("type", "express");
  params.set("country", country);
  params.set("email", instructorRow.email);
  params.set("capabilities[transfers][requested]", "true");
  params.set("business_type", "individual");
  params.set("metadata[instructor_id]", instructorRow.id);
  params.set("metadata[user_id]", user.id);

  const stripeResponse = await fetch("https://api.stripe.com/v1/accounts", {
    method: "POST",
    headers: {
      Authorization: stripeAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const stripeData = await stripeResponse.json();

  if (!stripeResponse.ok) {
    const stripeMessage = stripeData?.error?.message || "Could not create Stripe Connect account.";
    const needsPlatformConnectSetup =
      stripeMessage.toLowerCase().includes("signed up for connect") ||
      stripeMessage.toLowerCase().includes("dashboard.stripe.com/connect");

    return NextResponse.json(
      {
        error: needsPlatformConnectSetup
          ? "BookAnInstructor Stripe Connect needs to be activated before instructor payouts can be set up."
          : stripeMessage,
        setupUrl: needsPlatformConnectSetup ? "https://dashboard.stripe.com/connect" : null,
      },
      { status: 502 }
    );
  }

  await supabase
    .from("instructors")
    .update({
      stripe_connect_account_id: stripeData.id,
      stripe_connect_onboarding_complete: Boolean(stripeData.details_submitted),
      stripe_connect_charges_enabled: Boolean(stripeData.charges_enabled),
      stripe_connect_payouts_enabled: Boolean(stripeData.payouts_enabled),
      stripe_connect_requirements_due: stripeData.requirements?.currently_due || [],
      stripe_connect_updated_at: new Date().toISOString(),
    })
    .eq("id", instructorRow.id);

  return NextResponse.json({ accountId: stripeData.id });
}
