"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { getOrCreateProfile } from "../lib/profile";
import { supabase } from "../lib/supabase";

type AdminGateProps = {
  children: ReactNode;
};

export default function AdminGate({ children }: AdminGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAccess(nextSession: Session | null) {
      if (!mounted) return;
      setSession(nextSession);

      if (!nextSession) {
        setIsAdmin(false);
        setLoading(false);
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      try {
        const profile = await getOrCreateProfile(nextSession);
        setIsAdmin(profile.role === "admin");
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    supabase.auth.getSession().then(({ data }) => checkAccess(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setLoading(true);
      checkAccess(nextSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (loading || !session) {
    return (
      <section className="emptyState">
        <h2>Admin sign in required</h2>
        <p>Please sign in with an admin account to continue.</p>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="emptyState">
        <h2>Admin access required</h2>
        <p>This area is only available to BookAnInstructor admin staff.</p>
      </section>
    );
  }

  return <>{children}</>;
}
