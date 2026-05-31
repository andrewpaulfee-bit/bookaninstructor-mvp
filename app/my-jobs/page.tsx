"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "../../components/AuthGate";
import Nav from "../../components/Nav";
import { firstNameOnly } from "../../lib/displayName";
import { supabase } from "../../lib/supabase";

type Offer = {
  id: string;
  price: number | null;
  proposed_rate: number | null;
  availability: string | null;
  message: string | null;
  status: string | null;
  instructor_id: string;
  instructor?: {
    user_id: string | null;
    name: string;
    location: string | null;
    categories: string[] | null;
    headshot_url: string | null;
  } | null;
};

type ClientRequest = {
  id: string;
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
  repeat_notes: string | null;
  company_name: string | null;
  client_name: string | null;
  location: string | null;
  details: string | null;
  status: string | null;
  client_user_id: string | null;
  selected_instructor_id: string | null;
  offers?: Offer[];
};

type Agreement = {
  id: string;
  request_id: string;
  offer_id: string;
  contract_number: string | null;
  status: string | null;
  accepted_at: string | null;
};

type RawOffer = Omit<Offer, "instructor"> & {
  instructor?: Offer["instructor"] | Offer["instructor"][];
};

type RawClientRequest = Omit<ClientRequest, "offers"> & {
  offers?: RawOffer[];
};

export default function MyJobs() {
  const router = useRouter();
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageStatus, setMessageStatus] = useState<"idle" | "success" | "error">("idle");
  const [openingConversationId, setOpeningConversationId] = useState("");
  const [offerMessages, setOfferMessages] = useState<Record<string, string>>({});
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [preparingAgreementId, setPreparingAgreementId] = useState("");

  async function loadMyJobs() {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("client_requests")
      .select(
        "id,title,budget,total_hours,style,class_level,class_frequency,repeat_start_date,repeat_end_date,repeat_day,repeat_start_time,repeat_end_time,repeat_weeks,repeat_notes,company_name,client_name,location,details,status,client_user_id,selected_instructor_id,offers(id,price,proposed_rate,availability,message,status,instructor_id,instructor:instructors(user_id,name,location,categories,headshot_url))"
      )
      .or(`client_user_id.eq.${user.id},client_email.eq.${user.email}`)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setMessageStatus("error");
    } else {
      const normalizedRequests = ((data || []) as RawClientRequest[]).map((request) => ({
        ...request,
        offers: request.offers?.map((offer) => ({
          ...offer,
          instructor: Array.isArray(offer.instructor)
            ? offer.instructor[0] || null
            : offer.instructor || null,
        })),
      }));
      setRequests(normalizedRequests);

      const requestIds = normalizedRequests.map((request) => request.id);
      if (requestIds.length > 0) {
        const { data: agreementData, error: agreementError } = await supabase
          .from("booking_agreements")
          .select("id,request_id,offer_id,contract_number,status,accepted_at")
          .in("request_id", requestIds);

        if (!agreementError) {
          setAgreements((agreementData || []) as Agreement[]);
        }
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    loadMyJobs();
  }, []);

  async function selectInstructor(requestId: string, offer: Offer) {
    setMessage("");
    setMessageStatus("idle");
    setOfferMessages((current) => ({ ...current, [offer.id]: "" }));

    const [requestResult, offerResult] = await Promise.all([
      supabase
        .from("client_requests")
        .update({
          selected_instructor_id: offer.instructor_id,
          status: "instructor_selected",
        })
        .eq("id", requestId),
      supabase.from("offers").update({ status: "accepted" }).eq("id", offer.id),
    ]);

    if (requestResult.error || offerResult.error) {
      setMessage(requestResult.error?.message || offerResult.error?.message || "");
      setMessageStatus("error");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (token) {
      await fetch("/api/notifications/event", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ event: "instructor_selected", id: offer.id }),
      }).catch(() => null);
    }

    setMessage("Instructor selected. Review the agreement next, then send it to the instructor.");
    setMessageStatus("success");
    setOfferMessages((current) => ({
      ...current,
      [offer.id]: "Instructor selected. Please click Review agreement next, check the booking details, then send it to the instructor.",
    }));
    loadMyJobs();
  }

  async function openConversation(request: ClientRequest, offer: Offer) {
    setMessage("");
    setMessageStatus("idle");
    setOfferMessages((current) => ({ ...current, [offer.id]: "" }));
    setOpeningConversationId(offer.id);
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      setOfferMessages((current) => ({ ...current, [offer.id]: "Please sign in before messaging." }));
      setOpeningConversationId("");
      return;
    }

    if (!offer.instructor_id) {
      setOfferMessages((current) => ({
        ...current,
        [offer.id]: "This offer is missing its instructor link.",
      }));
      setOpeningConversationId("");
      return;
    }

    const { data: existingConversation, error: existingError } = await supabase
      .from("conversations")
      .select("id")
      .eq("request_id", request.id)
      .eq("instructor_id", offer.instructor_id)
      .maybeSingle();

    if (existingError) {
      setOfferMessages((current) => ({
        ...current,
        [offer.id]:
        existingError.message.includes("conversations")
          ? "Messaging is not installed yet. Run supabase/fix-messaging-basic.sql in Supabase, then try again."
          : existingError.message,
      }));
      setOpeningConversationId("");
      return;
    }

    if (existingConversation?.id) {
      router.push(`/messages/${existingConversation.id}`);
      return;
    }

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        request_id: request.id,
        offer_id: offer.id,
        client_user_id: request.client_user_id || user.id,
        instructor_id: offer.instructor_id,
        instructor_user_id: offer.instructor?.user_id || null,
        status: "open",
      })
      .select("id")
      .single();

    if (error) {
      setOfferMessages((current) => ({
        ...current,
        [offer.id]:
        error.message.includes("conversations") || error.message.includes("row-level security")
          ? "Messaging needs its Supabase setup. Run supabase/fix-messaging-basic.sql, then try again."
          : error.message,
      }));
      setOpeningConversationId("");
      return;
    }

    if (!data?.id) {
      setOfferMessages((current) => ({
        ...current,
        [offer.id]: "Conversation was created, but Supabase did not return its ID.",
      }));
      setOpeningConversationId("");
      return;
    }

    router.push(`/messages/${data.id}`);
  }

  function agreementForOffer(offerId: string) {
    return agreements.find((agreement) => agreement.offer_id === offerId);
  }

  function createContractNumber() {
    return Math.floor(Math.random() * 100000000).toString().padStart(8, "0");
  }

  function repeatSummary(request: ClientRequest) {
    if (request.class_frequency !== "Ongoing") return "";

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

    const summary = parts.join(" · ");
    return [summary, request.repeat_notes].filter(Boolean).join("\n");
  }

  async function prepareAgreement(request: ClientRequest, offer: Offer) {
    setOfferMessages((current) => ({ ...current, [offer.id]: "" }));
    setPreparingAgreementId(offer.id);

    if (request.selected_instructor_id !== offer.instructor_id && offer.status !== "accepted") {
      setOfferMessages((current) => ({
        ...current,
        [offer.id]: "Select this instructor before sending an agreement.",
      }));
      setPreparingAgreementId("");
      return;
    }

    const totalFee = offer.price || offer.proposed_rate || request.budget || 0;
    const totalHours = request.total_hours || null;
    const hourlyRate = totalFee && totalHours ? totalFee / totalHours : null;
    const commissionRate = 0.1;
    const commissionAmount = totalFee * commissionRate;
    const bookingDetails = [
      request.details,
      repeatSummary(request) ? `Repeat booking: ${repeatSummary(request)}` : "",
    ].filter(Boolean).join("\n\n");

    const { data, error } = await supabase
      .from("booking_agreements")
      .upsert(
        {
          request_id: request.id,
          offer_id: offer.id,
          contract_number: createContractNumber(),
          client_user_id: request.client_user_id,
          instructor_id: offer.instructor_id,
          instructor_user_id: offer.instructor?.user_id || null,
          status: "draft",
          client_name: request.client_name || "Client",
          client_organisation: request.company_name || null,
          instructor_name: offer.instructor?.name || "Instructor",
          job_title: request.title || "Instructor request",
          style: request.style || null,
          class_level: request.class_level || null,
          location: request.location || null,
          booking_details: bookingDetails || null,
          availability: offer.availability || null,
          total_fee: totalFee || null,
          total_hours: totalHours,
          hourly_rate: hourlyRate,
          commission_rate: commissionRate,
          commission_amount: commissionAmount || null,
          instructor_payout: totalFee ? totalFee - commissionAmount : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "offer_id" }
      )
      .select("id,request_id,offer_id,contract_number,status,accepted_at")
      .single();

    if (error) {
      setOfferMessages((current) => ({
        ...current,
        [offer.id]: error.message.includes("booking_agreements")
          ? "Agreement setup is missing. Run supabase/agreements-schema.sql in Supabase, then try again."
          : error.message,
      }));
      setPreparingAgreementId("");
      return;
    }

    setAgreements((current) => [
      ...current.filter((agreement) => agreement.offer_id !== offer.id),
      data as Agreement,
    ]);
    setPreparingAgreementId("");
    router.push(`/agreements/${data.id}`);
  }

  return (
    <main className="container">
      <Nav />

      <section className="pageHeader">
        <p className="eyebrow">Client jobs</p>
        <h1>My Jobs</h1>
        <p>Review instructor replies and select the best fit for your request.</p>
      </section>

      <AuthGate>
        {loading && <p>Loading your jobs...</p>}
        {message && (
          <p className={messageStatus === "success" ? "formMessage" : "formMessage error"}>
            {message}
          </p>
        )}

        <div className="requestList">
          {requests.map((request) => (
            <article className="requestCard" key={request.id}>
              <div>
                <h2>{request.title || request.style || "Instructor request"}</h2>
                <p>
                  {request.style || "Instructor"}
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
                {request.class_frequency === "Ongoing" && (
                  <div>
                    <dt>Repeat booking</dt>
                    <dd>{repeatSummary(request) || "Not supplied"}</dd>
                  </div>
                )}
                <div>
                  <dt>Details</dt>
                  <dd>{request.details || "No details supplied"}</dd>
                </div>
              </dl>

              <section className="offerList">
                <h3>Instructor replies</h3>
                {request.offers?.length ? (
                  request.offers.map((offer) => (
                    <article className="offerCard" key={offer.id}>
                      {offer.status === "accepted" && !agreementForOffer(offer.id) && (
                        <p className="formMessage">
                          Instructor selected. Please click Review agreement next, check the booking details, then send it to the instructor.
                        </p>
                      )}
                      {offer.status === "accepted" && agreementForOffer(offer.id)?.status === "draft" && (
                        <p className="formMessage">
                          Agreement ready. Please click View agreement, check the booking details, then send it to the instructor.
                        </p>
                      )}
                      <div className="offerHeader">
                        {offer.instructor?.headshot_url ? (
                          <img alt={firstNameOnly(offer.instructor.name)} src={offer.instructor.headshot_url} />
                        ) : (
                          <div className="selectedInstructorAvatar">
                            {firstNameOnly(offer.instructor?.name).slice(0, 1)}
                          </div>
                        )}
                        <div>
                          <h4>{firstNameOnly(offer.instructor?.name)}</h4>
                          <p>{offer.instructor?.location || "Location not supplied"}</p>
                        </div>
                      </div>

                      <p>{offer.message || "No message supplied"}</p>
                      <p>
                        <strong>Price:</strong>{" "}
                        {offer.price || offer.proposed_rate
                          ? `$${offer.price || offer.proposed_rate}`
                          : "Not supplied"}
                      </p>
                      <p>
                        <strong>Availability:</strong>{" "}
                        {offer.availability || "Not supplied"}
                      </p>

                      <button
                        className="btn"
                        disabled={offer.status === "accepted"}
                        type="button"
                        onClick={() => selectInstructor(request.id, offer)}
                      >
                        {offer.status === "accepted" ? "Selected" : "Select instructor"}
                      </button>
                      <button
                        className="secondaryButton"
                        disabled={openingConversationId === offer.id}
                        type="button"
                        onClick={() => openConversation(request, offer)}
                      >
                        {openingConversationId === offer.id ? "Opening messages..." : "Message instructor"}
                      </button>
                      <a className="secondaryButton" href={`/instructors/${offer.instructor_id}`}>
                        Review instructor
                      </a>
                      {(offer.status === "accepted" ||
                        request.selected_instructor_id === offer.instructor_id) && (
                        agreementForOffer(offer.id) ? (
                          <a
                            className="secondaryButton"
                            href={`/agreements/${agreementForOffer(offer.id)?.id}`}
                          >
                            View agreement
                          </a>
                        ) : (
                          <button
                            className="secondaryButton"
                            disabled={preparingAgreementId === offer.id}
                            type="button"
                            onClick={() => prepareAgreement(request, offer)}
                          >
                            {preparingAgreementId === offer.id
                              ? "Preparing agreement..."
                              : "Review agreement"}
                          </button>
                        )
                      )}
                      {agreementForOffer(offer.id)?.status === "accepted" && (
                        <p className="formMessage">
                          Agreement accepted. Payment request pending.
                        </p>
                      )}
                      {offerMessages[offer.id] && (
                        <p
                          className={
                            offerMessages[offer.id].includes("missing") ||
                            offerMessages[offer.id].includes("Please sign in") ||
                            offerMessages[offer.id].includes("Select this instructor") ||
                            offerMessages[offer.id].includes("Could not")
                              ? "formMessage error"
                              : "formMessage"
                          }
                        >
                          {offerMessages[offer.id]}
                        </p>
                      )}
                    </article>
                  ))
                ) : (
                  <p>No instructor replies yet.</p>
                )}
              </section>
            </article>
          ))}
        </div>

        {!loading && requests.length === 0 && (
          <p>You have not posted any jobs yet.</p>
        )}
      </AuthGate>
    </main>
  );
}
