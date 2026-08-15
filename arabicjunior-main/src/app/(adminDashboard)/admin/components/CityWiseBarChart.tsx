"use client"

import { Bar, BarChart, CartesianGrid, Cell, Rectangle, XAxis } from "recharts"

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import useAuthAdmin from "@/hooks/useAuthAdmin"
import React from "react"
import Loader from "@/components/loader"

export function CityWiseChart() {
    const { token } = useAuthAdmin()
    const [sourceData, setSourceData] = React.useState<any>([])
    const [loading, setLoading] = React.useState(true)
    const [cityConfig, setCityConfig] = React.useState<ChartConfig>({
        count: { label: "Students" },
    })

    const colorPalette = [
        "hsl(var(--chart-12))",
        "hsl(var(--chart-6))",
        "hsl(var(--chart-7))",
        "hsl(var(--chart-8))",
        "hsl(var(--chart-9))",
        "hsl(var(--chart-10))",
        "hsl(var(--chart-11))",
    ]

    React.useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/insights/city-wise-students`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                )
                if (!res.ok) throw new Error("Failed to fetch data")

                const json = await res.json()
                const data: any[] = json.data

                // 🔹 Dynamically build config & attach fill colors
                const dynamicConfig: ChartConfig = {
                    count: { label: "Students" },
                }

                const mapped = data.map((item, index) => {
                    const cityKey = item.city?.toLowerCase() || "unknown"
                    const color = colorPalette[index % colorPalette.length] // cycle if more than palette
                    dynamicConfig[cityKey] = {
                        label: item.city || "Unknown",
                        color,
                    }
                    return { ...item, fill: color }
                })

                setCityConfig(dynamicConfig)
                setSourceData(mapped)
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
    }, [token])

    return (
        <>
            {
                loading ?
                    <Loader />
                    :
                    <ChartContainer config={cityConfig}>
                        <BarChart accessibilityLayer data={sourceData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="city"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) =>
                                    cityConfig[value.toLowerCase() as keyof typeof cityConfig]?.label ??
                                    value
                                }
                            />
                            {/* <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} /> */}
                            <ChartTooltip
                                cursor={false}
                                content={({ active, payload, label }) => {
                                    if (!active || !payload?.length) return null
                                    const data = payload[0]
                                    return (
                                        <div className="rounded-lg border bg-white p-2 shadow-sm">
                                            <p className="text-sm font-medium">
                                                City: {label}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Students: {data.value}
                                            </p>
                                        </div>
                                    )
                                }}
                            />
                            <Bar
                                dataKey="count"
                                strokeWidth={2}
                                radius={8}
                                activeIndex={2}
                                activeBar={({ ...props }) => (
                                    <Rectangle
                                        {...props}
                                        fillOpacity={0.8}
                                        stroke={props.payload.fill}
                                        strokeDasharray={4}
                                        strokeDashoffset={4}
                                    />
                                )}
                            >
                                {sourceData.map((entry: any, index: any) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>}
        </>
        // <ChartContainer config={cityConfig}>
        //     <BarChart accessibilityLayer data={sourceData}>
        //         <CartesianGrid vertical={false} />
        //         <XAxis
        //             dataKey="city"
        //             tickLine={false}
        //             tickMargin={10}
        //             axisLine={false}
        //             tickFormatter={(value) =>
        //                 cityConfig[value.toLowerCase() as keyof typeof cityConfig]?.label
        //             }
        //         />
        //         <ChartTooltip
        //             cursor={false}
        //             content={<ChartTooltipContent hideLabel />}
        //         />
        //         <Bar
        //             dataKey="count"
        //             strokeWidth={2}
        //             radius={8}
        //             activeIndex={2} // highlight Hyderabad
        //             activeBar={({ ...props }) => {
        //                 return (
        //                     <Rectangle
        //                         {...props}
        //                         fillOpacity={0.8}
        //                         stroke={props.payload.fill}
        //                         strokeDasharray={4}
        //                         strokeDashoffset={4}
        //                     />
        //                 )
        //             }}
        //         />
        //     </BarChart>
        // </ChartContainer>
    )
}
