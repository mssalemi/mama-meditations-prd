import Link from "next/link";
import UploadForm from "../upload-form";

export default function AdminPage() {
  return (
    <>
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
