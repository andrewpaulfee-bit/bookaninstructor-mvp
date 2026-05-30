"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { getOrCreateProfile } from "../lib/profile";
import { supabase } from "../lib/supabase";

type AuthGateProps = {
  children: ReactNode;
};

export default function AuthGate({ children }: AuthGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);

      if (!data.session) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      getOrCreateProfile(data.session)
        .then((profile) => {
          if (!profile.role) {
            router.replace(`/onboarding?next=${encodeURIComponent(pathname)}`);
          }
        })
        .catch(() => {
          router.replace(`/onboarding?next=${encodeURIComponent(pathname)}`);
        });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (loading || !session) {
    return (
      <section className="emptyState">
        <h2>Sign in required</h2>
        <p>Please sign in to continue.</p>
      </section>
    );
  }

  return <>{children}</>;
}
