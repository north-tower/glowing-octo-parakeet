"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Bi } from "@/components/landing/Bi";

export function HeroSection() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/app?q=${encodeURIComponent(query)}` : "/app");
  };

  return (
    <section className="hero hero--classified">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="hero-kicker">
            <Bi
              en="The home of Nakuru discovery"
              sw="Nyumbani pa kugundua Nakuru"
            />
          </span>
          <h1>
            <span data-en="Find what you need." data-sw="Pata unachohitaji.">
              Find what you need.
            </span>
            <span className="hero-gold" data-en="Right here in Nakuru." data-sw="Hapa Nakuru.">
              Right here in Nakuru.
            </span>
          </h1>
          <p
            className="lead"
            data-en="Explore property, vehicles, local services, jobs, events and more in one trusted local marketplace."
            data-sw="Gundua mali, magari, huduma, kazi, matukio na zaidi katika soko moja la kuaminika."
          >
            Explore property, vehicles, local services, jobs, events and more in
            one trusted local marketplace.
          </p>
          <form className="hero-search" onSubmit={onSearch} role="search">
            <label className="sr-only" htmlFor="hero-q">
              <Bi en="What are you looking for?" sw="Unatafuta nini?" />
            </label>
            <input
              id="hero-q"
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="What are you looking for?"
              autoComplete="off"
            />
            <button className="btn fl" type="submit">
              <Bi en="Search" sw="Tafuta" />
            </button>
          </form>
          <ul className="hero-proof" role="list">
            <li data-en="Local discoveries" data-sw="Uvumbuzi wa nyumbani">
              Local discoveries
            </li>
            <li data-en="Easy to use" data-sw="Rahisi kutumia">
              Easy to use
            </li>
            <li data-en="Built for Nakuru" data-sw="Imejengwa kwa Nakuru">
              Built for Nakuru
            </li>
          </ul>
        </div>
        <div className="hero-visual">
          <Link className="featured-card" href="/app?cat=property">
            <p className="featured-kicker">
              <Bi en="Featured discovery" sw="Kilele cha sasa" />
            </p>
            <img
              className="featured-photo"
              src="/images/hero-featured-home.png"
              alt="Modern living room with open kitchen, listed as a featured home on NakuruHub"
              width={900}
              height={680}
            />
            <div className="featured-chip">
              <Bi en="Local finds, closer to home" sw="Vitu vya karibu na nyumbani" />
            </div>
            <p className="featured-caption">
              <Bi en="Find your next place" sw="Tafuta mahali pako" />
              <span>Property · Nakuru</span>
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
