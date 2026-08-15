"use client"

import { Pie, PieChart } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"

export const description = "A pie chart with a legend"

const chartData = [
    { gender: "male", total: 275, fill: "var(--color-male)" },
    { gender: "female", total: 200, fill: "var(--color-female)" },
]

const chartConfig = {
    total: {
        label: "total",
    },
    male: {
        label: "Male",
        color: "hsl(var(--chart-1))",
    },
    female: {
        label: "Female",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export function TotalTrialsGenderWise() {
    return (
        <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
        >
            <PieChart>
                <Pie data={chartData} dataKey="total" />
                <ChartLegend
                    content={<ChartLegendContent nameKey="gender" />}
                    className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                />
            </PieChart>
        </ChartContainer>
    )
}
