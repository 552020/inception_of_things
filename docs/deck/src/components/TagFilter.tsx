"use client";

type Props = { tags: string[]; selected: string | null; onChange: (tag: string | null) => void };

export function TagFilter({ tags, selected, onChange }: Props) {
  const base = "ui-chip";
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`${base} ${selected === null ? "ui-chip-on" : ""}`}
      >
        all
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onChange(tag === selected ? null : tag)}
          className={`${base} ${selected === tag ? "ui-chip-on" : ""}`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
