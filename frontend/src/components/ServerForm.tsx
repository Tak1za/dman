import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Server } from "./AppSidebar";

interface ServerFormProps {
  onSubmit: (server: Server) => void;
  onCancel: () => void;
}

export function ServerForm({ onSubmit, onCancel }: ServerFormProps) {
  const [name, setName] = useState("");
  const [host, setHost] = useState("localhost");
  const [port, setPort] = useState("5432");
  const [user, setUser] = useState("postgres");
  const [password, setPassword] = useState("");
  const [database, setDatabase] = useState("postgres");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: `${Date.now()}`,
      name,
      host,
      port,
      user,
      password,
      database,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add PostgreSQL Server</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-muted-foreground">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-muted-foreground">
              Host
            </label>
            <Input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-muted-foreground">
              Port
            </label>
            <Input
              value={port}
              onChange={(e) => setPort(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-muted-foreground">
              User
            </label>
            <Input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-muted-foreground">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-muted-foreground">
              Database
            </label>
            <Input
              value={database}
              onChange={(e) => setDatabase(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
