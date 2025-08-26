import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Calendar, ChevronDown, Filter as FilterIcon, Tag, User, UserCheck, Building, FilterX, Check, AlertTriangle, Search,
} from "lucide-react";
import type { FilterState } from "@/components/types/tickets";

export function FiltersBar({
                               pending, setPending, uniqueValues, search, setSearch,
                               onApply, onClear, hasUnapplied, activeFilterCount,
                           }: {
    pending: FilterState;
    setPending: React.Dispatch<React.SetStateAction<FilterState>>;
    uniqueValues: {
        statuses: string[]; priorities: string[]; categories: string[];
        impacts: string[]; users: string[]; assignees: string[]; departments: string[];
    };
    search: string; setSearch: (v: string) => void;
    onApply: () => void; onClear: () => void;
    hasUnapplied: boolean; activeFilterCount: number;
}) {
    const toggle = (key: keyof FilterState, value: string, checked: boolean) => {
        setPending(prev => ({
            ...prev,
            [key]: checked
                ? ([...(prev[key] as string[]), value] as any)
                : ((prev[key] as string[]).filter(v => v !== value) as any),
        }));
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="relative bg-accent" >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search tickets by ID, title, user, description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-primary-foreground"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                <Facet label="Status" icon={<FilterIcon className="w-4 h-4 mr-2" />} count={pending.status.length}>
                    {uniqueValues.statuses.map(s => (
                        <DropdownMenuCheckboxItem key={s}
                                                  checked={pending.status.includes(s)}
                                                  onCheckedChange={(c) => toggle("status", s, !!c)}>
                            {s}
                        </DropdownMenuCheckboxItem>
                    ))}
                </Facet>

                <Facet label="Priority" icon={<AlertTriangle className="w-4 h-4 mr-2" />} count={pending.priority.length}>
                    {uniqueValues.priorities.map(p => (
                        <DropdownMenuCheckboxItem key={p}
                                                  checked={pending.priority.includes(p)}
                                                  onCheckedChange={(c) => toggle("priority", p, !!c)}>
                            {p}
                        </DropdownMenuCheckboxItem>
                    ))}
                </Facet>

                <Facet label="Category" icon={<Tag className="w-4 h-4 mr-2" />} count={pending.category.length}>
                    {uniqueValues.categories.map(c => (
                        <DropdownMenuCheckboxItem key={c}
                                                  checked={pending.category.includes(c)}
                                                  onCheckedChange={(x) => toggle("category", c, !!x)}>
                            {c}
                        </DropdownMenuCheckboxItem>
                    ))}
                </Facet>

                <Facet label="Users" icon={<User className="w-4 h-4 mr-2" />} count={pending.users.length}>
                    {uniqueValues.users.map(u => (
                        <DropdownMenuCheckboxItem key={u}
                                                  checked={pending.users.includes(u)}
                                                  onCheckedChange={(x) => toggle("users", u, !!x)}>
                            {u}
                        </DropdownMenuCheckboxItem>
                    ))}
                </Facet>

                <Facet label="Assignee" icon={<UserCheck className="w-4 h-4 mr-2" />} count={pending.assignees.length}>
                    {uniqueValues.assignees.map(a => (
                        <DropdownMenuCheckboxItem key={a}
                                                  checked={pending.assignees.includes(a)}
                                                  onCheckedChange={(x) => toggle("assignees", a, !!x)}>
                            {a}
                        </DropdownMenuCheckboxItem>
                    ))}
                </Facet>

                <Facet label="Department" icon={<Building className="w-4 h-4 mr-2" />} count={pending.departments.length}>
                    {uniqueValues.departments.map(d => (
                        <DropdownMenuCheckboxItem key={d}
                                                  checked={pending.departments.includes(d)}
                                                  onCheckedChange={(x) => toggle("departments", d, !!x)}>
                            {d}
                        </DropdownMenuCheckboxItem>
                    ))}
                </Facet>

                <Select
                    value={pending.dateRange}
                    onValueChange={(v) =>
                        setPending(prev => ({ ...prev, dateRange: v as FilterState["dateRange"] }))
                    }
                >
                    <SelectTrigger><Calendar className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="7days">Last 7 days</SelectItem>
                        <SelectItem value="30days">Last 30 days</SelectItem>
                        <SelectItem value="90days">Last 90 days</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Button onClick={onApply} disabled={!hasUnapplied}>
                        <Check className="w-4 h-4 mr-2" /> Apply Filters
                    </Button>
                    {activeFilterCount > 0 && (
                        <Button variant="outline" onClick={onClear}>
                            <FilterX className="w-4 h-4 mr-2" /> Clear All
                        </Button>
                    )}
                </div>
                {hasUnapplied && (
                    <div className="text-sm text-muted-foreground">Unapplied changes</div>
                )}
            </div>
        </div>
    );
}

function Facet({
                   label, icon, count, children,
               }: { label: string; icon: React.ReactNode; count?: number; children: React.ReactNode }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="justify-between">
                    {icon}{label}{count ? ` (${count})` : ""}<ChevronDown className="w-4 h-4 ml-2" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filter by {label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
