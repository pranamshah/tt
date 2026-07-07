import { format } from "date-fns";
import { getDefaultUserId } from "@/lib/db/default-user";
import {
  getCategories,
  getTaskCompletionStats,
  getTodayAndOverdueTasks,
  getTodayTimetableBlocks,
} from "@/lib/db/queries";
import { QuickAddBar } from "@/components/today/quick-add-bar";
import { ProgressRing } from "@/components/today/progress-ring";
import { Timeline } from "@/components/today/timeline";
import { TaskBoard } from "@/components/today/task-board";

// Task/timetable data changes on every request — never prerender this page.
export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const userId = await getDefaultUserId();
  const now = new Date();
  const todayDate = format(now, "yyyy-MM-dd");
  const todayDayOfWeek = now.getDay();

  const [categories, blocks, tasks, stats] = await Promise.all([
    getCategories(userId),
    getTodayTimetableBlocks(userId, todayDayOfWeek, todayDate),
    getTodayAndOverdueTasks(userId, todayDate),
    getTaskCompletionStats(userId, todayDate),
  ]);

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-on-background md:text-[32px]">
              Today&apos;s Focus
            </h2>
            <p className="font-body text-sm text-on-surface-variant md:text-base">
              You have {tasks.length}{" "}
              {tasks.length === 1 ? "task" : "tasks"} to get through today.
            </p>
          </div>
          <ProgressRing total={stats.total} completed={stats.completed} />
        </div>
        <QuickAddBar />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 xl:col-span-4">
          <Timeline blocks={blocks} categories={categories} />
        </div>
        <div className="lg:col-span-7 xl:col-span-8">
          <TaskBoard tasks={tasks} categories={categories} todayDate={todayDate} />
        </div>
      </div>
    </div>
  );
}
