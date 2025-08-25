import { Card, CardContent } from "../ui/card";
import { List, Clock, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

export function OverviewCards({
                                  total, loadingTotal, open, critical, resolvedToday, connectionStatus,
                              }: {
    total: number | null;
    loadingTotal: boolean;
    open: number; critical: number; resolvedToday: number;
    connectionStatus: "connected" | "disconnected" | "testing";
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Metric title="Total Tickets" icon={<List className="w-5 h-5" />} highlight>
        <span className="text-2xl font-bold">
          {loadingTotal ? <Loader2 className="w-6 h-6 animate-spin" /> : total ?? 0}
        </span>
                <p className="text-xs text-muted-foreground">
                    {connectionStatus === "connected" ? "Server: total ticket count" : "Demo data"}
                </p>
            </Metric>

            <Metric title="Open Tickets" icon={<Clock className="w-5 h-5" />}>
                <span className="text-2xl font-bold">{open}</span>
                <p className="text-xs text-muted-foreground">Active [current page]</p>
            </Metric>

            <Metric title="Critical Priority" icon={<AlertTriangle className="w-5 h-5" />}>
                <span className="text-2xl font-bold">{critical}</span>
                <p className="text-xs text-muted-foreground">Needs attention</p>
            </Metric>

            <Metric title="Resolved Today" icon={<CheckCircle2 className="w-5 h-5" />}>
                <span className="text-2xl font-bold">{resolvedToday}</span>
                <p className="text-xs text-muted-foreground">Completed [current page]</p>
            </Metric>
        </div>
    );
}

function Metric({
                    title, icon, children, highlight,
                }: { title: string; icon: React.ReactNode; children: React.ReactNode; highlight?: boolean }) {
    return (
        <Card className={highlight ? "bg-theme-accent/5 border-theme-accent/20" : ""}>
            <CardContent className="p-4">
                <div className="bg-muted rounded-lg p-3 mb-3 flex items-center gap-2">
                    {icon}<span className="text-sm font-medium">{title}</span>
                </div>
                {children}
            </CardContent>
        </Card>
    );
}
