import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
    const [state, setState] = useState<T>(() => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? { ...initial, ...JSON.parse(raw) } : initial;
        } catch { return initial; }
    });

    useEffect(() => {
        try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
    }, [key, state]);

    const set = useCallback((updater: T | ((prev: T) => T)) => {
        setState((prev) => typeof updater === "function" ? (updater as any)(prev) : updater);
    }, []);

    return [state, set] as const;
}
