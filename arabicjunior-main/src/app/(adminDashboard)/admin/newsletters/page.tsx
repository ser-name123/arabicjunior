"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/admin/data-table"
import { ColumnDef } from "@tanstack/react-table"
import useAuthAdmin from "@/hooks/useAuthAdmin"
import { Calendar1, FileSpreadsheet, Mail } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button-2"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar-2"
import { DateRange } from "react-day-picker"

type Newsletter = {
    _id: string
    email: string
    action_taken: "subscribed" | "unsubscribed"
    action_date?: string
    createdAt: string
    updatedAt: string
}

const columns: ColumnDef<Newsletter>[] = [
    { accessorKey: "email", header: "Email" },
    {
        accessorKey: "action_taken", header: "Status",
        cell: ({ row }) => (


            <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${row.original.action_taken === 'subscribed'
                    ? "bg-green-100 text-green-800" // attended
                    : "bg-red-100 text-red-800"     // not attended
                    }`}
            >
                {row.original.action_taken}
            </span>
        ),

    },
    {
        accessorKey: "action_date",
        header: "Action Date",
        cell: ({ row }) => row.original.action_date ? format(new Date(row.original.action_date), "dd-MM-yyyy") : "-"
    },
    {
        accessorKey: "createdAt",
        header: "Subscribed On",
        cell: ({ row }) => format(new Date(row.original.createdAt), "dd-MM-yyyy")
    }
]

export default function NewslettersPage() {
    const { token } = useAuthAdmin()
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
    const [data, setData] = useState<Newsletter[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null)


    // Fetch newsletters
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams({
                    page: currentPage.toString(),
                    limit: pageSize.toString(),
                })
                if (dateRange?.from) params.append("startDate", dateRange?.from.toISOString())
                if (dateRange?.to) params.append("endDate", dateRange?.to.toISOString())

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/newsletter/get?${params.toString()}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (!res.ok) throw new Error("Failed to fetch newsletters")
                const json = await res.json()
                setData(json.data ?? [])
                setTotalPages(json.pagination?.totalPages || 1)
            } catch (err) {
                console.error(err)
                setData([])
            } finally {
                setTimeout(() => setLoading(false), 500)
            }
        }

        if (token) fetchData()
    }, [currentPage, pageSize, dateRange, token])

    const handleExport = async () => {
        try {
            const params = new URLSearchParams({})
            if (dateRange?.from) params.append("startDate", dateRange?.from.toISOString())
            if (dateRange?.to) params.append("endDate", dateRange?.to.toISOString())

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/newsletter/get/all?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Failed to fetch all newsletters")
            const json = await res.json()
            const allNewsletters: Newsletter[] = json.data ?? []

            if (!allNewsletters.length) {
                alert("No newsletters to export")
                return
            }

            const worksheet = XLSX.utils.json_to_sheet(
                allNewsletters.map(n => ({
                    ID: n._id,
                    Email: n.email,
                    Status: n.action_taken,
                    "Action Date": n.action_date ? format(new Date(n.action_date), "dd-MM-yyyy") : "-",
                    "Subscribed On": format(new Date(n.createdAt), "dd-MM-yyyy")
                }))
            )
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, "Newsletters")
            XLSX.writeFile(workbook, "newsletters.xlsx")
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-4">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-2xl font-semibold flex items-center gap-1">
                    <Mail /> Newsletters
                </h3>
            </div>

            <div className="mb-7 flex gap-4 items-center justify-end">
                <Popover>
                    <PopoverTrigger asChild>
                        <div className="relative max-w-xs">
                            <Calendar1 className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

                            <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                    "w-[240px] h-8 pl-8 justify-start text-left font-normal",
                                    !dateRange?.from && "text-muted-foreground"
                                )}
                            >
                                {dateRange?.from ? (
                                    dateRange?.to ? (
                                        <>
                                            {format(dateRange?.from, "LLL dd, y")} - {format(dateRange?.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange?.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                            className="text-xs"
                        />
                    </PopoverContent>
                </Popover>
                <Button
                    onClick={handleExport}
                    size="sm"
                    variant="secondary"
                    className="flex items-center gap-2 text-black text-xs h-8"
                >
                    <FileSpreadsheet size={18} /> Export to Excel
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={data}
                loading={loading}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                    setPageSize(size)
                    setCurrentPage(1)
                }}
                showActions={true}
                actions={["view"]}
                onAction={(type, row) => {
                    if (type === "view") setSelectedNewsletter(row as Newsletter)
                }}
            />

            {/* View Newsletter Dialog */}
            <Dialog open={!!selectedNewsletter} onOpenChange={() => setSelectedNewsletter(null)}>
                <DialogContent className="max-w-lg rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <Mail size={22} /> Newsletter Details
                        </DialogTitle>
                        <DialogDescription>Full details of the selected newsletter subscriber</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4 text-sm bg-muted/20 p-4 rounded-lg">
                        <p><strong>Email:</strong> {selectedNewsletter?.email}</p>
                        <p><strong>Status:</strong> {selectedNewsletter?.action_taken}</p>
                        <p><strong>Action Date:</strong> {selectedNewsletter?.action_date ? format(new Date(selectedNewsletter.action_date), "dd-MM-yyyy") : "-"}</p>
                        <p><strong>Subscribed On:</strong> {selectedNewsletter && format(new Date(selectedNewsletter.createdAt), "dd-MM-yyyy")}</p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
