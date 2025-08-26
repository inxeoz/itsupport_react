import { create } from "zustand";



type DashboardState = {
    isEditable: boolean;
    toggleEditable: () => void;
    setEditable: (value: boolean) => void;
};

export const useDashboardStore = create<DashboardState>((set) => ({
    isEditable: false,
    toggleEditable: () => set((s) => ({ isEditable: !s.isEditable })),
    setEditable: (value) => set({ isEditable: value }),
}));


// GlobalStore.ts
export enum Dashboard {
    TicketDashboard = 0,
    FormDashboard = 1,
    KanbanDashboard = 2,
    GanttDashboard = 3,
    DeveloperDashboard = 4,
    AddTaskDashboard = 5,
    ChartDashboard = 6,
    CalendarDashboard = 7,
    FileGalleryDashboard = 8,
}



type CurrentDashboard = {
    dashboard: Dashboard;
    setDashboard: (value: Dashboard) => void;
}

export const useCurrentDashboard = create<CurrentDashboard> (
    (set) => (
        {
            dashboard: Dashboard.TicketDashboard,
            setDashboard: (value: Dashboard) => set({ dashboard: value }),
        }
    )
);



type DashboardResizeAble = {
    isDashboardResizeAble: boolean;
    toggleDashboardResizeAble:() => void;
    setDashboardResizeAble: (value: boolean) => void;
};

export const useDashboardResizeAble = create<DashboardResizeAble>((set) => ({
    isDashboardResizeAble: false,
    toggleDashboardResizeAble: () => set((s) => ({isDashboardResizeAble: !s.isDashboardResizeAble})),
    setDashboardResizeAble: (value: boolean) => set({isDashboardResizeAble: value})
}));


type DashboardDropAble = {
    isDashboardDropAble: boolean;
    toggleDashboardDropAble:() => void;
    setDashboardDropAble: (value: boolean) => void;
};

export const useDashboardDropAble = create<DashboardDropAble>((set) => ({
    isDashboardDropAble: false,
    toggleDashboardDropAble: () => set((s) => ({isDashboardDropAble: !s.isDashboardDropAble})),
    setDashboardDropAble: (value: boolean) => set({isDashboardDropAble: value})
}));

