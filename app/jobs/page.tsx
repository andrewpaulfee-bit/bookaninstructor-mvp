"use client";

import { useEffect, useState } from "react";
import AuthGate from "../../components/AuthGate";
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
  class_frequency: string | null;
  repeat_start_date: string | null;
  repeat_end_date: string | null;
  repeat_day: string | null;
  repeat_start_time: string | null;
  repeat_end_time: string | null;
  repeat_weeks: number | null;
  company_name: string | null;
  client_name: string;
  category: string;
  location: string | null;
  details: string | null;
  status: string | null;
};

function repeatSummary(request: ClientRequest) {
  const parts = [
    request.repeat_day,
    request.repeat_start_time && request.repeat_end_time
      ? `${request.repeat_start_time.slice(0, 5)}-${request.repeat_end_time.slice(0, 5)}`
      : "",
    request.repeat_start_date && request.repeat_end_date
      ? `${request.repeat_start_date} to ${request.repeat_end_date}`
      : "",
    request.repeat_weeks ? `${request.repeat_weeks} weeks` : "",
  ].filter(Boolean);

  return parts.join(" · ");
}

export default function Jobs() {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJobs() {
      const { data, error } = await supabase
        .from("client_requests")
        .select(
          "id,created_at,title,budget,total_hours,style,class_level,class_frequency,repeat_start_date,repeat_end_date,repeat_day,repeat_start_time,repeat_end_time,repeat_weeks,company_name,client_name,category,location,details,status"
        )
        .in("status", ["open", "instructor_selected", "booking_confirmed"])
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setRequests(data || []);
      }

      setLoading(false);
    }

    loadJobs();
  }, []);

  return (
    <main className="container">
      <Nav />

      <section className="pageHeader">
        <p className="eyebrow">Instructor jobs</p>
        <h1>Available instructor requests</h1>
        <p>Review open client requests and reply to the ones that suit you.</p>
      </section>

      <AuthGate>
        {loading && <p>Loading jobs...</p>}
        {error && <p className="formMessage error">{error}</p>}

        <div className="requestList">
          {requests.map((request) => (
            <a className="requestCard" href={`/jobs/${request.id}`} key={request.id}>
              <div>
                <h2>{request.title || request.category}</h2>
                <p>
                  {request.style || request.category}
                  {request.class_level ? ` · ${request.class_level}` : ""}
                  {request.location ? ` · ${request.location}` : ""}
                </p>
              </div>

              <span className="statusBadge">{request.status || "open"}</span>

              <dl>
                <div>
                  <dt>Budget</dt>
                  <dd>{request.budget ? `$${request.budget}` : "Not supplied"}</dd>
                </div>
                <div>
                  <dt>Total hours</dt>
                  <dd>{request.total_hours ? `${request.total_hours} hours` : "Not supplied"}</dd>
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
                  <dt>Frequency</dt>
                  <dd>{request.class_frequency || "Not supplied"}</dd>
                </div>
                {request.class_frequency === "Ongoing" && (
                  <div>
                    <dt>Repeat booking</dt>
                    <dd>{repeatSummary(request) || "Not supplied"}</dd>
                  </div>
                )}
                <div>
                  <dt>Client</dt>
                  <dd>{request.company_name || request.client_name}</dd>
                </div>
                <div>
                  <dt>Details</dt>
                  <dd>{request.details || "No details supplied"}</dd>
                </div>
              </dl>
            </a>
          ))}
        </div>

        {!loading && requests.length === 0 && !error && (
          <p>No open instructor requests yet.</p>
        )}
      </AuthGate>
    </main>
  );
}
