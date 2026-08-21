"use client";

import type { FC, ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    BarChartSquare02,
    Bell01,
    Calendar,
    CheckDone01,
    Dataflow03,
    File06,
    HomeLine,
    Inbox01,
    Lightning01,
    LineChartUp02,
    MessageChatCircle,
    PieChart03,
    Plus,
    Rows01,
    SearchLg,
    Settings01,
    Tool01,
    Users01,
} from "@untitledui/icons";
import { ChartTooltipContent } from "@/components/application/charts/charts-base";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ProgressBarBase } from "@/components/base/progress-indicators/progress-indicators";
import { cx } from "@/utils/cx";

type NavIcon = FC<{ className?: string }>;
// next-intl translator for home.valueMockups
type MockT = (key: string) => string;

function BrandMark({ label, workspace, compact = false }: { label: string; workspace: string; compact?: boolean }) {
    const letter = label.trim().charAt(0).toUpperCase() || "Y";
    if (compact) {
        return (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-solid text-xs font-bold text-white">{letter}</span>
        );
    }
    return (
        <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-solid text-xs font-bold text-white">{letter}</span>
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-primary">{label}</p>
                <p className="truncate text-[11px] text-tertiary">{workspace}</p>
            </div>
        </div>
    );
}

function TrendPill({ value, positive = true }: { value: string; positive?: boolean }) {
    return (
        <span
            className={cx(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
                positive
                    ? "bg-success-primary text-success-primary ring-success-secondary"
                    : "bg-error-primary text-error-primary ring-error-secondary",
            )}
        >
            {positive ? "↑" : "↓"} {value}
        </span>
    );
}

function MetricCard({
    label,
    value,
    delta,
    positive = true,
    className,
}: {
    label: string;
    value: string;
    delta: string;
    positive?: boolean;
    className?: string;
}) {
    return (
        <div className={cx("flex min-w-0 flex-col gap-2 rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary", className)}>
            <p className="text-sm font-medium text-tertiary">{label}</p>
            <div className="flex items-end justify-between gap-2">
                <p className="text-display-xs font-semibold tracking-tight text-primary">{value}</p>
                <TrendPill value={delta} positive={positive} />
            </div>
        </div>
    );
}

function IconRail({ brandLabel, t, active = 1 }: { brandLabel: string; t: MockT; active?: number }) {
    const items: { icon: NavIcon; label: string }[] = [
        { icon: HomeLine, label: t("navHome") },
        { icon: CheckDone01, label: t("navOps") },
        { icon: Dataflow03, label: t("navFlows") },
        { icon: BarChartSquare02, label: t("navInsights") },
        { icon: Users01, label: t("navClients") },
        { icon: Settings01, label: t("navSettings") },
    ];

    return (
        <aside className="flex w-[4.25rem] shrink-0 flex-col items-center gap-3 border-r border-brand/20 bg-brand-secondary py-4">
            <BrandMark label={brandLabel} workspace={t("workspace")} compact />
            <nav className="flex flex-1 flex-col gap-1" aria-hidden>
                {items.map((item, i) => {
                    const Icon = item.icon;
                    const current = i === active;
                    return (
                        <div
                            key={item.label}
                            className={cx(
                                "flex size-10 items-center justify-center rounded-lg",
                                current
                                    ? "bg-brand-solid text-white shadow-sm"
                                    : "text-fg-brand-primary/70",
                            )}
                        >
                            <Icon className="size-5" />
                        </div>
                    );
                })}
            </nav>
            <Avatar size="sm" initials="AR" />
        </aside>
    );
}

function WideSidebar({
    brandLabel,
    t,
    items,
    active = 0,
}: {
    brandLabel: string;
    t: MockT;
    items: { label: string; icon: NavIcon }[];
    active?: number;
}) {
    return (
        <aside className="flex w-52 shrink-0 flex-col border-r border-brand/20 bg-brand-primary">
            <div className="border-b border-brand/15 px-4 py-4">
                <BrandMark label={brandLabel} workspace={t("workspace")} />
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-hidden>
                {items.map((item, i) => {
                    const Icon = item.icon;
                    const current = i === active;
                    return (
                        <div
                            key={item.label}
                            className={cx(
                                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium",
                                current
                                    ? "bg-brand-solid text-white shadow-sm"
                                    : "text-brand-secondary hover:bg-brand-secondary/60",
                            )}
                        >
                            <Icon
                                className={cx(
                                    "size-5 shrink-0",
                                    current ? "text-white" : "text-fg-brand-primary",
                                )}
                            />
                            <span className="truncate">{item.label}</span>
                        </div>
                    );
                })}
            </nav>
            <div className="border-t border-brand/15 bg-brand-secondary/50 p-3">
                <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
                    <Avatar size="sm" initials="AR" />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-brand-primary">{t("userName")}</p>
                        <p className="truncate text-xs text-brand-secondary">{t("admin")}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function TopHeader({
    brandLabel,
    t,
    links,
    trailing,
    tinted = false,
}: {
    brandLabel: string;
    t: MockT;
    links: string[];
    trailing?: ReactNode;
    /** Brand wash when there is no sidebar (header carries the color). */
    tinted?: boolean;
}) {
    return (
        <header
            className={cx(
                "flex items-center justify-between gap-4 border-b px-5 py-3.5",
                tinted ? "border-brand/20 bg-brand-primary" : "border-secondary bg-primary",
            )}
        >
            <div className="flex min-w-0 items-center gap-6">
                <BrandMark label={brandLabel} workspace={t("workspace")} />
                <nav className="hidden items-center gap-1 md:flex" aria-hidden>
                    {links.map((link, i) => (
                        <span
                            key={link}
                            className={cx(
                                "rounded-lg px-3 py-1.5 text-sm font-medium",
                                tinted
                                    ? i === 0
                                        ? "bg-brand-solid text-white shadow-sm"
                                        : "text-brand-secondary"
                                    : i === 0
                                      ? "bg-secondary text-primary"
                                      : "text-tertiary",
                            )}
                        >
                            {link}
                        </span>
                    ))}
                </nav>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <Button size="sm" color="secondary" iconLeading={SearchLg} aria-label={t("search")} />
                <Button size="sm" color="secondary" iconLeading={Bell01} aria-label={t("notifications")} />
                {trailing}
                <Avatar size="sm" initials="AR" />
            </div>
        </header>
    );
}

function OperationsMock({ brandLabel, t }: { brandLabel: string; t: MockT }) {
    const rows = [
        { id: "REQ-1042", team: t("opsTeamOps"), title: t("opsRow1"), status: t("opsStatusProgress"), color: "brand" as const },
        { id: "REQ-1041", team: t("opsTeamFinance"), title: t("opsRow2"), status: t("opsStatusWaiting"), color: "warning" as const },
        { id: "REQ-1038", team: t("opsTeamLegal"), title: t("opsRow3"), status: t("opsStatusDone"), color: "success" as const },
        { id: "REQ-1035", team: t("opsTeamHr"), title: t("opsRow4"), status: t("opsStatusProgress"), color: "brand" as const },
        { id: "REQ-1031", team: t("opsTeamOps"), title: t("opsRow5"), status: t("opsStatusDone"), color: "success" as const },
    ];

    return (
        <div className="flex h-full min-h-0">
            <WideSidebar
                brandLabel={brandLabel}
                t={t}
                active={1}
                items={[
                    { label: t("navHome"), icon: HomeLine },
                    { label: t("navRequests"), icon: Inbox01 },
                    { label: t("navProjects"), icon: Rows01 },
                    { label: t("navReporting"), icon: PieChart03 },
                    { label: t("navUsers"), icon: Users01 },
                ]}
            />
            <div className="flex min-w-0 flex-1 flex-col bg-secondary">
                <div className="flex items-start justify-between gap-3 border-b border-secondary bg-primary px-5 py-4">
                    <div>
                        <h3 className="text-lg font-semibold text-primary">{t("opsTitle")}</h3>
                        <p className="text-sm text-tertiary">{t("opsSubtitle")}</p>
                    </div>
                    <Button size="sm" color="primary" iconLeading={Plus}>
                        {t("opsNew")}
                    </Button>
                </div>
                <div className="flex flex-1 flex-col gap-4 overflow-hidden p-5">
                    <div className="grid grid-cols-3 gap-3">
                        <MetricCard label={t("opsOpen")} value="24" delta="12%" />
                        <MetricCard label={t("opsCycle")} value="1.8d" delta="9%" />
                        <MetricCard label={t("opsSla")} value="96%" delta="3%" />
                    </div>
                    <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
                        <div className="grid grid-cols-[6rem_5rem_1fr_7.5rem] gap-3 border-b border-secondary px-4 py-3 text-xs font-semibold tracking-wide text-quaternary uppercase">
                            <span>{t("opsColId")}</span>
                            <span>{t("opsColTeam")}</span>
                            <span>{t("opsColRequest")}</span>
                            <span>{t("opsColStatus")}</span>
                        </div>
                        {rows.map((row) => (
                            <div
                                key={row.id}
                                className="grid grid-cols-[6rem_5rem_1fr_7.5rem] items-center gap-3 border-b border-secondary px-4 py-3 last:border-b-0"
                            >
                                <span className="truncate text-sm font-medium text-tertiary">{row.id}</span>
                                <span className="truncate text-sm text-secondary">{row.team}</span>
                                <span className="truncate text-sm font-medium text-primary">{row.title}</span>
                                <BadgeWithDot size="sm" color={row.color} type="modern">
                                    {row.status}
                                </BadgeWithDot>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function AutomationMock({ brandLabel, t }: { brandLabel: string; t: MockT }) {
    const flows = [
        { name: t("autoFlow1"), runs: t("autoFlow1Runs"), progress: 92 },
        { name: t("autoFlow2"), runs: t("autoFlow2Runs"), progress: 74 },
        { name: t("autoFlow3"), runs: t("autoFlow3Runs"), progress: 88 },
        { name: t("autoFlow4"), runs: t("autoFlow4Runs"), progress: 61 },
    ];

    return (
        <div className="flex h-full min-h-0">
            <IconRail brandLabel={brandLabel} t={t} active={2} />
            <div className="flex min-w-0 flex-1 flex-col bg-secondary">
                <div className="flex items-center justify-between border-b border-secondary bg-primary px-5 py-4">
                    <div>
                        <h3 className="text-lg font-semibold text-primary">{t("autoTitle")}</h3>
                        <p className="text-sm text-tertiary">{t("autoSubtitle")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge size="sm" color="success" type="pill-color">
                            {t("autoLiveCount")}
                        </Badge>
                        <Button size="sm" color="primary" iconLeading={Lightning01}>
                            {t("autoNew")}
                        </Button>
                    </div>
                </div>
                <div className="grid flex-1 grid-cols-[1.35fr_0.9fr] gap-4 overflow-hidden p-5">
                    <div className="flex min-h-0 flex-col gap-3 overflow-hidden">
                        {flows.map((flow) => (
                            <div key={flow.name} className="rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary">
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex size-10 items-center justify-center rounded-lg bg-brand-primary">
                                            <Lightning01 className="size-5 text-fg-brand-primary" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-primary">{flow.name}</p>
                                            <p className="text-xs text-tertiary">{flow.runs}</p>
                                        </div>
                                    </div>
                                    <Badge size="sm" color="success" type="pill-color">
                                        {t("live")}
                                    </Badge>
                                </div>
                                <ProgressBarBase value={flow.progress} className="h-1.5" />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col gap-3 rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary">
                        <p className="text-sm font-semibold text-primary">{t("autoHoursSaved")}</p>
                        <p className="text-display-sm font-semibold text-primary">146h</p>
                        <TrendPill value={t("autoTrend")} />
                        <div className="mt-auto space-y-3 border-t border-secondary pt-4">
                            {[t("autoEvent1"), t("autoEvent2"), t("autoEvent3")].map((line) => (
                                <div key={line} className="flex items-start gap-2">
                                    <CheckDone01 className="mt-0.5 size-4 shrink-0 text-fg-success-primary" />
                                    <p className="text-sm text-secondary">{line}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InformationMock({ brandLabel, t }: { brandLabel: string; t: MockT }) {
    const chartTrend = [
        { label: t("dayMon"), value: 42 },
        { label: t("dayTue"), value: 58 },
        { label: t("dayWed"), value: 51 },
        { label: t("dayThu"), value: 72 },
        { label: t("dayFri"), value: 66 },
        { label: t("daySat"), value: 84 },
        { label: t("daySun"), value: 91 },
    ];

    return (
        <div className="flex h-full min-h-0 flex-col">
            <TopHeader
                brandLabel={brandLabel}
                t={t}
                tinted
                links={[t("infoOverview"), t("infoReports"), t("infoCosts"), t("infoExports")]}
            />
            <div className="flex flex-1 flex-col gap-4 overflow-hidden bg-secondary p-5">
                <div className="grid grid-cols-4 gap-3">
                    <MetricCard label={t("infoRevenue")} value="$128k" delta="7%" />
                    <MetricCard label={t("infoCostsMetric")} value="$41k" delta="4%" positive={false} />
                    <MetricCard label={t("infoMargin")} value="32%" delta="1.2%" />
                    <MetricCard label={t("infoUsers")} value="1,204" delta="9%" />
                </div>
                <div className="min-h-0 flex-1 rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-primary">{t("infoChartTitle")}</p>
                            <p className="text-xs text-tertiary">{t("infoChartSubtitle")}</p>
                        </div>
                        <Badge size="sm" color="brand" type="pill-color">
                            {t("live")}
                        </Badge>
                    </div>
                    <div className="h-[14rem] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartTrend} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="infoArea" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#4d6b97" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="#4d6b97" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="#e5e5e5" />
                                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#737373" }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#737373" }} width={32} />
                                <RechartsTooltip content={<ChartTooltipContent />} cursor={{ stroke: "#e5e5e5" }} />
                                <Area type="monotone" dataKey="value" stroke="#4d6b97" strokeWidth={2.5} fill="url(#infoArea)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CustomerMock({ brandLabel, t }: { brandLabel: string; t: MockT }) {
    const tickets = [
        { name: t("cxTicket1"), client: "Northwind", status: t("cxStatusOpen"), color: "brand" as const, active: true },
        { name: t("cxTicket2"), client: "Atelier Nord", status: t("cxStatusResolved"), color: "success" as const, active: false },
        { name: t("cxTicket3"), client: "M&H", status: t("cxStatusWaiting"), color: "warning" as const, active: false },
        { name: t("cxTicket4"), client: "Lumen Co", status: t("cxStatusOpen"), color: "brand" as const, active: false },
        { name: t("cxTicket5"), client: "Peak Labs", status: t("cxStatusOpen"), color: "brand" as const, active: false },
    ];

    return (
        <div className="flex h-full min-h-0 flex-col">
            <TopHeader
                brandLabel={brandLabel}
                t={t}
                tinted
                links={[t("cxInbox"), t("cxClients"), t("cxBookings")]}
                trailing={
                    <Button size="sm" color="primary" iconLeading={MessageChatCircle}>
                        {t("cxReply")}
                    </Button>
                }
            />
            <div className="grid min-h-0 flex-1 grid-cols-[0.95fr_1.15fr] overflow-hidden bg-secondary">
                <div className="overflow-hidden border-r border-secondary bg-primary">
                    <div className="border-b border-secondary px-4 py-3">
                        <p className="text-sm font-semibold text-primary">{t("cxListTitle")}</p>
                        <p className="text-xs text-tertiary">{t("cxListSubtitle")}</p>
                    </div>
                    {tickets.map((ticket) => (
                        <div
                            key={ticket.name}
                            className={cx(
                                "flex items-center gap-3 border-b border-secondary px-4 py-3",
                                ticket.active && "bg-brand-primary_alt",
                            )}
                        >
                            <Avatar size="md" initials={ticket.client.slice(0, 2).toUpperCase()} />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-primary">{ticket.name}</p>
                                <p className="truncate text-xs text-tertiary">{ticket.client}</p>
                            </div>
                            <BadgeWithDot size="sm" color={ticket.color} type="modern">
                                {ticket.status}
                            </BadgeWithDot>
                        </div>
                    ))}
                </div>
                <div className="flex min-h-0 flex-col gap-4 overflow-hidden p-5">
                    <div className="rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-semibold text-primary">{t("cxTicket1")}</h3>
                                <p className="text-sm text-tertiary">{t("cxDetailMeta")}</p>
                            </div>
                            <BadgeWithDot size="sm" color="brand" type="modern">
                                {t("cxStatusOpen")}
                            </BadgeWithDot>
                        </div>
                        <div className="space-y-3 rounded-lg bg-secondary p-4">
                            <p className="text-sm text-secondary">{t("cxMessage")}</p>
                            <div className="flex items-center gap-2">
                                <Avatar size="xs" initials="NW" />
                                <span className="text-xs text-tertiary">{t("cxSender")}</span>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Button size="sm" color="primary">
                                {t("cxApprove")}
                            </Button>
                            <Button size="sm" color="secondary">
                                {t("cxAsk")}
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <MetricCard label={t("cxActive")} value="38" delta="6%" />
                        <MetricCard label={t("cxCsat")} value="4.8" delta="0.2" />
                        <MetricCard label={t("cxResponse")} value="1.4h" delta="11%" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function DecisionsMock({ brandLabel, t }: { brandLabel: string; t: MockT }) {
    const chartBars = [
        { label: "Q1", value: 62 },
        { label: "Q2", value: 74 },
        { label: "Q3", value: 69 },
        { label: "Q4", value: 88 },
    ];

    return (
        <div className="flex h-full min-h-0">
            <IconRail brandLabel={brandLabel} t={t} active={3} />
            <aside className="flex w-44 shrink-0 flex-col border-r border-brand/20 bg-brand-primary p-3">
                <p className="px-2 pb-2 text-xs font-semibold tracking-wide text-brand-secondary uppercase">{t("decBoard")}</p>
                {[t("decOverview"), t("decForecast"), t("decAlerts"), t("decGoals")].map((item, i) => (
                    <div
                        key={item}
                        className={cx(
                            "rounded-lg px-3 py-2 text-sm font-medium",
                            i === 0
                                ? "bg-brand-solid text-white shadow-sm"
                                : "text-brand-secondary",
                        )}
                    >
                        {item}
                    </div>
                ))}
            </aside>
            <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden bg-secondary p-5">
                <div className="grid grid-cols-2 gap-3">
                    <MetricCard label={t("decForecastMetric")} value="+14%" delta="2.1%" />
                    <MetricCard label={t("decRisk")} value={t("decRiskValue")} delta={t("decRiskDelta")} />
                </div>
                <div className="grid min-h-0 flex-1 grid-cols-[1.25fr_0.85fr] gap-3">
                    <div className="rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary">
                        <p className="mb-2 text-sm font-semibold text-primary">{t("decMix")}</p>
                        <div className="h-[13rem] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartBars} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                                    <CartesianGrid vertical={false} stroke="#e5e5e5" />
                                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#737373" }} />
                                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#737373" }} width={28} />
                                    <RechartsTooltip content={<ChartTooltipContent />} cursor={{ fill: "#fafafa" }} />
                                    <Bar dataKey="value" fill="#4d6b97" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        {[
                            { icon: LineChartUp02, title: t("decCard1Title"), body: t("decCard1Body") },
                            { icon: Inbox01, title: t("decCard2Title"), body: t("decCard2Body") },
                            { icon: Calendar, title: t("decCard3Title"), body: t("decCard3Body") },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.title} className="flex flex-1 items-start gap-3 rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary">
                                        <Icon className="size-5 text-fg-brand-primary" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-primary">{item.title}</p>
                                        <p className="text-xs text-tertiary">{item.body}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CustomMock({ brandLabel, t }: { brandLabel: string; t: MockT }) {
    const tools = [
        { icon: File06, title: t("customTool1"), meta: t("customTool1Meta") },
        { icon: Users01, title: t("customTool2"), meta: t("customTool2Meta") },
        { icon: Settings01, title: t("customTool3"), meta: t("customTool3Meta") },
        { icon: Tool01, title: t("customTool4"), meta: t("customTool4Meta") },
    ];

    return (
        <div className="flex h-full min-h-0 flex-col bg-secondary">
            <div className="flex items-center justify-between gap-4 border-b border-brand/20 bg-brand-primary px-5 py-4">
                <BrandMark label={brandLabel} workspace={t("workspace")} />
                <div className="flex items-center gap-2">
                    <Badge size="sm" color="brand" type="pill-color">
                        {t("customSprint")}
                    </Badge>
                    <Button size="sm" color="primary" iconLeading={Plus}>
                        {t("customBuild")}
                    </Button>
                </div>
            </div>
            <div className="flex flex-1 flex-col gap-4 overflow-hidden p-5">
                <div>
                    <h3 className="text-lg font-semibold text-primary">{t("customTitle")}</h3>
                    <p className="text-sm text-tertiary">{t("customSubtitle")}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                            <div key={tool.title} className="rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary">
                                <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand-primary">
                                    <Icon className="size-5 text-fg-brand-primary" />
                                </span>
                                <p className="text-sm font-semibold text-primary">{tool.title}</p>
                                <p className="text-xs text-tertiary">{tool.meta}</p>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-auto rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-primary">{t("customRoadmap")}</p>
                        <span className="text-xs text-tertiary">{t("customComplete")}</span>
                    </div>
                    <ProgressBarBase value={68} className="h-2" />
                    <p className="mt-3 text-sm text-tertiary">{t("customPhases")}</p>
                </div>
            </div>
        </div>
    );
}

const MOCKS = [OperationsMock, AutomationMock, InformationMock, CustomerMock, DecisionsMock, CustomMock] as const;

export function ValueProductMockup({
    activeIndex,
    brandLabel,
    className,
}: {
    activeIndex: number;
    brandLabel: string;
    className?: string;
}) {
    const t = useTranslations("home.valueMockups");
    const index = ((activeIndex % MOCKS.length) + MOCKS.length) % MOCKS.length;
    const Mock = MOCKS[index];

    return (
        <div
            data-cobreo-mock
            className={cx(
                "pointer-events-none isolate w-full select-none overflow-hidden rounded-2xl bg-primary",
                "border border-brand ring-1 ring-brand/30",
                "[filter:drop-shadow(0_20px_44px_rgba(77,107,151,0.28))]",
                className,
            )}
        >
            <div className="aspect-[16/10] w-full min-h-[26rem] xl:min-h-[28rem] 2xl:min-h-[32rem]">
                <Mock brandLabel={brandLabel} t={t as MockT} />
            </div>
        </div>
    );
}

/* ─── Mobile phone mockups (readable native layouts) ─── */

function PhoneChrome({ children, brandLabel }: { children: ReactNode; brandLabel: string }) {
    return (
        <div
            data-cobreo-mock
            className={cx(
                "pointer-events-none mx-auto w-full max-w-[300px] select-none",
                "[filter:drop-shadow(0_18px_36px_rgba(77,107,151,0.28))]",
            )}
        >
            <div className="overflow-hidden rounded-[2rem] border-[5px] border-[#171718] bg-primary ring-1 ring-brand/25">
                <div className="relative flex h-11 items-center justify-between bg-brand-primary px-5">
                    <span className="text-[11px] font-semibold tabular-nums text-brand-secondary">9:41</span>
                    <span className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-[#171718]/90" aria-hidden />
                    <span className="text-[10px] font-semibold tracking-wide text-brand-secondary">{brandLabel.slice(0, 6)}</span>
                </div>
                <div className="h-[34rem] overflow-hidden bg-secondary">{children}</div>
                <div className="flex justify-center bg-primary pb-2.5 pt-1.5">
                    <span className="h-1 w-28 rounded-full bg-[#171718]/20" aria-hidden />
                </div>
            </div>
        </div>
    );
}

function MobileTabBar({ active = 0 }: { active?: number }) {
    const tabs: NavIcon[] = [HomeLine, Inbox01, Lightning01, BarChartSquare02, Users01];
    return (
        <div className="mt-auto flex shrink-0 items-center justify-around border-t border-secondary bg-primary px-1 py-2">
            {tabs.map((Icon, i) => (
                <span
                    key={i}
                    className={cx(
                        "flex size-9 items-center justify-center rounded-lg",
                        i === active ? "bg-brand-solid text-white" : "text-fg-quaternary",
                    )}
                >
                    <Icon className="size-4" />
                </span>
            ))}
        </div>
    );
}

function OperationsMobile({ t }: { t: MockT }) {
    const rows = [
        { title: t("opsRow1"), team: t("opsTeamOps"), status: t("opsStatusProgress"), color: "brand" as const },
        { title: t("opsRow2"), team: t("opsTeamFinance"), status: t("opsStatusWaiting"), color: "warning" as const },
        { title: t("opsRow3"), team: t("opsTeamLegal"), status: t("opsStatusDone"), color: "success" as const },
        { title: t("opsRow4"), team: t("opsTeamHr"), status: t("opsStatusProgress"), color: "brand" as const },
    ];

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="border-b border-secondary bg-primary px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-primary">{t("opsTitle")}</p>
                        <p className="truncate text-xs text-tertiary">{t("opsSubtitle")}</p>
                    </div>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-solid text-white">
                        <Plus className="size-4" />
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 px-3 py-3">
                {[
                    { label: t("opsOpen"), value: "24" },
                    { label: t("opsCycle"), value: "1.8d" },
                    { label: t("opsSla"), value: "96%" },
                ].map((m) => (
                    <div key={m.label} className="rounded-xl bg-primary p-2.5 shadow-xs ring-1 ring-secondary">
                        <p className="text-[10px] font-medium text-tertiary">{m.label}</p>
                        <p className="text-sm font-semibold text-primary">{m.value}</p>
                    </div>
                ))}
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-hidden px-3 pb-2">
                {rows.map((row) => (
                    <div key={row.title} className="rounded-xl bg-primary p-3 shadow-xs ring-1 ring-secondary">
                        <div className="mb-1.5 flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-primary">{row.title}</p>
                            <BadgeWithDot size="sm" color={row.color} type="modern">
                                {row.status}
                            </BadgeWithDot>
                        </div>
                        <p className="text-xs text-tertiary">{row.team}</p>
                    </div>
                ))}
            </div>
            <MobileTabBar active={1} />
        </div>
    );
}

function AutomationMobile({ t }: { t: MockT }) {
    const flows = [
        { name: t("autoFlow1"), runs: t("autoFlow1Runs"), progress: 92 },
        { name: t("autoFlow2"), runs: t("autoFlow2Runs"), progress: 74 },
        { name: t("autoFlow3"), runs: t("autoFlow3Runs"), progress: 88 },
    ];

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="border-b border-secondary bg-primary px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-primary">{t("autoTitle")}</p>
                        <p className="truncate text-xs text-tertiary">{t("autoSubtitle")}</p>
                    </div>
                    <Badge size="sm" color="success" type="pill-color">
                        {t("autoLiveCount")}
                    </Badge>
                </div>
            </div>
            <div className="mx-3 mt-3 rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary">
                <p className="text-xs font-medium text-tertiary">{t("autoHoursSaved")}</p>
                <div className="mt-1 flex items-end justify-between gap-2">
                    <p className="text-display-xs font-semibold text-primary">146h</p>
                    <TrendPill value={t("autoTrend")} />
                </div>
            </div>
            <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-hidden px-3 pb-2">
                {flows.map((flow) => (
                    <div key={flow.name} className="rounded-xl bg-primary p-3 shadow-xs ring-1 ring-secondary">
                        <div className="mb-2 flex items-center gap-2.5">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary">
                                <Lightning01 className="size-4 text-fg-brand-primary" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-primary">{flow.name}</p>
                                <p className="text-[11px] text-tertiary">{flow.runs}</p>
                            </div>
                            <Badge size="sm" color="success" type="pill-color">
                                {t("live")}
                            </Badge>
                        </div>
                        <ProgressBarBase value={flow.progress} className="h-1.5" />
                    </div>
                ))}
            </div>
            <MobileTabBar active={2} />
        </div>
    );
}

function InformationMobile({ t }: { t: MockT }) {
    const bars = [42, 58, 51, 72, 66, 84, 91];
    const days = [t("dayMon"), t("dayTue"), t("dayWed"), t("dayThu"), t("dayFri"), t("daySat"), t("daySun")];
    const max = Math.max(...bars);

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="border-b border-brand/20 bg-brand-primary px-4 py-3">
                <p className="text-base font-semibold text-primary">{t("infoOverview")}</p>
                <p className="text-xs text-brand-secondary">{t("infoChartSubtitle")}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 px-3 py-3">
                <div className="rounded-xl bg-primary p-3 shadow-xs ring-1 ring-secondary">
                    <p className="text-[10px] font-medium text-tertiary">{t("infoRevenue")}</p>
                    <p className="text-lg font-semibold text-primary">$128k</p>
                    <TrendPill value="7%" />
                </div>
                <div className="rounded-xl bg-primary p-3 shadow-xs ring-1 ring-secondary">
                    <p className="text-[10px] font-medium text-tertiary">{t("infoMargin")}</p>
                    <p className="text-lg font-semibold text-primary">32%</p>
                    <TrendPill value="1.2%" />
                </div>
            </div>
            <div className="mx-3 min-h-0 flex-1 rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary">
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-primary">{t("infoChartTitle")}</p>
                    <Badge size="sm" color="brand" type="pill-color">
                        {t("live")}
                    </Badge>
                </div>
                <div className="flex h-40 items-end gap-1.5">
                    {bars.map((value, i) => (
                        <div key={days[i]} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                            <div
                                className="w-full rounded-md bg-brand-solid"
                                style={{ height: `${Math.max(12, (value / max) * 100)}%` }}
                            />
                            <span className="text-[9px] text-quaternary">{days[i]}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="h-3" />
            <MobileTabBar active={3} />
        </div>
    );
}

function CustomerMobile({ t }: { t: MockT }) {
    const tickets = [
        { name: t("cxTicket1"), client: "Northwind", status: t("cxStatusOpen"), color: "brand" as const, active: true },
        { name: t("cxTicket2"), client: "Atelier Nord", status: t("cxStatusResolved"), color: "success" as const, active: false },
        { name: t("cxTicket3"), client: "M&H", status: t("cxStatusWaiting"), color: "warning" as const, active: false },
    ];

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="border-b border-brand/20 bg-brand-primary px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <p className="text-base font-semibold text-primary">{t("cxListTitle")}</p>
                        <p className="text-xs text-brand-secondary">{t("cxListSubtitle")}</p>
                    </div>
                    <span className="flex size-8 items-center justify-center rounded-lg bg-brand-solid text-white">
                        <MessageChatCircle className="size-4" />
                    </span>
                </div>
            </div>
            <div className="min-h-0 flex-1 space-y-0 overflow-hidden bg-primary">
                {tickets.map((ticket) => (
                    <div
                        key={ticket.name}
                        className={cx(
                            "flex items-center gap-3 border-b border-secondary px-4 py-3",
                            ticket.active && "bg-brand-primary_alt",
                        )}
                    >
                        <Avatar size="sm" initials={ticket.client.slice(0, 2).toUpperCase()} />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-primary">{ticket.name}</p>
                            <p className="truncate text-xs text-tertiary">{ticket.client}</p>
                        </div>
                        <BadgeWithDot size="sm" color={ticket.color} type="modern">
                            {ticket.status}
                        </BadgeWithDot>
                    </div>
                ))}
                <div className="m-3 rounded-xl bg-secondary p-3">
                    <p className="text-sm text-secondary">{t("cxMessage")}</p>
                    <div className="mt-3 flex gap-2">
                        <span className="rounded-lg bg-brand-solid px-3 py-1.5 text-xs font-semibold text-white">{t("cxApprove")}</span>
                        <span className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-secondary ring-1 ring-secondary">
                            {t("cxAsk")}
                        </span>
                    </div>
                </div>
            </div>
            <MobileTabBar active={4} />
        </div>
    );
}

function DecisionsMobile({ t }: { t: MockT }) {
    const cards = [
        { icon: LineChartUp02, title: t("decCard1Title"), body: t("decCard1Body") },
        { icon: Inbox01, title: t("decCard2Title"), body: t("decCard2Body") },
        { icon: Calendar, title: t("decCard3Title"), body: t("decCard3Body") },
    ];

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="border-b border-secondary bg-primary px-4 py-3">
                <p className="text-base font-semibold text-primary">{t("decBoard")}</p>
                <p className="text-xs text-tertiary">{t("decOverview")}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 px-3 py-3">
                <div className="rounded-xl bg-primary p-3 shadow-xs ring-1 ring-secondary">
                    <p className="text-[10px] font-medium text-tertiary">{t("decForecastMetric")}</p>
                    <p className="text-lg font-semibold text-primary">+14%</p>
                    <TrendPill value="2.1%" />
                </div>
                <div className="rounded-xl bg-primary p-3 shadow-xs ring-1 ring-secondary">
                    <p className="text-[10px] font-medium text-tertiary">{t("decRisk")}</p>
                    <p className="text-lg font-semibold text-primary">{t("decRiskValue")}</p>
                    <TrendPill value={t("decRiskDelta")} />
                </div>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-hidden px-3 pb-2">
                {cards.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.title} className="flex items-start gap-3 rounded-xl bg-primary p-3.5 shadow-xs ring-1 ring-secondary">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary">
                                <Icon className="size-4 text-fg-brand-primary" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-primary">{item.title}</p>
                                <p className="text-xs text-tertiary">{item.body}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <MobileTabBar active={3} />
        </div>
    );
}

function CustomMobile({ t }: { t: MockT }) {
    const tools = [
        { icon: File06, title: t("customTool1"), meta: t("customTool1Meta") },
        { icon: Users01, title: t("customTool2"), meta: t("customTool2Meta") },
        { icon: Settings01, title: t("customTool3"), meta: t("customTool3Meta") },
        { icon: Tool01, title: t("customTool4"), meta: t("customTool4Meta") },
    ];

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="border-b border-brand/20 bg-brand-primary px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-primary">{t("customTitle")}</p>
                        <p className="truncate text-xs text-brand-secondary">{t("customSubtitle")}</p>
                    </div>
                    <Badge size="sm" color="brand" type="pill-color">
                        {t("customSprint")}
                    </Badge>
                </div>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-hidden px-3 py-3">
                {tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                        <div key={tool.title} className="flex items-center gap-3 rounded-xl bg-primary p-3 shadow-xs ring-1 ring-secondary">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary">
                                <Icon className="size-5 text-fg-brand-primary" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-primary">{tool.title}</p>
                                <p className="text-xs text-tertiary">{tool.meta}</p>
                            </div>
                        </div>
                    );
                })}
                <div className="rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary">
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-primary">{t("customRoadmap")}</p>
                        <span className="text-xs text-tertiary">{t("customComplete")}</span>
                    </div>
                    <ProgressBarBase value={68} className="h-2" />
                    <p className="mt-2 text-xs text-tertiary">{t("customPhases")}</p>
                </div>
            </div>
            <MobileTabBar active={0} />
        </div>
    );
}

const MOBILE_MOCKS = [
    OperationsMobile,
    AutomationMobile,
    InformationMobile,
    CustomerMobile,
    DecisionsMobile,
    CustomMobile,
] as const;

export function ValueProductMockupMobile({
    activeIndex,
    brandLabel,
    className,
}: {
    activeIndex: number;
    brandLabel: string;
    className?: string;
}) {
    const t = useTranslations("home.valueMockups");
    const index = ((activeIndex % MOBILE_MOCKS.length) + MOBILE_MOCKS.length) % MOBILE_MOCKS.length;
    const Mock = MOBILE_MOCKS[index];

    return (
        <div className={cx("w-full", className)}>
            <PhoneChrome brandLabel={brandLabel}>
                <Mock t={t as MockT} />
            </PhoneChrome>
        </div>
    );
}
