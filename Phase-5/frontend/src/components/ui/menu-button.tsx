import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, Edit, Trash2, Copy, Share2, Download, Pin, Archive, Eye, MessageSquare, FileText, Settings, User } from "lucide-react";

interface MenuButtonProps {
  position?: "left" | "right" | "top" | "bottom";
  className?: string;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "lg" | "icon";
  actions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick?: () => void;
    danger?: boolean;
    separator?: boolean;
  }[];
}

export function MenuButton({
  position = "bottom",
  className = "",
  variant = "ghost",
  size = "icon",
  actions
}: MenuButtonProps) {
  // Default actions if none provided
  const defaultActions: Array<{
    label?: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick?: () => void;
    danger?: boolean;
    separator?: boolean;
  }> = actions || [
    { label: "New Chat", icon: MessageSquare },
    { label: "New Task", icon: FileText },
    { label: "Settings", icon: Settings },
    { label: "Profile", icon: User },
    { separator: true },
    { label: "Edit", icon: Edit },
    { label: "Duplicate", icon: Copy },
    { label: "Share", icon: Share2 },
    { label: "Export", icon: Download },
    { separator: true },
    { label: "Delete", icon: Trash2, danger: true }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={`${className}`}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {defaultActions.map((action, index) => {
          if (action.separator) {
            return <DropdownMenuSeparator key={`sep-${index}`} />;
          }

          if (action.icon) {
            const IconComponent = action.icon;
            return (
              <DropdownMenuItem
                key={index}
                className={action.danger ? "text-red-600" : ""}
                onSelect={() => action.onClick?.()}
              >
                <IconComponent className="mr-2 h-4 w-4" />
                <span>{action.label}</span>
              </DropdownMenuItem>
            );
          }

          return null;
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}