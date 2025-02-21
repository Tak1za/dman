import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavDatabases } from "./NavDatabases";
import { NavUser } from "./NavUser";
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

interface SidebarProps {
  servers: Server[];
  selectedServer: Server | null;
  onSelectServer: (conn: Server) => void;
  onAddServer: (conn: Server) => void;
}

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
};

export function AppSidebar({ servers, onAddServer }: SidebarProps) {
  const [activeServer, setActiveServer] = useState(servers[0]);
  const [databases, setDatabases] = useState<Database[]>([]);

  useEffect(() => {
    if (activeServer) {
      const connStr = `postgres://${activeServer.user}:${activeServer.password}@${activeServer.host}:${activeServer.port}/${activeServer.database}`;
      fetch("http://localhost:8080/databases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionString: connStr }),
      })
        .then((res) => res.json())
        .then((data) => setDatabases(data))
        .catch((err) => console.error("Failed to fetch databases:", err));
    }
  }, [activeServer]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <ServerSwitcher
          servers={servers}
          onAddServer={onAddServer}
          activeServer={activeServer}
          setActiveServer={setActiveServer}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavDatabases databases={databases} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
