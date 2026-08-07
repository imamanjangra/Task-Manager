import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  FolderKanban,
  User,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

export function AppSidebar() {

  return (
    <Sidebar className="bg-sidebar text-sidebar-foreground border-sidebar-border">
      
      {/* Header */}
      <SidebarHeader className="border-sidebar-border border-b bg-sidebar p-5">
        <h1 className="text-xl font-bold">
          Task Manager
        </h1>
      </SidebarHeader>


      {/* Content */}
      <SidebarContent className="bg-sidebar px-3 py-4">

        <nav className="space-y-2">

          {/* Dashboard */}
          <Link
            to="/dashboard"
            className="
              flex items-center gap-3
              rounded-lg px-3 py-2
              text-sidebar-foreground
              transition-colors
              hover:bg-sidebar-accent
              hover:text-sidebar-accent-foreground
            "
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>


          {/* My Boards */}
          <Link
            to="/boards"
            className="
              flex items-center gap-3
              rounded-lg px-3 py-2
              text-sidebar-foreground
              transition-colors
              hover:bg-sidebar-accent
              hover:text-sidebar-accent-foreground
            "
          >
            <ClipboardList size={20} />
            My Boards
          </Link>


          <Link
            to="/Workspaces"
            className="
              flex items-center gap-3
              rounded-lg px-3 py-2
              text-sidebar-foreground
              transition-colors
              hover:bg-sidebar-accent
              hover:text-sidebar-accent-foreground
            "
          >
             <FolderKanban size={20} />
            Workspaces
          </Link>


          {/* Profile */}
          <Link
            to="/profile"
            className="
              flex items-center gap-3
              rounded-lg px-3 py-2
              text-sidebar-foreground
              transition-colors
              hover:bg-sidebar-accent
              hover:text-sidebar-accent-foreground
            "
          >
            <User size={20} />
            Profile
          </Link>



          {/* Settings */}
          <Link
            to="/settings"
            className="
              flex items-center gap-3
              rounded-lg px-3 py-2
              text-sidebar-foreground
              transition-colors
              hover:bg-sidebar-accent
              hover:text-sidebar-accent-foreground
            "
          >
            <Settings size={20} />
            Settings
          </Link>


        </nav>

      </SidebarContent>



      {/* Footer */}
      <SidebarFooter className="border-sidebar-border border-t bg-sidebar p-5">

        <div className="flex items-center gap-3">

          <div
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-full
              bg-sidebar-primary
              text-sidebar-primary-foreground
            "
          >
            A
          </div>


          <div>
            <p className="font-semibold">
              Aman
            </p>

            <p className="text-sm opacity-70">
              Full Stack Developer
            </p>
          </div>

        </div>

      </SidebarFooter>

    </Sidebar>
  );
}