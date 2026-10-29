export function HomepagePrivacy() {
  return (
    <section className="border-border/70 border-y bg-muted/40" id="privacy">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:py-16 lg:px-6">
        <h2 className="max-w-xl text-balance font-semibold text-3xl text-foreground sm:text-4xl">
          Your inputs stay yours.
        </h2>
        <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
          Pick a tool, get a result, and get on with your day.
        </p>
        <ul className="mt-8 grid list-none gap-6 p-0 sm:grid-cols-3">
          <li className="min-w-0">
            <h3 className="text-balance font-semibold text-foreground">
              Processed in your browser
            </h3>
            <p className="mt-2 text-muted-foreground text-sm">
              For supported tools, work happens locally so inputs can stay on
              your device.
            </p>
          </li>
          <li className="min-w-0">
            <h3 className="text-balance font-semibold text-foreground">
              No account needed
            </h3>
            <p className="mt-2 text-muted-foreground text-sm">
              Open any tool and start. There is no signup step before the
              catalog.
            </p>
          </li>
          <li className="min-w-0">
            <h3 className="text-balance font-semibold text-foreground">
              Leave with a result
            </h3>
            <p className="mt-2 text-muted-foreground text-sm">
              Copy, download, or share the output you came for in a few direct
              actions.
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
