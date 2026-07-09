"use client";

import { useEffect, useMemo, useState } from "react";

type CategoryNavItem = {
  category: string;
  sectionId: string;
  count: number;
};

type CategoryNavProps = {
  items: CategoryNavItem[];
};

export function CategoryNav({ items }: CategoryNavProps) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const itemIds = useMemo(() => items.map((item) => item.sectionId), [items]);

  useEffect(() => {
    if (itemIds.length === 0) {
      setActiveSectionId(null);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveSectionId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0.1, 0.35, 0.6],
      },
    );

    for (const sectionId of itemIds) {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, [itemIds]);

  if (items.length === 0) {
    return null;
  }

  return (
    <aside className="sticky top-6 z-99 self-start rounded-xl border border-zinc-200 bg-white/80 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Categories
      </h2>
      <nav className="space-y-1" aria-label="Gallery categories">
        {items.map((item) => {
          const isActive = activeSectionId === item.sectionId;

          return (
            <a
              key={item.sectionId}
              href={`#${item.sectionId}`}
              className={`flex items-center justify-between rounded-md px-2 py-1 text-sm transition-colors ${
                isActive
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <span>{item.category}</span>
              <span className="text-xs opacity-75">{item.count}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
