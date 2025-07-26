import { SidebarProvider } from "@/components/ui/sidebar";
import { getAllPlaygroundForUser } from "@/features/dashboard/actions";
import DashboardSidebar from "@/features/dashboard/components/dashboardsidebar";
import React from "react";

export default async function Dashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const playgroundData = await getAllPlaygroundForUser();

  const technologyIconMap: Record<string, string> = {
    REACT: "Zap",
    NEXTJS: "Lightbulb",
    EXPRESS: "Database",
    VUE: "Compass",
    HONO: "FlameIcon",
    ANGULAR: "Terminal",
  };

  const formatedPlaygroundData = playgroundData?.map((playground) => ({
    id: playground.id,
    name: playground.title,
    icon: technologyIconMap[playground.template],
    starred: playground?.Starmark[0]?.isMarked || false,
  })) || [];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        {/* <DashboardSidebar /> implement */}
        <DashboardSidebar initialPlaygroundData={formatedPlaygroundData} />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
