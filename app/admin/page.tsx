"use client";

import { useEffect, useMemo, useState } from "react";
import AdminGate from "../../components/AdminGate";
import Nav from "../../components/Nav";
import { supabase } from "../../lib/supabase";

type ClientRequest = {
  id: string;
  created_at: string;
  title: string | null;
  budget: number | null;
  total_hours: number | null;
  style: string | null;
  class_level: string | null;
  style_levels: Array<{ style: string; class_level?: string }> | null;
  class_frequency: string | null;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
  client_name: string;
  client_email: string;
  mobile: string | null;
  category: string;
  location: string | null;
  event_date: string | null;
  details: string | null;
  terms_accepted: boolean | null;
  image_urls: string[] | null;
  selected_instructor_id: string | null;
  selected_instructor?: { name: string } | null;
  status: string;
};

type Instructor = {
  id: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  name: string;
  email: string;
  location: string | null;
  country: string | null;
  categories: string[] | null;
  bio: string | null;
  hourly_rate: number | null;
  date_of_birth: string | null;
  mobile: string | null;
  abn: string | null;
  registered_for_gst: boolean | null;
  service_areas: string[] | null;
  headshot_url: string | null;
  cv_url: string | null;
  profile_video_url: string | null;
  working_with_children_card: string | null;
  working_with_children_expiry: string | null;
  terms_accepted: boolean | null;
  approved: boolean;
  review_status: string | null;
  review_notes: string | null;
};

type Agreement = {
  id: string;
  contract_number: string | null;
  request_id: string;
  job_title: string | null;
  client_name: string | null;
  client_organisation: string | null;
  instructor_name: string | null;
  total_fee: number | null;
  instructor_payout: number | null;
  payment_status: string | null;
  class_completed_at: string | null;
  client_review_submitted_at: string | null;
  instructor_review_submitted_at: string | null;
  payout_status: string | null;
  payout_approved_at: string | null;
  payout_paid_at: string | null;
  payout_reference: string | null;
  payout_notes: string | null;
  payout_method: string | null;
  stripe_transfer_id: string | null;
};

export default function Admin() {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payoutMessages, setPayoutMessages] = useState<Record<string, string>>({});
  const [payoutErrors, setPayoutErrors] = useState<Record<string, string>>({});
  const [payoutReferences, setPayoutReferences] = useState<Record<string, string>>({});
  const [payoutNotes, setPayoutNotes] = useState<Record<string, string>>({});
  const [savingPayoutId, setSavingPayoutId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAdminData() {
      const [requestResult, instructorResult, agreementResult] = await Promise.all([
        supabase
        .from("client_requests")
        .select("*, selected_instructor:instructors(name)")
          .order("created_at", { ascending: false }),
        supabase
          .from("instructors")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("booking_agreements")
          .select("id,contract_number,request_id,job_title,client_name,client_organisation,instructor_name,total_fee,instructor_payout,payment_status,class_completed_at,client_review_submitted_at,instructor_review_submitted_at,payout_status")
          .order("created_at", { ascending: false }),
      ]);

      if (requestResult.error || instructorResult.error || agreementResult.error) {
        setError(
          requestResult.error?.message ||
            instructorResult.error?.message ||
            agreementResult.error?.message ||
            "Could not load admin data."
        );
      } else {
        setRequests(requestResult.data || []);
        setInstructors(instructorResult.data || []);
        setAgreements(
          ((agreementResult.data || []) as Omit<
          Agreement,
            | "payout_approved_at"
            | "payout_paid_at"
            | "payout_reference"
            | "payout_notes"
            | "payout_method"
            | "stripe_transfer_id"
          >[]).map((agreement) => ({
            ...agreement,
            payout_approved_at: null,
            payout_paid_at: null,
            payout_reference: null,
            payout_notes: null,
            payout_method: null,
            stripe_transfer_id: null,
          }))
        );
      }

      setLoading(false);
    }

    loadAdminData();
  }, []);

  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === "pending_review"),
    [requests]
  );
  const pendingInstructors = useMemo(
    () =>
      instructors.filter(
        (instructor) =>
          (instructor.review_status || (instructor.approved ? "approved" : "pending_review")) ===
          "pending_review"
      ),
    [instructors]
  );
  const activeBookings = useMemo(
    () =>
      requests.filter((request) =>
        ["instructor_selected", "booking_confirmed"].includes(request.status)
      ),
    [requests]
  );
  const payoutQueueAgreements = useMemo(
    () =>
      agreements.filter(
        (agreement) =>
          agreement.payment_status === "paid" &&
          agreement.class_completed_at &&
          agreement.client_review_submitted_at &&
          agreement.instructor_review_submitted_at &&
          agreement.payout_status !== "paid"
      ),
    [agreements]
  );
  const reviewQueueAgreements = useMemo(
    () =>
      agreements.filter(
        (agreement) =>
          agreement.payment_status === "paid" &&
          agreement.class_completed_at &&
          (!agreement.client_review_submitted_at || !agreement.instructor_review_submitted_at) &&
          ["awaiting_client_review", "awaiting_instructor_review", "not_ready"].includes(
            agreement.payout_status || "not_ready"
          )
      ),
    [agreements]
  );
  const completedAgreements = useMemo(
    () =>
      agreements.filter(
        (agreement) =>
          agreement.payment_status === "paid" &&
          agreement.class_completed_at &&
          agreement.payout_status === "paid"
      ),
    [agreements]
  );
  const recentSubmissions = useMemo(
    () =>
      [
        ...requests.map((request) => ({
          id: request.id,
          created_at: request.created_at,
          title: request.title || request.client_name,
          subtitle: request.location || request.client_email,
          status: request.status,
          href: `/admin/jobs/${request.id}`,
          kind: "Job",
        })),
        ...instructors.map((instructor) => ({
          id: instructor.id,
          created_at: instructor.created_at,
          title: instructor.name,
          subtitle: instructor.location || instructor.email,
          status:
            instructor.review_status || (instructor.approved ? "approved" : "pending_review"),
          href: `/admin/instructors/${instructor.id}`,
          kind: "Instructor",
        })),
      ]
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
        .slice(0, 6),
    [requests, instructors]
  );

  async function updatePayout(agreementId: string, action: "approve" | "mark_paid") {
    setSavingPayoutId(agreementId);
    setPayoutMessages((current) => ({ ...current, [agreementId]: "" }));
    setPayoutErrors((current) => ({ ...current, [agreementId]: "" }));

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      setPayoutErrors((current) => ({
        ...current,
        [agreementId]: "Please sign in before updating payout status.",
      }));
      setSavingPayoutId(null);
      return;
    }

    const response = await fetch("/api/payouts/update", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agreementId,
        action,
        reference: payoutReferences[agreementId],
        notes: payoutNotes[agreementId],
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setPayoutErrors((current) => ({
        ...current,
        [agreementId]: result.error || "Could not update payout.",
      }));
      setSavingPayoutId(null);
      return;
    }

    setAgreements((current) =>
      current.map((agreement) =>
        agreement.id === agreementId ? { ...agreement, ...result.agreement } : agreement
      )
    );
    setPayoutMessages((current) => ({
      ...current,
      [agreementId]:
        action === "approve"
          ? "Payout approved. You can now mark it as paid once the manual payment is sent."
          : result.email?.sent
            ? "Payout marked as paid. Email notification sent to the instructor."
            : result.email?.skipped
              ? `Payout marked as paid. Email notification skipped: ${result.email.reason || "No reason supplied."}`
              : result.email?.error
                ? `Payout marked as paid. Email notification failed: ${result.email.error}`
                : "Payout marked as paid.",
    }));
    setSavingPayoutId(null);
  }

  async function releaseStripePayout(agreementId: string) {
    setSavingPayoutId(agreementId);
    setPayoutMessages((current) => ({ ...current, [agreementId]: "" }));
    setPayoutErrors((current) => ({ ...current, [agreementId]: "" }));

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      setPayoutErrors((current) => ({
        ...current,
        [agreementId]: "Please sign in before releasing payout.",
      }));
      setSavingPayoutId(null);
      return;
    }

    const response = await fetch("/api/payouts/release-stripe", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agreementId }),
    });
    const result = await response.json();

    if (!response.ok) {
      setPayoutErrors((current) => ({
        ...current,
        [agreementId]: result.error || "Could not release Stripe payout.",
      }));
      setSavingPayoutId(null);
      return;
    }

    setAgreements((current) =>
      current.map((agreement) =>
        agreement.id === agreementId ? { ...agreement, ...result.agreement } : agreement
      )
    );
    setPayoutMessages((current) => ({
      ...current,
      [agreementId]: `Stripe payout released. Transfer: ${result.transferId}`,
    }));
    setSavingPayoutId(null);
  }

  return (
    <main className="container">
      <Nav />

      <AdminGate>
      <section className="pageHeader">
        <p className="eyebrow">Admin</p>
        <h1>Admin dashboard</h1>
        <p>Review pending jobs, approve instructor profiles, and keep an eye on active bookings.</p>
      </section>

      {loading && <p>Loading admin data...</p>}
      {error && <p className="formMessage error">{error}</p>}

      <section className="adminStats" aria-label="Admin summary">
        <a className="adminStatCard" href="#pending-jobs">
          <span>Pending jobs</span>
          <strong>{pendingRequests.length}</strong>
          <small>Need review before public release</small>
        </a>
        <a className="adminStatCard" href="#pending-instructors">
          <span>Pending instructors</span>
          <strong>{pendingInstructors.length}</strong>
          <small>Need profile approval</small>
        </a>
        <a className="adminStatCard" href="#active-bookings">
          <span>Active bookings</span>
          <strong>{activeBookings.length}</strong>
          <small>Selected or confirmed instructors</small>
        </a>
        <a className="adminStatCard" href="#ready-for-payout">
          <span>Payout review</span>
          <strong>{payoutQueueAgreements.length}</strong>
          <small>Bookings ready for payout review</small>
        </a>
        <a className="adminStatCard" href="#awaiting-reviews">
          <span>Awaiting reviews</span>
          <strong>{reviewQueueAgreements.length}</strong>
          <small>Completed bookings waiting on client review</small>
        </a>
        <a className="adminStatCard" href="#completed-bookings">
          <span>Completed bookings</span>
          <strong>{completedAgreements.length}</strong>
          <small>Finished bookings with payout marked paid</small>
        </a>
      </section>

      <section className="adminSection" id="pending-jobs">
        <div className="sectionTitle">
          <h2>Pending job approvals</h2>
          <span className="statusBadge">{pendingRequests.length}</span>
        </div>

        <div className="requestList">
          {pendingRequests.map((request) => (
            <article className="requestCard compactRequestCard" key={request.id}>
              <div>
                <h2>{request.title || request.client_name}</h2>
                <p>
                  {request.style || request.category}
                  {request.location ? ` · ${request.location}` : ""}
                </p>
              </div>

              <span className="statusBadge">{request.status}</span>
              <a className="secondaryButton" href={`/admin/jobs/${request.id}`}>
                Review job
              </a>

              <dl>
                <div>
                  <dt>Client</dt>
                  <dd>{request.client_name}</dd>
                </div>
                <div>
                  <dt>Company/School/Business</dt>
                  <dd>{request.company_name || "Not supplied"}</dd>
                </div>
                <div>
                  <dt>Budget</dt>
                  <dd>{request.budget ? `$${request.budget}` : "Not supplied"}</dd>
                </div>
                <div>
                  <dt>Hourly rate</dt>
                  <dd>
                    {request.budget && request.total_hours
                      ? `$${(request.budget / request.total_hours).toFixed(2)}/hr`
                      : "Not supplied"}
                  </dd>
                </div>
                <div>
                  <dt>Details</dt>
                  <dd>{request.details || "No details supplied"}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        {!loading && pendingRequests.length === 0 && !error && (
          <p>No jobs waiting for approval.</p>
        )}
      </section>

      <section className="adminSection" id="pending-instructors">
        <div className="sectionTitle">
          <h2>Pending instructor approvals</h2>
          <span className="statusBadge">{pendingInstructors.length}</span>
        </div>

        <div className="requestList">
          {pendingInstructors.map((instructor) => (
            <article className="requestCard compactRequestCard" key={instructor.id}>
              <div>
                <h2>{instructor.name}</h2>
                <p>
                  {instructor.categories?.join(", ") || "No categories supplied"}
                  {instructor.location ? ` · ${instructor.location}` : ""}
                </p>
              </div>

              <span className="statusBadge">
                {instructor.review_status || (instructor.approved ? "approved" : "pending_review")}
              </span>
              <a className="secondaryButton" href={`/admin/instructors/${instructor.id}`}>
                Review instructor
              </a>

              <dl>
                <div>
                  <dt>Email</dt>
                  <dd>{instructor.email}</dd>
                </div>
                <div>
                  <dt>Mobile</dt>
                  <dd>{instructor.mobile || "Not supplied"}</dd>
                </div>
                <div>
                  <dt>Country</dt>
                  <dd>{instructor.country || "Not supplied"}</dd>
                </div>
                <div>
                  <dt>Hourly rate</dt>
                  <dd>
                    {instructor.hourly_rate
                      ? `$${instructor.hourly_rate}/hr`
                      : "Not supplied"}
                  </dd>
                </div>
                <div>
                  <dt>Categories</dt>
                  <dd>
                    {instructor.categories?.length ? instructor.categories.join(", ") : "Not supplied"}
                  </dd>
                </div>
                <div>
                  <dt>Files</dt>
                  <dd className="fileLinks">
                    {instructor.headshot_url && (
                      <a href={instructor.headshot_url} target="_blank">
                        Head shot
                      </a>
                    )}
                    {instructor.cv_url && (
                      <a href={instructor.cv_url} target="_blank">
                        CV
                      </a>
                    )}
                    {instructor.profile_video_url && (
                      <a href={instructor.profile_video_url} target="_blank">
                        Video
                      </a>
                    )}
                    {!instructor.headshot_url &&
                      !instructor.cv_url &&
                      !instructor.profile_video_url &&
                      "No files supplied"}
                  </dd>
                </div>
                <div>
                  <dt>Bio</dt>
                  <dd>{instructor.bio || "No bio supplied"}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        {!loading && pendingInstructors.length === 0 && !error && (
          <p>No instructors waiting for approval.</p>
        )}
      </section>

      <section className="adminSection" id="awaiting-reviews">
        <div className="sectionTitle">
          <h2>Awaiting reviews</h2>
          <span className="statusBadge">{reviewQueueAgreements.length}</span>
        </div>

        <div className="adminQuickGrid">
          {reviewQueueAgreements.map((agreement) => (
            <article className="requestCard compactRequestCard" key={agreement.id}>
              <div>
                <h2>{agreement.job_title || "Completed booking"}</h2>
                <p>
                  {agreement.client_organisation || agreement.client_name || "Client"}
                  {" · "}
                  {agreement.instructor_name || "Instructor"}
                </p>
              </div>
              <span className="statusBadge">{agreement.payout_status}</span>
              <dl>
                <div>
                  <dt>Contract</dt>
                  <dd>{agreement.contract_number || agreement.id.slice(0, 8)}</dd>
                </div>
                <div>
                  <dt>Client review</dt>
                  <dd>
                    {agreement.client_review_submitted_at
                      ? `Submitted ${new Date(agreement.client_review_submitted_at).toLocaleDateString("en-AU")}`
                      : "Waiting"}
                  </dd>
                </div>
                <div>
                  <dt>Instructor review</dt>
                  <dd>
                    {agreement.instructor_review_submitted_at
                      ? `Submitted ${new Date(agreement.instructor_review_submitted_at).toLocaleDateString("en-AU")}`
                      : "Waiting"}
                  </dd>
                </div>
              </dl>
              <a className="secondaryButton" href={`/agreements/${agreement.id}`}>
                View agreement
              </a>
            </article>
          ))}
        </div>

        {!loading && reviewQueueAgreements.length === 0 && !error && (
          <p>No completed bookings waiting on client reviews.</p>
        )}
      </section>

      <section className="adminSection" id="ready-for-payout">
        <div className="sectionTitle">
          <h2>Ready for payout</h2>
          <span className="statusBadge">{payoutQueueAgreements.length}</span>
        </div>

        <div className="adminQuickGrid">
          {payoutQueueAgreements.map((agreement) => (
            <article className="requestCard compactRequestCard" key={agreement.id}>
              <div>
                <h2>{agreement.job_title || "Completed booking"}</h2>
                <p>
                  {agreement.client_organisation || agreement.client_name || "Client"}
                  {" · "}
                  {agreement.instructor_name || "Instructor"}
                </p>
              </div>
              <span className="statusBadge">
                {agreement.payout_status === "approved" ? "approved" : "ready_for_review"}
              </span>
              <dl>
                <div>
                  <dt>Contract</dt>
                  <dd>{agreement.contract_number || agreement.id.slice(0, 8)}</dd>
                </div>
                <div>
                  <dt>Total fee</dt>
                  <dd>{agreement.total_fee ? `$${agreement.total_fee}` : "Not supplied"}</dd>
                </div>
                <div>
                  <dt>Instructor payout</dt>
                  <dd>{agreement.instructor_payout ? `$${agreement.instructor_payout}` : "Not supplied"}</dd>
                </div>
                <div>
                  <dt>Completed</dt>
                  <dd>
                    {agreement.class_completed_at
                      ? new Date(agreement.class_completed_at).toLocaleString("en-AU")
                      : "Not supplied"}
                  </dd>
                </div>
                <div>
                  <dt>Client review</dt>
                  <dd>
                    {agreement.client_review_submitted_at
                      ? `Submitted ${new Date(agreement.client_review_submitted_at).toLocaleDateString("en-AU")}`
                      : "Waiting"}
                  </dd>
                </div>
                <div>
                  <dt>Instructor review</dt>
                  <dd>
                    {agreement.instructor_review_submitted_at
                      ? `Submitted ${new Date(agreement.instructor_review_submitted_at).toLocaleDateString("en-AU")}`
                      : "Waiting"}
                  </dd>
                </div>
              </dl>
              {agreement.payout_status === "approved" && (
                <div className="payoutFields">
                  <label>
                    Payout reference
                    <input
                      value={payoutReferences[agreement.id] ?? agreement.payout_reference ?? ""}
                      onChange={(event) =>
                        setPayoutReferences((current) => ({
                          ...current,
                          [agreement.id]: event.target.value,
                        }))
                      }
                      placeholder="Stripe transfer, bank ref, or note"
                    />
                  </label>
                  <label>
                    Payout notes
                    <textarea
                      value={payoutNotes[agreement.id] ?? agreement.payout_notes ?? ""}
                      onChange={(event) =>
                        setPayoutNotes((current) => ({
                          ...current,
                          [agreement.id]: event.target.value,
                        }))
                      }
                      placeholder="Optional internal notes"
                      rows={3}
                    />
                  </label>
                </div>
              )}
              {payoutMessages[agreement.id] && (
                <p className="formMessage">{payoutMessages[agreement.id]}</p>
              )}
              {payoutErrors[agreement.id] && (
                <p className="formMessage error">{payoutErrors[agreement.id]}</p>
              )}
              <div className="buttonRow">
                <a className="secondaryButton" href={`/agreements/${agreement.id}`}>
                  View agreement
                </a>
                {agreement.payout_status !== "approved" && (
                  <button
                    className="btn"
                    type="button"
                    disabled={savingPayoutId === agreement.id}
                    onClick={() => releaseStripePayout(agreement.id)}
                  >
                    {savingPayoutId === agreement.id ? "Releasing..." : "Release via Stripe"}
                  </button>
                )}
                {agreement.payout_status !== "approved" && (
                  <button
                    className="secondaryButton"
                    type="button"
                    disabled={savingPayoutId === agreement.id}
                    onClick={() => updatePayout(agreement.id, "approve")}
                  >
                    Approve manual payout
                  </button>
                )}
                {agreement.payout_status === "approved" && (
                  <button
                    className="btn"
                    type="button"
                    disabled={savingPayoutId === agreement.id}
                    onClick={() => updatePayout(agreement.id, "mark_paid")}
                  >
                    {savingPayoutId === agreement.id ? "Saving..." : "Mark payout paid"}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        {!loading && payoutQueueAgreements.length === 0 && !error && (
          <p>No bookings ready for payout review.</p>
        )}
      </section>

      <section className="adminSection" id="active-bookings">
        <div className="sectionTitle">
          <h2>Active bookings</h2>
          <span className="statusBadge">{activeBookings.length}</span>
        </div>

        <div className="adminQuickGrid">
          {activeBookings.map((request) => (
            <article className="requestCard compactRequestCard" key={request.id}>
              <div>
                <h2>{request.title || request.client_name}</h2>
                <p>
                  {request.selected_instructor?.name
                    ? `Instructor: ${request.selected_instructor.name}`
                    : "Instructor selected"}
                </p>
              </div>
              <span className="statusBadge">{request.status}</span>
              <a className="secondaryButton" href={`/admin/jobs/${request.id}`}>
                View booking
              </a>
            </article>
          ))}
        </div>

        {!loading && activeBookings.length === 0 && !error && (
          <p>No selected or confirmed bookings yet.</p>
        )}
      </section>

      <section className="adminSection" id="completed-bookings">
        <div className="sectionTitle">
          <h2>Completed bookings</h2>
          <span className="statusBadge">{completedAgreements.length}</span>
        </div>

        <div className="adminQuickGrid">
          {completedAgreements.map((agreement) => (
            <article className="requestCard compactRequestCard" key={agreement.id}>
              <div>
                <h2>{agreement.job_title || "Completed booking"}</h2>
                <p>
                  {agreement.client_organisation || agreement.client_name || "Client"}
                  {" · "}
                  {agreement.instructor_name || "Instructor"}
                </p>
              </div>
              <span className="statusBadge">completed</span>
              <dl>
                <div>
                  <dt>Contract</dt>
                  <dd>{agreement.contract_number || agreement.id.slice(0, 8)}</dd>
                </div>
                <div>
                  <dt>Total fee</dt>
                  <dd>{agreement.total_fee ? `$${agreement.total_fee}` : "Not supplied"}</dd>
                </div>
                <div>
                  <dt>Instructor payout</dt>
                  <dd>{agreement.instructor_payout ? `$${agreement.instructor_payout}` : "Not supplied"}</dd>
                </div>
                <div>
                  <dt>Class completed</dt>
                  <dd>
                    {agreement.class_completed_at
                      ? new Date(agreement.class_completed_at).toLocaleString("en-AU")
                      : "Not supplied"}
                  </dd>
                </div>
                <div>
                  <dt>Client review</dt>
                  <dd>
                    {agreement.client_review_submitted_at
                      ? `Submitted ${new Date(agreement.client_review_submitted_at).toLocaleDateString("en-AU")}`
                      : "Not submitted"}
                  </dd>
                </div>
                <div>
                  <dt>Instructor review</dt>
                  <dd>
                    {agreement.instructor_review_submitted_at
                      ? `Submitted ${new Date(agreement.instructor_review_submitted_at).toLocaleDateString("en-AU")}`
                      : "Not submitted"}
                  </dd>
                </div>
                <div>
                  <dt>Payout</dt>
                  <dd>{agreement.payout_reference || agreement.payout_method || "Paid"}</dd>
                </div>
              </dl>
              <a className="secondaryButton" href={`/agreements/${agreement.id}`}>
                View agreement
              </a>
            </article>
          ))}
        </div>

        {!loading && completedAgreements.length === 0 && !error && (
          <p>No completed bookings yet.</p>
        )}
      </section>

      <section className="adminSection">
        <div className="sectionTitle">
          <h2>Recent submissions</h2>
          <span className="statusBadge">{recentSubmissions.length}</span>
        </div>

        <div className="adminQuickGrid">
          {recentSubmissions.map((item) => (
            <article className="requestCard compactRequestCard" key={`${item.kind}-${item.id}`}>
              <div>
                <p className="eyebrow">{item.kind}</p>
                <h2>{item.title}</h2>
                <p>{item.subtitle || "No location supplied"}</p>
              </div>
              <span className="statusBadge">{item.status}</span>
              <a className="secondaryButton" href={item.href}>
                Open
              </a>
            </article>
          ))}
        </div>
      </section>
      </AdminGate>
    </main>
  );
}
