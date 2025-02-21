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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { XIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface Tab {
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

  const openTab = (tabId: string) => {
    const existingTab = tabs.find((tab) => tab.id === tabId);
    if (!existingTab) {
      const tabId = uuidv4();
      setTabs((prev) => [
        ...prev,
        {
          id: tabId,
          title: "New Tab",
          content: `Content for server ${selectedServer} and database ${selectedDatabase}`,
        },
      ]);
      setActiveTab(tabId);
    } else {
      setActiveTab(tabId);
    }
  };

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

  const addNewTab = () => {
    const newTabId = uuidv4();
    setTabs((prev) => [
      ...prev,
      {
        id: newTabId,
        title: `New Tab ${tabs.length + 1}`,
        content: `Content for server ${selectedServer} and database ${selectedDatabase}`,
      },
    ]);
    setActiveTab(newTabId);
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
            <div className="flex-1 p-4 pt-0 overflow-hidden">
              <div className="text-xl mb-2">Query Pad</div>
              {tabs.length > 0 ? (
                <Tabs
                  value={activeTab || tabs[0].id}
                  onValueChange={setActiveTab}
                >
                  <TabsList>
                    {tabs.map((tab) => (
                      <TabsTrigger key={tab.id} value={tab.id}>
                        <div className="flex flex-row justify-between gap-4 items-center">
                          {tab.title}
                          <XIcon
                            className="cursor-pointer size-4"
                            onClick={() => tabs.length > 1 && closeTab(tab.id)}
                          />
                        </div>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {tabs.map((tab) => (
                    <TabsContent key={tab.id} value={tab.id}>
                      <div className="mt-4">{tab.content}</div>
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <div className="text-gray-400">
                  No tabs open. Select a connection or add a new tab.
                </div>
              )}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;
