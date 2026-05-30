"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { getOrCreateProfile, ProfileRole } from "../lib/profile";
import { supabase } from "../lib/supabase";

export default function Nav() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<ProfileRole | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) {
        const profile = await getOrCreateProfile(data.session);
        setRole(profile.role);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setRole(null);
        return;
      }

      getOrCreateProfile(nextSession).then((profile) => setRole(profile.role));
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="nav">
      <Link href="/">Home</Link>
      <Link href="/how-it-works">How it Works</Link>
      <details className="navGroup">
        <summary>Account</summary>
        <div className="navDropdown">
          {session && (
            <Link href={role === "instructor" ? "/instructor-signup" : "/client-profile"}>
              My profile
            </Link>
          )}
          <Link href="/instructors">Find Instructors</Link>
          <Link href="/post-job">Post a Job</Link>
          {session && role === "client" && <Link href="/my-jobs">My Jobs</Link>}
          {session && <Link href="/messages">Messages</Link>}
          {session && <Link href="/my-agreements">Agreements</Link>}
          {session && role === "admin" && <Link href="/admin">Admin</Link>}
          {!session && <Link href="/login">Sign in</Link>}
        </div>
      </details>
      <details className="navGroup">
        <summary>Instructors</summary>
        <div className="navDropdown">
          <Link href="/jobs">Instructor Jobs</Link>
          <Link href="/instructor-signup">
            {role === "instructor" ? "Instructor Profile" : "Become an Instructor"}
          </Link>
        </div>
      </details>
      <details className="navGroup">
        <summary>Help</summary>
        <div className="navDropdown">
          <Link href="/faqs">FAQs</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </details>
      {session ? (
        <button className="navButton" type="button" onClick={signOut}>
          Sign out
        </button>
      ) : (
        <Link href="/login">Sign in</Link>
      )}
    </div>
  );
}
