type Props = { searchParams: Promise<{ error?: string; next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { error, next } = await searchParams;
  return (
    <form method="post" action="/api/login" className="max-w-sm flex flex-col gap-3 pt-8">
      <h1 className="text-xl font-medium">Log in</h1>
      <input type="hidden" name="next" value={next ?? "/"} />
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          required
          className="rounded-md border border-line bg-surface px-3 py-2 text-base"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Password
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className="rounded-md border border-line bg-surface px-3 py-2 text-base"
        />
      </label>
      {error && <p className="text-sm text-red-600">Wrong name or password.</p>}
      <button type="submit" className="py-3 rounded-md bg-foreground text-background text-base font-medium">
        Log in
      </button>
    </form>
  );
}
