import React, { useState } from "react";
import {
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import Person from "@mui/icons-material/Person";

interface MenuItemData {
  id: string;
  label: string;
  icon?: SvgIconComponent;
  avatar?: boolean;
  divider?: boolean;
}

interface AccountMenuProps {
  avatarText?: string;
  avatarBg?: string;
  avatarHover?: string;
  menuBg?: string;
  items?: MenuItemData[];
  onSelect?: (id: string) => void;
  tooltip?: string;
}

const defaultItems: MenuItemData[] = [
  { id: "profile", label: "Profile", avatar: true },
  { id: "account", label: "My account", avatar: true, divider: true },
  { id: "add-account", label: "Add another account", icon: PersonAdd },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "logout", label: "Logout", icon: Logout },
];

const AccountMenu: React.FC<AccountMenuProps> = ({
  avatarText = "M",
  avatarBg = "#059669",
  avatarHover = "#047857",
  menuBg = "#334155",
  items = defaultItems,
  onSelect,
  textColor = "#DDD",
  tooltip = "Account settings",
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleSelect = (id: string) => {
    handleClose();
    onSelect?.(id);
  };

  return (
    <>
      <Tooltip title={tooltip}>
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            padding: 0,
            "&:hover": { backgroundColor: "transparent" },
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              backgroundColor: avatarBg,
              "&:hover": { backgroundColor: avatarHover },
            }}
          >
            {avatarText}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: menuBg,
              overflow: "visible",
              color: textColor,
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: menuBg || "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
      >
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <MenuItem onClick={() => handleSelect(item.id)}>
              {item.avatar ? (
                <Avatar />
              ) : item.icon ? (
                <ListItemIcon>
                  <item.icon fontSize="small" />
                </ListItemIcon>
              ) : null}
              {item.label}
            </MenuItem>
            {item.divider && index < items.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Menu>
    </>
  );
};

export default AccountMenu;
export type { MenuItemData, AccountMenuProps };
