import { ApplianceCard } from "./appliance-card";
import { CategoryTiles } from "./category-tiles";
import { getDashboardData } from "./data";

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data.house) {
    return (
      <main className="flex flex-col gap-6 p-8">
        <p className="text-sm">No house found yet — add one to see your dashboard.</p>
      </main>
    );
  }

  const { house, cards } = data;

  return (
    <main className="flex flex-col gap-8 p-8 max-w-2xl">
      <h1 className="text-xl font-semibold">{house.address}</h1>

      <section className="grid grid-cols-2 gap-px border border-hairline bg-hairline sm:grid-cols-3">
        {cards.map((card, index) => (
          <ApplianceCard key={card.applianceInstanceId} card={card} index={index} />
        ))}
      </section>

      <CategoryTiles />
    </main>
  );
}
