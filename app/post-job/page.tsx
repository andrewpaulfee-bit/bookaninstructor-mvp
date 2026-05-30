"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthGate from "../../components/AuthGate";
import Nav from "../../components/Nav";
import { firstNameOnly } from "../../lib/displayName";
import { serviceAreaOptions, styleOptions } from "../../lib/instructorOptions";
import { errorMessage, getOrCreateProfile, Profile } from "../../lib/profile";
import { supabase } from "../../lib/supabase";

const classLevels = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Children",
  "Adults",
  "All levels",
];

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type StyleLevel = {
  style: string;
  class_level: string;
};

type SelectedInstructor = {
  id: string;
  name: string;
  location: string | null;
  categories: string[] | null;
  headshot_url: string | null;
};

function PostJobForm() {
  const searchParams = useSearchParams();
  const selectedInstructorId = searchParams.get("instructor");
  const [form, setForm] = useState({
    title: "",
    budget: "",
    total_hours: "",
    location: "",
    class_frequency: "",
    repeat_start_date: "",
    repeat_end_date: "",
    repeat_day: "",
    repeat_start_time: "",
    repeat_end_time: "",
    repeat_weeks: "",
    repeat_notes: "",
    company_name: "",
    first_name: "",
    last_name: "",
    client_email: "",
    mobile: "",
    details: "",
    terms_accepted: false,
  });
  const [styleLevels, setStyleLevels] = useState<StyleLevel[]>([
    { style: "", class_level: "" },
  ]);
  const [customCategory, setCustomCategory] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<SelectedInstructor | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadClientProfile() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setProfileLoaded(true);
        return;
      }

      try {
        const profile = (await getOrCreateProfile(data.session)) as Profile;
        const [firstNameFromFullName = "", ...lastNameParts] =
          (profile.full_name || "").split(" ").filter(Boolean);
        const lastNameFromFullName = lastNameParts.join(" ");

        setForm((current) => ({
          ...current,
          first_name: current.first_name || profile.first_name || firstNameFromFullName,
          last_name: current.last_name || profile.last_name || lastNameFromFullName,
          client_email: current.client_email || profile.email || data.session.user.email || "",
          mobile: current.mobile || profile.mobile || "",
          location: current.location || profile.location || "",
        }));
    } catch (error) {
      setStatus("error");
      setMessage(errorMessage(error) || "Could not load your profile details.");
      }

      setProfileLoaded(true);
    }

    loadClientProfile();
  }, []);

  useEffect(() => {
    async function loadSelectedInstructor() {
      if (!selectedInstructorId) return;

      const { data } = await supabase
        .from("instructors")
        .select("id,name,location,categories,headshot_url")
        .eq("id", selectedInstructorId)
        .maybeSingle();

      setSelectedInstructor(data || null);
    }

    loadSelectedInstructor();
  }, [selectedInstructorId]);

  function updateField(name: string, value: string | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateStyleLevel(index: number, field: keyof StyleLevel, value: string) {
    setStyleLevels((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    );
  }

  function addStyleLevel() {
    setStyleLevels((current) => [...current, { style: "", class_level: "" }]);
  }

  function removeStyleLevel(index: number) {
    setStyleLevels((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }

  function addCustomCategory() {
    const category = customCategory.trim();
    if (!category) return;

    if (!customCategories.includes(category) && !styleOptions.includes(category)) {
      setCustomCategories((current) => [...current, category]);
    }

    setStyleLevels((current) => {
      const emptyIndex = current.findIndex((row) => !row.style);
      if (emptyIndex === -1) return [...current, { style: category, class_level: "" }];

      return current.map((row, index) =>
        index === emptyIndex ? { ...row, style: category } : row
      );
    });
    setCustomCategory("");
  }

  async function uploadImage(file: File) {
    const safeName = file.name.replace(/[^a-z0-9.-]/gi, "-").toLowerCase();
    const path = `request-images/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from("request-files").upload(path, file);

    if (error) {
      throw error;
    }

    return supabase.storage.from("request-files").getPublicUrl(path).data.publicUrl;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setStatus("saving");
    setMessage("");

    if (!form.terms_accepted) {
      setStatus("error");
      setMessage("Please agree to the terms and conditions before submitting.");
      return;
    }

    const selectedStyleLevels = styleLevels.filter((row) => row.style);

    if (selectedStyleLevels.length === 0) {
      setStatus("error");
      setMessage("Please select at least one style.");
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const imageUrls = await Promise.all(images.map(uploadImage));
      const clientName = `${form.first_name} ${form.last_name}`.trim();
      const primaryStyleLevel = selectedStyleLevels[0];
      const isOngoing = form.class_frequency === "Ongoing";

      const { data: insertedRequest, error } = await supabase.from("client_requests").insert({
        client_user_id: sessionData.session?.user.id || null,
        title: form.title,
        budget: form.budget ? Number(form.budget) : null,
        total_hours: form.total_hours ? Number(form.total_hours) : null,
        location: form.location || null,
        style: primaryStyleLevel.style,
        class_level: primaryStyleLevel.class_level || null,
        style_levels: selectedStyleLevels,
        class_frequency: form.class_frequency || null,
        repeat_start_date: isOngoing && form.repeat_start_date ? form.repeat_start_date : null,
        repeat_end_date: isOngoing && form.repeat_end_date ? form.repeat_end_date : null,
        repeat_day: isOngoing ? form.repeat_day || null : null,
        repeat_start_time: isOngoing && form.repeat_start_time ? form.repeat_start_time : null,
        repeat_end_time: isOngoing && form.repeat_end_time ? form.repeat_end_time : null,
        repeat_weeks: isOngoing && form.repeat_weeks ? Number(form.repeat_weeks) : null,
        repeat_notes: isOngoing ? form.repeat_notes || null : null,
        company_name: form.company_name || null,
        first_name: form.first_name,
        last_name: form.last_name,
        client_name: clientName,
        client_email: form.client_email,
        mobile: form.mobile || null,
        category: primaryStyleLevel.style || "Instructor request",
        details: form.details || null,
        terms_accepted: form.terms_accepted,
        image_urls: imageUrls,
        selected_instructor_id: selectedInstructorId || null,
        status: "pending_review",
      }).select("id").single();

      if (error) {
        throw error;
      }

      if (insertedRequest?.id) {
        fetch("/api/submissions/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "job", id: insertedRequest.id }),
        }).catch(() => null);
      }

      setStatus("success");
      setMessage("Your instructor request has been submitted for review.");
      setForm((current) => ({
        ...current,
        title: "",
        budget: "",
        total_hours: "",
        class_frequency: "",
        repeat_start_date: "",
        repeat_end_date: "",
        repeat_day: "",
        repeat_start_time: "",
        repeat_end_time: "",
        repeat_weeks: "",
        repeat_notes: "",
        company_name: "",
        details: "",
        terms_accepted: false,
      }));
      setStyleLevels([{ style: "", class_level: "" }]);
      setCustomCategory("");
      setCustomCategories([]);
      setImages([]);
      formElement.reset();
    } catch (error) {
      setStatus("error");
      setMessage(errorMessage(error) || "Could not post request.");
    }
  }

  return (
    <main className="container">
      <Nav />

      <section className="pageHeader">
        <p className="eyebrow">Instructor request</p>
        <h1>Instructor Request Form</h1>
        <p>
          Tell instructors what you need, where you need it, and whether the class
          is one-off or ongoing.
        </p>
      </section>

      <AuthGate>
      {!profileLoaded && <p>Loading your saved contact details...</p>}
      <form className="formPanel wideForm" onSubmit={onSubmit}>
        {selectedInstructor && (
          <section className="selectedInstructorPanel">
            {selectedInstructor.headshot_url ? (
              <img alt={firstNameOnly(selectedInstructor.name)} src={selectedInstructor.headshot_url} />
            ) : (
              <div className="selectedInstructorAvatar">
                {firstNameOnly(selectedInstructor.name).slice(0, 1)}
              </div>
            )}
            <div>
              <p className="formSectionLabel">Requesting instructor</p>
              <h2>{firstNameOnly(selectedInstructor.name)}</h2>
              <p>
                {selectedInstructor.categories?.join(", ") || "Instructor"}
                {selectedInstructor.location ? ` · ${selectedInstructor.location}` : ""}
              </p>
            </div>
          </section>
        )}

        <section className="formSection">
          <p className="formSectionLabel">Images optional</p>
          <label className="fileButtonLabel">
            <span>Select images</span>
            <input
              accept="image/*"
              multiple
              type="file"
              onChange={(event) => setImages(Array.from(event.target.files || []))}
            />
          </label>
          {images.length > 0 && (
            <p className="helperText">{images.length} image{images.length === 1 ? "" : "s"} selected</p>
          )}
        </section>

        <label>
          Title
          <input
            required
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Acro and tap teacher on Tuesdays ongoing"
          />
        </label>

        <label>
          Description
          <textarea
            rows={7}
            value={form.details}
            onChange={(event) => updateField("details", event.target.value)}
            placeholder="Describe the class, schedule, goals, number of students, and any special requirements."
          />
        </label>

        <label>
          Budget
          <input
            inputMode="decimal"
            min="0"
            type="number"
            value={form.budget}
            onChange={(event) => updateField("budget", event.target.value)}
            placeholder="100"
          />
        </label>

        <label>
          Total hours
          <input
            inputMode="decimal"
            min="0"
            step="0.25"
            type="number"
            value={form.total_hours}
            onChange={(event) => updateField("total_hours", event.target.value)}
            placeholder="2"
          />
        </label>

        {form.budget && form.total_hours && Number(form.total_hours) > 0 && (
          <p className="helperText">
            Estimated hourly rate: $
            {(Number(form.budget) / Number(form.total_hours)).toFixed(2)} per hour
          </p>
        )}

        <label>
          Location
          <input
            list="request-suburbs"
            value={form.location}
            onChange={(event) => updateField("location", event.target.value)}
            placeholder="Start typing a suburb"
          />
          <datalist id="request-suburbs">
            {serviceAreaOptions.map((suburb) => (
              <option key={suburb} value={suburb} />
            ))}
          </datalist>
        </label>

        <section className="formSection">
          <p className="formSectionLabel">Styles and class levels</p>
          {styleLevels.map((row, index) => (
            <div className="repeatableRow" key={index}>
              <label>
                Select the style
                <select
                  required={index === 0}
                  value={row.style}
                  onChange={(event) =>
                    updateStyleLevel(index, "style", event.target.value)
                  }
                >
                  <option value="">Select a style</option>
                  {[...styleOptions, ...customCategories].map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Class level
                <select
                  value={row.class_level}
                  onChange={(event) =>
                    updateStyleLevel(index, "class_level", event.target.value)
                  }
                >
                  <option value="">Select level</option>
                  {classLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>

              {styleLevels.length > 1 && (
                <button
                  className="iconTextButton"
                  type="button"
                  onClick={() => removeStyleLevel(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button className="secondaryButton" type="button" onClick={addStyleLevel}>
            Add another style and level
          </button>
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
        </section>

        <fieldset>
          <legend>Class frequency</legend>
          <div className="inlineOptions">
            <label className="checkboxOption">
              <input
                checked={form.class_frequency === "One Off"}
                name="class_frequency"
                type="radio"
                onChange={() => updateField("class_frequency", "One Off")}
              />
              One Off
            </label>
            <label className="checkboxOption">
              <input
                checked={form.class_frequency === "Ongoing"}
                name="class_frequency"
                type="radio"
                onChange={() => updateField("class_frequency", "Ongoing")}
              />
              Ongoing
            </label>
          </div>
        </fieldset>

        {form.class_frequency === "Ongoing" && (
          <section className="formSection">
            <p className="formSectionLabel">Repeat booking</p>
            <div className="fieldGrid">
              <label>
                Term start date
                <input
                  type="date"
                  value={form.repeat_start_date}
                  onChange={(event) => updateField("repeat_start_date", event.target.value)}
                />
              </label>
              <label>
                Term end date
                <input
                  type="date"
                  value={form.repeat_end_date}
                  onChange={(event) => updateField("repeat_end_date", event.target.value)}
                />
              </label>
            </div>

            <div className="fieldGrid">
              <label>
                Repeat day
                <select
                  value={form.repeat_day}
                  onChange={(event) => updateField("repeat_day", event.target.value)}
                >
                  <option value="">Select day</option>
                  {weekDays.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Number of weeks
                <input
                  inputMode="decimal"
                  min="0"
                  step="1"
                  type="number"
                  value={form.repeat_weeks}
                  onChange={(event) => updateField("repeat_weeks", event.target.value)}
                  placeholder="10"
                />
              </label>
            </div>

            <div className="fieldGrid">
              <label>
                Start time
                <input
                  type="time"
                  value={form.repeat_start_time}
                  onChange={(event) => updateField("repeat_start_time", event.target.value)}
                />
              </label>
              <label>
                End time
                <input
                  type="time"
                  value={form.repeat_end_time}
                  onChange={(event) => updateField("repeat_end_time", event.target.value)}
                />
              </label>
            </div>

            <label>
              Repeat booking notes
              <textarea
                rows={4}
                value={form.repeat_notes}
                onChange={(event) => updateField("repeat_notes", event.target.value)}
                placeholder="Add term dates, excluded weeks, public holidays, student numbers, or schedule notes."
              />
            </label>
          </section>
        )}

        <label>
          Company/School/Business
          <input
            value={form.company_name}
            onChange={(event) => updateField("company_name", event.target.value)}
            placeholder="Company, school, or business name"
          />
        </label>

        <div className="fieldGrid">
          <label>
            Your first name
            <input
              required
              value={form.first_name}
              onChange={(event) => updateField("first_name", event.target.value)}
            />
          </label>

          <label>
            Your last name
            <input
              required
              value={form.last_name}
              onChange={(event) => updateField("last_name", event.target.value)}
            />
          </label>
        </div>

        <div className="fieldGrid">
          <label>
            Your email
            <input
              required
              type="email"
              value={form.client_email}
              onChange={(event) => updateField("client_email", event.target.value)}
            />
          </label>

          <label>
            Your mobile number
            <input
              inputMode="tel"
              value={form.mobile}
              onChange={(event) => updateField("mobile", event.target.value)}
              placeholder="+61 412 345 678"
            />
          </label>
        </div>

        <label className="checkboxOption termsOption">
          <input
            checked={form.terms_accepted}
            required
            type="checkbox"
            onChange={(event) => updateField("terms_accepted", event.target.checked)}
          />
          <span>
            I agree to the above{" "}
            <Link className="inlineLink" href="/terms" target="_blank">
              terms and conditions
            </Link>
            .
          </span>
        </label>

        <button className="btn" disabled={status === "saving"} type="submit">
          {status === "saving" ? "Posting..." : "Post request"}
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

export default function PostJob() {
  return (
    <Suspense fallback={<main className="container"><Nav /><p>Loading request form...</p></main>}>
      <PostJobForm />
    </Suspense>
  );
}
