import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { actionButton, appBaseUrl, sendBookAnInstructorEmail } from "../../../../lib/email";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type ReviewRole = "client" | "instructor";

type Agreement = {
  id: string;
  request_id: string;
  client_user_id: string | null;
  instructor_id: string;
  instructor_user_id: string | null;
  client_name: string | null;
  instructor_name: string | null;
  job_title: string | null;
  class_completed_at: string | null;
  client_review_submitted_at: string | null;
  instructor_review_submitted_at: string | null;
  request?: { client_email: string | null } | { client_email: string | null }[] | null;
  instructor?: { email: string | null } | { email: string | null }[] | null;
};

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

async function sendReviewsCompletedEmail(agreement: Agreement) {
  const requestData = one(agreement.request);
  const instructorData = one(agreement.instructor);
  const agreementUrl = `${appBaseUrl}/agreements/${agreement.id}`;
  const subject = `Reviews completed for ${agreement.job_title || "your booking"}`;

  await Promise.all([
    sendBookAnInstructorEmail({
      to: requestData?.client_email,
      subject,
      html: `<h1>Reviews completed</h1><p>Thanks, both post-class reviews have now been submitted.</p><p>BookAnInstructor will review the booking and finalise the instructor payout process.</p>${actionButton("View agreement", agreementUrl)}`,
      text: `Reviews completed. BookAnInstructor will now review the booking and finalise the instructor payout process. View agreement: ${agreementUrl}`,
    }),
    sendBookAnInstructorEmail({
      to: instructorData?.email,
      subject,
      html: `<h1>Reviews completed</h1><p>Thanks, both post-class reviews have now been submitted.</p><p>BookAnInstructor will review the booking and finalise the payout process.</p>${actionButton("View agreement", agreementUrl)}`,
      text: `Reviews completed. BookAnInstructor will now review the booking and finalise the payout process. View agreement: ${agreementUrl}`,
    }),
  ]);
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
  const { agreementId, role, rating, comment, reviewerName, highlights } = (await request.json()) as {
    agreementId?: string;
    role?: ReviewRole;
    rating?: number;
    comment?: string;
    reviewerName?: string;
    highlights?: string[];
  };

  if (!agreementId || !role || !rating) {
    return NextResponse.json({ error: "Please complete the review." }, { status: 400 });
  }

  if (!["client", "instructor"].includes(role)) {
    return NextResponse.json({ error: "Invalid review type." }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  if (!Array.isArray(highlights) || highlights.length !== 5) {
    return NextResponse.json(
      { error: "Please choose exactly 5 review highlights." },
      { status: 400 }
    );
  }

  const cleanHighlights = [...new Set(highlights.map((item) => item.trim()).filter(Boolean))];

  if (cleanHighlights.length !== 5) {
    return NextResponse.json(
      { error: "Please choose 5 different review highlights." },
      { status: 400 }
    );
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Review setup is missing Supabase service credentials." },
      { status: 500 }
    );
  }

  const user = await getSignedInUser(request);
  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase
    .from("booking_agreements")
    .select("id,request_id,client_user_id,instructor_id,instructor_user_id,client_name,instructor_name,job_title,class_completed_at,client_review_submitted_at,instructor_review_submitted_at,request:client_requests(client_email),instructor:instructors(email)")
    .eq("id", agreementId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Agreement not found." },
      { status: 404 }
    );
  }

  const agreement = data as Agreement;

  if (!agreement.class_completed_at) {
    return NextResponse.json(
      { error: "Reviews can only be submitted after the class is completed." },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  if (role === "client") {
    if (agreement.client_user_id !== user.id) {
      return NextResponse.json(
        { error: "Only the booked client can review this instructor." },
        { status: 403 }
      );
    }

    if (agreement.client_review_submitted_at) {
      return NextResponse.json(
        { error: "The client review has already been submitted for this booking." },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase.from("reviews").insert({
      instructor_id: agreement.instructor_id,
      reviewer_name: reviewerName || agreement.client_name || "Client",
      reviewer_type: "client",
      rating,
      review_tags: cleanHighlights,
      comment: comment?.trim() || null,
      published: true,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    if (agreement.instructor_review_submitted_at) {
      await supabase
        .from("booking_agreements")
        .update({
          client_review_submitted_at: now,
          payout_status: "ready_for_review",
          payout_ready_at: now,
          updated_at: now,
        })
        .eq("id", agreement.id);
      await sendReviewsCompletedEmail(agreement);
    } else {
      await supabase
        .from("booking_agreements")
        .update({
          client_review_submitted_at: now,
          payout_status: "awaiting_instructor_review",
          updated_at: now,
        })
        .eq("id", agreement.id);
    }

    return NextResponse.json({ submitted: true });
  }

  if (agreement.instructor_user_id !== user.id) {
    return NextResponse.json(
      { error: "Only the booked instructor can review this client." },
      { status: 403 }
    );
  }

  if (agreement.instructor_review_submitted_at) {
    return NextResponse.json(
      { error: "The instructor review has already been submitted for this booking." },
      { status: 400 }
    );
  }

  const { error: insertError } = await supabase.from("client_reviews").insert({
    agreement_id: agreement.id,
    request_id: agreement.request_id,
    client_user_id: agreement.client_user_id,
    instructor_id: agreement.instructor_id,
    instructor_user_id: agreement.instructor_user_id,
    client_name: agreement.client_name || "Client",
    reviewer_name: reviewerName || agreement.instructor_name || "Instructor",
    rating,
    review_tags: cleanHighlights,
    comment: comment?.trim() || null,
    published: false,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  if (agreement.client_review_submitted_at) {
    await supabase
      .from("booking_agreements")
      .update({
        instructor_review_submitted_at: now,
        payout_status: "ready_for_review",
        payout_ready_at: now,
        updated_at: now,
      })
      .eq("id", agreement.id);
    await sendReviewsCompletedEmail(agreement);
  } else {
    await supabase
      .from("booking_agreements")
      .update({
        instructor_review_submitted_at: now,
        payout_status: "awaiting_client_review",
        updated_at: now,
      })
      .eq("id", agreement.id);
  }

  return NextResponse.json({ submitted: true });
}
