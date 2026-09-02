import WebMCP from "@/components/WebMCP";

export default function PortalFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface py-4">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 sm:px-6">
        <p className="text-xs text-muted-foreground">
          Ordering powered by{" "}
          <span className="font-medium text-foreground">Restock</span>
        </p>
        <WebMCP />
      </div>
    </footer>
  );
}
