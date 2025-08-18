
// This is a new layout file specifically for the public OPD display.
// It does not include the sidebar or authenticated header.
import { DataProvider } from '@/context/data-provider';

export default function OpdDisplayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <div className="bg-slate-100 min-h-screen">
        <main className="p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </DataProvider>
  );
}
