import { useEffect, useState } from "react";
import { DatabaseList } from "./components/DatabaseList";

interface Database {
  name: string;
  owner: string;
  encoding: string;
}

function App() {
  const [databases, setDatabases] = useState<Database[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/databases")
      .then((res) => res.json())
      .then((data) => setDatabases(data))
      .catch((err) => console.error("Failed to fetch databases:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">PostgreSQL Tool</h1>
      <DatabaseList databases={databases} />
    </div>
  );
}

export default App;
