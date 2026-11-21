"use client";

type Props = { tags: string[]; selected: string | null; onChange: (tag: string | null) => void };

export function TagFilter({ tags, selected, onChange }: Props) {
  const base = "px-3 py-1.5 rounded-full text-sm border";
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`${base} ${selected === null ? "bg-foreground text-background border-foreground" : "border-line"}`}
      >
        all
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onChange(tag === selected ? null : tag)}
          className={`${base} ${selected === tag ? "bg-foreground text-background border-foreground" : "border-line"}`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
