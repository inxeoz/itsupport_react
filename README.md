# IT Support Dashboard

A modern React TypeScript dashboard for IT support ticket management with Kanban board and table views.

## Features

- **Dashboard Views**: Switch between table and Kanban board layouts
- **Ticket Management**: View, organize, and track support tickets
- **Modern UI**: Built with Radix UI components and Tailwind CSS
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Professional dark theme for better user experience

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **Lucide React** - Beautiful icon library

## Quick Start

### Prerequisites

Make sure you have Node.js installed (version 16 or higher):
```bash
node --version
npm --version
```

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd it_support_dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:5173
   ```

That's it! Your IT Support Dashboard should now be running.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
it_support_dashboard/
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI components
│   │   ├── KanbanBoard.tsx  # Kanban view component
│   │   ├── TicketDashboard.tsx # Table view component
│   │   └── TopBar.tsx       # Navigation bar
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## Features Overview

### Navigation
- **Main Table**: Traditional table view of support tickets
- **Kanban**: Board view with columns for different ticket states
- **Form**: Coming soon - ticket creation form

### Ticket Management
- View tickets grouped by status
- See ticket priorities (Low, Medium, High, Critical)
- Track creation and resolution dates
- Assign agents to tickets

### UI Components
The dashboard uses a comprehensive set of UI components including:
- Tables with sorting and filtering
- Cards and badges for status display
- Modals and dropdowns
- Form inputs and buttons
- Responsive navigation

## Customization

### Styling
The project uses Tailwind CSS with custom color variables defined in `src/index.css`. You can modify the color scheme by updating the CSS custom properties.

### Adding Features
Components are modular and can be easily extended. The main views are:
- `TicketDashboard.tsx` - Table view
- `KanbanBoard.tsx` - Board view
- `TopBar.tsx` - Navigation

## Troubleshooting

### Common Issues

1. **Port already in use**: If port 5173 is busy, Vite will automatically use the next available port.

2. **Dependencies not installing**: Try deleting `node_modules` and `package-lock.json`, then run `npm install` again.

3. **TypeScript errors**: Make sure all dependencies are installed and restart your IDE.

### Getting Help

If you encounter issues:
1. Check that Node.js version is 16+
2. Ensure all dependencies installed correctly
3. Check browser console for any errors
4. Try clearing browser cache

## Development

This project was created from Figma designs and implements modern React patterns:
- Functional components with hooks
- TypeScript for type safety
- Component composition
- Responsive design principles

The codebase follows React best practices and is ready for further development and customization.