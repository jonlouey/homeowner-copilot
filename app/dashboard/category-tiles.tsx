const CATEGORIES = [
  { id: "systems", label: "Systems" },
  { id: "exterior", label: "Exterior" },
  { id: "appliances", label: "Appliances" },
  { id: "safety", label: "Safety" },
] as const;

// Non-functional per the Phase 2b doc — the full appliance list/detail
// view these would link to doesn't exist yet.
export function CategoryTiles() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-gray-500">Categories</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CATEGORIES.map((category) => (
          <div
            key={category.id}
            className="border rounded px-3 py-4 text-center text-sm font-medium"
          >
            {category.label}
          </div>
        ))}
      </div>
    </section>
  );
}
