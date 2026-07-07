import { and, asc, between, desc, eq, isNull, lte, ne, or, sql } from "drizzle-orm";
import { db } from "./index";
import { categories, habitLogs, habits, notes, tasks, timetableBlocks } from "./schema";

export type CategoryRecord = typeof categories.$inferSelect;
export type TaskRecord = typeof tasks.$inferSelect;
export type TimetableBlockRecord = typeof timetableBlocks.$inferSelect;
export type NoteRecord = typeof notes.$inferSelect;
export type HabitRecord = typeof habits.$inferSelect;
export type HabitLogRecord = typeof habitLogs.$inferSelect;

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

/** All recurring weekly blocks, across every day-of-week, for the timetable editor. */
export async function getRecurringTimetableBlocks(
  userId: string,
): Promise<TimetableBlockRecord[]> {
  return db
    .select()
    .from(timetableBlocks)
    .where(
      and(
        eq(timetableBlocks.userId, userId),
        eq(timetableBlocks.isRecurring, true),
      ),
    )
    .orderBy(asc(timetableBlocks.dayOfWeek), asc(timetableBlocks.startTime));
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

/** Every non-deleted task, active ones first (by due date), completed ones last (most recent first). */
export async function getAllTasks(userId: string): Promise<TaskRecord[]> {
  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), isNull(tasks.deletedAt)))
    .orderBy(
      sql`(${tasks.status} = 'done')`,
      asc(tasks.dueDate),
      asc(tasks.dueTime),
      desc(tasks.createdAt),
    );
}

export async function getNotes(userId: string): Promise<NoteRecord[]> {
  return db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.updatedAt));
}

export async function getHabits(userId: string): Promise<HabitRecord[]> {
  return db
    .select()
    .from(habits)
    .where(eq(habits.userId, userId))
    .orderBy(asc(habits.createdAt));
}

/** Habit logs for this user's habits within [startDate, endDate] (inclusive, "yyyy-MM-dd"). */
export async function getHabitLogsInRange(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<HabitLogRecord[]> {
  return db
    .select({
      id: habitLogs.id,
      habitId: habitLogs.habitId,
      logDate: habitLogs.logDate,
      completed: habitLogs.completed,
    })
    .from(habitLogs)
    .innerJoin(habits, eq(habitLogs.habitId, habits.id))
    .where(
      and(eq(habits.userId, userId), between(habitLogs.logDate, startDate, endDate)),
    );
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
