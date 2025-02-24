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
import { v4 as uuidv4 } from "uuid";
import { QueryPad } from "./components/QueryPad";

export interface Tab {
  id: string;
  title: string;
  content: string;
}

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
  const [tabs, setTabs] = useState<Tab[]>([
    { id: uuidv4(), title: "New Tab 1", content: "" },
  ]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showQueryPad, setShowQueryPad] = useState(false);

  const closeTab = (tabId: string) => {
    setTabs((prev) => {
      const newTabs = prev.filter((tab) => tab.id !== tabId);
      if (activeTab === tabId) {
        setActiveTab(
          newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null
        );
      }
      return newTabs;
    });
  };

  const addNewTab = (server: Server, database: Database | null) => {
    if (!showQueryPad) {
      setShowQueryPad(true);
    } else {
      const newTabId = uuidv4();
      setTabs((prev) => [
        ...prev,
        {
          id: newTabId,
          title: `New Tab ${tabs.length + 1}`,
          content: "",
        },
      ]);
      setActiveTab(newTabId);
    }
    setSelectedServer(server);
    setSelectedDatabase(database);
  };

  const updateTabContent = (tabId: string, sqlCode: string) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === tabId ? { ...tab, content: sqlCode } : tab))
    );
  };

  useEffect(() => {
    localStorage.setItem("servers", JSON.stringify(servers));
  }, [servers]);

  const handleAddServer = (conn: Server) => {
    setServers((prev) => [...prev, conn]);
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex min-h-screen overflow-hidden">
        <SidebarProvider>
          <AppSidebar
            servers={servers}
            selectedServer={selectedServer}
            setSelectedServer={setSelectedServer}
            onAddServer={handleAddServer}
            selectedDatabase={selectedDatabase}
            onSelectDatabase={setSelectedDatabase}
            addNewTab={addNewTab}
          />
          <SidebarInset className="flex-1 flex flex-col overflow-hidden">
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
            {showQueryPad && (
              <QueryPad
                selectedDatabase={selectedDatabase}
                selectedServer={selectedServer}
                onCloseTab={closeTab}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tabs={tabs}
                onNewTab={addNewTab}
                updateTabContent={updateTabContent}
              />
            )}
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;
