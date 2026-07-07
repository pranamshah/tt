import { ClipboardCheck } from "lucide-react";
import { TaskRow } from "@/components/today/task-row";
import type { CategoryRecord, TaskRecord } from "@/lib/db/queries";

const UNCATEGORIZED_COLOR = "#777587";

export function TaskBoard({
  tasks,
  categories,
  todayDate,
}: {
  tasks: TaskRecord[];
  categories: CategoryRecord[];
  todayDate: string;
}) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-outline-variant/60 bg-card p-10 text-center">
        <ClipboardCheck className="size-8 text-on-surface-variant/50" aria-hidden />
        <p className="font-body text-sm text-on-surface-variant">
          Nothing due today. Use quick-add above to plan your day.
        </p>
      </div>
    );
  }

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const groups = new Map<string, TaskRecord[]>();

  for (const task of tasks) {
    const key = task.categoryId ?? "uncategorized";
    const list = groups.get(key) ?? [];
    list.push(task);
    groups.set(key, list);
  }

  const orderedKeys = [
    ...categories.map((c) => c.id).filter((id) => groups.has(id)),
    ...(groups.has("uncategorized") ? ["uncategorized"] : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      {orderedKeys.map((key) => {
        const groupTasks = groups.get(key)!;
        const category = categoryById.get(key);
        const color = category?.color ?? UNCATEGORIZED_COLOR;
        const name = category?.name ?? "Uncategorized";

        return (
          <div
            key={key}
            className="overflow-hidden rounded-xl border border-outline-variant/50 bg-card"
          >
            <div className="flex items-center justify-between bg-surface-container px-4 py-2">
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
                <h4 className="font-mono text-xs font-bold uppercase tracking-wide text-on-surface">
                  {name}
                </h4>
              </div>
              <span className="font-mono text-[10px] text-on-surface-variant">
                {groupTasks.length} {groupTasks.length === 1 ? "item" : "items"}
              </span>
            </div>
            <ul className="divide-y divide-outline-variant/30">
              {groupTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isOverdue={Boolean(task.dueDate && task.dueDate < todayDate)}
                />
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
