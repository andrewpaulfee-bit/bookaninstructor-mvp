"use client";

import { useEffect, useState } from "react";
import AuthGate from "../../components/AuthGate";
import Nav from "../../components/Nav";
import { firstNameOnly } from "../../lib/displayName";
import { supabase } from "../../lib/supabase";

type Conversation = {
  id: string;
  updated_at: string;
  status: string | null;
  request?: { title: string | null; style: string | null; client_name: string | null } | null;
  instructor?: { name: string; headshot_url: string | null } | null;
};

type RawConversation = Omit<Conversation, "request" | "instructor"> & {
  request?: Conversation["request"] | Conversation["request"][];
  instructor?: Conversation["instructor"] | Conversation["instructor"][];
};

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadConversations() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("conversations")
        .select(
          "id,updated_at,status,request:client_requests(title,style,client_name),instructor:instructors(name,headshot_url)"
        )
        .or(`client_user_id.eq.${user.id},instructor_user_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setConversations(
          ((data || []) as RawConversation[]).map((conversation) => ({
            ...conversation,
            request: Array.isArray(conversation.request)
              ? conversation.request[0] || null
              : conversation.request || null,
            instructor: Array.isArray(conversation.instructor)
              ? conversation.instructor[0] || null
              : conversation.instructor || null,
          }))
        );
      }

      setLoading(false);
    }

    loadConversations();
  }, []);

  return (
    <main className="container">
      <Nav />

      <section className="pageHeader">
        <p className="eyebrow">Messages</p>
        <h1>Inbox</h1>
        <p>Keep booking communication inside BookAnInstructor.</p>
      </section>

      <AuthGate>
        {loading && <p>Loading messages...</p>}
        {error && <p className="formMessage error">{error}</p>}

        <div className="requestList">
          {conversations.map((conversation) => (
            <a className="requestCard" href={`/messages/${conversation.id}`} key={conversation.id}>
              <div>
                <h2>{conversation.request?.title || conversation.request?.style || "Instructor request"}</h2>
                <p>
                  {firstNameOnly(conversation.instructor?.name)}
                  {conversation.request?.client_name
                    ? ` · ${conversation.request.client_name}`
                    : ""}
                </p>
              </div>
              <span className="statusBadge">{conversation.status || "open"}</span>
            </a>
          ))}
        </div>

        {!loading && conversations.length === 0 && !error && (
          <p>No message threads yet.</p>
        )}
      </AuthGate>
    </main>
  );
}
