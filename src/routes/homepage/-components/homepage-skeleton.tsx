import { Skeleton } from '@/lib/components/ui/skeleton';

const container = 'mx-auto w-full max-w-7xl px-4 lg:px-6';

export function HomepageSkeleton() {
  return (
    <main aria-label="Loading Toolbox homepage">
      <div className="sr-only" role="status">
        Loading Toolbox homepage.
      </div>
      <div aria-hidden="true">
        <div className="border-border/70 border-b">
          <div
            className={`${container} flex min-h-16 items-center justify-between gap-4`}
          >
            <Placeholder className="h-5 w-20" />
            <Placeholder className="h-8 w-8 sm:w-48" />
          </div>
        </div>
        <div className="border-border/70 border-b">
          <div className={`${container} py-12 sm:py-16`}>
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-2">
              <Placeholder className="h-10 w-4/5 sm:h-14 sm:w-2/5 lg:h-16" />
              <Placeholder className="h-10 w-full sm:h-14 sm:w-4/5 lg:h-16" />
              <Placeholder className="h-10 w-3/5 sm:hidden" />
            </div>
            <div className="mx-auto mt-5 flex max-w-xl flex-col items-center gap-2">
              <Placeholder className="h-5 w-full" />
              <Placeholder className="h-5 w-4/5" />
              <Placeholder className="h-5 w-3/5 sm:hidden" />
            </div>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Placeholder className="h-10 w-40 max-w-full sm:h-9" />
              <Placeholder className="h-10 w-40 max-w-full sm:h-9" />
            </div>
            <div className="mx-auto mt-10 max-w-5xl rounded-2xl border bg-muted/40 p-2">
              <div className="flex flex-wrap justify-between gap-2 px-3 py-2">
                <Placeholder className="h-4 w-36 max-w-full" />
                <Placeholder className="h-3 w-28 max-w-full" />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <PreviewPlaceholder bodyClassName="h-28" />
                <PreviewPlaceholder bodyClassName="h-24" />
                <PreviewPlaceholder bodyClassName="h-20" />
              </div>
            </div>
          </div>
        </div>
        <div className={`${container} py-12 sm:py-16`}>
          <Placeholder className="h-9 w-64 max-w-full" />
          <Placeholder className="mt-3 h-5 w-72 max-w-full" />
          <Placeholder className="mt-8 h-9 w-full max-w-md" />
          <div className="mt-4 flex flex-wrap gap-2">
            <Placeholder className="h-9 w-12 max-w-full rounded-full sm:h-8" />
            <Placeholder className="h-9 w-36 max-w-full rounded-full sm:h-8" />
            <Placeholder className="h-9 w-32 max-w-full rounded-full sm:h-8" />
            <Placeholder className="h-9 w-36 max-w-full rounded-full sm:h-8" />
            <Placeholder className="h-9 w-28 max-w-full rounded-full sm:h-8" />
            <Placeholder className="h-9 w-28 max-w-full rounded-full sm:h-8" />
            <Placeholder className="h-9 w-24 max-w-full rounded-full sm:h-8" />
          </div>
          <Placeholder className="mt-6 mb-4 h-4 w-48 max-w-full" />
          <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
            <ToolPlaceholder />
            <ToolPlaceholder />
            <ToolPlaceholder />
            <ToolPlaceholder />
            <ToolPlaceholder />
            <ToolPlaceholder />
          </div>
          <Placeholder className="mx-auto mt-8 h-9 w-40 max-w-full" />
        </div>
        <div className="border-border/70 border-y bg-muted/40">
          <div className={`${container} py-12 sm:py-16`}>
            <Placeholder className="h-9 w-80 max-w-full" />
            <Placeholder className="mt-3 h-5 w-96 max-w-full" />
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <TextPlaceholder />
              <TextPlaceholder />
              <TextPlaceholder />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Placeholder({ className }: { className: string }) {
  return <Skeleton className={`rounded-md bg-secondary ${className}`} />;
}

function PreviewPlaceholder({ bodyClassName }: { bodyClassName: string }) {
  return (
    <div className="flex flex-col rounded-xl bg-bg p-4">
      <div className="mb-3 flex items-center gap-2">
        <Placeholder className="size-8" />
        <Placeholder className="h-4 min-w-0 flex-1" />
      </div>
      <Placeholder className={`w-full ${bodyClassName}`} />
      <div className="mt-auto pt-4">
        <Placeholder className="h-4 w-4/5" />
      </div>
    </div>
  );
}

function ToolPlaceholder() {
  return (
    <div className="flex min-w-0 items-start gap-4 border-b py-4">
      <Placeholder className="size-9" />
      <div className="min-w-0 flex-1">
        <Placeholder className="h-4 w-36 max-w-full" />
        <Placeholder className="mt-2 h-4 w-full" />
        <Placeholder className="mt-2 h-4 w-3/4" />
      </div>
    </div>
  );
}

function TextPlaceholder() {
  return (
    <div className="min-w-0">
      <Placeholder className="h-5 w-40 max-w-full" />
      <Placeholder className="mt-3 h-4 w-full" />
      <Placeholder className="mt-2 h-4 w-4/5" />
    </div>
  );
}
