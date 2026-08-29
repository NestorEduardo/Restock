import WebMCP from "@/components/WebMCP";
import OrderPage from "@/components/order/OrderPage";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-6 lg:p-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Restock</h1>
        <p className="mt-1 text-gray-600">
          Natural-language B2B ordering portal for distributor catalogs.
        </p>
      </header>

      <OrderPage />

      <WebMCP />
    </main>
  );
}
