import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar, Server } from "@/components/AppSidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "./components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { QueryPad } from "./components/QueryPad";

export interface Tab {
  id: string;
  title: string;
  content: string;
  filePath: string;
  serverId: string;
  databaseName: string;
}

function App() {
  const [servers, setServers] = useState<Server[]>([
    {
      id: "1",
      host: "localhost",
      database: "postgres",
      name: "PostgreSQL",
      port: "5432",
      user: "postgres",
      password: "password",
    },
  ]);
  const [serversFile, setServersFile] = useState<string>("");
  const [selectedServer, setSelectedServer] = useState<Server>(servers[0]);
  const [selectedDatabase, setSelectedDatabase] = useState<string>("");
  const [tabs, setTabs] = useState<Tab[]>(() => {
    // Initial load will be handled in useEffect due to async IPC
    return [];
  });
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showQueryPad, setShowQueryPad] = useState(false);
  const [tempDir, setTempDir] = useState<string>("");
  const [tabsIndexFile, setTabsIndexFile] = useState<string>("");

  // Fetch temp directory and load tabs on mount
  useEffect(() => {
    window.electronAPI.getTempDir().then(async ({ tempDir, tabsIndexFile }) => {
      setTempDir(tempDir);
      setTabsIndexFile(tabsIndexFile);
      const serversFilePath = await window.electronAPI.getServersPath();
      setServersFile(serversFilePath);
      try {
        const serversData = await window.electronAPI.readFile(serversFilePath);
        const savedServers: Server[] = JSON.parse(serversData);
        setServers(savedServers);
        setSelectedServer(savedServers[0]);
        const indexData = await window.electronAPI.readFile(tabsIndexFile);
        const savedTabs: Tab[] = JSON.parse(indexData);
        const allTabsData = await Promise.all(
          savedTabs.map((tab) => window.electronAPI.readFile(tab.filePath))
        );
        const loadedTabs = savedTabs.map((tab, i) => {
          return {
            ...tab,
            content: allTabsData[i],
          };
        });
        setTabs(loadedTabs);
        if (loadedTabs.length > 0) {
          const toLoadTab = loadedTabs[loadedTabs.length - 1];
          setShowQueryPad(true);
          setActiveTab(toLoadTab.id);
          setSelectedServer(
            servers.find((server) => server.id === toLoadTab.serverId)!
          );
          setSelectedDatabase(toLoadTab.databaseName);
        }
      } catch (err) {
        setTabs([]);
      }
    });
  }, []);

  useEffect(() => {
    if (activeTab) {
      const tabToLoad = tabs.find((tab) => tab.id === activeTab);
      if (tabToLoad) {
        setSelectedServer(
          servers.find((server) => server.id === tabToLoad.serverId)!
        );
        setSelectedDatabase(tabToLoad.databaseName);
      }
    }
  }, [activeTab]);

  // Save tabs to temp files and index when tempDir is set
  useEffect(() => {
    const doStuff = async () => {
      if (!tempDir || !tabsIndexFile || tabs.length === 0) return; // Wait for tempDir to be set
      const allFilePaths = await Promise.all(
        tabs.map((tab) =>
          window.electronAPI.writeToFile(tab.filePath, tab.id, tab.content)
        )
      );
      const tabsWithPaths = tabs.map((tab, i) => {
        return {
          ...tab,
          filePath: allFilePaths[i],
        };
      });
      await window.electronAPI.writeToFile(
        tabsIndexFile,
        "",
        JSON.stringify(tabsWithPaths)
      );
      if (tabs.length > 0 && !activeTab) {
        setActiveTab(tabs[0].id);
      }
    };

    doStuff();
  }, [tabs, activeTab, tempDir, tabsIndexFile]);

  // Save servers to temp file when they change
  useEffect(() => {
    const saveServers = async () => {
      if (!serversFile) return;
      await window.electronAPI.writeToFile(
        serversFile,
        "",
        JSON.stringify(servers)
      );
    };

    saveServers();
  }, [servers, serversFile]);

  const closeTab = (tabId: string) => {
    setTabs((prev) => {
      const tabToClose = prev.find((tab) => tab.id === tabId);
      if (tabToClose && tabToClose.filePath) {
        try {
          window.electronAPI.unlinkSync(tabToClose.filePath); // Delete temp file
        } catch (err) {
          console.error("Failed to delete temp file:", err);
        }
      }
      const newTabs = prev.filter((tab) => tab.id !== tabId);
      if (activeTab === tabId) {
        setActiveTab(
          newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null
        );
      }
      return newTabs;
    });
  };

  const addNewTab = (server: Server, databaseName: string) => {
    const newTabId = `tab-${Date.now()}`;
    const tabCount = tabs.length;
    const newTab: Tab = {
      id: newTabId,
      title: `New Tab ${tabCount + 1}`,
      content: "",
      filePath: "",
      serverId: server.id,
      databaseName: databaseName,
    };
    setShowQueryPad(true);
    setTabs((prev) => [...prev, newTab]);
    setActiveTab(newTabId);
    setSelectedServer(server);
    setSelectedDatabase(databaseName);
  };

  const updateTabContent = (tabId: string, sqlCode: string) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === tabId ? { ...tab, content: sqlCode } : tab))
    );
  };

  const handleSaveAsFile = (tabId: string, sqlCode: string) => {
    const currentTab = tabs.find((t) => t.id === tabId)!;
    const blob = new Blob([sqlCode], { type: "text/sql" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentTab.title}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleAddServer = (conn: Server) => {
    setServers((prev) => [...prev, conn]);
  };

  const currentTabbedServer =
    servers.find(
      (s) => s.id === tabs.find((t) => t.id === activeTab)?.serverId
    ) ?? servers[0];

  const currentTabbedServerName = currentTabbedServer?.name;

  const currentTabbedDatabase = tabs.find(
    (t) => t.id === activeTab
  )?.databaseName;

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
                        {currentTabbedServerName}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {currentTabbedDatabase ? (
                      <>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                          <BreadcrumbPage>
                            {currentTabbedDatabase}
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
                selectedDatabase={currentTabbedDatabase ?? ""}
                selectedServer={currentTabbedServer}
                onCloseTab={closeTab}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tabs={tabs}
                onNewTab={addNewTab}
                updateTabContent={updateTabContent}
                onSaveAsFile={handleSaveAsFile}
              />
            )}
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;
