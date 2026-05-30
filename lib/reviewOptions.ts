export const instructorReviewHighlights = [
  "Professional",
  "Punctual",
  "Prepared",
  "Organised",
  "Well presented",
  "Engaging",
  "Clear communication",
  "Great with students",
  "Adapted to the group",
  "Reliable",
  "Friendly",
  "Safe environment",
  "Good value",
  "Would book again",
];

export const clientReviewHighlights = [
  "Tidy studio",
  "Professional",
  "PA provided",
  "Great students",
  "Clear brief",
  "Organised",
  "Suitable space",
  "Easy communication",
  "Respectful",
  "On time",
  "Smooth booking",
  "Would teach again",
  "Realistic expectations",
  "Friendly group",
  "Payment ready",
];

export function toggleReviewHighlight(current: string[], value: string) {
  if (current.includes(value)) {
    return current.filter((item) => item !== value);
  }

  if (current.length >= 5) {
    return current;
  }

  return [...current, value];
}
