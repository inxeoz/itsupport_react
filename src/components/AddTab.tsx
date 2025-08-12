import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { SvgIconComponent } from "@mui/icons-material";

// Icons
import TableChartIcon from "@mui/icons-material/TableChart";
import TimelineIcon from "@mui/icons-material/Timeline";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import TuneIcon from "@mui/icons-material/Tune";
import AppsIcon from "@mui/icons-material/Apps";
import SearchIcon from "@mui/icons-material/Search";

interface MenuItem {
  id: string;
  label: string;
  icon: SvgIconComponent;
  badge?: string;
  divider?: boolean;
}

interface StyleProps {
  menuBg?: string;
  menuHover?: string;
  buttonBg?: string;
  textColor?: string;
  iconColor?: string;
}

interface AddTabProps extends StyleProps {
  items?: MenuItem[];
  buttonText?: string;
  onSelect?: (id: string) => void;
}

const defaultItems: MenuItem[] = [
  { id: "table", label: "Table", icon: TableChartIcon },
  { id: "gantt", label: "Gantt", icon: TimelineIcon },
  { id: "chart", label: "Chart", icon: InsertChartIcon },
  { id: "calendar", label: "Calendar", icon: CalendarMonthIcon },
  { id: "kanban", label: "Kanban", icon: ViewKanbanIcon },
  { id: "doc", label: "Doc", icon: DescriptionIcon, badge: "New" },
  { id: "gallery", label: "File gallery", icon: ImageIcon },
  { id: "form", label: "Form", icon: FormatAlignCenterIcon },
  { id: "custom", label: "Customizable view", icon: TuneIcon, divider: true },
  { id: "apps", label: "Apps", icon: AppsIcon },
  { id: "explore", label: "Explore more views", icon: SearchIcon },
];

const StyledMenu = styled(Menu)<StyleProps>(
  ({ menuBg, menuHover, textColor, iconColor }) => ({
    "& .MuiPaper-root": {
      backgroundColor: menuBg || "#334155",
      color: textColor || "#DDD",
      borderRadius: 8,
      minWidth: 230,
      boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
    },
    "& .MuiMenuItem-root": {
      fontSize: 14,
      padding: "8px 16px",
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: iconColor || "#BBB",
        marginRight: 12,
      },
      "&:hover": {
        backgroundColor: menuHover || "#2A2B33",
      },
    },
    "& .MuiDivider-root": {
      backgroundColor: "#333",
      margin: "4px 0",
    },
  }),
);

const AddTab: React.FC<AddTabProps> = ({
  items = defaultItems,
  buttonText = "Board views",
  onSelect,
  menuBg,
  menuHover,
  buttonBg,
  textColor,
  iconColor,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

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
      <Button
        variant="contained"
        disableElevation
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: buttonBg || "#1e293b",
          color: textColor || "#DDD",
          textTransform: "none",
          fontSize: 14,
          fontWeight: 500,
          borderRadius: 1,
          minWidth: 140,
          justifyContent: "space-between",
          "&:hover": {
            backgroundColor: menuHover || "#334155",
          },
        }}
      >
        {buttonText}
      </Button>

      <StyledMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        menuBg={menuBg}
        menuHover={menuHover}
        textColor={textColor}
        iconColor={iconColor}
      >
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <MenuItem onClick={() => handleSelect(item.id)}>
              <item.icon />
              {item.label}
              {item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  sx={{
                    ml: "auto",
                    fontSize: "0.7rem",
                    color: "#1976d2",
                    backgroundColor: "rgba(25, 118, 210, 0.15)",
                  }}
                />
              )}
            </MenuItem>
            {item.divider && index < items.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </StyledMenu>
    </>
  );
};

export default AddTab;
export type { MenuItem, AddTabProps };
