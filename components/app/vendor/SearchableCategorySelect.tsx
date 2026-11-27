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
  /** When the typed name is new, create a community category and select it. */
  onCreateCustom?: (label: string) => boolean | void | Promise<boolean | void>;
  createBusy?: boolean;
  groupOfficialBy?: (row: DirectoryCategory) => string;
};

function matchesLabel(label: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return label.toLowerCase().includes(q);
}

function groupOfficialRows(
  rows: DirectoryCategory[],
  groupOfficialBy?: (row: DirectoryCategory) => string,
): { title: string; rows: DirectoryCategory[] }[] {
  if (!groupOfficialBy) {
    return [{ title: "Official", rows }];
  }
  const order: string[] = [];
  const map = new Map<string, DirectoryCategory[]>();
  for (const row of rows) {
    const title = groupOfficialBy(row) || "Other";
    if (!map.has(title)) {
      map.set(title, []);
      order.push(title);
    }
    map.get(title)!.push(row);
  }
  return order.map((title) => ({ title, rows: map.get(title)! }));
}

export function SearchableCategorySelect({
  id,
  value,
  disabled,
  officialOptions,
  communityOptions,
  onChange,
  onCreateCustom,
  createBusy,
  groupOfficialBy,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipFocusOpenRef = useRef(false);
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

  const trimmedQuery = query.trim();
  const mayCreate = !!onCreateCustom && trimmedQuery.length >= 2;
  const canOfferCreate =
    mayCreate &&
    flatFiltered.length > 0 &&
    !allOptions.some(
      (r) => r.label.toLowerCase() === trimmedQuery.toLowerCase(),
    );
  const showEmptyCreate = mayCreate && flatFiltered.length === 0;
  const createOptionIndex = canOfferCreate ? flatFiltered.length : -1;
  const navigableCount =
    flatFiltered.length + (canOfferCreate || showEmptyCreate ? 1 : 0);

  const runCreate = async () => {
    if (!onCreateCustom || !mayCreate || createBusy || disabled) return;
    skipFocusOpenRef.current = true;
    const ok = await onCreateCustom(trimmedQuery);
    if (ok !== false) {
      close();
      inputRef.current?.blur();
    } else {
      skipFocusOpenRef.current = false;
    }
  };

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
      setQuery("");
    };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [open]);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const pick = (slug: string) => {
    skipFocusOpenRef.current = true;
    onChange(slug);
    close();
    inputRef.current?.blur();
  };

  const pickFromPointer = (slug: string, e: { preventDefault: () => void }) => {
    e.preventDefault();
    pick(slug);
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
        navigableCount ? Math.min(i + 1, navigableCount - 1) : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (canOfferCreate && highlight === createOptionIndex) {
        void runCreate();
        return;
      }
      const row = flatFiltered[highlight];
      if (row) pick(row.slug);
      else if (mayCreate) void runCreate();
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
          type="text"
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
            if (skipFocusOpenRef.current) {
              skipFocusOpenRef.current = false;
              return;
            }
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
            <div className="cat-combo-empty">
              <div className="m">No matching categories.</div>
              {onCreateCustom && trimmedQuery.length >= 2 ? (
                <button
                  type="button"
                  className={`btn s full cat-combo-create-btn${
                    highlight === 0 ? " is-active-outline" : ""
                  }`}
                  disabled={createBusy || disabled}
                  onMouseEnter={() => setHighlight(0)}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    void runCreate();
                  }}
                >
                  {createBusy
                    ? "Creating…"
                    : `Add “${trimmedQuery}” as new category`}
                </button>
              ) : (
                <div className="m">
                  Type at least 2 characters to add a new category.
                </div>
              )}
            </div>
          ) : (
            <>
              {canOfferCreate ? (
                <button
                  type="button"
                  className={`cat-combo-option cat-combo-create${
                    highlight === createOptionIndex ? " is-active" : ""
                  }`}
                  disabled={createBusy || disabled}
                  onMouseEnter={() => setHighlight(createOptionIndex)}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    void runCreate();
                  }}
                >
                  {createBusy
                    ? "Creating…"
                    : `Add “${trimmedQuery}” as new category`}
                </button>
              ) : null}
              {filteredOfficial.length ? (
                <>
                  {groupOfficialRows(filteredOfficial, groupOfficialBy).map(
                    (section) => (
                      <div key={section.title}>
                        <div className="cat-combo-group" role="presentation">
                          {section.title}
                        </div>
                        {section.rows.map((row) => {
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
                              onPointerDown={(e) => pickFromPointer(row.slug, e)}
                            >
                              {row.label}
                            </button>
                          );
                        })}
                      </div>
                    ),
                  )}
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
                        onPointerDown={(e) => pickFromPointer(row.slug, e)}
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