"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { userSettings } from "@/lib/db/schema";
import { getDefaultUserId } from "@/lib/db/default-user";

export type UserSettingsInput = {
  weekStartDay: number;
  notificationsEnabled: boolean;
};

export async function updateUserSettings(input: UserSettingsInput) {
  const userId = await getDefaultUserId();

  await db
    .insert(userSettings)
    .values({ userId, ...input })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: input,
    });

  revalidatePath("/settings");
}
