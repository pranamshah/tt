import { addDays, format, startOfWeek } from "date-fns";
import { getDefaultUserId } from "@/lib/db/default-user";
import { getCategories, getHabitLogsInRange, getHabits } from "@/lib/db/queries";
import { HabitsList, type WeekDay } from "@/components/habits/habits-list";

// Habit logs change on every request — never prerender this page.
export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const userId = await getDefaultUserId();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    return {
      date: format(d, "yyyy-MM-dd"),
      dayOfWeek: d.getDay(),
      label: format(d, "EEEEEE"),
    };
  });

  const [categories, habits, logs] = await Promise.all([
    getCategories(userId),
    getHabits(userId),
    getHabitLogsInRange(userId, weekDays[0].date, weekDays[6].date),
  ]);

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold text-on-background md:text-[32px]">
          Habits
        </h2>
        <p className="font-body text-sm text-on-surface-variant md:text-base">
          Track this week&apos;s recurring habits day by day.
        </p>
      </div>

      <HabitsList habits={habits} logs={logs} weekDays={weekDays} categories={categories} />
    </div>
  );
}
