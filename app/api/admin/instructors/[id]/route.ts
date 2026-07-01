import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

type InstructorUpdate = {
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  mobile?: string | null;
  location?: string | null;
  country?: string | null;
  bio?: string | null;
  hourly_rate?: number | null;
  date_of_birth?: string | null;
  abn?: string | null;
  registered_for_gst?: boolean;
  working_with_children_card?: string | null;
  working_with_children_expiry?: string | null;
  categories?: string[];
  service_areas?: string[];
  approved?: boolean;
  review_status?: string;
  review_notes?: string | null;
};

async function getSignedInUser(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data } = await supabase.auth.getUser(token);
  return data.user || null;
}

async function getAdminClient(request: Request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return {
      error: NextResponse.json(
        { error: "Admin instructor setup is missing Supabase service credentials." },
        { status: 500 }
      ),
    };
  }

  const user = await getSignedInUser(request);
  if (!user) {
    return {
      error: NextResponse.json({ error: "Please sign in first." }, { status: 401 }),
    };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return {
      error: NextResponse.json(
        { error: profileError.message || "Could not verify admin access." },
        { status: 500 }
      ),
    };
  }

  if (profile?.role !== "admin") {
    return {
      error: NextResponse.json({ error: "Admin access required." }, { status: 403 }),
    };
  }

  return { supabase };
}

async function getInstructorId(context: RouteContext) {
  const params = await context.params;
  return params.id;
}

export async function GET(request: Request, context: RouteContext) {
  const admin = await getAdminClient(request);
  if (admin.error) return admin.error;

  const id = await getInstructorId(context);
  const { data, error } = await admin.supabase
    .from("instructors")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Instructor not found." },
      { status: error ? 500 : 404 }
    );
  }

  return NextResponse.json({ instructor: data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await getAdminClient(request);
  if (admin.error) return admin.error;

  const id = await getInstructorId(context);
  const body = (await request.json()) as { updates?: InstructorUpdate };
  const updates = body.updates || {};

  const payload: InstructorUpdate = {
    first_name: updates.first_name || "",
    last_name: updates.last_name || "",
    name: updates.name || "",
    email: updates.email || "",
    mobile: updates.mobile || null,
    location: updates.location || null,
    country: updates.country || null,
    bio: updates.bio || null,
    hourly_rate:
      typeof updates.hourly_rate === "number" && Number.isFinite(updates.hourly_rate)
        ? updates.hourly_rate
        : null,
    date_of_birth: updates.date_of_birth || null,
    abn: updates.abn || null,
    registered_for_gst: Boolean(updates.registered_for_gst),
    working_with_children_card: updates.working_with_children_card || null,
    working_with_children_expiry: updates.working_with_children_expiry || null,
    categories: Array.isArray(updates.categories) ? updates.categories : [],
    service_areas: Array.isArray(updates.service_areas) ? updates.service_areas : [],
    approved: Boolean(updates.approved),
    review_status: updates.review_status || "pending_review",
    review_notes: updates.review_notes || null,
  };

  const { data, error } = await admin.supabase
    .from("instructors")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ instructor: data });
}
