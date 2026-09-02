import { JsonCatalogSource } from "@/lib/catalog/json-source";

import { OrderDraftProvider } from "@/components/order/OrderDraftContext";
import OrderPage from "@/components/order/OrderPage";
import PortalFooter from "@/components/portal/PortalFooter";
import PortalHeader from "@/components/portal/PortalHeader";

export default async function Home() {
  const catalog = new JsonCatalogSource();
  const catalogInfo = await catalog.getInfo("demo");

  return (
    <OrderDraftProvider>
      <PortalHeader catalog={catalogInfo} />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6">
        <OrderPage />
      </main>

      <PortalFooter />
    </OrderDraftProvider>
  );
}
