"use client"

import * as React from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { DateRange } from "react-day-picker"
import useAuthAdmin from "@/hooks/useAuthAdmin"
import Loader from "@/components/loader"

const chartConfig = {
  trial: {
    label: "Trial Students",
    color: "hsl(var(--chart-1))",
  },
  registered: {
    label: "Registered Students",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface ChartLineTrialVsRegisteredProps {
  timeRange: "7d" | "30d" | "90d"
  dateRange?: DateRange | undefined
}

type TrendRow = {
  date: Date;
  trial: number;
  registered: number;
}

export function ChartLineTrialVsRegistered({
  timeRange,
  dateRange,
}: ChartLineTrialVsRegisteredProps) {
  const { token } = useAuthAdmin()
  const [loading, setLoading] = React.useState(true)
  const [sourceData, setSourceData] = React.useState<TrendRow[]>([])

  const normalize = React.useCallback(
    (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()),
    []
  )

  const referenceDate = React.useMemo(() => {
    return normalize(dateRange?.to ?? new Date())
  }, [dateRange, normalize])

  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (timeRange) params.append("timeRange", timeRange)
        if (dateRange?.from) params.append("from", dateRange.from.toISOString())
        if (dateRange?.to) params.append("to", dateRange.to.toISOString())

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/insights/enrollment-trends?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
        if (!res.ok) throw new Error("Failed to fetch data")

        const json = await res.json();
        const data: TrendRow[] = json.data;
        setSourceData(data);
      } catch (err) {
        console.error(err)
        setSourceData([])
      } finally {
        setTimeout(() => {
          setLoading(false)
        }, 500)
      }
    }
    fetchData()
  }, [timeRange, dateRange]);

  return (
    <>
      {
        loading ?
          <Loader />
          :
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <LineChart data={sourceData}>
              {/* Add shadow filter definitions */}
              <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4" />
                </filter>
              </defs>

              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <YAxis domain={[0, "dataMax"]} tick={false} tickLine={false} axisLine={false} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                    indicator="dot"
                  />
                }
              />
              <Line
                dataKey="trial"
                type="monotone"
                stroke="var(--color-trial)"
                strokeWidth={2}
                dot={false}
                filter="url(#shadow)"
              />
              <Line
                dataKey="registered"
                type="monotone"
                stroke="var(--color-registered)"
                strokeWidth={2}
                dot={false}
                filter="url(#shadow)"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
      }
    </>
  )
}
