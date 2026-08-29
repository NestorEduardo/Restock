type MessageInputProps = {
  message: string;
  isLoading: boolean;
  error: string | null;
  onMessageChange: (message: string) => void;
  onSubmit: () => void;
};

export default function MessageInput({
  message,
  isLoading,
  error,
  onMessageChange,
  onSubmit,
}: MessageInputProps) {
  return (
    <div className="flex h-full flex-col gap-3">
      <label htmlFor="order-message" className="text-sm font-medium text-gray-700">
        Your order
      </label>
      <textarea
        id="order-message"
        value={message}
        onChange={(event) => onMessageChange(event.target.value)}
        placeholder='5 usb c cables, 10 screen protectors for the 14 pro, 3 chargers…'
        rows={12}
        disabled={isLoading}
        className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:bg-gray-50"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading || !message.trim()}
        className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isLoading ? "Resolving…" : "Submit order"}
      </button>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
