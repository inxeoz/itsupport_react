import type { FrappeTicket } from "../../services/frappeApi.ts";
import type { SortDirection, SortField } from "@/components/types/tickets.ts";

const prioOrder: Record<string, number> = {
    Critical: 4, High: 3, Medium: 2, Low: 1,
};

const cmpStr = (a?: string | null, b?: string | null) =>
    (a || "").toLowerCase().localeCompare((b || "").toLowerCase());

const cmpNum = (a: number, b: number) => a - b;

export const sortFns: Record<SortField, (a: FrappeTicket, b: FrappeTicket, d: SortDirection) => number> = {
    name: (a,b,d) => (d==="asc"?cmpStr(a.name,b.name):-cmpStr(a.name,b.name)),
    ticket_id: (a,b,d)=> (d==="asc"?cmpStr(a.ticket_id||a.name,b.ticket_id||b.name): -cmpStr(a.ticket_id||a.name,b.ticket_id||b.name)),
    title: (a,b,d)=> (d==="asc"?cmpStr(a.title,b.title): -cmpStr(a.title,b.title)),
    user_name: (a,b,d)=> (d==="asc"?cmpStr(a.user_name,b.user_name): -cmpStr(a.user_name,b.user_name)),
    department: (a,b,d)=> (d==="asc"?cmpStr(a.department,b.department): -cmpStr(a.department,b.department)),
    priority: (a,b,d)=> {
        const r = (prioOrder[a.priority || ""]||0) - (prioOrder[b.priority || ""]||0);
        return d==="asc"? r : -r;
    },
    status: (a,b,d)=> (d==="asc"?cmpStr(a.status,b.status): -cmpStr(a.status,b.status)),
    category: (a,b,d)=> (d==="asc"?cmpStr(a.category,b.category): -cmpStr(a.category,b.category)),
    created_datetime: (a,b,d)=>{
        const r = (a.created_datetime ? +new Date(a.created_datetime):0) - (b.created_datetime?+new Date(b.created_datetime):0);
        return d==="asc"? r : -r;
    },
    due_datetime: (a,b,d)=>{
        const r = (a.due_datetime ? +new Date(a.due_datetime):0) - (b.due_datetime?+new Date(b.due_datetime):0);
        return d==="asc"? r : -r;
    },
    assignee: (a,b,d)=> (d==="asc"?cmpStr(a.assignee,b.assignee): -cmpStr(a.assignee,b.assignee)),
};
