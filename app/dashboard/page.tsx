import { CategoryTiles } from "./category-tiles";
import { CaughtUpState } from "./caught-up-state";
import { getDashboardData } from "./data";
import { NeedsAttentionList } from "./needs-attention-list";
import { NoContentNote } from "./no-content-note";

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data.house) {
    return (
      <main className="flex flex-col gap-6 p-8">
        <p className="text-sm">No house found yet — add one to see your dashboard.</p>
      </main>
    );
  }

  const { house, needsAttention, nextUpcoming, noContentTypes } = data;

  return (
    <main className="flex flex-col gap-8 p-8 max-w-2xl">
      <h1 className="text-xl font-semibold">{house.address}</h1>

      {needsAttention.length === 0 ? (
        <CaughtUpState nextUpcoming={nextUpcoming} />
      ) : (
        <NeedsAttentionList items={needsAttention} />
      )}

      <CategoryTiles />

      {noContentTypes.length > 0 && <NoContentNote items={noContentTypes} />}
    </main>
  );
}
