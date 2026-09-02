const EXAMPLE_PHRASES = [
  "2 cases of 6ft usb c braided black, 10 tempered glass screen protectors for the 14 pro, 3 chargers",
  "5 usb c cables, 10 screen protectors for the 14 pro",
  "3 wall chargers and 2 tempered glass for iPhone 15",
] as const;

type MessageInputProps = {
  message: string;
  isLoading: boolean;
  error: string | null;
  onMessageChange: (message: string) => void;
  onSubmit: () => void;
};

function LoadingSpinner() {
  return (
    <svg
      className="size-4 animate-spin text-brand-foreground"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function MessageInput({
  message,
  isLoading,
  error,
  onMessageChange,
  onSubmit,
}: MessageInputProps) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-5">
      <div>
        <h2 className="text-base font-semibold text-foreground">
          What do you need?
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Describe your order in plain language — quantities, products, and
          models.
        </p>
      </div>

      <div className="relative">
        <label htmlFor="order-message" className="sr-only">
          Your order
        </label>
        <textarea
          id="order-message"
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          placeholder="e.g. 5 usb c cables, 10 screen protectors for the 14 pro…"
          rows={8}
          disabled={isLoading}
          className="w-full resize-none rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-surface/80 backdrop-blur-[1px]">
            <div className="flex items-center gap-2.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground shadow-elevated">
              <LoadingSpinner />
              Matching products…
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          Try an example
        </p>
        <div className="flex flex-col gap-1.5">
          {EXAMPLE_PHRASES.map((phrase) => (
            <button
              key={phrase}
              type="button"
              disabled={isLoading}
              onClick={() => onMessageChange(phrase)}
              className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-left text-xs leading-relaxed text-muted-foreground transition-colors hover:border-brand/40 hover:bg-brand-subtle hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              &ldquo;{phrase}&rdquo;
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading || !message.trim()}
        className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isLoading ? "Resolving…" : "Submit order"}
      </button>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}
    </section>
  );
}
