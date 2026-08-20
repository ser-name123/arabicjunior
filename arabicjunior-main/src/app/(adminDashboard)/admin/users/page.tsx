"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/admin/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Input } from "@/components/ui/input-2"
import useAuthAdmin from "@/hooks/useAuthAdmin"
import { Calendar1, FileSpreadsheet, Search, Trash2, User, Users2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"

// Attended Cell Component
const AttendedCell = ({ row, getValue, token }: { row: any; getValue: any; token: string }) => {
    const value = !!(getValue() as boolean)
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedValue, setSelectedValue] = useState(value)

    const handleChange = (newValue: boolean) => {
        setSelectedValue(newValue)
        setOpenDialog(true)
    }

    const confirmChange = async () => {
        setOpenDialog(false)
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/trial-users/${row.original._id}/attendance`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ attended: selectedValue }),
                }
            )
            if (!res.ok) throw new Error("Failed to update status")
            toast.success('Attendance updated successfully.!');
        } catch (error) {
            console.error(error)
            toast.error("Failed to update attendance")
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Switch
                checked={selectedValue}
                onCheckedChange={handleChange}
            />
            {openDialog && (
                <div className="flex gap-2">
                    <Button size="sm" onClick={confirmChange}>Confirm</Button>
                    <Button size="sm" variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
                </div>
            )}
        </div>
    )
}
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button-2"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar-2"

type User = {
    _id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    grade: number
    howManyJoin: string
    preferredTeacher: string
    classStartDate: string
    classStartTime: string
    howFindUs: string
    userIP: string
    clientInfo?: {
        userAgent?: string
        browser?: string
        operatingSystem?: string
        deviceType?: string
        timezone?: string
        gmtOffset?: string
        localTime?: string
        language?: string
        languages?: string
        screenSize?: string
        viewportSize?: string
        pixelRatio?: string
        colorDepth?: string
        cpuCores?: string
        deviceMemory?: string
        touchSupport?: string
        connectionType?: string
        referrer?: string
        pageUrl?: string
        ipAddress?: string
        country?: string
        countryCode?: string
        region?: string
        city?: string
        postalCode?: string
        ipTimezone?: string
        isp?: string
        lookupError?: string
    }
    gender: string
    attended: boolean
    createdAt?: any
}

/** One label + value cell. Falls back to a dash when the browser withheld it. */
const Detail = ({ label, value }: { label: string; value?: string }) => (
    <div>
        <p className="text-xs text-gray-600">{label}</p>
        <p className="font-semibold break-words">{value || "-"}</p>
    </div>
)

export default function TrialUsersPage() {
    const { token } = useAuthAdmin()
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [_attended, setAttended] = useState<'all' | 'true' | 'false'>('all')
    const [data, setData] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
    const [deletingUser, setDeletingUser] = useState<User | null>(null)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

    const [selectedRows, setSelectedRows] = useState<User[]>([])
    /** Bumped after a delete or a filter change to clear the ticked rows. */
    const [selectionKey, setSelectionKey] = useState(0)
    const [openBulkDialog, setOpenBulkDialog] = useState(false)
    const [bulkDeleting, setBulkDeleting] = useState(false)

    const columns: ColumnDef<User>[] = [
        { accessorKey: "firstName", header: "Firstname" },
        { accessorKey: "lastName", header: "Lastname" },
        { accessorKey: "email", header: "Email" },
        { accessorKey: "phoneNumber", header: "Phone" },
        { accessorKey: "grade", header: "Grade" },
        { accessorKey: "preferredTeacher", header: "Preferred Teacher" },
        { accessorKey: "howFindUs", header: "How Found Us" },
        {
            accessorKey: "attended",
            header: "Attended",
            cell: ({ row, getValue }) => (
                <AttendedCell row={row} getValue={getValue} token={token || ""} />
            ),
        },

    ]

    // ⏳ Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search)
            setCurrentPage(1) // reset page whenever search changes
        }, 500)

        return () => clearTimeout(handler)
    }, [search])

    const fetchData = async () => {
        setLoading(true)
        console.log(token)
        try {
            const params = new URLSearchParams({
                search: debouncedSearch,
                page: currentPage.toString(),
                limit: pageSize.toString(),
                attended: _attended.toString()
            })
            if (dateRange?.from) params.append("startDate", dateRange?.from.toISOString())
            if (dateRange?.to) params.append("endDate", dateRange?.to.toISOString())
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/trial-users?${params.toString()}`,
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
            setTotal(json.pagination?.total ?? 0)
        } catch (err) {
            console.error("Error fetching Users:", err)
            setData([])
        } finally {
            setTimeout(() => setLoading(false), 500)
        }
    }
    // 📡 Fetch API whenever debounced search or page changes
    useEffect(() => {
        if (token) fetchData()
    }, [debouncedSearch, currentPage, pageSize, dateRange, token, _attended]) // ✅ use debouncedSearch, not raw search

    // Ticks must not survive a page or filter change: the rows behind them are
    // gone, and a later bulk delete would hit records nobody looked at.
    useEffect(() => {
        setSelectedRows([])
        setSelectionKey((k) => k + 1)
    }, [currentPage, pageSize, dateRange, debouncedSearch, _attended])

    const handleBulkDelete = async () => {
        if (!selectedRows.length || !token) return

        setBulkDeleting(true)
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/trial-users/delete-many`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ids: selectedRows.map((u) => u._id) }),
                }
            )
            const json = await res.json().catch(() => null)
            if (!res.ok) throw new Error(json?.message || "Failed to delete")

            toast.success(json?.message || "Trial students deleted")

            // The page may now be past the end — after deleting the only rows on
            // page 4, staying there would show "No results".
            const remaining = total - selectedRows.length
            const lastPage = Math.max(1, Math.ceil(remaining / pageSize))
            if (currentPage > lastPage) {
                setCurrentPage(lastPage)
            } else {
                fetchData()
            }

            setSelectedRows([])
            setSelectionKey((k) => k + 1)
            setOpenBulkDialog(false)
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "Failed to delete")
        } finally {
            setBulkDeleting(false)
        }
    }

    const handleDeleteUser = async () => {
        if (!deletingUser || !token) return
        toast.loading("Deleting trial user...", { id: "trial-delete" })
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/trial-users/${deletingUser._id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            )
            if (!res.ok) throw new Error("Failed to delete user")
            toast.success("Trial user deleted successfully!", { id: "trial-delete" })
            setOpenDeleteDialog(false)
            setDeletingUser(null)
            setSelectedRows([])
            setSelectionKey((k) => k + 1)
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete user", { id: "trial-delete" })
        }
    }

    const handleExport = async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/trial-users/all`,
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
                alert("No trial users found to export")
                return
            }

            const worksheet = XLSX.utils.json_to_sheet(
                allUsers.map((u) => ({
                    ID: u._id,
                    "First Name": u.firstName,
                    "Last Name": u.lastName,
                    Email: u.email,
                    Phone: u.phoneNumber,
                    Gender: u.gender,
                    Grade: u.grade,
                    "Preferred Teacher": u.preferredTeacher,
                    "How Many Join": u.howManyJoin,
                    "Class Start Date": u.classStartDate ? format(new Date(u.classStartDate), "dd-MM-yyyy") : "-",
                    "Class Start Time": u.classStartTime,
                    "How Found Us": u.howFindUs,
                    "Attended": u.attended ? "Yes" : "No",
                    "City": u.userIP
                }))
            )

            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, "Trial Students")
            XLSX.writeFile(workbook, "trial_users.xlsx")
        } catch (error) {
            console.error("Export error:", error)
        }
    }
    return (
        <div className="space-y-4">
            <div className="mb-7 flex items-center justify-between">
                <h3 className="text-2xl font-semibold flex items-center gap-2">
                    <Users2 />
                    Trial Students
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-600">
                        {total.toLocaleString()}
                        {/* Says "found" when a search or filter is on, so the number
                            is never mistaken for the whole list. */}
                        {debouncedSearch || dateRange?.from || dateRange?.to || _attended !== "all"
                            ? " found"
                            : " total"}
                    </span>
                </h3>

            </div>
            <div className="mb-7 flex flex-col sm:flex-row gap-4 sm:gap-4 sm:items-center justify-between">
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
                    <div className="flex items-center gap-1">
                        <Label className="text-xs">Attended: </Label>
                        <Select
                            value={_attended}
                            onValueChange={(value: any) => setAttended(value)}
                        >
                            <SelectTrigger className="h-8 w-[140px] text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={'all'}>
                                    All
                                </SelectItem>
                                <SelectItem value={'true'}>
                                    Attended
                                </SelectItem>
                                <SelectItem value={'false'}>
                                    Not Attended
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedRows.length > 0 && (
                        <Button
                            onClick={() => setOpenBulkDialog(true)}
                            size={'sm'}
                            variant={'destructive'}
                            className="flex mt-0 items-center gap-2 text-xs h-8"
                        >
                            <Trash2 size={16} /> Delete selected ({selectedRows.length})
                        </Button>
                    )}

                    <Button
                        onClick={handleExport}
                        size={'sm'}
                        variant={'secondary'}
                        className="flex mt-0 items-center gap-2  text-black text-xs h-8"
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
                enableSelection
                onSelectionChange={(rows) => setSelectedRows(rows as User[])}
                selectionResetKey={selectionKey}
                showActions={true} // ✅ enable actions
                actions={['view', 'delete']}
                onAction={(type, row) => {
                    if (type === "view") {
                        setSelectedUser(row as User)
                    } else if (type === "delete") {
                        setDeletingUser(row as User)
                        setOpenDeleteDialog(true)
                    }
                }}
            />

            {/* View User Dialog */}
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="max-w-2xl max-h-[86vh] overflow-y-auto rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <User size={22} />Trial User Details
                        </DialogTitle>
                        <DialogDescription>
                            Full details of the selected trial student
                        </DialogDescription>
                    </DialogHeader>

                    {/* ✅ Scrollable content */}
                    <div className="space-y-6">
                        {/* Personal Details */}
                        <section>
                            <h4 className="text-base font-medium border-b">Personal Details</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm bg-muted/20 py-4 px-0.5">
                                <div>
                                    <p className="font- text-gray-600 -mb-0.5 text-xs">First Name</p>
                                    <p className="font-semibold text-sm">{selectedUser?.firstName}</p>
                                </div>
                                <div>
                                    <p className="font- text-gray-600 -mb-0.5 text-xs">Last Name</p>
                                    <p className="font-semibold text-sm">{selectedUser?.lastName}</p>
                                </div>
                                <div>
                                    <p className="font- text-gray-600 -mb-0.5 text-xs">Email</p>
                                    <p className="font-semibold text-sm">{selectedUser?.email}</p>
                                </div>
                                <div>
                                    <p className="font- text-gray-600 -mb-0.5 text-xs">Phone</p>
                                    <p className="font-semibold text-sm">{selectedUser?.phoneNumber}</p>
                                </div>
                                <div>
                                    <p className="font- text-gray-600 -mb-0.5 text-xs">Gender</p>
                                    <p className="font-semibold text-sm">{selectedUser?.gender}</p>
                                </div>
                            </div>
                        </section>

                        {/* School Details */}
                        <section>
                            <h4 className="text-base font-semibold border-b">Class Details</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm bg-muted/20 py-4 px-0.5">
                                <div><p className="text-xs text-gray-600">Grade</p><p className="font-semibold">{selectedUser?.grade}</p></div>
                                <div><p className="text-xs text-gray-600">Preferred Teacher</p><p className="font-semibold">{selectedUser?.preferredTeacher}</p></div>
                                <div><p className="text-xs text-gray-600">Class Start Date</p><p className="font-semibold">{selectedUser?.classStartDate ? format(new Date(selectedUser.classStartDate), "dd-MM-yyyy") : "-"}</p></div>
                                <div><p className="text-xs text-gray-600">Class Start Time</p><p className="font-semibold">{selectedUser?.classStartTime}</p></div>
                                <div><p className="text-xs text-gray-600">Attended</p>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${selectedUser?.attended
                                            ? "bg-green-100 text-green-800" // attended
                                            : "bg-red-100 text-red-800"     // not attended
                                            }`}
                                    >
                                        {selectedUser?.attended ? "Yes" : "No"}
                                    </span></div>
                                <div>
                                    <p className="text-xs text-gray-600">Registered At</p>
                                    <p className="font-semibold">{selectedUser?.createdAt ? format(new Date(selectedUser.createdAt), "dd-MM-yyyy") : "-"}</p>
                                </div>
                            </div>
                        </section>

                        {/* Other Details */}
                        <section>
                            <h4 className="text-base font-semibold border-b">Other Details</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm bg-muted/20 py-4 px-0.5">
                                <div><p className="text-xs text-gray-600">How Found Us</p><p className="font-semibold">{selectedUser?.howFindUs}</p></div>
                                <div><p className="text-xs text-gray-600">City</p><p className="font-semibold">{selectedUser?.userIP}</p></div>
                                <div><p className="text-xs text-gray-600">How Many Join</p><p className="font-semibold">{selectedUser?.howManyJoin}</p></div>
                            </div>
                        </section>

                        {/* Anything submitted before this was captured has no
                            clientInfo at all, so the whole block is hidden
                            rather than showing a grid of dashes. */}
                        {selectedUser?.clientInfo ? (
                            <>
                                <section>
                                    <h4 className="text-base font-semibold border-b">Device &amp; Browser</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm bg-muted/20 py-4 px-0.5">
                                        <Detail label="Device" value={selectedUser.clientInfo.deviceType} />
                                        <Detail label="Operating System" value={selectedUser.clientInfo.operatingSystem} />
                                        <Detail label="Browser" value={selectedUser.clientInfo.browser} />
                                        <Detail label="Screen" value={selectedUser.clientInfo.screenSize} />
                                        <Detail label="Window" value={selectedUser.clientInfo.viewportSize} />
                                        <Detail label="Pixel Ratio" value={selectedUser.clientInfo.pixelRatio} />
                                        <Detail label="Colour Depth" value={selectedUser.clientInfo.colorDepth} />
                                        <Detail label="CPU Cores" value={selectedUser.clientInfo.cpuCores} />
                                        <Detail label="Device Memory" value={selectedUser.clientInfo.deviceMemory} />
                                        <Detail label="Touch Screen" value={selectedUser.clientInfo.touchSupport} />
                                        <Detail label="Connection" value={selectedUser.clientInfo.connectionType} />
                                        <Detail label="Language" value={selectedUser.clientInfo.language} />
                                    </div>
                                    {selectedUser.clientInfo.userAgent && (
                                        <p className="px-0.5 pb-3 text-[11px] leading-relaxed text-gray-500 break-all">
                                            <span className="font-semibold">User Agent:</span>{" "}
                                            {selectedUser.clientInfo.userAgent}
                                        </p>
                                    )}
                                </section>

                                <section>
                                    <h4 className="text-base font-semibold border-b">Time Zone</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm bg-muted/20 py-4 px-0.5">
                                        <Detail label="GMT Offset" value={selectedUser.clientInfo.gmtOffset} />
                                        <Detail label="Time Zone" value={selectedUser.clientInfo.timezone} />
                                        <Detail label="Time Zone (by IP)" value={selectedUser.clientInfo.ipTimezone} />
                                        <div className="col-span-2 sm:col-span-3">
                                            <p className="text-xs text-gray-600">Their Local Time When Submitting</p>
                                            <p className="font-semibold">{selectedUser.clientInfo.localTime || "-"}</p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-base font-semibold border-b">Location &amp; Network</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm bg-muted/20 py-4 px-0.5">
                                        <Detail label="IP Address" value={selectedUser.clientInfo.ipAddress} />
                                        <Detail label="Country" value={selectedUser.clientInfo.country} />
                                        <Detail label="Region" value={selectedUser.clientInfo.region} />
                                        <Detail label="City" value={selectedUser.clientInfo.city} />
                                        <Detail label="Postal Code" value={selectedUser.clientInfo.postalCode} />
                                        <Detail label="Internet Provider" value={selectedUser.clientInfo.isp} />
                                    </div>
                                    {selectedUser.clientInfo.lookupError && (
                                        <p className="px-0.5 pb-3 text-[11px] text-amber-700">
                                            IP lookup did not return a location: {selectedUser.clientInfo.lookupError}
                                        </p>
                                    )}
                                </section>

                                <section>
                                    <h4 className="text-base font-semibold border-b">Where They Came From</h4>
                                    <div className="grid grid-cols-1 gap-3 text-sm bg-muted/20 py-4 px-0.5">
                                        <div>
                                            <p className="text-xs text-gray-600">Referrer</p>
                                            <p className="font-semibold break-all">
                                                {selectedUser.clientInfo.referrer || "Typed the address in, or came from a bookmark"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Form Page</p>
                                            <p className="font-semibold break-all">
                                                {selectedUser.clientInfo.pageUrl || "-"}
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            </>
                        ) : (
                            <p className="rounded-lg bg-muted/40 p-3 text-xs text-gray-500">
                                No device information — this enquiry was submitted before it
                                started being recorded.
                            </p>
                        )}
                    </div>

                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                <DialogContent className="max-w-md bg-white text-black p-6 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Delete Trial User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-neutral-500">
                            Are you sure you want to delete the trial registration for{" "}
                            <strong>
                                {deletingUser?.firstName} {deletingUser?.lastName}
                            </strong>
                            ? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setOpenDeleteDialog(false)
                                    setDeletingUser(null)
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteUser}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Confirmation. Names who is going, not just how many —
                deleting a trial signup cannot be undone. */}
            <Dialog open={openBulkDialog} onOpenChange={setOpenBulkDialog}>
                <DialogContent className="max-w-md bg-white text-black p-6 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            Delete {selectedRows.length} trial student
                            {selectedRows.length === 1 ? "" : "s"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-neutral-500">
                            This permanently removes the selected signups. It cannot be
                            undone.
                        </p>

                        <ul className="max-h-40 overflow-y-auto rounded-lg bg-muted/40 p-3 text-xs">
                            {selectedRows.slice(0, 20).map((u) => (
                                <li key={u._id} className="truncate">
                                    {u.firstName} {u.lastName} &mdash; {u.email}
                                </li>
                            ))}
                            {selectedRows.length > 20 && (
                                <li className="pt-1 font-semibold">
                                    …and {selectedRows.length - 20} more
                                </li>
                            )}
                        </ul>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                disabled={bulkDeleting}
                                onClick={() => setOpenBulkDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleBulkDelete}
                                disabled={bulkDeleting}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                {bulkDeleting ? "Deleting…" : "Delete"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}