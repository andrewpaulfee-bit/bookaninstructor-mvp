export function firstNameOnly(name: string | null | undefined) {
  return (name || "Instructor").trim().split(/\s+/)[0] || "Instructor";
}
