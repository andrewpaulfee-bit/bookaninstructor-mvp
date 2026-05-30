"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AuthGate from "../../../components/AuthGate";
import Nav from "../../../components/Nav";
import { checkMessageForContactDetails } from "../../../lib/contactGuard";
import { firstNameOnly } from "../../../lib/displayName";
import { supabase } from "../../../lib/supabase";

type Conversation = {
  id: string;
  request_id: string;
  client_user_id: string | null;
  instructor_user_id: string | null;
  request?: { title: string | null; client_name: string | null } | null;
  instructor?: { name: string; email: string | null } | null;
};

type Message = {
  id: string;
  created_at: string;
  author_user_id: string | null;
  author_role: "client" | "instructor" | "admin";
  body: string;
};

type Agreement = {
  id: string;
  contract_number: string | null;
  request_id: string;
  client_user_id: string | null;
  instructor_user_id: string | null;
  status: string | null;
  payment_status: string | null;
  total_fee: number | null;
  instructor_payout: number | null;
};

type RawConversation = Omit<Conversation, "request" | "instructor"> & {
  request?: Conversation["request"] | Conversation["request"][];
  instructor?: Conversation["instructor"] | Conversation["instructor"][];
};

function money(value: number | null) {
  return value === null || value === undefined ? "Not supplied" : `$${Number(value).toFixed(2)}`;
}

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [notice, setNotice] = useState("");

  async function loadConversation() {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    setCurrentUserId(user?.id || "");

    const [{ data: conversationData, error: conversationError }, { data: messageData }] =
      await Promise.all([
        supabase
          .from("conversations")
          .select(
            "id,request_id,client_user_id,instructor_user_id,request:client_requests(title,client_name),instructor:instructors(name,email)"
          )
          .eq("id", params.id)
          .maybeSingle(),
        supabase
          .from("messages")
          .select("id,created_at,author_user_id,author_role,body")
          .eq("conversation_id", params.id)
          .order("created_at", { ascending: true }),
      ]);

    if (conversationError) {
      setNotice(conversationError.message);
    }

    const rawConversation = conversationData as RawConversation | null;
    if (
      rawConversation &&
      user?.id &&
      rawConversation.client_user_id !== user.id &&
      rawConversation.instructor_user_id !== user.id
    ) {
      setConversation(null);
      setMessages([]);
      setNotice("You do not have access to this conversation.");
      setLoading(false);
      return;
    }

    const normalizedConversation = rawConversation
      ? {
          ...rawConversation,
          request: Array.isArray(rawConversation.request)
            ? rawConversation.request[0] || null
            : rawConversation.request || null,
          instructor: Array.isArray(rawConversation.instructor)
            ? rawConversation.instructor[0] || null
            : rawConversation.instructor || null,
        }
      : null;

    setConversation(normalizedConversation);
    setMessages((messageData || []) as Message[]);

    if (normalizedConversation?.request_id && normalizedConversation.instructor_user_id) {
      const { data: agreementData, error: agreementError } = await supabase
        .from("booking_agreements")
        .select("id,contract_number,request_id,client_user_id,instructor_user_id,status,payment_status,total_fee,instructor_payout")
        .eq("request_id", normalizedConversation.request_id)
        .eq("instructor_user_id", normalizedConversation.instructor_user_id)
        .maybeSingle();

      if (!agreementError) {
        setAgreement(agreementData as Agreement | null);
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    loadConversation();
  }, [params.id]);

  async function sendNotification(messageId: string) {
    await fetch("/api/messages/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: params.id, messageId }),
    }).catch(() => null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setNotice("");

    const guard = checkMessageForContactDetails(messageBody);
    if (guard.blocked) {
      setStatus("error");
      setNotice(guard.reason);
      return;
    }

    const authorRole =
      currentUserId && currentUserId === conversation?.instructor_user_id
        ? "instructor"
        : "client";

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: params.id,
        author_user_id: currentUserId || null,
        author_role: authorRole,
        body: messageBody.trim(),
      })
      .select("id")
      .single();

    if (error) {
      setStatus("error");
      setNotice(error.message);
      return;
    }

    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", params.id);

    setMessageBody("");
    setStatus("idle");
    await loadConversation();
    if (data?.id) await sendNotification(data.id);
  }

  return (
    <main className="container">
      <Nav />

      <AuthGate>
        {loading && <p>Loading conversation...</p>}
        {!loading && !conversation && <p>Conversation not found.</p>}
        {!loading && !conversation && notice && <p className="formMessage error">{notice}</p>}

        {conversation && (
          <>
            <section className="pageHeader">
              <p className="eyebrow">Messages</p>
              <h1>{conversation.request?.title || "Instructor request"}</h1>
              <p>
                {conversation.request?.client_name || "Client"} and{" "}
                {firstNameOnly(conversation.instructor?.name)}
              </p>
            </section>

            <section className="chatPanel">
              {agreement && (
                <div className="agreementCallout">
                  <div>
                    <p className="formSectionLabel">Agreement</p>
                    <h2>
                      Contract {agreement.contract_number || "not assigned"}
                    </h2>
                    <p>
                      Status: <strong>{agreement.status || "draft"}</strong>
                      {" · "}
                      Payment: <strong>{agreement.payment_status || "unpaid"}</strong>
                      {" · "}
                      {currentUserId === agreement.instructor_user_id
                        ? `Payout: ${money(agreement.instructor_payout)}`
                        : `Total fee: ${money(agreement.total_fee)}`}
                    </p>
                  </div>
                  <a className="secondaryButton" href={`/agreements/${agreement.id}`}>
                    {currentUserId === agreement.instructor_user_id && agreement.status === "sent"
                      ? "Review and accept"
                      : currentUserId === agreement.client_user_id && agreement.status === "draft"
                        ? "Review and send"
                        : "View agreement"}
                  </a>
                </div>
              )}

              <div className="chatMessages">
                {messages.map((message) => (
                  <article
                    className={
                      message.author_user_id === currentUserId
                        ? "chatBubble ownMessage"
                        : "chatBubble"
                    }
                    key={message.id}
                  >
                    <small>{message.author_role}</small>
                    <p>{message.body}</p>
                  </article>
                ))}

                {messages.length === 0 && (
                  <p className="helperText">No messages yet. Start the conversation below.</p>
                )}
              </div>

              <form className="chatComposer" onSubmit={onSubmit}>
                <label>
                  Message
                  <textarea
                    required
                    rows={4}
                    value={messageBody}
                    onChange={(event) => setMessageBody(event.target.value)}
                    placeholder="Ask a question or share booking details. Email addresses and phone numbers are blocked."
                  />
                </label>

                <button className="btn" disabled={status === "sending"} type="submit">
                  {status === "sending" ? "Sending..." : "Send message"}
                </button>
              </form>

              {notice && (
                <p className={status === "error" ? "formMessage error" : "formMessage"}>
                  {notice}
                </p>
              )}
            </section>
          </>
        )}
      </AuthGate>
    </main>
  );
}
