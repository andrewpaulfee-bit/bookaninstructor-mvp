"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import AuthGate from "../../components/AuthGate";
import Nav from "../../components/Nav";
import { serviceAreaOptions } from "../../lib/instructorOptions";
import { getOrCreateProfile, Profile } from "../../lib/profile";
import { supabase } from "../../lib/supabase";

export default function ClientProfile() {
  const [profileId, setProfileId] = useState("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;

      try {
        const profile = (await getOrCreateProfile(data.session)) as Profile;
        const [firstNameFromFullName = "", lastNameFromFullName = ""] =
          (profile.full_name || "").split(" ");

        setProfileId(profile.id);
        setForm({
          first_name: profile.first_name || firstNameFromFullName,
          last_name: profile.last_name || lastNameFromFullName,
          email: profile.email || data.session.user.email || "",
          mobile: profile.mobile || "",
          location: profile.location || "",
        });
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Could not load profile.");
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  function updateField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    const fullName = `${form.first_name} ${form.last_name}`.trim();
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        full_name: fullName,
        email: form.email,
        mobile: form.mobile || null,
        location: form.location || null,
        role: "client",
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("saved");
    setMessage("Profile saved.");
  }

  return (
    <main className="container">
      <Nav />

      <section className="pageHeader">
        <p className="eyebrow">Client profile</p>
        <h1>Create your basic profile</h1>
        <p>Add your contact details now, then post a job whenever you are ready.</p>
      </section>

      <AuthGate>
        {loading ? (
          <p>Loading your profile...</p>
        ) : (
          <form className="formPanel" onSubmit={onSubmit}>
            <div className="fieldGrid">
              <label>
                First name
                <input
                  required
                  value={form.first_name}
                  onChange={(event) => updateField("first_name", event.target.value)}
                />
              </label>

              <label>
                Last name
                <input
                  required
                  value={form.last_name}
                  onChange={(event) => updateField("last_name", event.target.value)}
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
              />
            </label>

            <label>
              Mobile
              <input
                inputMode="tel"
                value={form.mobile}
                onChange={(event) => updateField("mobile", event.target.value)}
                placeholder="+61 412 345 678"
              />
            </label>

            <label>
              Location
              <input
                list="client-profile-service-areas"
                value={form.location}
                onChange={(event) => updateField("location", event.target.value)}
                placeholder="Start typing a suburb"
              />
              <datalist id="client-profile-service-areas">
                {serviceAreaOptions.map((suburb) => (
                  <option key={suburb} value={suburb} />
                ))}
              </datalist>
            </label>

            <div className="buttonRow">
              <button className="btn" disabled={status === "saving"} type="submit">
                {status === "saving" ? "Saving..." : "Save profile"}
              </button>
              <Link className="secondaryButton" href="/post-job">
                Add a job now
              </Link>
            </div>

            {message && (
              <p className={status === "error" ? "formMessage error" : "formMessage"}>
                {message}
              </p>
            )}
          </form>
        )}
      </AuthGate>
    </main>
  );
}

