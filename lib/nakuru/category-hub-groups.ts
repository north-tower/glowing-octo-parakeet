import type { DirectoryCategory } from "@/lib/nakuru/data/category-directory";

export type HubGroupId =
  | "motors"
  | "property"
  | "shopping"
  | "services"
  | "work";

export type HubGroupDef = {
  id: HubGroupId;
  titleKey:
    | "hubGroupMotors"
    | "hubGroupProperty"
    | "hubGroupShopping"
    | "hubGroupServices"
    | "hubGroupWork";
  slugs: string[];
};

export const HUB_GROUPS: HubGroupDef[] = [
  {
    id: "motors",
    titleKey: "hubGroupMotors",
    slugs: ["vehicles"],
  },
  {
    id: "property",
    titleKey: "hubGroupProperty",
    slugs: ["real-estate", "stays"],
  },
  {
    id: "shopping",
    titleKey: "hubGroupShopping",
    slugs: [
      "mobile-phones-tablets",
      "electronics",
      "home-garden",
      "fashion-and-beauty",
      "health-and-beauty",
      "babies-and-kids",
      "animals-and-pets",
      "agriculture-and-foodstuff",
      "hobbies-art-sport",
      "office-and-commercial-equipment-tools",
      "business-and-industry",
    ],
  },
  {
    id: "services",
    titleKey: "hubGroupServices",
    slugs: ["services", "repair-and-construction", "taxi", "rider"],
  },
  {
    id: "work",
    titleKey: "hubGroupWork",
    slugs: ["jobs", "seeking-work-cvs"],
  },
];

export function groupOfficialRoots(
  roots: DirectoryCategory[],
): { group: HubGroupDef; items: DirectoryCategory[] }[] {
  const bySlug = new Map(roots.map((r) => [r.slug, r]));
  const used = new Set<string>();
  const out: { group: HubGroupDef; items: DirectoryCategory[] }[] = [];

  for (const group of HUB_GROUPS) {
    const items = group.slugs
      .map((slug) => bySlug.get(slug))
      .filter((r): r is DirectoryCategory => !!r);
    items.forEach((r) => used.add(r.slug));
    if (items.length) out.push({ group, items });
  }

  const rest = roots.filter((r) => !used.has(r.slug));
  if (rest.length) {
    const shopping = out.find((g) => g.group.id === "shopping");
    if (shopping) shopping.items.push(...rest);
    else out.push({ group: HUB_GROUPS[2]!, items: rest });
  }

  return out;
}