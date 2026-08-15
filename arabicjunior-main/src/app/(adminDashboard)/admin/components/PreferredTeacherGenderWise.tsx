"use client"

import { Pie, PieChart } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import useAuthAdmin from "@/hooks/useAuthAdmin"
import React from "react";
import Loader from "@/components/loader";

const chartConfig = {
    male: {
        label: "Male",
        color: "hsl(var(--chart-3))",
    },
    female: {
        label: "Female",
        color: "hsl(var(--chart-5))",
    },
    other: {
        label: "Other",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

export function PreferredTeacherGenderWise() {
    const { token } = useAuthAdmin()
    const [sourceData, setSourceData] = React.useState<any>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/insights/teacher-gender-preference`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    })
                if (!res.ok) throw new Error("Failed to fetch data")

                const json = await res.json();
                const data: any[] = json.data;
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
    }, [])

    const stagesOrder = ["male", "female", "other"]

    const getFill = React.useCallback((stage: string) => {
        const cfgColor = chartConfig[stage as keyof typeof chartConfig]?.color
        return cfgColor || `var(--color-${stage})`
    }, [])

    const aggregatedData = React.useMemo(() => {
        const map: Record<string, number> = {}
        for (const row of sourceData) {
            const key = (row.gender || "").toLowerCase()
            map[key] = (map[key] || 0) + (row.count ?? 0)
        }
        return stagesOrder.map((stage) => ({
            gender: stage,
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
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[300px]"
                    >
                        <PieChart>
                            <Pie data={aggregatedData} dataKey="value" nameKey="gender" />
                            <ChartLegend
                                content={<ChartLegendContent nameKey="gender" />}
                                className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                        </PieChart>
                    </ChartContainer>
            }
        </>
    )
}
