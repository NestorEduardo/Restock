import type { CatalogInfo } from "@/lib/catalog/types";

type PortalHeaderProps = {
  catalog: CatalogInfo;
};

export default function PortalHeader({ catalog }: PortalHeaderProps) {
  const categoryPreview = catalog.categories.slice(0, 4).join(", ");
  const extraCategories =
    catalog.categories.length > 4
      ? ` +${catalog.categories.length - 4} more`
      : "";

  return (
    <header className="border-b border-border bg-surface shadow-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-foreground"
              aria-hidden
            >
              HW
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-foreground sm:text-xl">
                {catalog.distributor}
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {catalog.itemCount.toLocaleString()} SKUs
                {categoryPreview && (
                  <>
                    {" · "}
                    {categoryPreview}
                    {extraCategories}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
          <span className="rounded-full bg-brand-subtle px-3 py-1 text-xs font-medium text-brand">
            Buyer account
          </span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            Demo Store #1042
          </span>
        </div>
      </div>
    </header>
  );
}
