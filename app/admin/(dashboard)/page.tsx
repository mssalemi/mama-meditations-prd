import Link from "next/link";
import { pickForToday, readAll, todayUTC } from "@/lib/store";
import UploadForm from "../upload-form";

export const dynamic = "force-dynamic";

function daysSinceEpochUTC() {
  const now = new Date();
  return Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) /
      (1000 * 60 * 60 * 24),
  );
}

export default async function AdminPage() {
  const all = await readAll().catch(() => []);
  const published = all
    .filter((m) => m.published)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  // Preview which meditation lands on which day. A pin only ever applies to the
  // day it names, so only "Today" can differ from the plain rotation.
  const base = Math.floor(Date.parse(`${todayUTC()}T00:00:00Z`) / 86_400_000);
  const schedule =
    published.length > 0
      ? [
          { label: "Today", meditation: pickForToday(published) ?? published[0] },
          ...Array.from({ length: 5 }, (_, i) => {
            const offset = i + 1;
            const date = new Date(Date.parse(`${todayUTC()}T00:00:00Z`) + offset * 86_400_000);
            return {
              label: date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              }),
              meditation: published[(base + offset) % published.length],
            };
          }),
        ]
      : [];

  return (
    <>
      {schedule.length > 0 && (
        <div className="mb-6 rounded-xl bg-white p-4 shadow dark:bg-zinc-900">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-zinc-400">
            Schedule
          </h2>
          <ul className="flex flex-col gap-1.5">
            {schedule.map(({ label, meditation: m }, i) => (
              <li
                key={i}
                className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                  i === 0 ? "bg-zinc-100 dark:bg-zinc-800" : ""
                }`}
              >
                <Link
                  href={`/admin/meditations/${m.id}`}
                  className={`truncate text-sm hover:underline ${
                    i === 0
                      ? "font-semibold text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {m.title}
                </Link>
                <span
                  className={`flex-shrink-0 text-xs ${
                    i === 0
                      ? "font-medium text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-400"
                  }`}
                >
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <UploadForm />

      <Link
        href="/admin/meditations"
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        View all meditations
      </Link>
    </>
  );
}
