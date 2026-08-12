import WorkspaceCard from "@/components/Workspaces-ui/WorkspaceCard";
import API from "@/Api/axios";
import { useEffect } from "react";
export default function Workspace() {

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await API.get("/workspace/");
        console.log("Workspace response:", response.data);
      } catch (error) {
        console.error("Error fetching workspaces:", error);
      }
    };

    fetchWorkspaces();
  }, []);

    return (

        <div  className="grid grid-cols-2 gap-4">
           <WorkspaceCard
  id="1"
  name="Product Development"
  description="Core product features, roadmap planning and engineering."
  color="#4F46E5"
  plan="pro"
  boards={3}
  members={5}
  owner="Alex"
  createdAt="Jan 12, 2025"
  avatars={[
    {
      id: "1",
      name: "Alex",
      initials: "AM",
      color: "#F59E0B",
    },
    {
      id: "2",
      name: "Jamie",
      initials: "JC",
      color: "#8B5CF6",
    },
    {
      id: "3",
      name: "Sam",
      initials: "SR",
      color: "#EC4899",
    },
    {
      id: "4",
      name: "Taylor",
      initials: "TK",
      color: "#4F46E5",
    },
    {
      id: "5",
      name: "John",
      initials: "JD",
      color: "#10B981",
    },
  ]}
  onOpen={(id) => console.log("Open", id)}
  onEdit={(id) => console.log("Edit", id)}
  onDelete={(id) => console.log("Delete", id)}
/>
       
        </div>
    );
};
