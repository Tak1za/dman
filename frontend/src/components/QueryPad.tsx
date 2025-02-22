import { useState } from "react";
import { Database, Server } from "./AppSidebar";
import { v4 as uuidv4 } from "uuid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon, XIcon } from "lucide-react";
import { Tab } from "@/App";
import { Button } from "./ui/button";
import { CodeBlock } from "./CodeBlock";

interface QueryPadProps {
  readonly selectedServer: Server;
  readonly selectedDatabase: Database | null;
  readonly onCloseTab: (tabId: string) => void;
  readonly activeTab: string | null;
  readonly setActiveTab: (tabId: string) => void;
  readonly tabs: Tab[];
  readonly onNewTab: () => void;
  readonly updateTabContent: (tabId: string, sqlCode: string) => void;
}

export function QueryPad({
  selectedDatabase,
  selectedServer,
  onCloseTab,
  activeTab,
  setActiveTab,
  tabs,
  onNewTab,
  updateTabContent,
}: QueryPadProps) {
  return (
    <div className="flex-1 p-4 pt-0 flex flex-col">
      <div className="text-xl mb-2">Query Pad</div>
      {tabs.length > 0 ? (
        <Tabs
          value={activeTab || tabs[0].id}
          onValueChange={setActiveTab}
          className="flex flex-col h-full"
        >
          <div className="flex flex-row gap-2 items-center">
            <Button size="icon" onClick={onNewTab}>
              <PlusIcon />
            </Button>
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  <div className="flex flex-row justify-between gap-4 items-center">
                    {tab.title}
                    <XIcon
                      className="cursor-pointer size-4"
                      onClick={() => tabs.length > 1 && onCloseTab(tab.id)}
                    />
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {tabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="flex-1 mt-4 overflow-hidden"
            >
              <CodeBlock
                value={tab.content}
                onChange={(sqlCode) => updateTabContent(tab.id, sqlCode)}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-gray-400">
          No tabs open. Select a connection or add a new tab.
        </div>
      )}
    </div>
  );
}
