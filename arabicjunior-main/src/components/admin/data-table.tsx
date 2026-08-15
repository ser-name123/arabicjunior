"use client"

import * as React from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import Loader from "../loader"
import { Eye, Pencil, Trash2 } from "lucide-react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    pageSize: number
    onPageSizeChange: (size: number) => void
    loading?: boolean

    showActions?: boolean
    actions?: ("view" | "edit" | "delete")[]
    onAction?: (type: "view" | "edit" | "delete", row: TData) => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    currentPage,
    totalPages,
    onPageChange,
    pageSize,
    onPageSizeChange,
    loading = false,
    showActions = false,
    actions = [],
    onAction,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const actionColumn: ColumnDef<TData, any> = {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <div className="flex gap-2 justify-center">
                {actions?.includes("view") && (
                    <Eye
                        className="w-4 h-4 cursor-pointer text-orange-500 hover:text-orange-600"
                        onClick={() => onAction?.("view", row.original)}
                    />
                )}
                {actions?.includes("edit") && (
                    <Pencil
                        className="w-4 h-4 cursor-pointer text-green-500 hover:text-green-700"
                        onClick={() => onAction?.("edit", row.original)}
                    />
                )}
                {actions?.includes("delete") && (
                    <Trash2
                        className="w-4 h-4 cursor-pointer text-red-500 hover:text-red-700"
                        onClick={() => onAction?.("delete", row.original)}
                    />
                )}
            </div>
        ),
    }

    const finalColumns = React.useMemo(
        () => (showActions ? [...columns, actionColumn] : columns),
        [columns, showActions]
    )

    const table = useReactTable({
        data,
        columns: finalColumns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
        },
        manualPagination: true,
        pageCount: totalPages,
    })

    return (
        // <div className="w-full">
        <>
            <div aria-describedby="table-wrapper" className="overflow-auto w-full">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="whitespace-nowrap">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={finalColumns.length}
                                    className="h-24 text-center text-sm text-muted-foreground"
                                >
                                    <div className="w-full justify-center items-center flex">
                                        <div className="flex w-28 items-center gap-1 text-xs">
                                            <Loader spinnerClassname="w-4 h-4 -mr-8" noPadding />
                                            Loading...
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="odd:bg-muted/50 [&>*]:whitespace-nowrap"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="!text-xs">
                                            {(() => {
                                                if (cell.column.id === "actions") {
                                                    return flexRender(cell.column.columnDef.cell, cell.getContext())
                                                }

                                                const value = cell.getValue() as any
                                                if (value === null || value === undefined) return null

                                                if (value instanceof Date) {
                                                    console.log('here')
                                                    return format(value, "dd/MM/yyyy")
                                                }

                                                if (cell.column.id !== 'slug' && typeof value === "string" && !isNaN(Date.parse(value))) {
                                                    console.log('here 22')

                                                    return format(new Date(value), "dd/MM/yyyy")
                                                }

                                                return flexRender(cell.column.columnDef.cell, cell.getContext())
                                            })()}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={finalColumns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* ✅ Pagination & Page Size Dropdown */}
            <div className="flex items-center justify-between py-4">
                {/* Page Info */}
                <div className="text-muted-foreground text-xs w-[100px]">
                    <p>Page {currentPage} of {totalPages}</p>
                </div>

                {/* Pagination */}
                <Pagination>
                    <PaginationContent>
                        {/* Previous */}
                        <PaginationItem>
                            <PaginationPrevious
                                size="sm"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (currentPage > 1) onPageChange(currentPage - 1)
                                }}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>

                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            if (
                                page === 1 ||
                                page === totalPages ||
                                Math.abs(page - currentPage) <= 1
                            ) {
                                return (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            href="#"
                                            size="sm"
                                            isActive={page === currentPage}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                onPageChange(page)
                                            }}
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            }

                            if (
                                (page === 2 && currentPage > 3) ||
                                (page === totalPages - 1 && currentPage < totalPages - 2)
                            ) {
                                return (
                                    <PaginationItem key={page}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )
                            }

                            return null
                        })}

                        {/* Next */}
                        <PaginationItem>
                            <PaginationNext
                                size="sm"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (currentPage < totalPages) onPageChange(currentPage + 1)
                                }}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>

                {/* Page Size Selector */}
                <div className="flex items-center gap-2 text-xs w-[300px]">
                    <span>Rows per page:</span>
                    <Select
                        value={String(pageSize)}
                        onValueChange={(value) => onPageSizeChange(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-[100px] text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[5, 10, 25, 50, 100].map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </>
    )
}
