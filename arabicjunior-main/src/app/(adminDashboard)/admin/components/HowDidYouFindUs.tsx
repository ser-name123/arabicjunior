"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import useAuthAdmin from "@/hooks/useAuthAdmin"
import React from "react"
import Loader from "@/components/loader"

export const description = "A bar chart showing student acquisition sources"

const chartConfig = {
    students: {
        label: "Students",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig

export function HowDidYouFindUsChart() {
    const { token } = useAuthAdmin()
    const [sourceData, setSourceData] = React.useState<any>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/insights/how-find-us`,
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
    return (
        <>
            {
                loading ?
                    <Loader />
                    :
                    <ChartContainer config={chartConfig}>
                        <BarChart
                            accessibilityLayer
                            data={sourceData}
                            margin={{
                                top: 20,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="source"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar dataKey="count" fill="var(--color-students)" radius={8}>
                                <LabelList
                                    position="top"
                                    offset={12}
                                    className="fill-foreground"
                                    fontSize={12}
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
            }
        </>
    )
}
