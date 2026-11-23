import { CategoryTile } from "@/components/app/category/browse/CategoryTile";
import type { BrowseCategoryGroup } from "@/components/app/category/browse/categories";

type Props = {
  group: BrowseCategoryGroup;
};

export function CategoryGroup({ group }: Props) {
  return (
    <section className="browse-group">
      <h3 className="browse-group__title">{group.title}</h3>
      <div className="browse-grid">
        {group.items.map((item) => (
          <CategoryTile key={item.slug} {...item} />
        ))}
      </div>
    </section>
  );
}