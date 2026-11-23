"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

const BOX_COUNT = 6;

type Props = {
  value: string;
  onChange: (digits: string) => void;
  onComplete?: (digits: string) => void;
  disabled?: boolean;
  error?: string | null;
  autoFocus?: boolean;
};

export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  error = null,
  autoFocus = false,
}: Props) {
  const baseId = useId();
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const digits = value.replace(/\D/g, "").slice(0, BOX_COUNT).split("");
  while (digits.length < BOX_COUNT) digits.push("");

  const syncFromBoxes = useCallback(
    (parts: string[]) => {
      const joined = parts.join("").replace(/\D/g, "").slice(0, BOX_COUNT);
      onChange(joined);
      if (joined.length === BOX_COUNT) onComplete?.(joined);
    },
    [onChange, onComplete],
  );

  useEffect(() => {
    if (autoFocus && !disabled) {
      inputsRef.current[0]?.focus();
    }
  }, [autoFocus, disabled]);

  const focusIndex = (i: number) => {
    const el = inputsRef.current[Math.max(0, Math.min(BOX_COUNT - 1, i))];
    el?.focus();
    el?.select();
  };

  const onDigitInput = (index: number, raw: string) => {
    const chunk = raw.replace(/\D/g, "");
    const next = [...digits];
    if (chunk.length > 1) {
      let cursor = index;
      for (const ch of chunk) {
        if (cursor >= BOX_COUNT) break;
        next[cursor] = ch;
        cursor += 1;
      }
      syncFromBoxes(next);
      focusIndex(Math.min(cursor, BOX_COUNT - 1));
      return;
    }
    next[index] = chunk.slice(-1);
    syncFromBoxes(next);
    if (chunk && index < BOX_COUNT - 1) focusIndex(index + 1);
  };

  const onKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        syncFromBoxes(next);
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = "";
        syncFromBoxes(next);
        focusIndex(index - 1);
      }
      e.preventDefault();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
    }
    if (e.key === "ArrowRight" && index < BOX_COUNT - 1) {
      e.preventDefault();
      focusIndex(index + 1);
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const chunk = text.replace(/\D/g, "").slice(0, BOX_COUNT);
    if (!chunk) return;
    const next = chunk.split("");
    while (next.length < BOX_COUNT) next.push("");
    syncFromBoxes(next);
    focusIndex(Math.min(chunk.length, BOX_COUNT - 1));
  };

  const errId = `${baseId}-error`;

  return (
    <div>
      <div
        key={error ?? "ok"}
        className={`flex justify-center gap-2 sm:gap-2.5${error && !reduced ? " motion-safe:animate-[auth-shake_0.4s_ease-in-out]" : ""}`}
        role="group"
        aria-label="6-digit code"
        aria-describedby={error ? errId : undefined}
      >
        {digits.map((d, i) => (
          <input
            key={`${baseId}-${i}`}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            id={`${baseId}-${i}`}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            pattern="[0-9]*"
            maxLength={1}
            value={d}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            className={`h-14 w-11 rounded-xl border bg-white text-center text-2xl font-semibold tabular-nums text-stone-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 sm:h-14 sm:w-14 ${
              error
                ? "border-red-400 focus-visible:ring-red-500"
                : "border-stone-300"
            }`}
            onChange={(e) => onDigitInput(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={onPaste}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>
      {error ? (
        <p id={errId} role="alert" className="mt-3 text-center text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}