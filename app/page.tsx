"use client";

import { FormEvent, useState } from "react";
import Footer from "../components/Footer";
import { serviceAreaOptions, styleOptions } from "../lib/instructorOptions";

export default function Home() {
  const [style, setStyle] = useState("");
  const [location, setLocation] = useState("");
  const [locationStatus, setLocationStatus] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    if (style) params.set("style", style);
    if (location) params.set("location", location);

    window.location.href = `/instructors${params.toString() ? `?${params}` : ""}`;
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("Location is not available in this browser.");
      return;
    }

    setLocationStatus("Finding your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(5);
        const longitude = position.coords.longitude.toFixed(5);
        setLocation(`${latitude}, ${longitude}`);
        setLocationStatus("");
      },
      () => {
        setLocationStatus("Could not access your current location.");
      }
    );
  }

  return (
    <main className="home">
      <nav className="nav">
        <img src="/logo.png" className="logo" />
      </nav>

      <section className="hero">
        <div className="heroText">
          <h1>Find your perfect instructor today!</h1>
          <p>
            An online community connecting clients with a diverse array of
            instructors, trainers, coaches, guides, and teachers.
          </p>
        </div>

        <div className="heroImages">
          <div className="dots dotsTop" />
          <div className="dots dotsBottom" />

          <img src="/hero-small-1.png" className="smallLeft" />
          <img src="/hero-main.png" className="mainPhoto" />
          <img src="/hero-small-2.png" className="smallRight" />
        </div>
      </section>

      <form className="searchBar" onSubmit={onSubmit}>
        <select
          aria-label="Style"
          value={style}
          onChange={(event) => setStyle(event.target.value)}
        >
          <option value="">Style</option>
          {styleOptions.map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
        <input
          list="home-service-areas"
          placeholder="Location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
        <datalist id="home-service-areas">
          {serviceAreaOptions.map((suburb) => (
            <option key={suburb} value={suburb} />
          ))}
        </datalist>
        <button
          aria-label="Use current location"
          className="locationIcon"
          type="button"
          onClick={useCurrentLocation}
        >
          ⌖
        </button>
        <button aria-label="Search instructors" className="searchSubmit" type="submit">
          →
        </button>
      </form>
      {locationStatus && <p className="searchStatus">{locationStatus}</p>}
      <Footer />
    </main>
  );
}
