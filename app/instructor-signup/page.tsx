"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import AuthGate from "../../components/AuthGate";
import Nav from "../../components/Nav";
import {
  australianSuburbs,
  serviceAreaOptions,
  styleOptions,
} from "../../lib/instructorOptions";
import { errorMessage } from "../../lib/profile";
import { supabase } from "../../lib/supabase";

const profileExample =
  "I am a Brisbane-based dance instructor with experience teaching students across a range of ages and abilities. My classes are structured, encouraging, and tailored to the needs of each group, whether the goal is confidence, technique, performance preparation, or a fun one-off workshop. I focus on creating a positive learning environment where students feel supported, challenged, and excited to participate.";

type InstructorAccount = {
  id: string;
  email: string;
  stripe_connect_account_id: string | null;
  stripe_connect_onboarding_complete: boolean | null;
  stripe_connect_charges_enabled: boolean | null;
  stripe_connect_payouts_enabled: boolean | null;
  stripe_connect_requirements_due: string[] | null;
};

export default function InstructorSignup() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    location: "",
    country: "Australia",
    bio: "",
    hourly_rate: "",
    date_of_birth: "",
    mobile: "",
    abn: "",
    registered_for_gst: "false",
    working_with_children_card: "",
    working_with_children_expiry: "",
    terms_accepted: false,
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [selectedServiceAreas, setSelectedServiceAreas] = useState<string[]>([]);
  const [headshot, setHeadshot] = useState<File | null>(null);
  const [profileVideo, setProfileVideo] = useState<File | null>(null);
  const [headshotPreview, setHeadshotPreview] = useState("");
  const [showProfileHelp, setShowProfileHelp] = useState(false);
  const [currentInstructor, setCurrentInstructor] = useState<InstructorAccount | null>(null);
  const [payoutStatus, setPayoutStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [payoutMessage, setPayoutMessage] = useState("");
  const [stripeConnectSetupUrl, setStripeConnectSetupUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function loadCurrentInstructor() {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) return;

    const { data } = await supabase
      .from("instructors")
      .select(
        "id,email,stripe_connect_account_id,stripe_connect_onboarding_complete,stripe_connect_charges_enabled,stripe_connect_payouts_enabled,stripe_connect_requirements_due"
      )
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setCurrentInstructor((data as InstructorAccount | null) || null);
  }

  useEffect(() => {
    loadCurrentInstructor();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payout = params.get("payout");

    if (payout === "return" || payout === "refresh") {
      refreshPayoutStatus();
    }
  }, []);

  function updateField(name: string, value: string | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleValue(value: string, values: string[], setValues: (next: string[]) => void) {
    setValues(
      values.includes(value)
        ? values.filter((current) => current !== value)
        : [...values, value]
    );
  }

  function toggleAllServiceAreas() {
    setSelectedServiceAreas(
      selectedServiceAreas.length === serviceAreaOptions.length ? [] : serviceAreaOptions
    );
  }

  function addCustomCategory() {
    const category = customCategory.trim();
    if (!category) return;

    if (!categories.includes(category)) {
      setCategories((current) => [...current, category]);
    }

    if (!customCategories.includes(category) && !styleOptions.includes(category)) {
      setCustomCategories((current) => [...current, category]);
    }

    setCustomCategory("");
  }

  function updateHeadshot(file: File | null) {
    setHeadshot(file);
    setHeadshotPreview(file ? URL.createObjectURL(file) : "");
  }

  function createProfileStarter() {
    const firstName = form.first_name || "I";
    const categoryText = categories.length ? categories.join(", ") : "my chosen styles";
    const locationText = form.location ? ` based in ${form.location}` : "";

    updateField(
      "bio",
      `${firstName} is an instructor${locationText} specialising in ${categoryText}. My classes are designed to be professional, engaging, and tailored to the needs of each client, from one-off workshops through to ongoing classes. I focus on clear communication, reliable preparation, and creating a positive class environment where students feel confident, supported, and excited to learn.`
    );
  }

  async function authHeaders() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function refreshPayoutStatus() {
    setPayoutStatus("loading");
    setPayoutMessage("");
    setStripeConnectSetupUrl("");

    const response = await fetch("/api/stripe/connect/refresh-status", {
      method: "POST",
      headers: await authHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      setPayoutStatus("error");
      setPayoutMessage(data.error || "Could not refresh payout setup.");
      return;
    }

    await loadCurrentInstructor();
    setPayoutStatus("success");
    setPayoutMessage("Payout setup status refreshed.");
  }

  async function startPayoutSetup() {
    setPayoutStatus("loading");
    setPayoutMessage("");
    setStripeConnectSetupUrl("");

    const headers = await authHeaders();
    const accountResponse = await fetch("/api/stripe/connect/create-account", {
      method: "POST",
      headers,
    });
    const accountData = await accountResponse.json();

    if (!accountResponse.ok) {
      setPayoutStatus("error");
      setPayoutMessage(accountData.error || "Could not create Stripe payout account.");
      if (accountData.setupUrl) {
        setStripeConnectSetupUrl(accountData.setupUrl);
      }
      return;
    }

    const linkResponse = await fetch("/api/stripe/connect/onboarding-link", {
      method: "POST",
      headers,
    });
    const linkData = await linkResponse.json();

    if (!linkResponse.ok || !linkData.url) {
      setPayoutStatus("error");
      setPayoutMessage(linkData.error || "Could not create Stripe onboarding link.");
      return;
    }

    window.location.href = linkData.url;
  }

  async function uploadFile(file: File, folder: string) {
    const safeName = file.name.replace(/[^a-z0-9.-]/gi, "-").toLowerCase();
    const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage
      .from("instructor-files")
      .upload(path, file);

    if (error) {
      throw error;
    }

    return supabase.storage.from("instructor-files").getPublicUrl(path).data.publicUrl;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    if (!form.terms_accepted) {
      setStatus("error");
      setMessage("Please agree to the terms and conditions before submitting.");
      return;
    }

    if (categories.length === 0) {
      setStatus("error");
      setMessage("Please select at least one category.");
      return;
    }

    if (!headshot) {
      setStatus("error");
      setMessage("Please upload your profile photo.");
      return;
    }

    if (!form.bio.trim()) {
      setStatus("error");
      setMessage("Please write your instructor profile before submitting.");
      return;
    }

    try {
      const formElement = event.currentTarget;
      const { data: sessionData } = await supabase.auth.getSession();
      const [headshotUrl, profileVideoUrl] = await Promise.all([
        headshot ? uploadFile(headshot, "headshots") : Promise.resolve(null),
        profileVideo ? uploadFile(profileVideo, "profile-videos") : Promise.resolve(null),
      ]);

      const fullName = `${form.first_name} ${form.last_name}`.trim();
      const { data: insertedInstructor, error } = await supabase.from("instructors").insert({
        user_id: sessionData.session?.user.id || null,
        first_name: form.first_name,
        last_name: form.last_name,
        name: fullName,
        email: form.email,
        location: form.location || null,
        country: form.country || null,
        categories,
        bio: form.bio || null,
        hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null,
        date_of_birth: form.date_of_birth || null,
        mobile: form.mobile || null,
        abn: form.abn || null,
        registered_for_gst: form.registered_for_gst === "true",
        working_with_children_card: form.working_with_children_card || null,
        working_with_children_expiry: form.working_with_children_expiry || null,
        service_areas: selectedServiceAreas,
        headshot_url: headshotUrl,
        profile_video_url: profileVideoUrl,
        terms_accepted: form.terms_accepted,
        approved: false,
        review_status: "pending_review",
      }).select("id").single();

      if (error) {
        throw error;
      }

      if (insertedInstructor?.id) {
        fetch("/api/submissions/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "instructor", id: insertedInstructor.id }),
        }).catch(() => null);
      }

      await loadCurrentInstructor();
      setStatus("success");
      setMessage("Thanks for applying. We will review your instructor profile shortly.");
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        location: "",
        country: "Australia",
        bio: "",
        hourly_rate: "",
        date_of_birth: "",
        mobile: "",
        abn: "",
        registered_for_gst: "false",
        working_with_children_card: "",
        working_with_children_expiry: "",
        terms_accepted: false,
      });
      setCategories([]);
      setCustomCategory("");
      setCustomCategories([]);
      setSelectedServiceAreas([]);
      setHeadshot(null);
      setProfileVideo(null);
      setHeadshotPreview("");
      formElement.reset();
    } catch (error) {
      setStatus("error");
      setMessage(errorMessage(error) || "Could not submit profile.");
    }
  }

  return (
    <main className="container">
      <Nav />

      <section className="pageHeader">
        <p className="eyebrow">Become an instructor</p>
        <h1>Create your instructor profile</h1>
        <p>
          Tell us about what you teach. New profiles are reviewed before appearing
          on the marketplace.
        </p>
      </section>

      <AuthGate>
      {currentInstructor && (
        <section className="formPanel wideForm">
          <p className="formSectionLabel">Payout setup</p>
          <h2>Instructor payouts</h2>
          <p>
            Connect Stripe so BookAnInstructor can release instructor payouts
            after confirmed bookings are completed. We do not store your bank
            details.
          </p>
          <div className="setupOverview">
            <h3>What you need for payout setup</h3>
            <p>Stripe will ask you to confirm your identity and payout details. Have these ready:</p>
            <ul>
              <li>Your legal name and date of birth</li>
              <li>Your home or business address</li>
              <li>Your ABN if you use one for instructing</li>
              <li>Your bank account details for payouts</li>
              <li>A government ID if Stripe requests verification</li>
            </ul>
          </div>
          <div className="adminStats payoutStatusGrid">
            <div>
              <span>Onboarding</span>
              <strong>
                {currentInstructor.stripe_connect_onboarding_complete ? "Complete" : "Required"}
              </strong>
            </div>
            <div>
              <span>Charges</span>
              <strong>
                {currentInstructor.stripe_connect_charges_enabled ? "Enabled" : "Pending"}
              </strong>
            </div>
            <div>
              <span>Payouts</span>
              <strong>
                {currentInstructor.stripe_connect_payouts_enabled ? "Enabled" : "Pending"}
              </strong>
            </div>
          </div>

          {currentInstructor.stripe_connect_requirements_due?.length ? (
            <p className="helperText">
              Stripe still needs: {currentInstructor.stripe_connect_requirements_due.join(", ")}
            </p>
          ) : null}

          <div className="buttonRow">
            <button
              className="btn"
              disabled={payoutStatus === "loading"}
              type="button"
              onClick={startPayoutSetup}
            >
              {payoutStatus === "loading"
                ? "Opening Stripe..."
                : currentInstructor.stripe_connect_account_id
                  ? "Continue payout setup"
                  : "Set up payouts"}
            </button>
            <button
              className="secondaryButton"
              disabled={payoutStatus === "loading"}
              type="button"
              onClick={refreshPayoutStatus}
            >
              Refresh payout status
            </button>
            {stripeConnectSetupUrl && (
              <a className="secondaryButton" href={stripeConnectSetupUrl} target="_blank">
                Open Stripe Connect setup
              </a>
            )}
          </div>

          {currentInstructor.stripe_connect_onboarding_complete &&
            currentInstructor.stripe_connect_payouts_enabled && (
              <p className="formMessage">Payout setup complete.</p>
            )}

          {payoutMessage && (
            <p className={payoutStatus === "error" ? "formMessage error" : "formMessage"}>
              {payoutMessage}
            </p>
          )}
        </section>
      )}

      <form className="formPanel wideForm" onSubmit={onSubmit}>
        <section className="formSection">
          <p className="formSectionLabel">Your Profile photo</p>
          {headshotPreview && (
            <div className="imagePreviewWrap">
              <img alt="Profile preview" className="imagePreview" src={headshotPreview} />
              <button className="removeImageButton" type="button" onClick={() => updateHeadshot(null)}>
                x
              </button>
            </div>
          )}
          <label className="fileButtonLabel">
            <span>{headshotPreview ? "Change image" : "Select image"}</span>
            <input
              accept="image/*"
              required={!headshot}
              type="file"
              onChange={(event) => updateHeadshot(event.target.files?.[0] || null)}
            />
          </label>
        </section>

        <div className="fieldGrid">
          <label>
            First name
            <input
              required
              value={form.first_name}
              onChange={(event) => updateField("first_name", event.target.value)}
              placeholder="Sarah"
            />
          </label>

          <label>
            Last name
            <input
              required
              value={form.last_name}
              onChange={(event) => updateField("last_name", event.target.value)}
              placeholder="Mitchell"
            />
          </label>
        </div>

        <label>
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="sarah@example.com"
          />
        </label>

        <div className="fieldGrid">
          <label>
            Location
            <input
              list="australian-suburbs"
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              placeholder="Start typing a suburb"
            />
            <datalist id="australian-suburbs">
              {australianSuburbs.map((suburb) => (
                <option key={suburb} value={suburb} />
              ))}
            </datalist>
          </label>

          <label>
            Country
            <select
              value={form.country}
              onChange={(event) => updateField("country", event.target.value)}
            >
              <option value="Australia">Australia</option>
              <option value="New Zealand">New Zealand</option>
              <option value="Other">Other</option>
            </select>
          </label>
        </div>

        <fieldset>
          <legend>Categories</legend>
          <div className="checkboxGrid">
            {[...styleOptions, ...customCategories].map((category) => (
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
          <div className="addCategoryRow">
            <input
              value={customCategory}
              onChange={(event) => setCustomCategory(event.target.value)}
              placeholder="Add another category"
            />
            <button className="secondaryButton" type="button" onClick={addCustomCategory}>
              Add another category
            </button>
          </div>
        </fieldset>

        <label>
          Profile info
          <textarea
            required
            rows={6}
            value={form.bio}
            onChange={(event) => updateField("bio", event.target.value)}
            placeholder="Share your teaching experience, styles, class approach, and the types of clients you work well with. Do not include phone numbers, email addresses, or external links."
          />
        </label>
        <div className="buttonRow">
          <button className="secondaryButton" type="button" onClick={createProfileStarter}>
            Help me write it
          </button>
          <button
            className="secondaryButton"
            type="button"
            onClick={() => setShowProfileHelp((current) => !current)}
          >
            {showProfileHelp ? "Hide example" : "Show example"}
          </button>
        </div>
        {showProfileHelp && (
          <section className="profileExamplePanel">
            <p className="formSectionLabel">Example profile</p>
            <p>{profileExample}</p>
          </section>
        )}

        <fieldset>
          <legend>Service areas</legend>
          <button className="secondaryButton" type="button" onClick={toggleAllServiceAreas}>
            {selectedServiceAreas.length === serviceAreaOptions.length
              ? "Clear all areas"
              : "Select all areas"}
          </button>
          <div className="checkboxGrid serviceAreaGrid">
            {serviceAreaOptions.map((suburb) => (
              <label className="checkboxOption" key={suburb}>
                <input
                  checked={selectedServiceAreas.includes(suburb)}
                  type="checkbox"
                  onChange={() =>
                    toggleValue(suburb, selectedServiceAreas, setSelectedServiceAreas)
                  }
                />
                {suburb}
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          Upload your profile video optional
          <input
            accept="video/mp4,video/mpeg,video/quicktime"
            type="file"
            onChange={(event) => setProfileVideo(event.target.files?.[0] || null)}
          />
        </label>

        <div className="fieldGrid">
          <label>
            Date of birth optional
            <input
              type="date"
              value={form.date_of_birth}
              onChange={(event) => updateField("date_of_birth", event.target.value)}
            />
          </label>

          <label>
            Mobile number optional
            <input
              inputMode="tel"
              value={form.mobile}
              onChange={(event) => updateField("mobile", event.target.value)}
              placeholder="+61 412 345 678"
            />
          </label>
        </div>

        <div className="fieldGrid">
          <label>
            Your ABN optional
            <input
              inputMode="numeric"
              value={form.abn}
              onChange={(event) => updateField("abn", event.target.value)}
              placeholder="11 digit ABN"
            />
          </label>

          <label>
            Hourly rate optional
            <input
              min="0"
              step="1"
              type="number"
              value={form.hourly_rate}
              onChange={(event) => updateField("hourly_rate", event.target.value)}
              placeholder="95"
            />
          </label>
        </div>

        <fieldset>
          <legend>Are you registered for GST? optional</legend>
          <div className="inlineOptions">
            <label className="checkboxOption">
              <input
                checked={form.registered_for_gst === "false"}
                name="registered_for_gst"
                type="radio"
                onChange={() => updateField("registered_for_gst", "false")}
              />
              No
            </label>
            <label className="checkboxOption">
              <input
                checked={form.registered_for_gst === "true"}
                name="registered_for_gst"
                type="radio"
                onChange={() => updateField("registered_for_gst", "true")}
              />
              Yes
            </label>
          </div>
        </fieldset>

        <label>
          Your working with children card optional
          <input
            value={form.working_with_children_card}
            onChange={(event) =>
              updateField("working_with_children_card", event.target.value)
            }
            placeholder="Card number"
          />
        </label>

        <label>
          Your working with children card expiry date optional
          <input
            type="date"
            value={form.working_with_children_expiry}
            onChange={(event) =>
              updateField("working_with_children_expiry", event.target.value)
            }
          />
        </label>

        <label className="checkboxOption termsOption">
          <input
            checked={form.terms_accepted}
            required
            type="checkbox"
            onChange={(event) => updateField("terms_accepted", event.target.checked)}
          />
          <span>
            I agree to the{" "}
            <Link className="inlineLink" href="/terms" target="_blank">
              terms and conditions
            </Link>
            .
          </span>
        </label>

        <button className="btn" disabled={status === "saving"} type="submit">
          {status === "saving" ? "Submitting..." : "Submit profile"}
        </button>

        {message && (
          <p className={status === "error" ? "formMessage error" : "formMessage"}>
            {message}
          </p>
        )}
      </form>
      </AuthGate>
    </main>
  );
}
