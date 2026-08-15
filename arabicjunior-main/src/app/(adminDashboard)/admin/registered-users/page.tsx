"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/admin/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Input } from "@/components/ui/input-2"
import useAuthAdmin from "@/hooks/useAuthAdmin"
import { Calendar1, FileSpreadsheet, Search, User, UserCheck2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button-2"
import { DateRange } from "react-day-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar-2"

type User = {
    _id: string
    first_name: string
    last_name: string
    email: string
    phone_number: string
    class_grade: string
    school_name: string
    curriculum: string
    gender: string
    class_start_date: string
    preferred_time: string
    pricing_package: string
    preferred_days: any
    class_type: string
}

const columns: ColumnDef<User>[] = [
    { accessorKey: "first_name", header: "Firstname" },
    { accessorKey: "last_name", header: "Lastname" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone_number", header: "Phone" },
    { accessorKey: "class_grade", header: "Grade" },
    { accessorKey: "school_name", header: "School" },
    { accessorKey: "curriculum", header: "Curriculum" }
]

export default function UsersPage() {
    const { token } = useAuthAdmin()
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [data, setData] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

    // ⏳ Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search)
            setCurrentPage(1) // reset page whenever search changes
        }, 500)

        return () => clearTimeout(handler)
    }, [search])

    // 📡 Fetch API whenever debounced search or page changes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            console.log(token)
            try {
                const params = new URLSearchParams({
                    search: debouncedSearch,
                    page: currentPage.toString(),
                    limit: pageSize.toString(),
                })
                if (dateRange?.from) params.append("startDate", dateRange?.from.toISOString())
                if (dateRange?.to) params.append("endDate", dateRange?.to.toISOString())
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/registered-students?${params.toString()}`,
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
                setData(data ?? [])
                setTotalPages(json.pagination?.totalPages || 1)
            } catch (err) {
                console.error("Error fetching Users:", err)
                setData([])
            } finally {
                setTimeout(() => setLoading(false), 500)
            }
        }

        if (token) fetchData()
    }, [debouncedSearch, currentPage, pageSize, dateRange, token]) // ✅ use debouncedSearch, not raw search

    const handleExport = async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/registered-students/all`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            )
            if (!res.ok) throw new Error("Failed to fetch all users")

            const json = await res.json()
            const allUsers: User[] = json.data ?? []

            if (allUsers.length === 0) {
                alert("No users found to export")
                return
            }

            const worksheet = XLSX.utils.json_to_sheet(
                allUsers.map((u) => ({
                    ID: u._id,
                    "First Name": u.first_name,
                    "Last Name": u.last_name,
                    Email: u.email,
                    Phone: u.phone_number,
                    Gender: u.gender,
                    Grade: u.class_grade,
                    School: u.school_name,
                    Curriculum: u.curriculum,
                    "Class Type": u.class_type,
                    "Class Start Date": u.class_start_date
                        ? format(new Date(u.class_start_date), "dd-MM-yyyy")
                        : "-",
                    "Preferred Time": u.preferred_time,
                    "Preferred Days": Array.isArray(u.preferred_days)
                        ? u.preferred_days.join(", ")
                        : u.preferred_days,
                    "Pricing Package": u.pricing_package,
                }))
            )

            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, "Registered Users")
            XLSX.writeFile(workbook, "registered_users.xlsx")
        } catch (error) {
            console.error("Export error:", error)
        }
    }
    return (
        <div className="space-y-4">
            <div className="mb-7 flex items-center justify-between">
                <h3 className="text-2xl font-semibold flex items-center gap-1">
                    <UserCheck2 />
                    Registered Users
                </h3>

            </div>
            <div className="mb-7 flex items-center justify-between">
                {/* 🔍 Search Input */}
                <div className="relative max-w-xs">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-[34px] pl-8"
                    />
                </div>
                <div className="flex-col flex sm:flex-row items-start gap-4">
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
                        size={'sm'}
                        variant={'secondary'}
                        className="flex items-center gap-2  text-black text-xs h-8"
                    >
                        <FileSpreadsheet size={18} /> Export to Excel
                    </Button>
                </div>
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
                    setCurrentPage(1) // reset page when page size changes
                }}
                showActions={true} // ✅ enable actions
                actions={['view']}
                onAction={(type, row) => {
                    if (type === "view") {
                        setSelectedUser(row as User)
                    } else if (type === "edit") {
                        console.log("Edit user:", row)
                    } else if (type === "delete") {
                        console.log("Delete user:", row)
                    }
                }}
            />

            {/* View User Dialog */}
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="max-w-2xl max-h-[86vh] overflow-y-auto rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <User size={22} /> User Details
                        </DialogTitle>
                        <DialogDescription>
                            Full details of the selected registered student
                        </DialogDescription>
                    </DialogHeader>

                    {/* ✅ Scrollable content */}
                    <div className="space-y-6">
                        {/* Personal Details */}
                        <section>
                            <h4 className="text-base font-medium border-b">Personal Details</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm bg-muted/20 py-4 px-0.5">
                                <div>
                                    <p className="font- text-gray-600 -mb-0.5 text-xs">First Name</p>
                                    <p className="font-semibold text-sm">{selectedUser?.first_name}</p>
                                </div>
                                <div>
                                    <p className="font- text-gray-600 -mb-0.5 text-xs">Last Name</p>
                                    <p className="font-semibold text-sm">{selectedUser?.last_name}</p>
                                </div>
                                <div>
                                    <p className="font- text-gray-600 -mb-0.5 text-xs">Email</p>
                                    <p className="font-semibold text-sm">{selectedUser?.email}</p>
                                </div>
                                <div>
                                    <p className="font- text-gray-600 -mb-0.5 text-xs">Phone</p>
                                    <p className="font-semibold text-sm">{selectedUser?.phone_number}</p>
                                </div>
                                <div>
                                    <p className="font- text-gray-600 -mb-0.5 text-xs">Gender</p>
                                    <p className="font-semibold text-sm">{selectedUser?.gender}</p>
                                </div>
                            </div>
                        </section>

                        {/* School Details */}
                        <section>
                            <h4 className="text-base font-semibold border-b">School Details</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm bg-muted/20 py-4 px-0.5">
                                <div>
                                    <p className="font- text-gray-600 -mb-0.5 text-xs">School Name</p>
                                    <p className="font-semibold text-sm">{selectedUser?.school_name}</p>
                                </div>
                                <div>
                                    <p className="font- text-gray-600 -mb-0.5 text-xs">Grade</p>
                                    <p className="font-semibold text-sm">{selectedUser?.class_grade}</p>
                                </div>
                                <div>
                                    <p className="font- text-gray-600 -mb-0.5 text-xs">Class Type</p>
                                    <p className="font-semibold text-sm">{selectedUser?.class_type}</p>
                                </div>
                                <div>
                                    <p className="font- text-gray-600 -mb-0.5 text-xs">Curriculum</p>
                                    <p className="font-semibold text-sm">{selectedUser?.curriculum}</p>
                                </div>
                            </div>
                        </section>

                        {/* Other Details */}
                        <section>
                            <h4 className="text-base font-semibold border-b">Other Details</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm bg-muted/20 py-4 px-0.5">
                                <div>
                                    <p className="font- text-gray-600 -mb-0.5 text-xs">Class Start</p>
                                    <p className="font-semibold text-sm">{format(selectedUser?.class_start_date ?? new Date(), 'dd-MM-yyyy')}</p>
                                </div>
                                <div>
                                    <p className="font- text-gray-600 -mb-0.5 text-xs">Preferred Time</p>
                                    <p className="font-semibold text-sm">{selectedUser?.preferred_time}</p>
                                </div>
                                <div>
                                    <p className="font- text-gray-600 -mb-0.5 text-xs">Package</p>
                                    <p className="font-semibold text-sm">{selectedUser?.pricing_package}</p>
                                </div>
                                <div className="col-span-3">
                                    <p className="font- text-gray-600 -mb-0.5 text-xs">Prefreed Days</p>
                                    <p className="font-semibold text-sm">
                                        {selectedUser?.preferred_days?.join(', ')}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                </DialogContent>
            </Dialog>
        </div>
    )
}