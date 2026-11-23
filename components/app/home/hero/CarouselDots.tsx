"use client";

type CarouselDotsProps = {
  count: number;
  index: number;
  onSelect: (i: number) => void;
};

export function CarouselDots({ count, index, onSelect }: CarouselDotsProps) {
  return (
    <div
      className="pointer-events-auto flex items-center gap-1 rounded-full bg-black/25 px-2 py-1.5 backdrop-blur-sm"
      role="tablist"
      aria-label="Carousel pagination"
    >
      {Array.from({ length: count }, (_, i) => {
        const on = i === index;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={on}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => onSelect(i)}
            className="relative flex size-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            <span
              className={`block h-1.5 rounded-full transition-all duration-300 ease-out ${
                on ? "w-6 bg-white" : "w-1.5 bg-white/50"
              }`}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}