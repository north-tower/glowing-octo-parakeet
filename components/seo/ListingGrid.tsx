import Image from "next/image";
import Link from "next/link";
import { isOptimizablePhotoUrl } from "@/lib/nakuru/listing-image";
import { areaBySlug } from "@/lib/seo/areas";
import type { DirListing } from "@/lib/seo/directory";

function priceLabel(l: DirListing): string {
  if (l.price <= 0) return "Ask for price";
  const amount = `KSh ${l.price.toLocaleString("en-KE")}`;
  return l.rent ? `${amount} / month` : amount;
}

function locationLabel(l: DirListing): string | null {
  if (l.areaSlug) return areaBySlug(l.areaSlug)?.name ?? l.location;
  return l.location;
}

export function ListingGrid({ listings }: { listings: DirListing[] }) {
  return (
    <ul className="seo-grid">
      {listings.map((l, i) => {
        const loc = locationLabel(l);
        return (
          <li key={l.id}>
            <Link className="seo-card" href={`/app/p/${encodeURIComponent(l.id)}`}>
              <div className="seo-card-image">
                {l.image ? (
                  <Image
                    src={l.image}
                    alt={l.title}
                    fill
                    sizes="(max-width: 520px) 100vw, (max-width: 1024px) 33vw, 280px"
                    priority={i < 4}
                    unoptimized={!isOptimizablePhotoUrl(l.image)}
                  />
                ) : (
                  <span className="seo-card-placeholder" aria-hidden>
                    {l.categoryLabel}
                  </span>
                )}
              </div>
              <div className="seo-card-body">
                <p className="seo-card-cat">{l.categoryLabel}</p>
                <h3 className="seo-card-title">{l.title}</h3>
                {loc || l.vendor ? (
                  <p className="seo-card-meta">
                    {[loc, l.vendor].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
                <p className="seo-card-price">{priceLabel(l)}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
