type Props = {
  size?: number;
  className?: string;
};

/** Inline flamingo mark — pink + white on transparent (sits on teal header). */
export function FlamingoMarkSvg({ size = 28, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden
      focusable="false"
    >
      <path
        d="M8 26c2.2-1.2 4-3.4 5.2-6.1.8-1.8 1.2-3.8 1.4-5.9.2-2 .1-4-.4-5.8C13.6 6.8 12.2 5.5 10.4 5 9 4.6 7.4 4.8 6.2 5.8c-.8.7-1.2 1.7-1.1 2.7.1 1 .6 1.9 1.4 2.5-.6 1.5-.9 3.1-.8 4.7.2 2.4 1.1 4.6 2.5 6.3l-.2 3.5z"
        fill="#EC5F7B"
      />
      <path
        d="M11.5 12.2c.4-1.8 1.6-3.2 3.2-3.8 2-.7 4.2-.1 5.6 1.5 1.1 1.3 1.5 3 1.2 4.6-.4 2.2-1.8 4-3.8 5-1.2.6-2.6.9-4 .8"
        fill="#fff"
        opacity={0.95}
      />
      <path
        d="M18.8 8.5c1.2-.4 2.4-.2 3.3.5 1.2.9 1.8 2.5 1.5 4-.5 2.5-2.8 4.2-5.2 4.5"
        stroke="#EC5F7B"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="9.2" cy="8.4" r="1.1" fill="#073B39" />
      <path
        d="M6.5 24.5c1.8.2 3.6-.3 5-1.3"
        stroke="#fff"
        strokeWidth={1.2}
        strokeLinecap="round"
        opacity={0.7}
      />
    </svg>
  );
}