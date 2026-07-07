import { getDefaultUserId } from "@/lib/db/default-user";
import { getUserSettings } from "@/lib/db/queries";
import { SettingsForm } from "@/components/settings/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const userId = await getDefaultUserId();
  const settings = await getUserSettings(userId);

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold text-on-background md:text-[32px]">
          Settings
        </h2>
        <p className="font-body text-sm text-on-surface-variant md:text-base">
          Preferences for your planner. Theme lives in the toggle at the top right.
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
