import { cache } from "react";
import { db } from "./index";
import { users, categories } from "./schema";

const DEFAULT_USER_EMAIL = "local@planner.app";

const DEFAULT_CATEGORIES = [
  { name: "Work", color: "#3525cd", icon: "briefcase" },
  { name: "Personal", color: "#516072", icon: "user" },
  { name: "Health", color: "#0f9d58", icon: "heart-pulse" },
  { name: "Learning", color: "#7e3000", icon: "book-open" },
];

/**
 * Single-tenant for now: lazily creates (and caches per-request) the one
 * app user + their default categories. Swapping in real auth later just
 * means replacing this with a session lookup — every other table already
 * scopes by user_id.
 */
export const getDefaultUserId = cache(async (): Promise<string> => {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [created] = await db
    .insert(users)
    .values({ email: DEFAULT_USER_EMAIL })
    .returning({ id: users.id });

  await db.insert(categories).values(
    DEFAULT_CATEGORIES.map((category) => ({
      userId: created.id,
      ...category,
    })),
  );

  return created.id;
});
