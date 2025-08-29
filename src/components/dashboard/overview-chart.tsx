
"use client"

import * as React from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getMonthlyChartData, MonthlyData } from "@/lib/firebase/firestore/reports"
import { Skeleton } from "../ui/skeleton"
import { Loader2 } from "lucide-react"

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
  const [data, setData] = React.useState<MonthlyData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const chartData = await getMonthlyChartData();
        setData(chartData);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
       <div className="flex items-center justify-center min-h-[350px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
       </div>
    )
  }
  
  if(data.length === 0) {
    return (
        <div className="flex items-center justify-center min-h-[350px]">
            <p className="text-muted-foreground">لا توجد بيانات كافية لعرض الرسم البياني.</p>
        </div>
    )
  }


  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <XAxis
            dataKey="month"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => new Intl.NumberFormat('ar-SA').format(value as number)}
          />
          <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent formatter={(value, name) => <span>{`${(name === 'income' ? 'الدخل' : 'المصروفات')}: ${new Intl.NumberFormat('ar-SA').format(value as number)}`}</span>} />} />
          <Legend />
          <Bar dataKey="income" name="الدخل" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="المصروفات" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
