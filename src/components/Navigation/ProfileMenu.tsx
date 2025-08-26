
// =============================================
// components/Navigation/ProfileMenu.tsx
// =============================================
import React from "react";
import { Button } from "@/components/ui/button.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu.tsx";
import { User, UserIcon, Settings, Plug, LogOut, HelpCircle, Palette } from "lucide-react";
import { ConditionalTooltip } from "@/components/Navigation/ConditionalTooltip.tsx";

interface ProfileMenuProps {
  getThemeClasses: () => string;
  getAccentColorClass: () => string;
  showTooltips: boolean;
  onToggleTooltips: (checked: boolean) => void;
  onOpenApiConfig: () => void;
}

export function ProfileMenu({ getThemeClasses, getAccentColorClass, showTooltips, onToggleTooltips, onOpenApiConfig }: ProfileMenuProps) {
  return (
    <ConditionalTooltip
      show={showTooltips}
      content={
        <div className="mytick-theme">
          <p className="font-medium mytick-theme">User Profile</p>
          <p className="text-sm mt-1 mytick-theme">Access profile settings, API config, and logout</p>
        </div>
      }
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`w-8 h-8 rounded-full flex items-center justify-center mytick-theme ${getAccentColorClass()}`}
          >
            <User className="w-4 h-4 mytick-theme" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={`w-64 bg-popover border-border mytick-theme ${getThemeClasses()}`}>
          <DropdownMenuLabel className="flex items-center gap-3 px-3 py-2 mytick-theme">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mytick-theme ${getAccentColorClass()}`}>
              <User className="w-4 h-4 mytick-theme" />
            </div>
            <div className="mytick-theme">
              <p className="text-sm font-medium text-foreground mytick-theme">John Doe</p>
              <p className="text-xs text-muted-foreground mytick-theme">john.doe@company.com</p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-border mytick-theme" />

          <DropdownMenuGroup className="mytick-theme">
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme">
              <UserIcon className="w-4 h-4 text-muted-foreground mytick-theme" />
              <span className="text-foreground mytick-theme">Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme" onClick={onOpenApiConfig}>
              <Plug className="w-4 h-4 text-muted-foreground mytick-theme" />
              <span className="text-foreground mytick-theme">API Settings</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme">
              <Settings className="w-4 h-4 text-muted-foreground mytick-theme" />
              <span className="text-foreground mytick-theme">Settings</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground mytick-theme">
              <Palette className="w-4 h-4 text-muted-foreground mytick-theme" />
              <span className="text-foreground mytick-theme">Appearance</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-border mytick-theme" />

          <div className="flex items-center justify-between px-3 py-2 mytick-theme">
            <div className="flex items-center gap-3 mytick-theme">
              <HelpCircle className="w-4 h-4 text-muted-foreground mytick-theme" />
              <span className="text-foreground text-sm mytick-theme">Show Hints</span>
            </div>
            <Switch checked={showTooltips} onCheckedChange={onToggleTooltips} className="mytick-theme" />
          </div>

          <DropdownMenuSeparator className="bg-border mytick-theme" />

          <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer text-destructive hover:bg-destructive hover:text-destructive-foreground focus:text-destructive mytick-theme">
            <LogOut className="w-4 h-4 mytick-theme" />
            <span className="mytick-theme">Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ConditionalTooltip>
  );
}
