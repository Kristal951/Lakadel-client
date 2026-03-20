import Header from "@/components/shop/Header";

export default function SettingsPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full h-full flex">
      <Header />
      <main className="flex-1 mt-17.5">
        {children}
      </main>
    </div>
  );
}
