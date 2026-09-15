"use client";

import { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  Boxes,
  ListChecks,
  PackageCheck,
  Wallet,
} from "lucide-react";
import { TaskVelocityPoint } from "@/lib/data";

const money = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const chartColors = ["#0f766e", "#2563eb", "#f59e0b", "#8b5cf6", "#ef4444"];

export type DashboardChartMode = "ecommerce" | "analytics" | "saas" | "stocks";

export type DashboardChartsData = {
  statusMix: { name: string; value: number }[];
  categoryValue: { category: string; value: number }[];
  orderStatusMix: { name: string; value: number }[];
  paymentMix: { name: string; value: number }[];
  priorityWorkload: { name: string; hours: number }[];
  stockRisk: { name: string; value: number }[];
};

export function DashboardCharts({
  mode,
  dashboard,
  velocity,
}: {
  mode: DashboardChartMode;
  dashboard: DashboardChartsData;
  velocity: TaskVelocityPoint[];
}) {
  if (mode === "ecommerce") {
    return (
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartPanel
          className="xl:col-span-2"
          title="Order pipeline"
          subtitle="จำนวน order แยกตามสถานะ"
        >
          {dashboard.orderStatusMix.some((item) => item.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dashboard.orderStatusMix}
                margin={{ left: -24, right: 12, top: 12, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#2563eb" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState
              icon={PackageCheck}
              title="ยังไม่มี order"
              detail="เมื่อมีคำสั่งซื้อใหม่ pipeline จะแสดงภาพรวมตรงนี้"
            />
          )}
        </ChartPanel>

        <ChartPanel title="Payment mix" subtitle="สัดส่วนสถานะการชำระเงิน">
          {dashboard.paymentMix.some((item) => item.value > 0) ? (
            <StatusPie data={dashboard.paymentMix} />
          ) : (
            <ChartEmptyState
              icon={Wallet}
              title="ยังไม่มีข้อมูล payment"
              detail="ระบบจะแสดง payment mix เมื่อมี order ในคำค้นนี้"
            />
          )}
        </ChartPanel>
      </section>
    );
  }

  if (mode === "analytics") {
    return (
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartPanel
          className="xl:col-span-2"
          title="Performance trend"
          subtitle="Task velocity รายสัปดาห์"
        >
          <VelocityChart velocity={velocity} />
        </ChartPanel>

        <ChartPanel title="Signal distribution" subtitle="สถานะงานในระบบ">
          {dashboard.statusMix.length > 0 ? (
            <StatusPie data={dashboard.statusMix} />
          ) : (
            <ChartEmptyState
              icon={Activity}
              title="ยังไม่มี signal"
              detail="ระบบไม่พบ task ตามคำค้นนี้"
            />
          )}
        </ChartPanel>
      </section>
    );
  }

  if (mode === "saas") {
    return (
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartPanel
          className="xl:col-span-2"
          title="Task velocity"
          subtitle="สร้างงานใหม่เทียบกับงานที่ปิดแล้ว"
        >
          <VelocityChart velocity={velocity} />
        </ChartPanel>

        <ChartPanel title="Priority workload" subtitle="ชั่วโมงงานแยกตาม priority">
          {dashboard.priorityWorkload.some((item) => item.hours > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dashboard.priorityWorkload}
                margin={{ left: -24, right: 12, top: 12, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="hours" fill="#8b5cf6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState
              icon={ListChecks}
              title="ยังไม่มี workload"
              detail="เมื่อมี task estimate ระบบจะแสดงชั่วโมงงานตรงนี้"
            />
          )}
        </ChartPanel>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <ChartPanel
        className="xl:col-span-2"
        title="Stock value by category"
        subtitle="มูลค่าสต็อกแยกตามหมวดสินค้า"
      >
        {dashboard.categoryValue.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={dashboard.categoryValue}
              margin={{ left: -24, right: 12, top: 12, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="category"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <Tooltip
                formatter={(value) => money.format(Number(value))}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="value" fill="#0f766e" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmptyState
            icon={Boxes}
            title="ไม่พบสินค้า"
            detail="ลองล้างคำค้นหรือเพิ่มสินค้าใหม่ใน inventory"
          />
        )}
      </ChartPanel>

      <ChartPanel title="Stock risk" subtitle="สินค้าพร้อมขาย เทียบกับสินค้าเสี่ยง">
        {dashboard.stockRisk.length > 0 ? (
          <StatusPie data={dashboard.stockRisk} />
        ) : (
          <ChartEmptyState
            icon={AlertTriangle}
            title="ยังไม่มีข้อมูล stock"
            detail="เมื่อมีสินค้าในระบบ จะเห็น risk mix ตรงนี้"
          />
        )}
      </ChartPanel>
    </section>
  );
}

export function VelocityChart({ velocity }: { velocity: TaskVelocityPoint[] }) {
  return velocity.length > 0 ? (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={velocity}
        margin={{ left: -24, right: 12, top: 12, bottom: 0 }}
      >
        <defs>
          <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0f766e" stopOpacity={0.32} />
            <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e2e8f0"
          vertical={false}
        />
        <XAxis
          dataKey="week"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey="created"
          stroke="#2563eb"
          fill="url(#createdGradient)"
          strokeWidth={2.5}
        />
        <Area
          type="monotone"
          dataKey="completed"
          stroke="#0f766e"
          fill="url(#completedGradient)"
          strokeWidth={2.5}
        />
      </AreaChart>
    </ResponsiveContainer>
  ) : (
    <ChartEmptyState
      icon={Activity}
      title="ยังไม่มีข้อมูล trend"
      detail="เมื่อมี task velocity จะแสดงกราฟตรงนี้"
    />
  );
}

export function StatusPie({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={64}
          outerRadius={96}
          paddingAngle={4}
        >
          {data.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={chartColors[index % chartColors.length]}
            />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ChartPanel({
  title,
  subtitle,
  className = "",
  icon: Icon,
  children,
}: {
  title: string;
  subtitle: string;
  className?: string;
  icon?: React.ElementType;
  children: ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 ${className}`}
    >
      <div className="mb-5">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-teal-600" />}
          <h2 className="text-sm font-black text-slate-950 dark:text-white">
            {title}
          </h2>
        </div>
        <p className="mt-1 text-xs font-medium text-slate-400">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export function MultiBarChart({
  data,
  bars,
  height = 280,
}: {
  data: Record<string, string | number>[];
  bars: { dataKey: string; fill: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: -24, right: 12, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
        />
        <Tooltip contentStyle={tooltipStyle} />
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.fill}
            radius={[8, 8, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ValuePieChart({
  data,
  formatter,
  height = 280,
}: {
  data: { name: string; value: number }[];
  formatter?: (value: number) => string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={96}>
          {data.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={chartColors[index % chartColors.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) =>
            formatter ? formatter(Number(value)) : Number(value)
          }
          contentStyle={tooltipStyle}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function ChartEmptyState({
  icon: Icon,
  title,
  detail,
}: {
  icon: React.ElementType;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center dark:border-slate-800 dark:bg-slate-950/40">
      <Icon className="mb-3 h-8 w-8 text-slate-300" />
      <div className="text-sm font-black text-slate-700 dark:text-slate-200">
        {title}
      </div>
      <div className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
        {detail}
      </div>
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 14,
  border: "1px solid #e2e8f0",
  fontSize: 12,
};
