export function AdminLoginForm() {
  return (
    <form
      action="/api/auth/sign-in/email?callbackURL=/studio-console"
      method="post"
      className="space-y-4"
    >
      <div className="space-y-2">
        <label
          htmlFor="admin-email"
          className="block text-sm font-medium text-zinc-200"
        >
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="admin-password"
          className="block text-sm font-medium text-zinc-200"
        >
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
        />
      </div>

      <button
        type="submit"
        className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Sign in
      </button>
    </form>
  );
}
