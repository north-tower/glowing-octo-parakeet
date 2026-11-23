"use client";

import type { DirectoryCategory } from "@/lib/nakuru/data/category-directory";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

type Props = {
  id: string;
  value: string;
  disabled?: boolean;
  officialOptions: DirectoryCategory[];
  communityOptions: DirectoryCategory[];
  onChange: (slug: string) => void;
};

function matchesLabel(label: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return label.toLowerCase().includes(q);
}

export function SearchableCategorySelect({
  id,
  value,
  disabled,
  officialOptions,
  communityOptions,
  onChange,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const allOptions = useMemo(
    () => [...officialOptions, ...communityOptions],
    [officialOptions, communityOptions],
  );

  const selectedLabel = allOptions.find((r) => r.slug === value)?.label ?? "";

  const filteredOfficial = useMemo(
    () => officialOptions.filter((r) => matchesLabel(r.label, query)),
    [officialOptions, query],
  );
  const filteredCommunity = useMemo(
    () => communityOptions.filter((r) => matchesLabel(r.label, query)),
    [communityOptions, query],
  );
  const flatFiltered = useMemo(
    () => [...filteredOfficial, ...filteredCommunity],
    [filteredOfficial, filteredCommunity],
  );

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
      setQuery("");
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const pick = (slug: string) => {
    onChange(slug);
    close();
  };

  const openList = () => {
    if (disabled) return;
    setOpen(true);
    setQuery("");
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      openList();
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((i) =>
        flatFiltered.length ? Math.min(i + 1, flatFiltered.length - 1) : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const row = flatFiltered[highlight];
      if (row) {
        e.preventDefault();
        pick(row.slug);
      }
    }
  };

  let optionIndex = -1;

  return (
    <div
      ref={rootRef}
      className={`cat-combo${open ? " is-open" : ""}`}
    >
      <div className="cat-combo-field">
        <input
          ref={inputRef}
          id={id}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && flatFiltered[highlight]
              ? `${id}-opt-${flatFiltered[highlight]!.slug}`
              : undefined
          }
          autoComplete="off"
          enterKeyHint="done"
          disabled={disabled}
          placeholder="Search categories…"
          value={open ? query : selectedLabel}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            if (!disabled && !open) openList();
          }}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          className="cat-combo-toggle"
          tabIndex={-1}
          aria-label={open ? "Close category list" : "Open category list"}
          disabled={disabled}
          onClick={() => {
            if (open) close();
            else openList();
          }}
        />
      </div>
      {open ? (
        <div
          id={listId}
          className="cat-combo-list"
          role="listbox"
          aria-label="Categories"
        >
          {!flatFiltered.length ? (
            <div className="cat-combo-empty m">No matching categories</div>
          ) : (
            <>
              {filteredOfficial.length ? (
                <>
                  <div className="cat-combo-group" role="presentation">
                    Official
                  </div>
                  {filteredOfficial.map((row) => {
                    optionIndex += 1;
                    const idx = optionIndex;
                    const active = idx === highlight;
                    return (
                      <button
                        key={row.slug}
                        id={`${id}-opt-${row.slug}`}
                        type="button"
                        role="option"
                        aria-selected={row.slug === value}
                        className={`cat-combo-option${active ? " is-active" : ""}${
                          row.slug === value ? " is-selected" : ""
                        }`}
                        onMouseEnter={() => setHighlight(idx)}
                        onClick={() => pick(row.slug)}
                      >
                        {row.label}
                      </button>
                    );
                  })}
                </>
              ) : null}
              {filteredCommunity.length ? (
                <>
                  <div className="cat-combo-group" role="presentation">
                    Community
                  </div>
                  {filteredCommunity.map((row) => {
                    optionIndex += 1;
                    const idx = optionIndex;
                    const active = idx === highlight;
                    return (
                      <button
                        key={row.slug}
                        id={`${id}-opt-${row.slug}`}
                        type="button"
                        role="option"
                        aria-selected={row.slug === value}
                        className={`cat-combo-option${active ? " is-active" : ""}${
                          row.slug === value ? " is-selected" : ""
                        }`}
                        onMouseEnter={() => setHighlight(idx)}
                        onClick={() => pick(row.slug)}
                      >
                        {row.label}
                      </button>
                    );
                  })}
                </>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}