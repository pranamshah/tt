"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserSettings } from "@/lib/actions/settings";
import type { UserSettingsRecord } from "@/lib/db/queries";

const WEEK_START_OPTIONS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
];

export function SettingsForm({ settings }: { settings: UserSettingsRecord }) {
  const [isPending, startTransition] = useTransition();
  const [weekStartDay, setWeekStartDay] = useState(String(settings.weekStartDay));
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    settings.notificationsEnabled,
  );

  function handleSave() {
    startTransition(async () => {
      await updateUserSettings({
        weekStartDay: Number(weekStartDay),
        notificationsEnabled,
      });
      toast.success("Settings saved");
    });
  }

  return (
    <div className="flex max-w-md flex-col gap-6 rounded-xl border border-outline-variant/50 bg-card p-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="week-start-day">Week starts on</Label>
        <Select
          value={weekStartDay}
          onValueChange={(value) => value && setWeekStartDay(value)}
        >
          <SelectTrigger id="week-start-day" className="w-full">
            <SelectValue>
              {(value) =>
                WEEK_START_OPTIONS.find((option) => option.value === value)?.label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {WEEK_START_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <label className="flex items-center gap-2 text-sm text-on-surface">
        <Checkbox
          checked={notificationsEnabled}
          onCheckedChange={(checked) => setNotificationsEnabled(checked === true)}
        />
        Enable notifications
      </label>

      <Button type="button" onClick={handleSave} disabled={isPending} className="self-start">
        Save changes
      </Button>
    </div>
  );
}
