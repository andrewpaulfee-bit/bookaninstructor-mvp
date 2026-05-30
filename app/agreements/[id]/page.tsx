"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import AuthGate from "../../../components/AuthGate";
import Nav from "../../../components/Nav";
import { supabase } from "../../../lib/supabase";

type Agreement = {
  id: string;
  created_at: string;
  accepted_at: string | null;
  contract_number: string | null;
  request_id: string;
  offer_id: string;
  client_user_id: string | null;
  instructor_id: string;
  instructor_user_id: string | null;
  status: string | null;
  client_name: string | null;
  client_organisation: string | null;
  instructor_name: string | null;
  job_title: string | null;
  style: string | null;
  class_level: string | null;
  location: string | null;
  booking_details: string | null;
  availability: string | null;
  total_fee: number | null;
  total_hours: number | null;
  hourly_rate: number | null;
  commission_rate: number | null;
  commission_amount: number | null;
  instructor_payout: number | null;
  payment_status: string | null;
  paid_at: string | null;
  class_completed_at: string | null;
  client_review_submitted_at: string | null;
  instructor_review_submitted_at: string | null;
  payout_status: string | null;
  payout_ready_at: string | null;
};

function money(value: number | null) {
  return value === null || value === undefined ? "Not supplied" : `$${Number(value).toFixed(2)}`;
}

function createContractNumber() {
  return Math.floor(Math.random() * 100000000).toString().padStart(8, "0");
}

function shortId(value: string) {
  return value.slice(0, 8).toUpperCase();
}

export default function AgreementPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "confirming">("idle");
  const [completionStatus, setCompletionStatus] = useState<"idle" | "saving">("idle");
  const [message, setMessage] = useState("");

  async function loadAgreement() {
    const { data: sessionData } = await supabase.auth.getSession();
    setCurrentUserId(sessionData.session?.user.id || "");

    const { data, error } = await supabase
      .from("booking_agreements")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();

    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setAgreement(data as Agreement | null);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAgreement();
  }, [params.id]);

  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (payment === "success" && sessionId && agreement?.payment_status !== "paid") {
      confirmPayment(sessionId);
    }

    if (payment === "cancelled") {
      setStatus("error");
      setMessage("Payment was cancelled. You can try again when ready.");
    }
  }, [searchParams, agreement?.id, agreement?.payment_status]);

  async function acceptAgreement() {
    if (!agreement) return;

    setStatus("saving");
    setMessage("");

    const { error } = await supabase
      .from("booking_agreements")
      .update({
        status: "accepted",
        payment_status: "pending",
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", agreement.id);

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("Agreement accepted. Sending payment request to the client...");
    await fetch("/api/payments/request-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agreementId: agreement.id }),
    }).catch(() => null);
    setMessage("Agreement accepted. Payment request sent to the client.");
    loadAgreement();
  }

  const canAccept =
    agreement &&
    currentUserId &&
    agreement.instructor_user_id === currentUserId &&
    agreement.status === "sent";

  const canSendToInstructor =
    agreement &&
    currentUserId &&
    agreement.client_user_id === currentUserId &&
    agreement.status === "draft";

  const canRequestPayment =
    agreement &&
    currentUserId &&
    agreement.client_user_id === currentUserId &&
    agreement.status === "accepted" &&
    agreement.payment_status !== "paid";

  const canCompleteClass =
    agreement &&
    currentUserId &&
    agreement.instructor_user_id === currentUserId &&
    agreement.payment_status === "paid" &&
    !agreement.class_completed_at;

  async function sendToInstructor() {
    if (!agreement) return;

    setStatus("saving");
    setMessage("");

    const { error } = await supabase
      .from("booking_agreements")
      .update({
        status: "sent",
        contract_number: agreement.contract_number || createContractNumber(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", agreement.id);

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    await supabase
      .from("client_requests")
      .update({ status: "agreement_sent" })
      .eq("id", agreement.request_id);

    setStatus("success");
    setMessage("Agreement sent to instructor. Waiting for acceptance.");
    loadAgreement();
  }

  async function startPayment() {
    if (!agreement) return;

    setPaymentStatus("loading");
    setMessage("");
    setStatus("idle");

    const response = await fetch("/api/payments/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agreementId: agreement.id }),
    });
    const data = await response.json();

    if (!response.ok || !data.url) {
      setStatus("error");
      setMessage(data.error || "Could not start payment.");
      setPaymentStatus("idle");
      return;
    }

    window.location.href = data.url;
  }

  async function confirmPayment(sessionId: string) {
    if (!agreement || paymentStatus === "confirming") return;

    setPaymentStatus("confirming");
    setMessage("Confirming payment...");
    setStatus("success");

    const response = await fetch("/api/payments/confirm-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agreementId: agreement.id, sessionId }),
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus("error");
      setMessage(data.error || "Could not confirm payment.");
      setPaymentStatus("idle");
      return;
    }

    setStatus("success");
    setMessage("Payment received. Booking confirmed.");
    setPaymentStatus("idle");
    loadAgreement();
  }

  async function completeClass() {
    if (!agreement) return;

    setCompletionStatus("saving");
    setStatus("idle");
    setMessage("");

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const response = await fetch("/api/bookings/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ agreementId: agreement.id }),
    });
    const result = await response.json();

    if (!response.ok) {
      setStatus("error");
      setMessage(result.error || "Could not mark class complete.");
      setCompletionStatus("idle");
      return;
    }

    setStatus("success");
    setMessage("Class completed. Review requests have been sent. Payout will be reviewed after the client submits their instructor review.");
    setCompletionStatus("idle");
    loadAgreement();
  }

  return (
    <main className="container">
      <Nav />

      <AuthGate>
        {loading && <p>Loading agreement...</p>}
        {!loading && !agreement && <p>Agreement not found.</p>}

        {agreement && (
          <>
            <section className="pageHeader">
              <p className="eyebrow">Electronic agreement</p>
              <h1>Booking Agreement</h1>
              <p>
                Review the booking terms below. Acceptance is recorded electronically
                with your signed-in BookAnInstructor account.
              </p>
              {canSendToInstructor && (
                <button className="btn" disabled={status === "saving"} type="button" onClick={sendToInstructor}>
                  {status === "saving" ? "Sending..." : "Send to instructor"}
                </button>
              )}
              {canAccept && (
                <button className="btn" disabled={status === "saving"} type="button" onClick={acceptAgreement}>
                  {status === "saving" ? "Accepting..." : "Accept agreement"}
                </button>
              )}
              {canRequestPayment && (
                <button className="btn" disabled={paymentStatus !== "idle"} type="button" onClick={startPayment}>
                  {paymentStatus === "loading" ? "Opening payment..." : "Pay booking fee"}
                </button>
              )}
              {canCompleteClass && (
                <button className="btn" disabled={completionStatus === "saving"} type="button" onClick={completeClass}>
                  {completionStatus === "saving" ? "Completing..." : "Class completed"}
                </button>
              )}
              {message && (
                <p className={status === "error" ? "formMessage error" : "formMessage"}>
                  {message}
                </p>
              )}
            </section>

            <section className="agreementPanel">
              <div className="agreementHeader">
                <div>
                  <p className="formSectionLabel">Contract number</p>
                  <p>{agreement.contract_number || "Not assigned"}</p>
                </div>
                <div>
                  <p className="formSectionLabel">Booking ID</p>
                  <p>{shortId(agreement.request_id)}</p>
                </div>
                <div>
                  <p className="formSectionLabel">Status</p>
                  <span className="statusBadge">{agreement.status || "sent"}</span>
                </div>
                <div>
                  <p className="formSectionLabel">Agreement date</p>
                  <p>{new Date(agreement.created_at).toLocaleDateString("en-AU")}</p>
                </div>
                <div>
                  <p className="formSectionLabel">Accepted</p>
                  <p>
                    {agreement.accepted_at
                      ? new Date(agreement.accepted_at).toLocaleString("en-AU")
                      : "Not yet accepted"}
                  </p>
                </div>
                <div>
                  <p className="formSectionLabel">Payment</p>
                  <p>
                    {agreement.payment_status === "paid"
                      ? `Paid${agreement.paid_at ? ` ${new Date(agreement.paid_at).toLocaleDateString("en-AU")}` : ""}`
                      : agreement.payment_status || "unpaid"}
                  </p>
                </div>
                <div>
                  <p className="formSectionLabel">Class completed</p>
                  <p>
                    {agreement.class_completed_at
                      ? new Date(agreement.class_completed_at).toLocaleString("en-AU")
                      : "Not yet completed"}
                  </p>
                </div>
                <div>
                  <p className="formSectionLabel">Payout</p>
                  <p>{agreement.payout_status || "not_ready"}</p>
                </div>
                <div>
                  <p className="formSectionLabel">Client review</p>
                  <p>
                    {agreement.client_review_submitted_at
                      ? `Submitted ${new Date(agreement.client_review_submitted_at).toLocaleDateString("en-AU")}`
                      : agreement.class_completed_at
                        ? "Waiting"
                        : "Not requested"}
                  </p>
                </div>
                <div>
                  <p className="formSectionLabel">Instructor review</p>
                  <p>
                    {agreement.instructor_review_submitted_at
                      ? `Submitted ${new Date(agreement.instructor_review_submitted_at).toLocaleDateString("en-AU")}`
                      : agreement.class_completed_at
                        ? "Waiting"
                        : "Not requested"}
                  </p>
                </div>
              </div>

              {agreement.class_completed_at && (
                <section className="reviewPromptPanel">
                  <div>
                    <h2>Reviews</h2>
                    <p className="helperText">
                      Client reviews are published on the instructor profile. Instructor reviews
                      are kept internally to help BookAnInstructor monitor client quality.
                    </p>
                  </div>
                  <div className="buttonRow">
                    {currentUserId === agreement.client_user_id && (
                      agreement.client_review_submitted_at ? (
                        <span className="secondaryButton disabledButton">
                          Your instructor review submitted
                        </span>
                      ) : (
                        <a className="btn" href={`/reviews/${agreement.id}/review-instructor`}>
                          Review instructor
                        </a>
                      )
                    )}
                    {currentUserId === agreement.instructor_user_id && (
                      agreement.instructor_review_submitted_at ? (
                        <span className="secondaryButton disabledButton">
                          Your client review submitted
                        </span>
                      ) : (
                        <a className="btn" href={`/reviews/${agreement.id}/review-client`}>
                          Review client
                        </a>
                      )
                    )}
                    {currentUserId === agreement.instructor_user_id &&
                      !agreement.client_review_submitted_at && (
                        <span className="statusBadge">Waiting for client to review instructor</span>
                      )}
                  </div>
                </section>
              )}

              <section>
                <h2>Booking Details</h2>
                <dl>
                  <div>
                    <dt>Request</dt>
                    <dd>{agreement.job_title || "Instructor booking"}</dd>
                  </div>
                  <div>
                    <dt>Client / organisation</dt>
                    <dd>{agreement.client_organisation || agreement.client_name || "Client"}</dd>
                  </div>
                  <div>
                    <dt>Instructor</dt>
                    <dd>{agreement.instructor_name || "Instructor"}</dd>
                  </div>
                  <div>
                    <dt>Style</dt>
                    <dd>{agreement.style || "Not supplied"}</dd>
                  </div>
                  <div>
                    <dt>Class level</dt>
                    <dd>{agreement.class_level || "Not supplied"}</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>{agreement.location || "Not supplied"}</dd>
                  </div>
                  <div>
                    <dt>Availability / timing</dt>
                    <dd>{agreement.availability || "Not supplied"}</dd>
                  </div>
                  <div>
                    <dt>Class details</dt>
                    <dd>{agreement.booking_details || "Not supplied"}</dd>
                  </div>
                </dl>
              </section>

              <section>
                <h2>Fees</h2>
                <dl>
                  <div>
                    <dt>Total client fee</dt>
                    <dd>{money(agreement.total_fee)}</dd>
                  </div>
                  <div>
                    <dt>Total hours</dt>
                    <dd>
                      {agreement.total_hours ? `${agreement.total_hours} hours` : "Not supplied"}
                    </dd>
                  </div>
                  <div>
                    <dt>Hourly rate</dt>
                    <dd>{money(agreement.hourly_rate)}</dd>
                  </div>
                  <div>
                    <dt>BookAnInstructor commission</dt>
                    <dd>
                      {agreement.commission_rate
                        ? `${agreement.commission_rate * 100}% (${money(agreement.commission_amount)})`
                        : "Not supplied"}
                    </dd>
                  </div>
                  <div>
                    <dt>Estimated instructor payout</dt>
                    <dd>{money(agreement.instructor_payout)}</dd>
                  </div>
                </dl>
                <p className="helperText">
                  BookAnInstructor applies a 10% commission on the first booking
                  and 5% on future bookings with the same client where applicable.
                </p>
              </section>

              <section>
                <h2>Agreement Terms</h2>
                <p>
                  BookAnInstructor.com facilitates the introduction, booking
                  administration, communication, and payment process between the
                  client and instructor. The instructor accepts the booking as an
                  independent service provider, not as an employee of
                  BookAnInstructor.com.
                </p>
                <p>
                  The instructor agrees to provide the agreed class or service in
                  a punctual, professional, safe, respectful, and prepared manner,
                  and to follow reasonable booking details agreed through the
                  platform.
                </p>
                <p>
                  The instructor must keep client information confidential and must
                  not move the booking, payment, or communication outside the
                  BookAnInstructor platform unless BookAnInstructor.com gives
                  written approval.
                </p>
                <p>
                  Payment will be requested from the client after this agreement is
                  accepted. Funds are intended to be held until the class is
                  completed and the post-class process is finalised.
                </p>
              </section>

              {canSendToInstructor && (
                <button className="btn" disabled={status === "saving"} type="button" onClick={sendToInstructor}>
                  {status === "saving" ? "Sending..." : "Send to instructor"}
                </button>
              )}

              {canAccept && (
                <button className="btn" disabled={status === "saving"} type="button" onClick={acceptAgreement}>
                  {status === "saving" ? "Accepting..." : "Accept agreement"}
                </button>
              )}

              {canRequestPayment && (
                <button className="btn" disabled={paymentStatus !== "idle"} type="button" onClick={startPayment}>
                  {paymentStatus === "loading" ? "Opening payment..." : "Pay booking fee"}
                </button>
              )}

              {canCompleteClass && (
                <button className="btn" disabled={completionStatus === "saving"} type="button" onClick={completeClass}>
                  {completionStatus === "saving" ? "Completing..." : "Class completed"}
                </button>
              )}

              {agreement.status === "accepted" && (
                <p className="formMessage">
                  {agreement.payment_status === "paid"
                    ? "Payment received. Booking confirmed."
                    : "Agreement accepted. Payment request pending."}
                </p>
              )}

              {message && (
                <p className={status === "error" ? "formMessage error" : "formMessage"}>
                  {message}
                </p>
              )}
            </section>
          </>
        )}
      </AuthGate>
    </main>
  );
}
