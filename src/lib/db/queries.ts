import { and, asc, eq, isNull, lte, ne, or } from "drizzle-orm";
import { db } from "./index";
import { categories, tasks, timetableBlocks } from "./schema";

export type CategoryRecord = typeof categories.$inferSelect;
export type TaskRecord = typeof tasks.$inferSelect;
export type TimetableBlockRecord = typeof timetableBlocks.$inferSelect;

export async function getCategories(userId: string): Promise<CategoryRecord[]> {
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.createdAt));
}

/** Recurring blocks for today's day-of-week (0=Sun..6=Sat) plus one-offs pinned to today's date. */
export async function getTodayTimetableBlocks(
  userId: string,
  todayDayOfWeek: number,
  todayDate: string,
): Promise<TimetableBlockRecord[]> {
  return db
    .select()
    .from(timetableBlocks)
    .where(
      and(
        eq(timetableBlocks.userId, userId),
        or(
          and(
            eq(timetableBlocks.isRecurring, true),
            eq(timetableBlocks.dayOfWeek, todayDayOfWeek),
          ),
          eq(timetableBlocks.specificDate, todayDate),
        ),
      ),
    )
    .orderBy(asc(timetableBlocks.startTime));
}

/** Tasks due today or overdue, excluding completed and soft-deleted. */
export async function getTodayAndOverdueTasks(
  userId: string,
  todayDate: string,
): Promise<TaskRecord[]> {
  return db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        isNull(tasks.deletedAt),
        ne(tasks.status, "done"),
        lte(tasks.dueDate, todayDate),
      ),
    )
    .orderBy(asc(tasks.dueDate), asc(tasks.dueTime));
}

export async function getTaskCompletionStats(
  userId: string,
  todayDate: string,
): Promise<{ total: number; completed: number }> {
  const rows = await db
    .select({ status: tasks.status, dueDate: tasks.dueDate })
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        isNull(tasks.deletedAt),
        eq(tasks.dueDate, todayDate),
      ),
    );

  return {
    total: rows.length,
    completed: rows.filter((r) => r.status === "done").length,
  };
}
