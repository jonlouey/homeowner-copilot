import { AttentionCard } from "./attention-card";
import { CategoryCard } from "./category-card";
import { getDashboardData } from "./data";

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data.house) {
    return (
      <main className="flex justify-center bg-paper px-6 pb-20 pt-12">
        <p className="text-sm text-ink-muted">No house found yet — add one to see your dashboard.</p>
      </main>
    );
  }

  const { house, attentionCards, categories } = data;

  return (
    <main className="flex justify-center bg-paper px-6 pb-20 pt-12">
      <div className="w-full max-w-[860px]">
        <div className="mb-10">
          <h1 className="text-[30px] leading-[1.2] tracking-[-0.015em] font-bold text-navy-deep">
            {house.address}
          </h1>
        </div>

        <section className="mb-10">
          <div className="mb-4 flex items-baseline justify-between">
            <span className="text-[15px] font-bold text-navy-deep">Needs your attention</span>
            {attentionCards.length > 0 && (
              <span className="text-[12.5px] text-ink-muted">
                {attentionCards.length} item{attentionCards.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {attentionCards.length === 0 ? (
            <p className="text-sm text-ink-muted">Nothing needs attention right now.</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5">
              {attentionCards.map((card, index) => (
                <AttentionCard key={card.applianceInstanceId} card={card} index={index} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <span className="text-[15px] font-bold text-navy-deep">Categories</span>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5">
            {categories.map((category) => (
              <CategoryCard key={category.categoryId} category={category} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
