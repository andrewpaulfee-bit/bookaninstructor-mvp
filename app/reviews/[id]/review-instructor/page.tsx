"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import AuthGate from "../../../../components/AuthGate";
import Nav from "../../../../components/Nav";
import { instructorReviewHighlights, toggleReviewHighlight } from "../../../../lib/reviewOptions";
import { supabase } from "../../../../lib/supabase";

export default function ReviewInstructorPage() {
  const params = useParams<{ id: string }>();
  const [form, setForm] = useState({ reviewerName: "", rating: "5" });
  const [highlights, setHighlights] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function authHeaders() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    if (highlights.length !== 5) {
      setStatus("error");
      setMessage("Please choose exactly 5 review highlights.");
      return;
    }

    const response = await fetch("/api/reviews/submit", {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({
        agreementId: params.id,
        role: "client",
        reviewerName: form.reviewerName,
        rating: Number(form.rating),
        highlights,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus("error");
      setMessage(data.error || "Could not submit review.");
      return;
    }

    setStatus("success");
    setMessage("Thanks. Your instructor review has been submitted.");
    setForm({ reviewerName: "", rating: "5" });
    setHighlights([]);
  }

  return (
    <main className="container">
      <Nav />
      <section className="pageHeader">
        <p className="eyebrow">Review</p>
        <h1>Review your instructor</h1>
        <p>Your review helps future clients choose the right instructor.</p>
      </section>

      <AuthGate>
        <form className="formPanel" onSubmit={onSubmit}>
          <label>
            Your name
            <input value={form.reviewerName} onChange={(event) => setForm((current) => ({ ...current, reviewerName: event.target.value }))} />
          </label>
          <fieldset className="reviewHighlights">
            <legend>Choose 5 instructor qualities</legend>
            <p className="helperText">{highlights.length}/5 selected</p>
            <div className="reviewHighlightGrid">
              {instructorReviewHighlights.map((highlight) => {
                const selected = highlights.includes(highlight);
                const disabled = !selected && highlights.length >= 5;

                return (
                  <button
                    className={selected ? "reviewHighlight selected" : "reviewHighlight"}
                    disabled={disabled}
                    key={highlight}
                    type="button"
                    onClick={() =>
                      setHighlights((current) => toggleReviewHighlight(current, highlight))
                    }
                  >
                    {highlight}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <label>
            Overall rating out of 5
            <select value={form.rating} onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))}>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </label>
          <button className="btn" disabled={status === "saving"} type="submit">
            {status === "saving" ? "Submitting..." : "Submit review"}
          </button>
          {message && <p className={status === "error" ? "formMessage error" : "formMessage"}>{message}</p>}
        </form>
      </AuthGate>
    </main>
  );
}
