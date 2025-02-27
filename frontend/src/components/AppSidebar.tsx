import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { NavDatabases } from "./NavDatabases";
import { ServerSwitcher } from "./ServerSwitcher";
import { useEffect, useState } from "react";

export interface Database {
  name: string;
  owner: string;
  encoding: string;
}

export interface Server {
  id: string;
  name: string;
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
}

interface AppSidebarProps {
  servers: Server[];
  selectedServer: Server;
  setSelectedServer: (conn: Server) => void;
  onAddServer: (conn: Server) => void;
  selectedDatabase: string;
  onSelectDatabase: (db: string) => void;
  addNewTab: (server: Server, databaseName: string) => void;
}

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
};

export function AppSidebar({
  servers,
  selectedServer,
  setSelectedServer,
  onAddServer,
  selectedDatabase,
  onSelectDatabase,
  addNewTab,
}: AppSidebarProps) {
  const [databases, setDatabases] = useState<Database[]>([]);

  useEffect(() => {
    if (selectedServer) {
      const connStr = `postgres://${selectedServer.user}:${selectedServer.password}@${selectedServer.host}:${selectedServer.port}/${selectedServer.database}`;
      fetch("http://localhost:8080/databases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionString: connStr }),
      })
        .then((res) => res.json())
        .then((data) => {
          setDatabases(data);
          onSelectDatabase(selectedDatabase ?? data[0].name);
        })
        .catch((err) => console.error("Failed to fetch databases:", err));
    }
  }, [selectedServer]);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <ServerSwitcher
          servers={servers}
          onAddServer={onAddServer}
          selectedServer={selectedServer}
          setSelectedServer={setSelectedServer}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavDatabases
          databases={databases}
          selectedServer={selectedServer}
          selectedDatabase={selectedDatabase}
          onSelectDatabase={onSelectDatabase}
          addNewTab={addNewTab}
        />
      </SidebarContent>
    </Sidebar>
  );
}
