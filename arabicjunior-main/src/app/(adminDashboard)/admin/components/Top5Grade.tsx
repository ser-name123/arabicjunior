"use client"

import { useEffect, useState } from "react"
import { LabelList, RadialBar, RadialBarChart } from "recharts"

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
} from "@/components/ui/chart"
import useAuthAdmin from "@/hooks/useAuthAdmin"
import Loader from "@/components/loader"

// Types for API response
interface GradeData {
    grade: number
    count: number
}

const colors = [
    "hsl(var(--chart-6))",
    "hsl(var(--chart-7))",
    "hsl(var(--chart-8))",
    "hsl(var(--chart-9))",
    "hsl(var(--chart-10))",
]

// Dynamic chart config generator
const generateChartConfig = (grades: GradeData[]) => {


    const config: ChartConfig = {
        count: { label: "Students" },
    }

    grades.forEach((item, index) => {
        config[`grade-${item.grade}`] = {
            label: `Grade ${item.grade}`,
            color: colors[index % colors.length],
        }
    })

    return config
}

export function Top5Grade() {
    const { token } = useAuthAdmin()
    const [loading, setLoading] = useState(true)
    const [chartData, setChartData] = useState<any[]>([])
    const [chartConfig, setChartConfig] = useState<ChartConfig>({})

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/insights/top-5-grades`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                )
                if (!res.ok) throw new Error("Failed to fetch data")
                const json = await res.json();
                const data: GradeData[] = json.data;

                // Format for Recharts
                const formatted = data.map((item, index) => ({
                    grade: `${item.grade}th Grade: ${item.count}`,
                    count: item.count,
                    fill: colors[index % colors.length],
                }))

                setChartData(formatted)
                setChartConfig(generateChartConfig(data))
            } catch (error) {
                console.error("Error fetching grades data:", error)
            } finally {
                setTimeout(() => {
                    setLoading(false)
                }, 500);
            }
        }

        fetchData()
    }, [])

    return (
        <>
            {loading ? <Loader /> : (
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <RadialBarChart
                        data={chartData}
                        startAngle={-90}
                        endAngle={380}
                        innerRadius={30}
                        outerRadius={110}
                    >
                        <ChartTooltip
                            cursor={false}
                            content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null
                                const data = payload[0]
                                console.log(data)
                                return (
                                    <div className="rounded-lg border bg-white p-2 shadow-sm">
                                        <p className="text-sm font-medium">
                                            {data.payload?.grade}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Students: {data.value}
                                        </p>
                                    </div>
                                )
                            }}
                        />
                        <RadialBar dataKey="count" background>
                            <LabelList
                                position="insideStart"
                                dataKey="grade"
                                className="fill-white capitalize mix-blend-luminosity"
                                fontSize={11}
                            />
                        </RadialBar>
                    </RadialBarChart>
                </ChartContainer>
            )}
        </>
    )
}
