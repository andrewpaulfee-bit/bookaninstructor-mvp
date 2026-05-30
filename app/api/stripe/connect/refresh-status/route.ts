import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

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
    .select("id,user_id,email,stripe_connect_account_id")
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

  if (!instructor.stripe_connect_account_id) {
    return NextResponse.json({ updated: false, reason: "No Stripe account yet." });
  }

  const stripeResponse = await fetch(
    `https://api.stripe.com/v1/accounts/${encodeURIComponent(instructor.stripe_connect_account_id)}`,
    {
      method: "GET",
      headers: {
        Authorization: stripeAuthHeader(),
      },
    }
  );
  const stripeData = await stripeResponse.json();

  if (!stripeResponse.ok) {
    return NextResponse.json(
      { error: stripeData?.error?.message || "Could not refresh Stripe Connect status." },
      { status: 502 }
    );
  }

  const requirementsDue = stripeData.requirements?.currently_due || [];

  await supabase
    .from("instructors")
    .update({
      stripe_connect_onboarding_complete: Boolean(stripeData.details_submitted),
      stripe_connect_charges_enabled: Boolean(stripeData.charges_enabled),
      stripe_connect_payouts_enabled: Boolean(stripeData.payouts_enabled),
      stripe_connect_requirements_due: requirementsDue,
      stripe_connect_updated_at: new Date().toISOString(),
    })
    .eq("id", instructor.id);

  return NextResponse.json({
    updated: true,
    onboardingComplete: Boolean(stripeData.details_submitted),
    chargesEnabled: Boolean(stripeData.charges_enabled),
    payoutsEnabled: Boolean(stripeData.payouts_enabled),
    requirementsDue,
  });
}
