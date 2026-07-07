import { format } from "date-fns";
import { getDefaultUserId } from "@/lib/db/default-user";
import { getAllTasks, getCategories } from "@/lib/db/queries";
import { QuickAddBar } from "@/components/today/quick-add-bar";
import { TaskBoard } from "@/components/today/task-board";

// Task data changes on every request — never prerender this page.
export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const userId = await getDefaultUserId();
  const todayDate = format(new Date(), "yyyy-MM-dd");

  const [categories, tasks] = await Promise.all([
    getCategories(userId),
    getAllTasks(userId),
  ]);

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-on-background md:text-[32px]">
            All Tasks
          </h2>
          <p className="font-body text-sm text-on-surface-variant md:text-base">
            Every open and completed task, grouped by category.
          </p>
        </div>
        <QuickAddBar />
      </section>

      <TaskBoard
        tasks={tasks}
        categories={categories}
        todayDate={todayDate}
        emptyMessage="No tasks yet. Use quick-add above to create one."
      />
    </div>
  );
}
