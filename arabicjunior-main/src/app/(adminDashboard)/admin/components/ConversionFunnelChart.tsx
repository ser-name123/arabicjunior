"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import React from "react";
import { DateRange } from "react-day-picker";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import Loader from "@/components/loader";

type ConversionFunnelChartProps = {
  timeRange?: "7d" | "30d" | "90d"
  dateRange?: DateRange | undefined
  conversionRate: (value: number) => void
}

const chartConfig = {
  trialBooked: {
    label: "Trial Booked",
    color: "hsl(var(--chart-1))",
  },
  trialAttended: {
    label: "Trial Attended",
    color: "hsl(var(--chart-2))",
  },
  registered: {
    label: "Registered",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

type FunnelRow = {
  stage: "trialBooked" | "trialAttended" | "registered"
  value: number
}


export function ConversionFunnelChart({ timeRange, dateRange, conversionRate }: ConversionFunnelChartProps) {
  const { token } = useAuthAdmin()
  const [sourceData, setSourceData] = React.useState<FunnelRow[]>([])
  const [loading, setLoading] = React.useState(true)

  // fetch from API
  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (timeRange) params.append("timeRange", timeRange)
        if (dateRange?.from) params.append("from", dateRange.from.toISOString())
        if (dateRange?.to) params.append("to", dateRange.to.toISOString())

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/insights/conversion-funnel?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
        if (!res.ok) throw new Error("Failed to fetch data")

        const json = await res.json();
        const data: FunnelRow[] = json.data;
        setSourceData(data);
        conversionRate(json.conversionRate ?? 0)
      } catch (err) {
        console.error(err)
        setSourceData([])
      } finally {
        setTimeout(() => {
          setLoading(false)
        }, 500)
      }
    }
    if (!token) return
    fetchData()
  }, [timeRange, dateRange, token])

  const stagesOrder = ["trialBooked", "trialAttended", "registered"]

  const getFill = React.useCallback(
    (stage: string) => {
      const cfgColor = chartConfig[stage as keyof typeof chartConfig]?.color
      if (cfgColor) return cfgColor
      return `var(--color-${stage})`
    },
    []
  )

  const aggregatedData = React.useMemo(() => {
    const map: Record<string, number> = {}
    for (const row of sourceData) {
      map[row.stage] = (map[row.stage] || 0) + (row.value ?? 0)
    }
    return stagesOrder.map((stage) => ({
      stage,
      value: map[stage] ?? 0,
      fill: getFill(stage),
    }))
  }, [sourceData, getFill])

  return (
    <>
      {
        loading ?
          <Loader />
          :
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart
              accessibilityLayer
              data={aggregatedData}
              layout="vertical"
              margin={{
                left: 20,
              }}
            >
              <YAxis
                dataKey="stage"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) =>
                  chartConfig[value as keyof typeof chartConfig]?.label
                }
              />
              <XAxis dataKey="value" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="value" layout="vertical" radius={5} isAnimationActive={true} />
            </BarChart>
          </ChartContainer >
      }
    </>
  )
}
