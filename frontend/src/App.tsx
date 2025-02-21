import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar, Server, Database } from "@/components/AppSidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "./components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

function App() {
  const [servers, setServers] = useState<Server[]>(() => {
    const saved = localStorage.getItem("servers");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "1",
            host: "localhost",
            database: "postgres",
            name: "PostgreSQL",
            port: "5432",
            user: "postgres",
            password: "password",
          },
        ];
  });
  const [selectedServer, setSelectedServer] = useState<Server>(servers[0]);
  const [selectedDatabase, setSelectedDatabase] = useState<Database | null>(
    null
  );

  useEffect(() => {
    localStorage.setItem("servers", JSON.stringify(servers));
  }, [servers]);

  const handleAddServer = (conn: Server) => {
    setServers((prev) => [...prev, conn]);
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex min-h-screen">
        <SidebarProvider>
          <AppSidebar
            servers={servers}
            selectedServer={selectedServer}
            setSelectedServer={setSelectedServer}
            onAddServer={handleAddServer}
            selectedDatabase={selectedDatabase}
            onSelectDatabase={setSelectedDatabase}
          />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">
                        {selectedServer.name}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {selectedDatabase ? (
                      <>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                          <BreadcrumbPage>
                            {selectedDatabase.name}
                          </BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    ) : undefined}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="aspect-video rounded-xl bg-muted/50" />
                <div className="aspect-video rounded-xl bg-muted/50" />
                <div className="aspect-video rounded-xl bg-muted/50" />
              </div>
              <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;
