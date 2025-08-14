# MYTICK Dashboard Development Guidelines

## Project Structure Rules

### Correct File Organization
```
├── index.html                  # Vite HTML entry point
├── src/
│   ├── App.tsx                # Main app component (imports from ../components/)
│   ├── main.tsx               # React entry point
│   ├── styles/globals.css     # Tailwind V4 styles with design tokens
│   └── guidelines/Guidelines.md # This file
├── components/                # All React components (root level)
│   ├── TopBar.tsx             # Navigation with tabs
│   ├── TicketDashboard.tsx    # Table view
│   ├── KanbanBoard.tsx        # Kanban view  
│   ├── AddTicket.tsx          # Add ticket form
│   ├── AnalyticsDashboard.tsx # Charts and analytics
│   ├── ui/                    # ShadCN UI components
│   └── figma/                 # Figma-specific components
├── package.json               # Dependencies and scripts
├── vite.config.ts             # Vite configuration
└── tsconfig.json              # TypeScript configuration
```

### Import Path Rules
```typescript
// ✅ Correct - from src/App.tsx
import { TopBar } from '../components/TopBar';
import { TicketDashboard } from '../components/TicketDashboard';

// ✅ Correct - from components using relative paths
import { Button } from './ui/button';
import { Dialog } from './ui/dialog';

// ❌ Incorrect - these paths won't work
import { TopBar } from './components/TopBar';
import { TopBar } from 'components/TopBar';
```

## Design System Guidelines

### Typography Rules
* **Base font size**: 14px (defined in CSS custom properties)
* **DO NOT** use Tailwind text classes (`text-lg`, `font-bold`, etc.) unless specifically overriding base typography
* Use semantic HTML elements (`h1`, `h2`, `h3`, `p`, `label`, `button`) for automatic typography
* Only add Tailwind text classes when you need to deviate from the design system

### Color System
* **CRITICAL**: No transparent values allowed - all colors must be solid
* Use CSS custom properties for theming (defined in globals.css)
* Dark mode support via `.dark` class on root element
* Color tokens are available as Tailwind classes (e.g., `bg-background`, `text-foreground`)

### Component Design Guidelines

#### Status Badges (Solid Colors Only)
* **New**: `bg-blue-600 text-white border-blue-600`
* **In Progress**: `bg-purple-600 text-white border-purple-600`  
* **Pending**: `bg-yellow-600 text-white border-yellow-600`
* **Resolved**: `bg-green-600 text-white border-green-600`
* **Closed**: `bg-gray-600 text-white border-gray-600`

#### Priority Badges (Solid Colors Only)
* **Critical**: `bg-red-600 text-white border-red-600`
* **High**: `bg-orange-600 text-white border-orange-600`
* **Medium**: `bg-yellow-600 text-white border-yellow-600`
* **Low**: `bg-green-600 text-white border-green-600`

#### Branding Elements
* **Main brand name**: MYTICK (always uppercase)
* **Brand colors**: Emerald (`bg-emerald-600`) for primary elements
* **"In Portal" badge**: `bg-emerald-600 text-white`

### Layout and Responsive Design
* **Mobile-first approach** with responsive breakpoints
* Use horizontal scrolling for wide tables on mobile (`overflow-x-auto`)
* Minimum width containers where needed (`min-w-[1500px]` for ticket tables)
* Consistent spacing using Tailwind spacing scale

### Interaction States
* Hover states on all interactive elements
* Use `group` and `group-hover:` for nested hover effects
* Context actions: `opacity-0 group-hover:opacity-100` pattern
* Smooth transitions: `transition-colors`, `transition-opacity`

## Development Best Practices

### Component Architecture
* **One component per file** with matching filename
* **TypeScript interfaces** for all props
* **Single responsibility principle** - each component has one clear purpose
* **Extract reusable logic** into custom hooks where appropriate

### State Management Pattern
```typescript
// ✅ Current pattern - prop drilling for now
const [activeTab, setActiveTab] = useState('main-table');

// Pass state and handlers via props
<TopBar 
  activeTab={activeTab} 
  onTabChange={setActiveTab}
  // ...other props
/>
```

### Naming Conventions
* **Component files**: PascalCase (`TopBar.tsx`)
* **Component functions**: PascalCase (`TopBar`)
* **Props interfaces**: PascalCase with "Props" suffix (`TopBarProps`)
* **State variables**: camelCase (`activeTab`, `isDarkMode`)
* **Event handlers**: `on` prefix (`onTabChange`, `onToggleTheme`)

## Build and Development Commands

### Available Scripts
* `npm run dev` - Start development server (http://localhost:5173)
* `npm run build` - Build for production (output to `dist/`)
* `npm run preview` - Preview production build locally
* `npm run lint` - Run ESLint for code quality

### Dependencies Overview
* **React 18** - UI framework
* **TypeScript** - Type safety
* **Vite** - Build tool and dev server
* **Tailwind CSS V4** - Styling with design tokens
* **ShadCN/UI** - Component library (Radix UI + custom styling)
* **Lucide React** - Icon library
* **Recharts** - Charts and data visualization
* **React DnD** - Drag and drop functionality

## Common Issues and Solutions

### Build Errors
* **Missing dependencies**: Run `npm install` to install all required packages
* **Import path errors**: Ensure imports from `src/App.tsx` use `../components/` prefix
* **Duplicate files**: Keep only `src/App.tsx`, remove root `App.tsx`

### Development Workflow
1. **Structure first**: Ensure clean file organization before coding
2. **Component isolation**: Test each component individually
3. **Responsive testing**: Check mobile and desktop views
4. **Dark mode testing**: Verify both light and dark themes work
5. **Build validation**: Run `npm run build` before major commits

## MYTICK Dashboard Specific Features

### Tab Management
* Dynamic tab creation through "Add View" dropdown
* Tab state persisted in main App component
* Icon support for tabs (some have icons, others don't)

### View Types
* **Main Table** - Default ticket list view
* **Kanban** - Drag and drop board view
* **Add Ticket** - Form for creating new tickets
* **Charts** - Analytics dashboard with metrics
* **Form/Gantt/Calendar/etc.** - Placeholder views for future features

### Ticket Management
* **CRUD operations** - Create, read, update, delete tickets
* **Status management** - New, In Progress, Pending, Resolved, Closed
* **Priority levels** - Critical, High, Medium, Low
* **Group organization** - Tickets organized in collapsible groups
* **Drag and drop** - Move tickets between statuses in Kanban view

This dashboard is designed to be a comprehensive IT support management system with modern UI patterns and responsive design.