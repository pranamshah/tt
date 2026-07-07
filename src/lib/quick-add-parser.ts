import { addDays, format } from "date-fns";

export type ParsedQuickAdd = {
  title: string;
  dueDate: string | null;
  dueTime: string | null;
  tagNames: string[];
};

const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const TIME_RE =
  /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b|\b([01]?\d|2[0-3]):([0-5]\d)\b/i;

function extractTags(input: string): { text: string; tagNames: string[] } {
  const tagNames: string[] = [];
  const text = input.replace(/#(\w+)/g, (_match, tag: string) => {
    tagNames.push(tag.toLowerCase());
    return "";
  });
  return { text, tagNames };
}

function extractDate(
  input: string,
  now: Date,
): { text: string; dueDate: string | null } {
  const lower = input.toLowerCase();

  if (/\btoday\b/.test(lower)) {
    return {
      text: input.replace(/\btoday\b/i, ""),
      dueDate: format(now, "yyyy-MM-dd"),
    };
  }

  if (/\btomorrow\b/.test(lower)) {
    return {
      text: input.replace(/\btomorrow\b/i, ""),
      dueDate: format(addDays(now, 1), "yyyy-MM-dd"),
    };
  }

  for (let i = 0; i < WEEKDAYS.length; i++) {
    const weekdayRe = new RegExp(`\\b${WEEKDAYS[i]}\\b`, "i");
    if (weekdayRe.test(lower)) {
      const currentDay = now.getDay();
      let diff = i - currentDay;
      if (diff <= 0) diff += 7;
      return {
        text: input.replace(weekdayRe, ""),
        dueDate: format(addDays(now, diff), "yyyy-MM-dd"),
      };
    }
  }

  return { text: input, dueDate: null };
}

function extractTime(input: string): { text: string; dueTime: string | null } {
  const match = input.match(TIME_RE);
  if (!match) return { text: input, dueTime: null };

  let hours: number;
  let minutes: number;

  if (match[4] !== undefined) {
    // 24h form: HH:mm
    hours = Number(match[4]);
    minutes = Number(match[5]);
  } else {
    hours = Number(match[1]);
    minutes = match[2] ? Number(match[2]) : 0;
    const meridiem = match[3].toLowerCase();
    if (meridiem === "pm" && hours !== 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;
  }

  const dueTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
  return { text: input.replace(TIME_RE, ""), dueTime };
}

/** Parses shorthand like "Call dentist tomorrow 5pm #health" into a title + due date/time + tags. No AI — plain string matching. */
export function parseQuickAdd(rawInput: string, now: Date = new Date()): ParsedQuickAdd {
  const { text: afterTags, tagNames } = extractTags(rawInput);
  const { text: afterDate, dueDate } = extractDate(afterTags, now);
  const { text: afterTime, dueTime } = extractTime(afterDate);

  const title = afterTime.replace(/\s+/g, " ").trim();

  return { title, dueDate, dueTime, tagNames };
}
