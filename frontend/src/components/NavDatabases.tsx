import {
  ChevronRight,
  DatabaseIcon,
  MoreHorizontal,
  MoreVerticalIcon,
  PlayIcon,
  SwatchBookIcon,
  TableIcon,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Database, Server } from "./AppSidebar";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Schema {
  readonly name: string;
}

interface NavDatabasesProps {
  readonly databases: Database[];
  readonly selectedServer: Server;
  readonly selectedDatabase: Database | null;
  readonly onSelectDatabase: (db: Database) => void;
}

export function NavDatabases({
  databases,
  selectedServer,
  selectedDatabase,
  onSelectDatabase,
}: NavDatabasesProps) {
  const [schemas, setSchemas] = useState<
    {
      database: string;
      schemas: string[];
    }[]
  >([]);
  const handleExpandDatabase = (isOpen: boolean, database: string) => {
    if (isOpen) {
      const connStr = `postgres://${selectedServer.user}:${selectedServer.password}@${selectedServer.host}:${selectedServer.port}/${database}`;
      fetch("http://localhost:8080/schemas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionString: connStr }),
      })
        .then((res) => res.json())
        .then((data: Schema[]) => {
          const cloned = [...schemas];
          const existingIndex =
            cloned.findIndex((s) => s.database === database) || 0;
          if (existingIndex === -1) {
            cloned.push({
              database: database,
              schemas: data.map((d) => d.name),
            });
          } else {
            cloned[existingIndex] = {
              ...cloned[existingIndex],
              schemas: data.map((d) => d.name),
            };
          }
          setSchemas(cloned);
        })
        .catch((err) => console.error("Failed to fetch schemas:", err));
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Databases</SidebarGroupLabel>
      <SidebarMenu>
        {databases.map((database) => (
          <Collapsible
            key={database.name}
            asChild
            defaultOpen={false}
            className="group/collapsible"
            onOpenChange={(isOpen: boolean) =>
              handleExpandDatabase(isOpen, database.name)
            }
          >
            <SidebarMenuItem>
              <>
                <CollapsibleTrigger
                  asChild
                  onClick={() => onSelectDatabase(database)}
                >
                  <SidebarMenuButton
                    tooltip={database.name}
                    isActive={selectedDatabase?.name === database.name}
                  >
                    <DatabaseIcon />
                    <span>{database.name}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="mr-0 pr-0">
                    {schemas.length === 0 ? <SidebarMenuSkeleton /> : undefined}
                    {schemas
                      .find((s) => s.database === database.name)
                      ?.schemas.map((schema) => (
                        <Collapsible
                          key={schema}
                          asChild
                          defaultOpen={false}
                          className={`group/collapsible-2`}
                        >
                          <SidebarMenuSubItem key={schema}>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuSubButton>
                                <SwatchBookIcon />
                                <span>{schema}</span>
                                <ChevronRight
                                  className={`ml-auto transition-transform duration-200 group-data-[state=open]/collapsible-2:rotate-90`}
                                />
                              </SidebarMenuSubButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub className="mr-0 pr-0">
                                <SidebarMenuSubItem>
                                  <SidebarMenuSubButton>
                                    <TableIcon />
                                    <span>table1</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuSubItem>
                        </Collapsible>
                      ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction>
                      <MoreVerticalIcon />
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start">
                    <DropdownMenuItem>
                      <span>Query Pad</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
