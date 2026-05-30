"use client";

import { useEffect, useState } from "react";
import AuthGate from "../../components/AuthGate";
import Nav from "../../components/Nav";
import { supabase } from "../../lib/supabase";

type Agreement = {
  id: string;
  created_at: string;
  accepted_at: string | null;
  contract_number: string | null;
  request_id: string;
  client_user_id: string | null;
  instructor_user_id: string | null;
  status: string | null;
  payment_status: string | null;
  client_organisation: string | null;
  client_name: string | null;
  instructor_name: string | null;
  job_title: string | null;
  style: string | null;
  location: string | null;
  total_fee: number | null;
  instructor_payout: number | null;
};

function money(value: number | null) {
  return value === null || value === undefined ? "Not supplied" : `$${Number(value).toFixed(2)}`;
}

function shortId(value: string) {
  return value.slice(0, 8).toUpperCase();
}

export default function MyAgreements() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAgreements() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        setLoading(false);
        return;
      }

      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from("booking_agreements")
        .select(
          "id,created_at,accepted_at,contract_number,request_id,client_user_id,instructor_user_id,status,payment_status,client_organisation,client_name,instructor_name,job_title,style,location,total_fee,instructor_payout"
        )
        .or(`client_user_id.eq.${user.id},instructor_user_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
      } else {
        setAgreements((data || []) as Agreement[]);
      }

      setLoading(false);
    }

    loadAgreements();
  }, []);

  return (
    <main className="container">
      <Nav />

      <section className="pageHeader">
        <p className="eyebrow">Bookings</p>
        <h1>My Agreements</h1>
        <p>Review draft, sent, and accepted booking agreements.</p>
      </section>

      <AuthGate>
        {loading && <p>Loading agreements...</p>}
        {message && <p className="formMessage error">{message}</p>}

        <div className="requestList">
          {agreements.map((agreement) => {
            const isInstructor = agreement.instructor_user_id === currentUserId;
            const isClient = agreement.client_user_id === currentUserId;

            return (
              <article className="requestCard compactRequestCard" key={agreement.id}>
                <div>
                  <h2>{agreement.job_title || "Booking agreement"}</h2>
                  <p>
                    {agreement.style || "Instructor booking"}
                    {agreement.location ? ` · ${agreement.location}` : ""}
                  </p>
                </div>

                <span className="statusBadge">{agreement.status || "draft"}</span>

                <dl>
                  <div>
                    <dt>Contract number</dt>
                    <dd>{agreement.contract_number || "Not assigned"}</dd>
                  </div>
                  <div>
                    <dt>Booking ID</dt>
                    <dd>{shortId(agreement.request_id)}</dd>
                  </div>
                  <div>
                    <dt>{isInstructor ? "Client" : "Instructor"}</dt>
                    <dd>
                      {isInstructor
                        ? agreement.client_organisation || agreement.client_name || "Client"
                        : agreement.instructor_name || "Instructor"}
                    </dd>
                  </div>
                  <div>
                    <dt>{isInstructor ? "Your payout" : "Total fee"}</dt>
                    <dd>{money(isInstructor ? agreement.instructor_payout : agreement.total_fee)}</dd>
                  </div>
                  <div>
                    <dt>Payment</dt>
                    <dd>{agreement.payment_status || "unpaid"}</dd>
                  </div>
                  <div>
                    <dt>Accepted</dt>
                    <dd>
                      {agreement.accepted_at
                        ? new Date(agreement.accepted_at).toLocaleString("en-AU")
                        : "Not yet accepted"}
                    </dd>
                  </div>
                </dl>

                <a className="btn" href={`/agreements/${agreement.id}`}>
                  {isInstructor && agreement.status === "sent"
                    ? "Review and accept"
                    : isClient && agreement.status === "draft"
                      ? "Review and send"
                      : "View agreement"}
                </a>
              </article>
            );
          })}
        </div>

        {!loading && agreements.length === 0 && <p>No agreements yet.</p>}
      </AuthGate>
    </main>
  );
}
