"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminGate from "../../../../components/AdminGate";
import Nav from "../../../../components/Nav";
import { serviceAreaOptions, styleOptions } from "../../../../lib/instructorOptions";
import { supabase } from "../../../../lib/supabase";

const statusOptions = ["pending_review", "approved", "needs_changes", "rejected"];

export default function AdminInstructorReview() {
  const params = useParams<{ id: string }>();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    name: "",
    email: "",
    mobile: "",
    location: "",
    country: "Australia",
    bio: "",
    hourly_rate: "",
    date_of_birth: "",
    abn: "",
    registered_for_gst: false,
    working_with_children_card: "",
    working_with_children_expiry: "",
    review_status: "pending_review",
    review_notes: "",
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [files, setFiles] = useState({
    headshot_url: "",
    profile_video_url: "",
  });
  const [payoutSetup, setPayoutSetup] = useState({
    stripe_connect_account_id: "",
    stripe_connect_onboarding_complete: false,
    stripe_connect_charges_enabled: false,
    stripe_connect_payouts_enabled: false,
    stripe_connect_requirements_due: [] as string[],
    stripe_connect_updated_at: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function loadInstructor() {
      const { data, error } = await supabase
        .from("instructors")
        .select("*")
        .eq("id", params.id)
        .maybeSingle();

      if (error || !data) {
        setIsError(true);
        setMessage(error?.message || "Instructor not found.");
        setLoading(false);
        return;
      }

      setForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        name: data.name || "",
        email: data.email || "",
        mobile: data.mobile || "",
        location: data.location || "",
        country: data.country || "Australia",
        bio: data.bio || "",
        hourly_rate: data.hourly_rate ? String(data.hourly_rate) : "",
        date_of_birth: data.date_of_birth || "",
        abn: data.abn || "",
        registered_for_gst: Boolean(data.registered_for_gst),
        working_with_children_card: data.working_with_children_card || "",
        working_with_children_expiry: data.working_with_children_expiry || "",
        review_status: data.review_status || (data.approved ? "approved" : "pending_review"),
        review_notes: data.review_notes || "",
      });
      setCategories(data.categories || []);
      setServiceAreas(data.service_areas || []);
      setFiles({
        headshot_url: data.headshot_url || "",
        profile_video_url: data.profile_video_url || "",
      });
      setPayoutSetup({
        stripe_connect_account_id: data.stripe_connect_account_id || "",
        stripe_connect_onboarding_complete: Boolean(data.stripe_connect_onboarding_complete),
        stripe_connect_charges_enabled: Boolean(data.stripe_connect_charges_enabled),
        stripe_connect_payouts_enabled: Boolean(data.stripe_connect_payouts_enabled),
        stripe_connect_requirements_due: data.stripe_connect_requirements_due || [],
        stripe_connect_updated_at: data.stripe_connect_updated_at || "",
      });
      setLoading(false);
    }

    loadInstructor();
  }, [params.id]);

  function updateField(name: string, value: string | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleValue(value: string, values: string[], setter: (values: string[]) => void) {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  async function notifyStatus(reviewStatus: string) {
    const event =
      reviewStatus === "approved"
        ? "instructor_approved"
        : reviewStatus === "needs_changes"
          ? "instructor_needs_changes"
          : reviewStatus === "rejected"
            ? "instructor_rejected"
            : "";

    if (!event) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    await fetch("/api/notifications/event", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event, id: params.id }),
    }).catch(() => null);
  }

  async function saveInstructor(nextStatus?: string) {
    setMessage("");
    setIsError(false);

    const reviewStatus = nextStatus || form.review_status;
    const approved = reviewStatus === "approved";
    const name = form.name || `${form.first_name} ${form.last_name}`.trim();

    const { error } = await supabase
      .from("instructors")
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        name,
        email: form.email,
        mobile: form.mobile || null,
        location: form.location || null,
        country: form.country || null,
        bio: form.bio || null,
        hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null,
        date_of_birth: form.date_of_birth || null,
        abn: form.abn || null,
        registered_for_gst: form.registered_for_gst,
        working_with_children_card: form.working_with_children_card || null,
        working_with_children_expiry: form.working_with_children_expiry || null,
        categories,
        service_areas: serviceAreas,
        approved,
        review_status: reviewStatus,
        review_notes: form.review_notes || null,
      })
      .eq("id", params.id);

    if (error) {
      setIsError(true);
      setMessage(error.message);
      return;
    }

    setForm((current) => ({ ...current, name, review_status: reviewStatus }));
    await notifyStatus(reviewStatus);
    setMessage(approved ? "Instructor approved and published." : "Instructor saved.");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveInstructor();
  }

  return (
    <main className="container">
      <Nav />

      <AdminGate>
      <section className="pageHeader">
        <p className="eyebrow">Admin review</p>
        <h1>Review instructor profile</h1>
        <p>Edit the profile, then approve, request changes, or reject it.</p>
      </section>

      {loading ? (
        <p>Loading profile...</p>
      ) : (
        <form className="formPanel wideForm" onSubmit={onSubmit}>
          <div className="buttonRow">
            <button className="btn" type="button" onClick={() => saveInstructor("approved")}>
              Approve / publish
            </button>
            <button className="secondaryButton" type="button" onClick={() => saveInstructor("needs_changes")}>
              Needs changes
            </button>
            <button className="secondaryButton" type="button" onClick={() => saveInstructor("rejected")}>
              Reject
            </button>
          </div>
          {message && <p className={isError ? "formMessage error" : "formMessage"}>{message}</p>}

          <section className="formSection">
            <p className="formSectionLabel">Payout setup</p>
            <div className="adminStats payoutStatusGrid">
              <div>
                <span>Stripe account</span>
                <strong>{payoutSetup.stripe_connect_account_id ? "Created" : "Not started"}</strong>
              </div>
              <div>
                <span>Onboarding</span>
                <strong>{payoutSetup.stripe_connect_onboarding_complete ? "Complete" : "Required"}</strong>
              </div>
              <div>
                <span>Charges</span>
                <strong>{payoutSetup.stripe_connect_charges_enabled ? "Enabled" : "Pending"}</strong>
              </div>
              <div>
                <span>Payouts</span>
                <strong>{payoutSetup.stripe_connect_payouts_enabled ? "Enabled" : "Pending"}</strong>
              </div>
            </div>
            {payoutSetup.stripe_connect_account_id && (
              <p className="helperText">Stripe account: {payoutSetup.stripe_connect_account_id}</p>
            )}
            {payoutSetup.stripe_connect_requirements_due.length > 0 && (
              <p className="helperText">
                Requirements due: {payoutSetup.stripe_connect_requirements_due.join(", ")}
              </p>
            )}
            {payoutSetup.stripe_connect_updated_at && (
              <p className="helperText">
                Last checked: {new Date(payoutSetup.stripe_connect_updated_at).toLocaleString("en-AU")}
              </p>
            )}
          </section>

          <label>
            Review status
            <select value={form.review_status} onChange={(event) => updateField("review_status", event.target.value)}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>

          <label>
            Review notes
            <textarea rows={4} value={form.review_notes} onChange={(event) => updateField("review_notes", event.target.value)} />
          </label>

          {files.headshot_url && (
            <section className="formSection">
              <p className="formSectionLabel">Profile photo</p>
              <img className="imagePreview" src={files.headshot_url} alt={form.name} />
            </section>
          )}

          <div className="fieldGrid">
            <label>
              First name
              <input required value={form.first_name} onChange={(event) => updateField("first_name", event.target.value)} />
            </label>
            <label>
              Last name
              <input required value={form.last_name} onChange={(event) => updateField("last_name", event.target.value)} />
            </label>
          </div>

          <label>
            Display name
            <input required value={form.name} onChange={(event) => updateField("name", event.target.value)} />
          </label>

          <div className="fieldGrid">
            <label>
              Email
              <input required type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
            </label>
            <label>
              Mobile
              <input value={form.mobile} onChange={(event) => updateField("mobile", event.target.value)} />
            </label>
          </div>

          <div className="fieldGrid">
            <label>
              Location
              <input value={form.location} onChange={(event) => updateField("location", event.target.value)} />
            </label>
            <label>
              Country
              <input value={form.country} onChange={(event) => updateField("country", event.target.value)} />
            </label>
          </div>

          <fieldset>
            <legend>Categories</legend>
            <div className="checkboxGrid">
              {styleOptions.map((category) => (
                <label className="checkboxOption" key={category}>
                  <input
                    checked={categories.includes(category)}
                    type="checkbox"
                    onChange={() => toggleValue(category, categories, setCategories)}
                  />
                  {category}
                </label>
              ))}
            </div>
          </fieldset>

          <label>
            Bio
            <textarea rows={7} value={form.bio} onChange={(event) => updateField("bio", event.target.value)} />
          </label>

          <fieldset>
            <legend>Service areas</legend>
            <div className="checkboxGrid serviceAreaGrid">
              {serviceAreaOptions.map((suburb) => (
                <label className="checkboxOption" key={suburb}>
                  <input
                    checked={serviceAreas.includes(suburb)}
                    type="checkbox"
                    onChange={() => toggleValue(suburb, serviceAreas, setServiceAreas)}
                  />
                  {suburb}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="fieldGrid">
            <label>
              Hourly rate
              <input type="number" value={form.hourly_rate} onChange={(event) => updateField("hourly_rate", event.target.value)} />
            </label>
            <label>
              Date of birth
              <input type="date" value={form.date_of_birth} onChange={(event) => updateField("date_of_birth", event.target.value)} />
            </label>
          </div>

          <div className="fieldGrid">
            <label>
              ABN
              <input value={form.abn} onChange={(event) => updateField("abn", event.target.value)} />
            </label>
            <label className="checkboxOption">
              <input
                checked={form.registered_for_gst}
                type="checkbox"
                onChange={(event) => updateField("registered_for_gst", event.target.checked)}
              />
              Registered for GST
            </label>
          </div>

          <div className="fieldGrid">
            <label>
              Working with children card
              <input value={form.working_with_children_card} onChange={(event) => updateField("working_with_children_card", event.target.value)} />
            </label>
            <label>
              Working with children expiry
              <input type="date" value={form.working_with_children_expiry} onChange={(event) => updateField("working_with_children_expiry", event.target.value)} />
            </label>
          </div>

          <section className="formSection">
            <p className="formSectionLabel">Submitted files</p>
            <div className="fileLinks">
              {files.headshot_url && <a href={files.headshot_url} target="_blank">Headshot</a>}
              {files.profile_video_url && <a href={files.profile_video_url} target="_blank">Video</a>}
              {!files.headshot_url && !files.profile_video_url && "No files supplied"}
            </div>
          </section>

          <button className="btn" type="submit">Save changes</button>
        </form>
      )}
      </AdminGate>
    </main>
  );
}
