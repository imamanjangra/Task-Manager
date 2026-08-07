import {
  Calendar,
  Crown,
  Layout,
  MoreHorizontal,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface WorkspaceMember {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface WorkspaceCardProps {
  id: string;
  name: string;
  description: string;
  color: string;
  plan: "free" | "pro";

  boards: number;
  members: number;

  owner: string;
  createdAt: string;

  avatars: WorkspaceMember[];

  onOpen?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function WorkspaceCard({
  id,
  name,
  description,
  color,
  plan,
  boards,
  members,
  owner,
  createdAt,
  avatars,
  onOpen,
  onEdit,
  onDelete,
}: WorkspaceCardProps) {
  return (
    <Card className="group overflow-hidden rounded-2xl border shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">

      {/* Top Color Bar */}
      <div
        className="h-2"
        style={{
          background: `linear-gradient(90deg, ${color}, ${color}99)`,
        }}
      />

      <CardContent className="p-5">

        {/* Header */}
        <div className="mb-4 flex items-start justify-between">

          <div className="flex items-center gap-3">

            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {name.charAt(0)}
            </div>

            <div>
              <h3 className="font-semibold">
                {name}
              </h3>

              <span
                className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  plan === "pro"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {plan}
              </span>
            </div>

          </div>

          {/* Menu */}
          <DropdownMenu>

            <DropdownMenuTrigger >

              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreHorizontal size={16} />
              </Button>

            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">

              <DropdownMenuItem
                onClick={() => onEdit?.(id)}
              >
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-red-500"
                onClick={() => onDelete?.(id)}
              >
                Delete
              </DropdownMenuItem>

            </DropdownMenuContent>

          </DropdownMenu>

        </div>

        {/* Description */}

        <p className="mb-5 line-clamp-2 text-sm text-muted-foreground">
          {description}
        </p>

        {/* Stats */}

        <div className="mb-5 grid grid-cols-2 gap-3 text-sm">

          <div className="flex items-center gap-2 text-muted-foreground">
            <Layout size={15} />
            {boards} Boards
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Users size={15} />
            {members} Members
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Crown size={15} />
            {owner}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar size={15} />
            {createdAt}
          </div>

        </div>

        {/* Footer */}

        <div className="flex items-center justify-between">

          {/* Avatars */}

          <div className="flex -space-x-2">

            {avatars.slice(0, 4).map((member) => (
              <div
                key={member.id}
                title={member.name}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-xs font-semibold text-white"
                style={{
                  backgroundColor: member.color,
                }}
              >
                {member.initials}
              </div>
            ))}

            {avatars.length > 4 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-semibold">
                +{avatars.length - 4}
              </div>
            )}

          </div>

          <Button
            size="sm"
            onClick={() => onOpen?.(id)}
          >
            Open
          </Button>

        </div>

      </CardContent>

    </Card>
  );
}