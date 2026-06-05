"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { getOrCreateProfile, ProfileRole } from "../lib/profile";
import { supabase } from "../lib/supabase";

type OpenMenu = "account" | "instructors" | "help" | null;

export default function Nav() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<ProfileRole | null>(null);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function toggleMenu(menu: Exclude<OpenMenu, null>) {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  return (
    <div className="nav" ref={navRef}>
      <Link className="navLogo" href="/" aria-label="BookAnInstructor home">
        <img src="/logo-mark.png" alt="BookAnInstructor" />
      </Link>

      <div className="navMenu">
        <Link href="/how-it-works">How it Works</Link>
        <div className="navGroup" onMouseLeave={() => setOpenMenu(null)}>
          <button
            aria-expanded={openMenu === "account"}
            aria-haspopup="menu"
            className="navMenuButton"
            type="button"
            onClick={() => toggleMenu("account")}
          >
            Account
          </button>
          {openMenu === "account" && (
          <div className="navDropdown" role="menu">
            {session && (
              <Link href={role === "instructor" ? "/instructor-signup" : "/client-profile"} onClick={() => setOpenMenu(null)}>
                My profile
              </Link>
            )}
            <Link href="/instructors" onClick={() => setOpenMenu(null)}>Find Instructors</Link>
            <Link href="/post-job" onClick={() => setOpenMenu(null)}>Post a Job</Link>
            {session && role === "client" && <Link href="/my-jobs" onClick={() => setOpenMenu(null)}>My Jobs</Link>}
            {session && <Link href="/messages" onClick={() => setOpenMenu(null)}>Messages</Link>}
            {session && <Link href="/my-agreements" onClick={() => setOpenMenu(null)}>Agreements</Link>}
            {session && role === "admin" && <Link href="/admin" onClick={() => setOpenMenu(null)}>Admin</Link>}
            {session && role === "admin" && <Link href="/admin/checklist" onClick={() => setOpenMenu(null)}>Admin Checklist</Link>}
            {!session && <Link href="/login" onClick={() => setOpenMenu(null)}>Sign in</Link>}
          </div>
          )}
        </div>
        <div className="navGroup" onMouseLeave={() => setOpenMenu(null)}>
          <button
            aria-expanded={openMenu === "instructors"}
            aria-haspopup="menu"
            className="navMenuButton"
            type="button"
            onClick={() => toggleMenu("instructors")}
          >
            Instructors
          </button>
          {openMenu === "instructors" && (
          <div className="navDropdown" role="menu">
            <Link href="/instructors" onClick={() => setOpenMenu(null)}>Find an Instructor</Link>
            <Link href="/jobs" onClick={() => setOpenMenu(null)}>Instructor Jobs</Link>
            <Link href="/instructor-signup" onClick={() => setOpenMenu(null)}>
              {role === "instructor" ? "Instructor Profile" : "Become an Instructor"}
            </Link>
          </div>
          )}
        </div>
        <div className="navGroup" onMouseLeave={() => setOpenMenu(null)}>
          <button
            aria-expanded={openMenu === "help"}
            aria-haspopup="menu"
            className="navMenuButton"
            type="button"
            onClick={() => toggleMenu("help")}
          >
            Help
          </button>
          {openMenu === "help" && (
          <div className="navDropdown" role="menu">
            <Link href="/faqs" onClick={() => setOpenMenu(null)}>FAQs</Link>
            <Link href="/terms" onClick={() => setOpenMenu(null)}>Terms</Link>
            <Link href="/privacy" onClick={() => setOpenMenu(null)}>Privacy</Link>
          </div>
          )}
        </div>
        {session ? (
          <button className="navButton" type="button" onClick={signOut}>
            Sign out
          </button>
        ) : (
          <Link href="/login">Log In</Link>
        )}
        <Link className="navPostButton" href="/post-job">Post a Job</Link>
      </div>
    </div>
  );
}
