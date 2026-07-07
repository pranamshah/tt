import { getDefaultUserId } from "@/lib/db/default-user";
import { getCategories, getNotes } from "@/lib/db/queries";
import { NotesList } from "@/components/notes/notes-list";

// Notes change on every request — never prerender this page.
export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const userId = await getDefaultUserId();

  const [categories, notes] = await Promise.all([
    getCategories(userId),
    getNotes(userId),
  ]);

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold text-on-background md:text-[32px]">
          Notes
        </h2>
        <p className="font-body text-sm text-on-surface-variant md:text-base">
          Freeform notes, most recently updated first.
        </p>
      </div>

      <NotesList notes={notes} categories={categories} />
    </div>
  );
}
