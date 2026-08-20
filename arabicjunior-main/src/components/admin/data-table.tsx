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
import { Checkbox } from "@/components/ui/checkbox"

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

    /** Adds a checkbox column. Off by default so existing screens are unchanged. */
    enableSelection?: boolean
    /** Called with the currently ticked rows whenever the selection changes. */
    onSelectionChange?: (rows: TData[]) => void
    /**
     * Change this value to clear the selection — after a page change or a
     * delete, say. Without it the ticks would carry over to rows the admin
     * never looked at, and the next bulk action would hit the wrong records.
     */
    selectionResetKey?: string | number
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
    enableSelection = false,
    onSelectionChange,
    selectionResetKey,
}: DataTableProps<TData, TValue>) {
    /**
     * The action column is built inside a useMemo that deliberately does not
     * depend on onAction — rebuilding the columns on every render would throw
     * away the memo entirely. That left the column holding the onAction closure
     * from the first render forever.
     *
     * It went unnoticed because the usual handler only calls state setters,
     * which are stable, so a stale closure behaves identically. A handler that
     * reads a value instead — a token, a filter, anything from state — silently
     * got whatever that value was on the very first render, which for anything
     * loaded asynchronously means null.
     *
     * Holding it in a ref keeps the columns memoised and still calls the
     * current handler.
     */
    const onActionRef = React.useRef(onAction)
    React.useEffect(() => {
        onActionRef.current = onAction
    })

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const selectColumn: ColumnDef<TData, any> = {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all rows on this page"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
    }

    const actionColumn: ColumnDef<TData, any> = {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <div className="flex gap-2 justify-center">
                {actions?.includes("view") && (
                    <Eye
                        className="w-4 h-4 cursor-pointer text-orange-500 hover:text-orange-600"
                        onClick={() => onActionRef.current?.("view", row.original)}
                    />
                )}
                {actions?.includes("edit") && (
                    <Pencil
                        className="w-4 h-4 cursor-pointer text-green-500 hover:text-green-700"
                        onClick={() => onActionRef.current?.("edit", row.original)}
                    />
                )}
                {actions?.includes("delete") && (
                    <Trash2
                        className="w-4 h-4 cursor-pointer text-red-500 hover:text-red-700"
                        onClick={() => onActionRef.current?.("delete", row.original)}
                    />
                )}
            </div>
        ),
    }

    const finalColumns = React.useMemo(
        () => [
            ...(enableSelection ? [selectColumn] : []),
            ...columns,
            ...(showActions ? [actionColumn] : []),
        ],
        // selectColumn and actionColumn are rebuilt on every render by design;
        // listing them here would rebuild the columns every render too. Neither
        // closes over anything that changes — onAction is read through a ref.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [columns, showActions, enableSelection]
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
        enableRowSelection: enableSelection,
    })

    // Report the ticked rows upward. Reading them from the table rather than
    // from the rowSelection keys keeps the caller working with real records
    // instead of row indexes.
    const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original)
    const selectedCount = selectedRows.length

    React.useEffect(() => {
        onSelectionChange?.(selectedRows)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCount, selectionResetKey])

    React.useEffect(() => {
        setRowSelection({})
    }, [selectionResetKey])

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
                                                // The select and actions columns have no accessor, so
                                                // getValue() is undefined for them and the
                                                // null-guard below would swallow the cell. That is
                                                // what stopped the row tick boxes from ever
                                                // appearing: the header rendered, because headers
                                                // do not come through here, but every row cell
                                                // returned null and only "select all" worked.
                                                if (cell.column.id === "actions" || cell.column.id === "select") {
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
