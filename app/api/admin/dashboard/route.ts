import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function getSignedInUser(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data } = await supabase.auth.getUser(token);
  return data.user || null;
}

export async function GET(request: Request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Admin dashboard setup is missing Supabase service credentials." },
      { status: 500 }
    );
  }

  const user = await getSignedInUser(request);
  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message || "Could not verify admin access." },
      { status: 500 }
    );
  }

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const [requestResult, instructorResult, agreementResult] = await Promise.all([
    supabase
      .from("client_requests")
      .select("*, selected_instructor:instructors(name)")
      .order("created_at", { ascending: false }),
    supabase.from("instructors").select("*").order("created_at", { ascending: false }),
    supabase
      .from("booking_agreements")
      .select(
        "id,contract_number,request_id,job_title,client_name,client_organisation,instructor_name,total_fee,instructor_payout,payment_status,class_completed_at,client_review_submitted_at,instructor_review_submitted_at,payout_status"
      )
      .order("created_at", { ascending: false }),
  ]);

  const error =
    requestResult.error?.message ||
    instructorResult.error?.message ||
    agreementResult.error?.message;

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({
    requests: requestResult.data || [],
    instructors: instructorResult.data || [],
    agreements: agreementResult.data || [],
  });
}
