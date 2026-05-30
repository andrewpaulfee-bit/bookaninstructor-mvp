"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Nav from "../../components/Nav";
import { firstNameOnly } from "../../lib/displayName";
import { serviceAreaOptions, styleOptions } from "../../lib/instructorOptions";
import { supabase } from "../../lib/supabase";

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
  approved: boolean;
};

function includesText(value: string | null | undefined, query: string) {
  return String(value || "").toLowerCase().includes(query.toLowerCase());
}

function hasMatch(values: string[] | null | undefined, query: string) {
  return (values || []).some((value) => includesText(value, query));
}

function InstructorResults() {
  const searchParams = useSearchParams();
  const [style, setStyle] = useState(searchParams.get("style") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [sortBy, setSortBy] = useState("name");
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInstructors() {
      const { data, error: requestError } = await supabase
        .from("instructors")
        .select("*")
        .eq("approved", true)
        .order("name", { ascending: true });

      if (requestError) {
        setError(requestError.message);
      } else {
        setInstructors(data || []);
      }

      setLoading(false);
    }

    loadInstructors();
  }, []);

  const filteredInstructors = useMemo(() => {
    const filtered = instructors.filter((instructor) => {
      const styleMatches = style
        ? hasMatch(instructor.categories, style)
        : true;
      const locationMatches = location
        ? includesText(instructor.location, location) ||
          hasMatch(instructor.service_areas, location)
        : true;

      return styleMatches && locationMatches;
    });

    return [...filtered].sort((left, right) => {
      if (sortBy === "rate") {
        return (left.hourly_rate || 0) - (right.hourly_rate || 0);
      }

      return left.name.localeCompare(right.name);
    });
  }, [instructors, location, sortBy, style]);

  function clearFilters() {
    setStyle("");
    setLocation("");
  }

  return (
    <main className="directoryPage">
      <Nav />

      <section className="directorySearch">
        <select
          aria-label="Style"
          value={style}
          onChange={(event) => setStyle(event.target.value)}
        >
          <option value="">Style</option>
          {styleOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <input
          list="directory-service-areas"
          placeholder="Location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
        <datalist id="directory-service-areas">
          {serviceAreaOptions.map((suburb) => (
            <option key={suburb} value={suburb} />
          ))}
        </datalist>

        <button type="button" onClick={() => undefined}>
          →
        </button>
      </section>

      <section className="directoryLayout">
        <aside className="filterPanel">
          <label>
            Styles
            <select value={style} onChange={(event) => setStyle(event.target.value)}>
              <option value="">All styles</option>
              {styleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button className="btn fullButton" type="button" onClick={clearFilters}>
            Filter
          </button>

          <div className="mapPanel">
            <span>Sunshine Coast</span>
            <span>Brisbane</span>
            <span>Gold Coast</span>
            <div className="mapPin pinOne" />
            <div className="mapPin pinTwo" />
            <div className="mapPin pinThree" />
          </div>
        </aside>

        <section className="directoryResults">
          <div className="resultsToolbar">
            <span>
              {loading
                ? "Loading instructors"
                : `Showing ${filteredInstructors.length} of ${instructors.length} results`}
            </span>
            <label>
              Sort by
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="name">Name</option>
                <option value="rate">Rate</option>
              </select>
            </label>
          </div>

          {error && <p className="formMessage error">{error}</p>}

          {!loading && filteredInstructors.length === 0 && !error && (
            <section className="emptyState">
              <h2>No matching instructors yet</h2>
              <p>
                Try a broader style or location, or post a request and we can help
                find suitable instructors.
              </p>
              <a className="btn" href="/post-job">
                Post a request
              </a>
            </section>
          )}

          <div className="directoryGrid">
            {filteredInstructors.map((instructor) => (
              <a className="directoryCard" href={`/instructors/${instructor.id}`} key={instructor.id}>
                {instructor.headshot_url ? (
                  <img alt={firstNameOnly(instructor.name)} src={instructor.headshot_url} />
                ) : (
                  <div className="directoryAvatar">{firstNameOnly(instructor.name).slice(0, 1)}</div>
                )}

                <h2>{firstNameOnly(instructor.name)}</h2>
                <p className="directoryLocation">
                  {instructor.location || "Location available on request"}
                </p>
                <p>{instructor.categories?.join(", ") || "Instructor"}</p>
                {instructor.hourly_rate && <strong>From ${instructor.hourly_rate}/hr</strong>}
              </a>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default function Instructors() {
  return (
    <Suspense fallback={<main className="container"><Nav /><p>Loading instructors...</p></main>}>
      <InstructorResults />
    </Suspense>
  );
}
