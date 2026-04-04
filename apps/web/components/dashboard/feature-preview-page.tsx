import type { HighlightCard } from "@cloaka/shared";
import { SectionCard } from "@/components/dashboard/section-card";
import { PageFrame } from "@/components/layout/page-frame";

type FeaturePreviewPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  cards: HighlightCard[];
};

export function FeaturePreviewPage({
  eyebrow,
  title,
  description,
  cards
}: FeaturePreviewPageProps) {
  return (
    <PageFrame eyebrow={eyebrow} title={title} description={description}>
      <section className="grid gap-4 xl:grid-cols-3">
        {cards.map((card) => (
          <SectionCard key={card.title} {...card} />
        ))}
      </section>
    </PageFrame>
  );
}
