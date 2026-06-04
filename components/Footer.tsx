"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { getOrCreateProfile, ProfileRole } from "../lib/profile";
import { supabase } from "../lib/supabase";

export default function Footer() {
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
    <footer className="siteFooter">
      <div className="footerBrand">
        <img src="/logo-mark.png" alt="BookAnInstructor" />
      </div>

      <div className="footerColumn">
        <h2>Instructors</h2>
        <Link href="/instructors">Search Instructors</Link>
        <Link href="/jobs">Instructor Jobs</Link>
        <Link href="/instructor-signup">Set up Instructor Profile</Link>
        <Link href="/post-job">Request an Instructor</Link>
      </div>

      <div className="footerColumn">
        <h2>About</h2>
        <a href="https://www.instagram.com/bookaninstructor/" target="_blank" rel="noreferrer">
          Instagram
        </a>
        <Link href="/how-it-works">How it Works</Link>
        <Link href="/faqs">FAQs</Link>
        <Link href="/terms">Terms and Conditions</Link>
        <Link href="/privacy">Privacy Policy</Link>
        {session ? (
          <>
            <Link href={role === "instructor" ? "/instructor-signup" : "/client-profile"}>
              Account
            </Link>
            <button className="navButton" type="button" onClick={signOut}>
              Sign out
            </button>
          </>
        ) : (
          <Link href="/login">Account</Link>
        )}
      </div>
    </footer>
  );
}
