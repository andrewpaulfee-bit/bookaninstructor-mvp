"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Nav from "../../../components/Nav";
import { firstNameOnly } from "../../../lib/displayName";
import { supabase } from "../../../lib/supabase";

type Instructor = {
  id: string;
  name: string;
  email: string;
  location: string | null;
  categories: string[] | null;
  bio: string | null;
  hourly_rate: number | null;
  service_areas: string[] | null;
  headshot_url: string | null;
};

type Review = {
  id: string;
  reviewer_name: string | null;
  rating: number;
  review_tags: string[] | null;
  comment: string | null;
  created_at: string;
};

function Stars({ rating }: { rating: number }) {
  return <span className="stars">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>;
}

export default function InstructorProfile() {
  const params = useParams<{ id: string }>();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const [instructorResult, reviewsResult] = await Promise.all([
        supabase.from("instructors").select("*").eq("id", params.id).maybeSingle(),
        supabase
          .from("reviews")
          .select("*")
          .eq("instructor_id", params.id)
          .eq("published", true)
          .order("created_at", { ascending: false }),
      ]);

      if (instructorResult.data) {
        setInstructor(instructorResult.data);
      }

      setReviews(reviewsResult.data || []);
      setLoading(false);
    }

    loadProfile();
  }, [params.id]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return Math.round(
      reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    );
  }, [reviews]);

  if (loading) {
    return <main className="container"><Nav /><p>Loading instructor...</p></main>;
  }

  if (!instructor) {
    return <main className="container"><Nav /><p>Instructor not found.</p></main>;
  }

  const firstName = firstNameOnly(instructor.name);

  return (
    <main className="container">
      <Nav />

      <div className="profileLayout">
        <aside className="profileSidebar">
          {instructor.headshot_url ? (
            <img alt={firstName} className="profileHeadshot" src={instructor.headshot_url} />
          ) : (
            <div className="profileAvatar">{firstName.slice(0, 1)}</div>
          )}

          <h1>{firstName}</h1>
          <p>{instructor.location || "Australia"}</p>

          {averageRating > 0 && (
            <p>
              This profile's average rating is: <Stars rating={averageRating} />
            </p>
          )}

          <div className="profileTags">
            {(instructor.categories || []).map((category) => (
              <span key={category}>{category}</span>
            ))}
          </div>

          <a className="btn fullButton" href={`/post-job?instructor=${instructor.id}`}>
            Send Request
          </a>

          <section className="profileSidebarReviews">
            <h2>Reviews</h2>
            <div className="reviewList">
              {reviews.map((review) => (
                <article className="reviewCard" key={review.id}>
                  <div>
                    <strong>{review.reviewer_name || "Client"}</strong>
                    <small>{new Date(review.created_at).toLocaleDateString("en-AU")}</small>
                  </div>
                  <p>{review.comment}</p>
                  {review.review_tags?.length ? (
                    <div className="reviewTagList">
                      {review.review_tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  ) : null}
                  <Stars rating={review.rating} />
                </article>
              ))}

              {reviews.length === 0 && (
                <article className="reviewCard">
                  <p>No reviews yet.</p>
                </article>
              )}
            </div>

            <article className="reviewForm verifiedReviewNote">
              <h3>Reviews are verified</h3>
              <p>
                Reviews can only be submitted by clients after a completed booking
                with this instructor.
              </p>
            </article>
          </section>
        </aside>

        <section className="profileMain">
          <div className="dotAccent" />
          <h2>{firstName} Bio</h2>

          <article className="profileBioPanel">
            <p>{instructor.bio || "Profile information coming soon."}</p>
          </article>
        </section>
      </div>
    </main>
  );
}
