import { create } from "zustand";


type CounterState = {
    count: number;
    inc: () => void;
    dec: () => void;
    set: (n: number) => void;
};



export const useCounterStore = create<CounterState>((set) => ({
    count: 0,
    inc: () => set((s) => ({ count: s.count + 1 })),
    dec: () => set((s) => ({ count: s.count - 1 })),
    set: (n) => set({ count: n }),
}));


type TicketDashboardState = {
    isEditable: boolean;
    toggleEditable: () => void;
    setEditable: (value: boolean) => void;
};

export const useTicketDashboardStore = create<TicketDashboardState>((set) => ({
    isEditable: false,
    toggleEditable: () => set((s) => ({ isEditable: !s.isEditable })),
    setEditable: (value) => set({ isEditable: value }),
}));



