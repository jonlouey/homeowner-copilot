import Link from "next/link";
import { notFound } from "next/navigation";
import { AttentionCard } from "@/app/dashboard/attention-card";
import { CATEGORY_LABELS } from "@/app/dashboard/category-icons";
import { getCategoryPageData, isValidCategoryId } from "./data";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;

  if (!isValidCategoryId(categoryId)) {
    notFound();
  }

  const data = await getCategoryPageData(categoryId);

  if (!data.house) {
    return (
      <main className="flex justify-center bg-paper px-6 pb-20 pt-12">
        <p className="text-sm text-ink-muted">
          No house found yet — add one to see your dashboard.
        </p>
      </main>
    );
  }

  const { house, cards } = data;

  return (
    <main className="flex justify-center bg-paper px-6 pb-20 pt-12">
      <div className="w-full max-w-[860px]">
        <Link
          href="/dashboard"
          className="mb-6 inline-block text-sm font-semibold text-ink-muted transition hover:text-ink"
        >
          &larr; Back to dashboard
        </Link>

        <div className="mb-10">
          <p className="mb-2 text-[12.5px] font-semibold uppercase tracking-[.08em] text-accent">
            {house.address}
          </p>
          <h1 className="text-[30px] leading-[1.2] tracking-[-0.015em] font-bold text-navy-deep">
            {CATEGORY_LABELS[categoryId]}
          </h1>
        </div>

        {cards.length === 0 ? (
          <p className="text-sm text-ink-muted">No appliances in this category yet.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5">
            {cards.map((card, index) => (
              <AttentionCard key={card.applianceInstanceId} card={card} index={index} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
