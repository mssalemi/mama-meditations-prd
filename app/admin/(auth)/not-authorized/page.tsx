import LogoutButton from "../../logout-button";

export default function NotAuthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-xl bg-white p-8 shadow dark:bg-zinc-900">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Not Authorized
        </h1>
        <p className="text-center text-sm text-zinc-500">
          Your email is not on the admin allowlist. Contact the site owner to
          request access.
        </p>
        <LogoutButton />
      </div>
    </div>
  );
}
