import { requireSession } from "@/lib/auth";
import Sidebar from "@/components/shell/Sidebar";
import TopBar from "@/components/shell/TopBar";
import { CartProvider } from "@/components/cart/CartProvider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <CartProvider>
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar name={session.name} email={session.email} />
          <main className="flex-1 p-6 md:p-10 max-w-[1400px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </CartProvider>
  );
}
