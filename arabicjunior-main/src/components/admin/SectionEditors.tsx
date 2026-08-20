"use client";

import React from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import {
  ICON_MAP,
  ICON_NAMES,
  ICON_THEMES,
  ICON_THEME_NAMES,
} from "@/lib/sectionIcons";

/**
 * The list editors shared by the page-settings admin screens.
 *
 * These were being retyped per screen and had already started to drift — one
 * copy had reordering, another did not. One component means a fix lands
 * everywhere.
 */

export const inputClass =
  "w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200";
export const labelClass = "mb-1 block text-sm font-medium text-neutral-700";

/** Anything with a title. The other fields are optional per editor. */
export interface EditableItem {
  title: string;
  description?: string;
  icon?: string;
  iconTheme?: string;
  badge?: string;
  order?: number;
}

const Dropdown = ({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: string[];
}) => (
  <label className="block">
    <span className={labelClass}>{label}</span>
    <select
      className={inputClass}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  </label>
);

export const AddButton = ({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-50"
  >
    <Plus className="w-4 h-4" /> {label}
  </button>
);

/**
 * Card editor with reordering.
 *
 * `fields` decides which optional inputs appear, so one component covers a card
 * with an icon, a card with a badge instead, and a label-only item.
 */
export function ItemListEditor<T extends EditableItem>({
  items,
  setItems,
  addLabel,
  blank,
  fields,
  round = false,
}: {
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  addLabel: string;
  blank: () => T;
  fields: { description?: boolean; icon?: boolean; badge?: boolean };
  /** Preview the icon in a circle, matching how the page renders it. */
  round?: boolean;
}) {
  const patch = (index: number, next: Partial<T>) =>
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...next } : item))
    );

  /** The array order is what the page renders, so moving one is a swap. */
  const move = (index: number, direction: -1 | 1) =>
    setItems((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  return (
    <>
      <div className="flex items-center justify-end">
        <AddButton
          onClick={() => setItems((p) => [...p, blank()])}
          label={addLabel}
        />
      </div>

      {items.length === 0 && (
        <p className="text-sm text-neutral-400">Nothing here yet.</p>
      )}

      {items.map((item, index) => {
        const Preview = ICON_MAP[item.icon ?? ""] ?? ICON_MAP.Star;
        const theme = ICON_THEMES[item.iconTheme ?? ""] ?? ICON_THEMES.orange;
        const shape = round ? "rounded-full" : "rounded-lg";

        return (
          <div
            key={index}
            className="rounded-lg border border-neutral-200 p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <span
                className={
                  "flex shrink-0 items-center justify-center w-10 h-10 " +
                  shape +
                  " " +
                  theme
                }
              >
                {fields.icon ? (
                  <Preview className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </span>
              <span className="flex-1 text-sm font-semibold text-neutral-700">
                {index + 1}. {item.title || "Untitled"}
              </span>

              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={"Move " + (index + 1) + " up"}
                className="rounded-lg border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                aria-label={"Move " + (index + 1) + " down"}
                className="rounded-lg border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setItems((p) => p.filter((_, i) => i !== index))}
                aria-label={"Remove " + (index + 1)}
                className="rounded-lg border border-neutral-200 p-2 text-red-500 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <label className="block">
              <span className={labelClass}>Title</span>
              <input
                className={inputClass}
                value={item.title}
                onChange={(e) =>
                  patch(index, { title: e.target.value } as Partial<T>)
                }
              />
            </label>

            {fields.description && (
              <label className="block">
                <span className={labelClass}>Description</span>
                <textarea
                  className={inputClass + " min-h-[80px]"}
                  value={item.description ?? ""}
                  onChange={(e) =>
                    patch(index, { description: e.target.value } as Partial<T>)
                  }
                />
              </label>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fields.badge && (
                <label className="block">
                  <span className={labelClass}>
                    Badge{" "}
                    <span className="font-normal text-neutral-400">
                      (empty = no badge)
                    </span>
                  </span>
                  <input
                    className={inputClass}
                    value={item.badge ?? ""}
                    onChange={(e) =>
                      patch(index, { badge: e.target.value } as Partial<T>)
                    }
                    placeholder="Most Popular"
                  />
                </label>
              )}

              {fields.icon && (
                <Dropdown
                  label="Icon"
                  value={item.icon ?? "Star"}
                  onChange={(v) => patch(index, { icon: v } as Partial<T>)}
                  options={ICON_NAMES}
                />
              )}

              <Dropdown
                label="Colour"
                value={item.iconTheme ?? "orange"}
                onChange={(v) => patch(index, { iconTheme: v } as Partial<T>)}
                options={ICON_THEME_NAMES}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}

/** A plain list of paragraphs — used for bullet notes and SEO copy. */
export const TextListEditor = ({
  lines,
  setLines,
  addLabel,
  placeholder,
}: {
  lines: string[];
  setLines: React.Dispatch<React.SetStateAction<string[]>>;
  addLabel: string;
  placeholder?: string;
}) => (
  <>
    <div className="flex items-center justify-end">
      <AddButton onClick={() => setLines((p) => [...p, ""])} label={addLabel} />
    </div>

    {lines.length === 0 && (
      <p className="text-sm text-neutral-400">Nothing here yet.</p>
    )}

    {lines.map((line, index) => (
      <div key={index} className="flex gap-2">
        <textarea
          className={inputClass + " min-h-[70px]"}
          value={line}
          onChange={(e) =>
            setLines((p) => p.map((l, i) => (i === index ? e.target.value : l)))
          }
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setLines((p) => p.filter((_, i) => i !== index))}
          aria-label={"Remove line " + (index + 1)}
          className="shrink-0 self-start rounded-lg border border-neutral-200 p-2 text-red-500 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ))}
  </>
);
