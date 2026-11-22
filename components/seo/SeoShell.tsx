import Link from "next/link";
import { BrandLogoMark } from "@/components/app/BrandLogoMark";
import { SEO_AREAS } from "@/lib/seo/areas";
import type { SeoCategory } from "@/lib/seo/directory-copy";
import "./seo.css";

type Props = {
  categories: SeoCategory[];
  children: React.ReactNode;
};

export function SeoShell({ categories, children }: Props) {
  return (
    <div className="seo-page">
      <header className="seo-header">
        <div className="seo-wrap seo-header-bar">
          <Link href="/" aria-label="NakuruHub home">
            <BrandLogoMark variant="lockup" size={44} priority />
          </Link>
          <nav className="seo-header-nav" aria-label="Main">
            <Link className="seo-nav-link" href="/nakuru">
              Browse Nakuru
            </Link>
            <Link className="seo-nav-link" href="/app">
              Open app
            </Link>
            <Link className="seo-nav-link seo-nav-cta" href="/app?start=vendor">
              Post a listing
            </Link>
          </nav>
        </div>
      </header>
      <main className="seo-wrap seo-main" id="main-content">
        {children}
      </main>
      <footer className="seo-footer">
        <div className="seo-wrap seo-footer-grid">
          <nav aria-label="Categories in Nakuru">
            <h2>Categories</h2>
            <ul>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/nakuru/${c.slug}`}>{c.label} in Nakuru</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Areas in Nakuru">
            <h2>Areas</h2>
            <ul>
              {SEO_AREAS.map((a) => (
                <li key={a.slug}>
                  <Link href={`/nakuru/${a.slug}`}>{a.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="NakuruHub">
            <h2>NakuruHub</h2>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/app">Marketplace app</Link>
              </li>
              <li>
                <Link href="/app?start=vendor">Sell on NakuruHub</Link>
              </li>
            </ul>
          </nav>
        </div>
        <p className="seo-wrap seo-copy">
          © NakuruHub · Nakuru, Kenya
        </p>
      </footer>
    </div>
  );
}
