import { NavigationMenuSection } from "@/pages/sections/NavigationMenuSection";

export function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <NavigationMenuSection />
      <main className="flex-1 md:ml-[218px] pt-[52px] md:pt-0">
        {children}
      </main>
    </div>
  );
}
