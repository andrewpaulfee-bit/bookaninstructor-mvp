"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Nav from "../../components/Nav";
import { getOrCreateProfile, ProfileRole } from "../../lib/profile";
import { supabase } from "../../lib/supabase";

function pathForRole(role: ProfileRole) {
  return role === "instructor" ? "/instructor-signup" : "/client-profile";
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace(`/login?next=${encodeURIComponent("/onboarding")}`);
        return;
      }

      try {
        const profile = await getOrCreateProfile(data.session);
        setUserId(profile.id);

        if (profile.role) {
          router.replace(next || pathForRole(profile.role));
          return;
        }
      } catch (profileError) {
        setError(profileError instanceof Error ? profileError.message : "Could not load profile.");
      }

      setLoading(false);
    }

    loadProfile();
  }, [next, router]);

  async function chooseRole(role: ProfileRole) {
    setSaving(true);
    setError("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.replace(pathForRole(role));
  }

  return (
    <main className="container">
      <Nav />

      <section className="pageHeader">
        <p className="eyebrow">Welcome</p>
        <h1>Choose your account type</h1>
        <p>Choose the account type that best matches how you want to use BookAnInstructor.</p>
      </section>

      {loading ? (
        <p>Loading your account...</p>
      ) : (
        <section className="choiceGrid">
          <button
            className="choiceCard"
            disabled={saving}
            type="button"
            onClick={() => chooseRole("client")}
          >
            <span>Client</span>
            <small>Post a request and find suitable instructors.</small>
          </button>

          <button
            className="choiceCard"
            disabled={saving}
            type="button"
            onClick={() => chooseRole("instructor")}
          >
            <span>Instructor</span>
            <small>Create your profile and apply to be listed.</small>
          </button>
        </section>
      )}

      {error && <p className="formMessage error">{error}</p>}
    </main>
  );
}

export default function Onboarding() {
  return (
    <Suspense fallback={<main className="container"><Nav /><p>Loading onboarding...</p></main>}>
      <OnboardingContent />
    </Suspense>
  );
}
