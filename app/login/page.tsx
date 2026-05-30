"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Nav from "../../components/Nav";
import { errorMessage, getOrCreateProfile } from "../../lib/profile";
import { supabase } from "../../lib/supabase";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function redirectAfterLogin() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;

    try {
      const profile = await getOrCreateProfile(data.session);
      router.replace(profile.role ? next : `/onboarding?next=${encodeURIComponent(next)}`);
    } catch (profileError) {
      setStatus("error");
      setMessage(
        `${errorMessage(profileError)}. Make sure supabase/profiles-schema.sql has been run.`
      );
    }
  }

  useEffect(() => {
    async function handleAuthReturn() {
      const code = searchParams.get("code");
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        await redirectAfterLogin();
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setStatus("error");
          setMessage(error.message);
        } else {
          await redirectAfterLogin();
        }
      }
    }

    handleAuthReturn().catch((authError) => {
      setStatus("error");
      setMessage(errorMessage(authError));
    });
  }, [next, router, searchParams]);

  async function signInWithGoogle() {
    setStatus("loading");
    setMessage("");

    const redirectTo = `${window.location.origin}/login?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const redirectTo = `${window.location.origin}/login?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("Check your email for a sign-in link.");
  }

  return (
    <main className="container">
      <Nav />

      <section className="pageHeader">
        <p className="eyebrow">Account</p>
        <h1>Sign in</h1>
        <p>Sign in before posting a job or creating an instructor profile.</p>
      </section>

      <section className="formPanel authPanel">
        <button className="btn" type="button" onClick={signInWithGoogle}>
          Continue with Google
        </button>

        <div className="divider">or</div>

        <form className="authForm" onSubmit={sendMagicLink}>
          <label>
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <button className="secondaryButton" disabled={status === "loading"} type="submit">
            Email me a sign-in link
          </button>
        </form>

        {message && (
          <p className={status === "error" ? "formMessage error" : "formMessage"}>
            {message}
          </p>
        )}
      </section>
    </main>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<main className="container"><Nav /><p>Loading login...</p></main>}>
      <LoginContent />
    </Suspense>
  );
}
