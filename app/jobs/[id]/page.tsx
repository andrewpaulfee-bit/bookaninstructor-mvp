"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AuthGate from "../../../components/AuthGate";
import Nav from "../../../components/Nav";
import { firstNameOnly } from "../../../lib/displayName";
import { supabase } from "../../../lib/supabase";

type ClientRequest = {
  id: string;
  client_user_id: string | null;
  title: string | null;
  budget: number | null;
  total_hours: number | null;
  style: string | null;
  class_level: string | null;
  style_levels: Array<{ style: string; class_level?: string }> | null;
  class_frequency: string | null;
  repeat_start_date: string | null;
  repeat_end_date: string | null;
  repeat_day: string | null;
  repeat_start_time: string | null;
  repeat_end_time: string | null;
  repeat_weeks: number | null;
  repeat_notes: string | null;
  company_name: string | null;
  client_name: string;
  category: string;
  location: string | null;
  details: string | null;
  image_urls: string[] | null;
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

type Instructor = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  approved: boolean;
  review_status: string | null;
};

export default function JobDetail() {
  const params = useParams<{ id: string }>();
  const [request, setRequest] = useState<ClientRequest | null>(null);
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [reply, setReply] = useState({
    price: "",
    availability_status: "available",
    alternative_start_time: "",
    alternative_end_time: "",
    message: "",
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadJob() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      const [requestResult, instructorResult] = await Promise.all([
        supabase
          .from("client_requests")
          .select("*")
          .eq("id", params.id)
          .in("status", ["open", "instructor_selected", "booking_confirmed"])
          .maybeSingle(),
        user
          ? supabase
              .from("instructors")
              .select("id,user_id,name,email,approved,review_status")
              .or(`user_id.eq.${user.id},email.eq.${user.email}`)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      setRequest(requestResult.data || null);
      setInstructor(instructorResult.data || null);

      if (requestResult.error) {
        setStatus("error");
        setMessage(requestResult.error.message);
      }

      setLoading(false);
    }

    loadJob();
  }, [params.id]);

  function updateField(name: string, value: string) {
    setReply((current) => ({ ...current, [name]: value }));
  }

  function createMessageStarter() {
    const instructorName = firstNameOnly(instructor?.name);
    const styleText = request?.style || request?.category || "this class";
    const locationText = request?.location ? ` in ${request.location}` : "";
    const priceText = reply.price ? ` My proposed price is $${reply.price}.` : "";
    const availabilityText =
      reply.availability_status === "available"
        ? " I am available for the requested time."
        : reply.alternative_start_time && reply.alternative_end_time
          ? ` I am not available at the requested time, but I can offer ${reply.alternative_start_time} to ${reply.alternative_end_time}.`
          : " I can suggest an alternative time if needed.";

    updateField(
      "message",
      `Hi, ${instructorName} here. I would be happy to help with your ${styleText} request${locationText}. I have experience creating clear, engaging classes that are tailored to the needs of the group, and I focus on making each session professional, supportive, and easy to follow.${availabilityText}${priceText} I would love to be considered for this booking.`
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setStatus("saving");
    setMessage("");

    if (!instructor) {
      setStatus("error");
      setMessage("Please create your instructor profile before replying to jobs.");
      return;
    }

    if (!instructor.approved || instructor.review_status !== "approved") {
      setStatus("error");
      setMessage("Your instructor profile needs to be approved before you can reply to jobs.");
      return;
    }

    if (
      reply.availability_status === "alternative" &&
      (!reply.alternative_start_time || !reply.alternative_end_time)
    ) {
      setStatus("error");
      setMessage("Please add both an alternative start time and end time for the client.");
      return;
    }

    const availability =
      reply.availability_status === "available"
        ? "I am available for the requested time."
        : `Alternative time suggested: ${reply.alternative_start_time} to ${reply.alternative_end_time}`;

    const { data: offer, error } = await supabase
      .from("offers")
      .insert({
        request_id: params.id,
        instructor_id: instructor.id,
        price: reply.price ? Number(reply.price) : null,
        proposed_rate: reply.price ? Number(reply.price) : null,
        availability,
        message: reply.message,
        status: "sent",
      })
      .select("id")
      .single();

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    if (offer?.id) {
      await supabase.from("conversations").upsert(
        {
          request_id: params.id,
          offer_id: offer.id,
          client_user_id: request?.client_user_id || null,
          instructor_id: instructor.id,
          instructor_user_id: instructor.user_id || null,
          status: "open",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "request_id,instructor_id" }
      );

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (token) {
        await fetch("/api/notifications/event", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ event: "offer_submitted", id: offer.id }),
        }).catch(() => null);
      }
    }

    setStatus("success");
    setMessage("Your reply has been sent to the client. A message thread is ready in Messages.");
    setReply({
      price: "",
      availability_status: "available",
      alternative_start_time: "",
      alternative_end_time: "",
      message: "",
    });
    formElement.reset();
  }

  return (
    <main className="container">
      <Nav />

      <AuthGate>
        {loading && <p>Loading job...</p>}
        {!loading && !request && <p>Job not found.</p>}

        {request && (
          <>
            <section className="pageHeader">
              <p className="eyebrow">Instructor job</p>
              <h1>{request.title || request.category}</h1>
              <p>
                {request.style || request.category}
                {request.location ? ` · ${request.location}` : ""}
              </p>
            </section>

            <div className="bookingLayout">
              <article className="requestCard">
                <span className="statusBadge">{request.status || "open"}</span>
                <dl>
                  <div>
                    <dt>Client</dt>
                    <dd>{request.company_name || request.client_name}</dd>
                  </div>
                  <div>
                    <dt>Budget</dt>
                    <dd>
                      {request.budget ? `$${request.budget} total` : "Not supplied"}
                      {request.budget && request.total_hours
                        ? ` / $${(request.budget / request.total_hours).toFixed(2)} per hour`
                        : ""}
                    </dd>
                  </div>
                  <div>
                    <dt>Total hours</dt>
                    <dd>{request.total_hours ? `${request.total_hours} hours` : "Not supplied"}</dd>
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
                  {request.class_frequency === "Ongoing" && request.repeat_notes && (
                    <div>
                      <dt>Repeat notes</dt>
                      <dd>{request.repeat_notes}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Styles and levels</dt>
                    <dd>
                      {request.style_levels?.length
                        ? request.style_levels
                            .map((row) =>
                              row.class_level
                                ? `${row.style} (${row.class_level})`
                                : row.style
                            )
                            .join(", ")
                        : request.class_level || "Not supplied"}
                    </dd>
                  </div>
                  <div>
                    <dt>Details</dt>
                    <dd>{request.details || "No details supplied"}</dd>
                  </div>
                </dl>

                {request.image_urls?.length ? (
                  <div className="fileLinks">
                    {request.image_urls.map((url, index) => (
                      <a href={url} key={url} target="_blank">
                        Image {index + 1}
                      </a>
                    ))}
                  </div>
                ) : null}
              </article>

              <form className="formPanel" onSubmit={onSubmit}>
                <h2>Reply to this request</h2>

                {!instructor && (
                  <p className="formMessage error">
                    You need an instructor profile before you can reply.
                  </p>
                )}

                <label>
                  Proposed price
                  <input
                    inputMode="decimal"
                    min="0"
                    type="number"
                    value={reply.price}
                    onChange={(event) => updateField("price", event.target.value)}
                    placeholder="120"
                  />
                </label>

                <fieldset>
                  <legend>Availability</legend>
                  <div className="inlineOptions">
                    <label className="checkboxOption">
                      <input
                        checked={reply.availability_status === "available"}
                        name="availability_status"
                        type="radio"
                        onChange={() => updateField("availability_status", "available")}
                      />
                      I&apos;m available
                    </label>
                    <label className="checkboxOption">
                      <input
                        checked={reply.availability_status === "alternative"}
                        name="availability_status"
                        type="radio"
                        onChange={() => updateField("availability_status", "alternative")}
                      />
                      Suggest alternative time
                    </label>
                  </div>
                </fieldset>

                {reply.availability_status === "alternative" && (
                  <div className="fieldGrid">
                    <label>
                      Alternative start time
                      <input
                        required
                        type="time"
                        value={reply.alternative_start_time}
                        onChange={(event) =>
                          updateField("alternative_start_time", event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Alternative end time
                      <input
                        required
                        type="time"
                        value={reply.alternative_end_time}
                        onChange={(event) =>
                          updateField("alternative_end_time", event.target.value)
                        }
                      />
                    </label>
                  </div>
                )}

                <label>
                  Message to client
                  <textarea
                    required
                    rows={7}
                    value={reply.message}
                    onChange={(event) => updateField("message", event.target.value)}
                    placeholder="Introduce yourself and explain why you are suitable."
                  />
                </label>
                <button className="secondaryButton" type="button" onClick={createMessageStarter}>
                  Help me write it
                </button>

                <button className="btn" disabled={status === "saving"} type="submit">
                  {status === "saving" ? "Sending..." : "Send reply"}
                </button>

                {message && (
                  <p className={status === "error" ? "formMessage error" : "formMessage"}>
                    {message}
                  </p>
                )}
              </form>
            </div>
          </>
        )}
      </AuthGate>
    </main>
  );
}
