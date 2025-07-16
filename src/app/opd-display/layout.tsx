
// This is a new layout file specifically for the public OPD display.
// It does not include the sidebar or authenticated header.
export default function OpdDisplayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-100 min-h-screen">
      <main className="p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
