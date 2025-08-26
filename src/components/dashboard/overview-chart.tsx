"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

const data = [
  { month: "يناير", income: 1860, expenses: 800 },
  { month: "فبراير", income: 3050, expenses: 1900 },
  { month: "مارس", income: 2370, expenses: 1200 },
  { month: "أبريل", income: 730, expenses: 2900 },
  { month: "مايو", income: 2090, expenses: 1800 },
  { month: "يونيو", income: 2140, expenses: 1100 },
]

const chartConfig = {
  income: {
    label: "الدخل",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "المصروفات",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function OverviewChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="vertical">
          <XAxis
            type="number"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <YAxis
            dataKey="month"
            type="category"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
          <Legend />
          <Bar dataKey="income" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
          <Bar dataKey="expenses" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
