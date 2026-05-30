import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type ProfileRole = "client" | "instructor" | "admin";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  mobile: string | null;
  location: string | null;
  role: ProfileRole | null;
};

export function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message);
  }
  return "Something went wrong.";
}

export async function getOrCreateProfile(session: Session) {
  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .maybeSingle();

  if (selectError) {
    throw new Error(errorMessage(selectError));
  }

  if (existingProfile) {
    return existingProfile as Profile;
  }

  const fullName =
    session.user.user_metadata?.full_name ||
    session.user.user_metadata?.name ||
    null;

  const { data: newProfile, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: session.user.id,
      email: session.user.email,
      full_name: fullName,
      role: null,
    })
    .select("*")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: profileAfterDuplicate, error: duplicateSelectError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!duplicateSelectError && profileAfterDuplicate) {
        return profileAfterDuplicate as Profile;
      }
    }

    throw new Error(errorMessage(insertError));
  }

  return newProfile as Profile;
}
