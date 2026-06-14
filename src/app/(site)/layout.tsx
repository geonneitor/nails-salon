import Navigation from '@/components/layout/Navigation';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col pb-20 md:pb-32">
      <main className="flex-1 w-full">{children}</main>
      <Navigation />
    </div>
  );
}
