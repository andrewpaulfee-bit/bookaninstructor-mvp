"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminGate from "../../../../components/AdminGate";
import Nav from "../../../../components/Nav";
import { serviceAreaOptions, styleOptions } from "../../../../lib/instructorOptions";
import { supabase } from "../../../../lib/supabase";

const statusOptions = ["pending_review", "open", "needs_changes", "rejected", "cancelled"];
const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function AdminJobReview() {
  const params = useParams<{ id: string }>();
  const [form, setForm] = useState({
    title: "",
    budget: "",
    total_hours: "",
    style: "",
    class_level: "",
    class_frequency: "",
    repeat_start_date: "",
    repeat_end_date: "",
    repeat_day: "",
    repeat_start_time: "",
    repeat_end_time: "",
    repeat_weeks: "",
    repeat_notes: "",
    company_name: "",
    client_name: "",
    client_email: "",
    mobile: "",
    location: "",
    details: "",
    status: "pending_review",
    review_notes: "",
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function loadJob() {
      const { data, error } = await supabase
        .from("client_requests")
        .select("*")
        .eq("id", params.id)
        .maybeSingle();

      if (error || !data) {
        setIsError(true);
        setMessage(error?.message || "Job not found.");
        setLoading(false);
        return;
      }

      setForm({
        title: data.title || "",
        budget: data.budget ? String(data.budget) : "",
        total_hours: data.total_hours ? String(data.total_hours) : "",
        style: data.style || "",
        class_level: data.class_level || "",
        class_frequency: data.class_frequency || "",
        repeat_start_date: data.repeat_start_date || "",
        repeat_end_date: data.repeat_end_date || "",
        repeat_day: data.repeat_day || "",
        repeat_start_time: data.repeat_start_time || "",
        repeat_end_time: data.repeat_end_time || "",
        repeat_weeks: data.repeat_weeks ? String(data.repeat_weeks) : "",
        repeat_notes: data.repeat_notes || "",
        company_name: data.company_name || "",
        client_name: data.client_name || "",
        client_email: data.client_email || "",
        mobile: data.mobile || "",
        location: data.location || "",
        details: data.details || "",
        status: data.status || "pending_review",
        review_notes: data.review_notes || "",
      });
      setImageUrls(data.image_urls || []);
      setLoading(false);
    }

    loadJob();
  }, [params.id]);

  function updateField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function notifyStatus(status: string) {
    const event =
      status === "open"
        ? "job_approved"
        : status === "needs_changes"
          ? "job_needs_changes"
          : status === "rejected"
            ? "job_rejected"
            : "";

    if (!event) return "";

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return "Email notification not sent because the admin session was missing.";

    const response = await fetch("/api/notifications/event", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event, id: params.id }),
    }).catch(() => null);

    if (!response) return "Email notification could not be checked.";

    const result = await response.json().catch(() => ({}));
    if (!response.ok) return `Email notification failed: ${result.error || "Unknown error"}`;
    if (result.sent) return " Email notification sent.";
    if (result.skipped) return ` Email notification skipped: ${result.reason || "Unknown reason"}`;
    if (result.error) return ` Email notification failed: ${result.error}`;
    return " Email notification checked.";
  }

  async function saveJob(nextStatus?: string, reviewNotesOverride?: string) {
    setMessage("");
    setIsError(false);

    const status = nextStatus || form.status;
    const reviewNotes = reviewNotesOverride ?? form.review_notes;

    if (status === "needs_changes" && !reviewNotes.trim()) {
      setIsError(true);
      setMessage("Add review notes before sending this back to the client.");
      return;
    }

    const { error } = await supabase
      .from("client_requests")
      .update({
        title: form.title,
        budget: form.budget ? Number(form.budget) : null,
        total_hours: form.total_hours ? Number(form.total_hours) : null,
        style: form.style || null,
        class_level: form.class_level || null,
        class_frequency: form.class_frequency || null,
        repeat_start_date: form.class_frequency === "Ongoing" && form.repeat_start_date ? form.repeat_start_date : null,
        repeat_end_date: form.class_frequency === "Ongoing" && form.repeat_end_date ? form.repeat_end_date : null,
        repeat_day: form.class_frequency === "Ongoing" ? form.repeat_day || null : null,
        repeat_start_time: form.class_frequency === "Ongoing" && form.repeat_start_time ? form.repeat_start_time : null,
        repeat_end_time: form.class_frequency === "Ongoing" && form.repeat_end_time ? form.repeat_end_time : null,
        repeat_weeks: form.class_frequency === "Ongoing" && form.repeat_weeks ? Number(form.repeat_weeks) : null,
        repeat_notes: form.class_frequency === "Ongoing" ? form.repeat_notes || null : null,
        company_name: form.company_name || null,
        client_name: form.client_name,
        client_email: form.client_email,
        mobile: form.mobile || null,
        location: form.location || null,
        details: form.details || null,
        category: form.style || "Instructor request",
        status,
        review_notes: reviewNotes || null,
      })
      .eq("id", params.id);

    if (error) {
      setIsError(true);
      setMessage(error.message);
      return;
    }

    setForm((current) => ({ ...current, status, review_notes: reviewNotes }));
    const notificationMessage = await notifyStatus(status);
    setMessage(
      (status === "open"
        ? "Job approved and published."
        : status === "needs_changes"
          ? "Change request sent to the client."
          : "Job saved.") + notificationMessage
    );
  }

  async function requestChanges() {
    const notes = window.prompt(
      "What changes should the client make before this listing can be approved?",
      form.review_notes
    );

    if (notes === null) return;

    if (!notes.trim()) {
      setIsError(true);
      setMessage("Add review notes before sending this back to the client.");
      return;
    }

    await saveJob("needs_changes", notes.trim());
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveJob();
  }

  return (
    <main className="container">
      <Nav />

      <AdminGate>
      <section className="pageHeader">
        <p className="eyebrow">Admin review</p>
        <h1>Review job submission</h1>
        <p>Edit the submission, then approve, request changes, or reject it.</p>
      </section>

      {loading ? (
        <p>Loading submission...</p>
      ) : (
        <form className="formPanel wideForm" onSubmit={onSubmit}>
          <div className="buttonRow">
            <button className="btn" type="button" onClick={() => saveJob("open")}>
              Approve / publish
            </button>
            <button className="secondaryButton" type="button" onClick={requestChanges}>
              Needs changes
            </button>
            <button className="secondaryButton" type="button" onClick={() => saveJob("rejected")}>
              Reject
            </button>
          </div>
          {message && <p className={isError ? "formMessage error" : "formMessage"}>{message}</p>}

          <label>
            Review status
            <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            Review notes
            <textarea
              rows={4}
              value={form.review_notes}
              onChange={(event) => updateField("review_notes", event.target.value)}
            />
          </label>

          <label>
            Title
            <input required value={form.title} onChange={(event) => updateField("title", event.target.value)} />
          </label>

          <label>
            Details
            <textarea rows={7} value={form.details} onChange={(event) => updateField("details", event.target.value)} />
          </label>

          <div className="fieldGrid">
            <label>
              Style
              <select value={form.style} onChange={(event) => updateField("style", event.target.value)}>
                <option value="">Select style</option>
                {styleOptions.map((style) => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </label>
            <label>
              Class level
              <input value={form.class_level} onChange={(event) => updateField("class_level", event.target.value)} />
            </label>
          </div>

          <div className="fieldGrid">
            <label>
              Budget
              <input type="number" value={form.budget} onChange={(event) => updateField("budget", event.target.value)} />
            </label>
            <label>
              Total hours
              <input min="0" step="0.25" type="number" value={form.total_hours} onChange={(event) => updateField("total_hours", event.target.value)} />
            </label>
          </div>

          {form.budget && form.total_hours && Number(form.total_hours) > 0 && (
            <p className="helperText">
              Estimated hourly rate: ${(Number(form.budget) / Number(form.total_hours)).toFixed(2)} per hour
            </p>
          )}

          <div className="fieldGrid">
            <label>
              Frequency
              <select value={form.class_frequency} onChange={(event) => updateField("class_frequency", event.target.value)}>
                <option value="">Select frequency</option>
                <option value="One Off">One Off</option>
                <option value="Ongoing">Ongoing</option>
              </select>
            </label>
          </div>

          {form.class_frequency === "Ongoing" && (
            <section className="formSection">
              <p className="formSectionLabel">Repeat booking</p>
              <div className="fieldGrid">
                <label>
                  Term start date
                  <input type="date" value={form.repeat_start_date} onChange={(event) => updateField("repeat_start_date", event.target.value)} />
                </label>
                <label>
                  Term end date
                  <input type="date" value={form.repeat_end_date} onChange={(event) => updateField("repeat_end_date", event.target.value)} />
                </label>
              </div>
              <div className="fieldGrid">
                <label>
                  Repeat day
                  <select value={form.repeat_day} onChange={(event) => updateField("repeat_day", event.target.value)}>
                    <option value="">Select day</option>
                    {weekDays.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Number of weeks
                  <input min="0" step="1" type="number" value={form.repeat_weeks} onChange={(event) => updateField("repeat_weeks", event.target.value)} />
                </label>
              </div>
              <div className="fieldGrid">
                <label>
                  Start time
                  <input type="time" value={form.repeat_start_time} onChange={(event) => updateField("repeat_start_time", event.target.value)} />
                </label>
                <label>
                  End time
                  <input type="time" value={form.repeat_end_time} onChange={(event) => updateField("repeat_end_time", event.target.value)} />
                </label>
              </div>
              <label>
                Repeat booking notes
                <textarea rows={4} value={form.repeat_notes} onChange={(event) => updateField("repeat_notes", event.target.value)} />
              </label>
            </section>
          )}

          <label>
            Location
            <input
              list="admin-job-suburbs"
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
            />
            <datalist id="admin-job-suburbs">
              {serviceAreaOptions.map((suburb) => (
                <option key={suburb} value={suburb} />
              ))}
            </datalist>
          </label>

          <label>
            Company/School/Business
            <input value={form.company_name} onChange={(event) => updateField("company_name", event.target.value)} />
          </label>

          <div className="fieldGrid">
            <label>
              Client name
              <input required value={form.client_name} onChange={(event) => updateField("client_name", event.target.value)} />
            </label>
            <label>
              Client email
              <input required type="email" value={form.client_email} onChange={(event) => updateField("client_email", event.target.value)} />
            </label>
          </div>

          <label>
            Mobile
            <input value={form.mobile} onChange={(event) => updateField("mobile", event.target.value)} />
          </label>

          {imageUrls.length > 0 && (
            <section className="formSection">
              <p className="formSectionLabel">Submitted images</p>
              <div className="fileLinks">
                {imageUrls.map((url, index) => (
                  <a href={url} key={url} target="_blank">Image {index + 1}</a>
                ))}
              </div>
            </section>
          )}

          <button className="btn" type="submit">Save changes</button>
        </form>
      )}
      </AdminGate>
    </main>
  );
}
