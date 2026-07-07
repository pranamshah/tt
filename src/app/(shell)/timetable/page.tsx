import { getDefaultUserId } from "@/lib/db/default-user";
import { getCategories, getRecurringTimetableBlocks } from "@/lib/db/queries";
import { WeekGrid } from "@/components/timetable/week-grid";

// Timetable blocks change on every request — never prerender this page.
export const dynamic = "force-dynamic";

export default async function TimetablePage() {
  const userId = await getDefaultUserId();

  const [categories, blocks] = await Promise.all([
    getCategories(userId),
    getRecurringTimetableBlocks(userId),
  ]);

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold text-on-background md:text-[32px]">
          Weekly Timetable
        </h2>
        <p className="font-body text-sm text-on-surface-variant md:text-base">
          Your recurring weekly schedule. Click a day&apos;s + to add a block, or an
          existing block to edit it.
        </p>
      </div>

      <WeekGrid blocks={blocks} categories={categories} />
    </div>
  );
}
