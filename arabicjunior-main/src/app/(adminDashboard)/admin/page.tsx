"use client"
import React from "react";
import { SectionCards } from "./components/section-cards";
import { ConversionFunnelChart } from "./components/ConversionFunnelChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar1, ChartPie } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button-2";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar-2";
import { PreferredTeacherGenderWise } from "./components/PreferredTeacherGenderWise";
import { HowDidYouFindUsChart } from "./components/HowDidYouFindUs";
import { CityWiseChart } from "./components/CityWiseBarChart";
import { ChartLineTrialVsRegistered } from "./components/ChartLineTrialVsRegistered";
import { Top5Grade } from "./components/Top5Grade";
import Top5Curriculams from "./components/Top5Curriculams";
import Top5PreferredTimes from "./components/Top5PreferredTimes";

const AdminDashboardPage = () => {
  const [timeRange, setTimeRange] = React.useState<any>("30d");
  const [conversionRate, setConversionRate] = React.useState<number>(0);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  return (
    <div aria-label="admin-overview">
      <div aria-describedby="main-wrapper" className="space-y-6">
        <SectionCards />

        <div className="flex justify-between items-center pt-2">
          <h2 className="text-2xl font-bold flex items-center gap-1">
            <ChartPie size={22} />
            Analytics
          </h2>
          <Select value={timeRange}
            onValueChange={(value) => {
              setTimeRange(value);
              if (value !== "custom") {
                setDateRange(undefined);
              }
            }}>
            <SelectTrigger
              className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          {timeRange === "custom" && (
            <div className="relative max-w-xs ml-4">
              <Calendar1 className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size={'sm'}
                    className={cn(
                      "w-[240px] pl-8 justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <div className="grid gap-3 my-3 grid-cols-1 lg:grid-cols-[65%_34%]">
          <Card className="pt-0 h-full">
            <CardHeader className="flex items-center gap-2 space-y-0 p-4 sm:flex-row">
              <div className="grid flex-1 gap-1">
                <CardTitle>Enrollment Trends - Trial vs Registered</CardTitle>
                <CardDescription className="text-xs">
                  Compare daily trial bookings and confirmed student registrations over the selected timeframe.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <ChartLineTrialVsRegistered timeRange={timeRange} dateRange={dateRange} />
            </CardContent>
          </Card>

          <Card className="pt-0 h-full">
            <CardHeader className="p-4">
              <CardTitle>Conversion Funnel - Trial to Registration</CardTitle>
              <CardDescription className="text-xs">Track trial bookings, attendance, and student registrations over the selected period</CardDescription>
            </CardHeader>
            <CardContent className="lg:py-6">
              <ConversionFunnelChart conversionRate={setConversionRate} timeRange={timeRange} dateRange={dateRange} />
            </CardContent >
            <CardFooter className="flex flex-col gap-2 text-sm pb-0">
              <div className="flex gap-2 leading-none font-medium">
                Conversion Rate:{" "}
                <span className="text-green-600 font-semibold">{conversionRate}%</span>
              </div>
              <div className="text-muted-foreground text-xs leading-none">
                Based on total trials booked vs student registrations
              </div>
            </CardFooter>
          </Card >
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 my-3">
          {/* <Card className="pt-0 h-full">
            <CardHeader className="px-4 py-4">
              <CardTitle>Total Trial Students</CardTitle>
              <CardDescription className="text-xs">Visual representation of trial student count by gender</CardDescription>
            </CardHeader>
            <CardContent className="p-2 py-0">
              <TotalTrialsGenderWise />
            </CardContent>
          </Card> */}

          <Card className="pt-0 h-full">
            <CardHeader className="px-4 py-4">
              <CardTitle>Teacher Gender Preference</CardTitle>
              <CardDescription className="text-xs">Distribution of trial students by preferred teacher gender</CardDescription>
            </CardHeader>
            <CardContent className="p-2 py-0">
              <PreferredTeacherGenderWise />
            </CardContent>
          </Card>

          <Card className="pt-0 h-full">
            <CardHeader className="px-4 py-4">
              <CardTitle>How Did You Find Us</CardTitle>
              <CardDescription className="text-xs">Sources reported by trial students</CardDescription>
            </CardHeader>
            <CardContent className="p-4 lg:py-14">
              <HowDidYouFindUsChart />
            </CardContent>
          </Card>
          <Card className="pt-0 h-full">
            <CardHeader className="px-4 py-4">
              <CardTitle>City Wise Students</CardTitle>
              <CardDescription className="text-xs">
                Number of trial students from each city
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 lg:py-14">
              <CityWiseChart />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 my-3">
          <Card className="pt-0 h-full">
            <CardHeader className="px-4 py-4">
              <CardTitle>Top 5 Grades - Registered Students</CardTitle>
              <CardDescription className="text-xs">Distribution of student registrations across the top 5 grades</CardDescription>
            </CardHeader>
            <CardContent className="p-2 lg:py-12">
              <Top5Grade />
            </CardContent>
          </Card>

          <Card className="pt-0 h-full">
            <CardHeader className="px-4 py-4">
              <CardTitle>Top 5 Curriculums - Registered Students</CardTitle>
              <CardDescription className="text-xs">
                Most popular curriculums ranked by student registrations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <Top5Curriculams />
            </CardContent>
          </Card>

          <Card className="pt-0 h-full">
            <CardHeader className="px-4 py-4">
              <CardTitle>Top 5 Preferred Time - Registered Students</CardTitle>
              <CardDescription className="text-xs">
                Most chosen time slots ranked by student registrations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <Top5PreferredTimes />
            </CardContent>
          </Card>

        </div>
      </div>

    </div>
  );
};

export default AdminDashboardPage;
