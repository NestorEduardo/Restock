import WebMCP from "@/components/WebMCP";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-8">
      <h1 className="text-3xl font-bold">Restock</h1>
      <p className="text-gray-600">
        Natural-language B2B ordering portal for distributor catalogs.
      </p>
      <WebMCP />
    </main>
  );
}
