export function ListingCardSkeleton() {
  return (
    <div className="block h-full" aria-hidden>
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
        <div className="aspect-[4/3] w-full animate-pulse bg-stone-100 motion-reduce:animate-none" />
        <div className="flex flex-1 flex-col gap-2 p-3">
          <div className="h-4 w-24 animate-pulse rounded bg-stone-100 motion-reduce:animate-none" />
          <div className="min-h-[2.5rem] space-y-1.5">
            <div className="h-3 w-full animate-pulse rounded bg-stone-100 motion-reduce:animate-none" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-stone-100 motion-reduce:animate-none" />
          </div>
          <div className="h-3 w-3/5 animate-pulse rounded bg-stone-100 motion-reduce:animate-none" />
          <div className="mt-auto h-6 w-28 animate-pulse rounded-full bg-stone-100 motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}