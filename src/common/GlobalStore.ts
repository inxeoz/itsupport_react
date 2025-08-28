import {create} from "zustand";
import {API_TOKEN, BASE_URL} from "../env";


type DashboardState = {
    isEditable: boolean;
    toggleEditable: () => void;
    setEditable: (value: boolean) => void;
};

export const useDashboardStore = create<DashboardState>((set) => ({
    isEditable: false,
    toggleEditable: () => set((s) => ({isEditable: !s.isEditable})),
    setEditable: (value) => set({isEditable: value}),
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

export const useCurrentDashboard = create<CurrentDashboard>(
    (set) => (
        {
            dashboard: Dashboard.TicketDashboard,
            setDashboard: (value: Dashboard) => set({dashboard: value}),
        }
    )
);


type DashboardResizeAble = {
    isDashboardResizeAble: boolean;
    toggleDashboardResizeAble: () => void;
    setDashboardResizeAble: (value: boolean) => void;
};

export const useDashboardResizeAble = create<DashboardResizeAble>((set) => ({
    isDashboardResizeAble: false,
    toggleDashboardResizeAble: () => set((s) => ({isDashboardResizeAble: !s.isDashboardResizeAble})),
    setDashboardResizeAble: (value: boolean) => set({isDashboardResizeAble: value})
}));


type DashboardDropAble = {
    isDashboardDropAble: boolean;
    toggleDashboardDropAble: () => void;
    setDashboardDropAble: (value: boolean) => void;
};

export const useDashboardDropAble = create<DashboardDropAble>((set) => ({
    isDashboardDropAble: false,
    toggleDashboardDropAble: () => set((s) => ({isDashboardDropAble: !s.isDashboardDropAble})),
    setDashboardDropAble: (value: boolean) => set({isDashboardDropAble: value})
}));


type OpenLoginDialog = {
    isOpenLoginDialog: boolean;
    toggleOpenLoginDialog: () => void;
    setOpenLoginDialog: (value: boolean) => void;
};

export const useOpenLoginDialog = create<OpenLoginDialog>((set) => ({
    isOpenLoginDialog: false,
    toggleOpenLoginDialog: () => set((s) => ({isOpenLoginDialog: !s.isOpenLoginDialog})),
    setOpenLoginDialog: (value: boolean) => set({isOpenLoginDialog: value})
}));


type AuthCookie = {
    AuthCookie: string;
    setAuthCookie: (value: string) => void;
};

export const useAuthCookie = create<AuthCookie>((set) => ({
    AuthCookie: "",
    setAuthCookie: (value: string) => set({AuthCookie: value})
}));


type AuthToken = {
    AuthToken: string;
    setAuthToken: (value: string) => void;
};

export const useAuthToken = create<AuthToken>((set) => ({
    AuthToken: API_TOKEN,
    setAuthToken: (value: string) => set({AuthToken: value})
}));


type AuthCred = {
    AuthCredUsr: string;
    AuthCredPwd: string;
    setAuthCred: (usr: string, pwd: string) => void;
};

export const useAuthCred = create<AuthCred>((set) => ({
    AuthCredUsr: "",
    AuthCredPwd: "",
    setAuthCred: (usr: string, pwd: string) => {

        if (usr.length) {
            set({AuthCredUsr: usr})
        }

        if (pwd.length) {
            set({AuthCredPwd: pwd})
        }

    }
}));

type BASE_URL = {
    base_url: string;
    setBASE_URL: (value: string) => void;
};


export const useBASE_URL = create<BASE_URL>((set) => ({
    base_url: BASE_URL,
    setBASE_URL: (value: string) => set({base_url: value})
}));
