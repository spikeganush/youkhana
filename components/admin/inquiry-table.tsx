'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { RentalInquiry, RentalInquiryStatus } from '@/types/rental-inquiry';
import { ProductStatus } from '@/types/rental-product';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Eye,
  Trash2,
  Mail,
  Phone,
} from 'lucide-react';
import { updateInquiryStatusAction, deleteInquiryAction, addInquiryNotesAction, updateProductStatusAction } from '@/app/admin/rental-inquiries/actions';
import { toast } from 'sonner';

interface EnrichedInquiry extends RentalInquiry {
  productStatus: ProductStatus;
}

interface InquiryTableProps {
  inquiries: EnrichedInquiry[];
}

export function InquiryTable({ inquiries }: InquiryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [viewInquiry, setViewInquiry] = useState<EnrichedInquiry | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [updatingProductStatus, setUpdatingProductStatus] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const getStatusBadgeVariant = (status: RentalInquiryStatus) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'contacted':
        return 'secondary';
      case 'confirmed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: RentalInquiryStatus) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'contacted':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'confirmed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'cancelled':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'completed':
        return 'text-gray-700 bg-gray-50 border-gray-200';
      default:
        return '';
    }
  };

  const handleUpdateStatus = async (inquiryId: string, status: RentalInquiryStatus) => {
    setUpdatingStatus(inquiryId);
    try {
      const result = await updateInquiryStatusAction(inquiryId, status);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update inquiry status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (inquiryId: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;

    try {
      const result = await deleteInquiryAction(inquiryId);
      if (result.success) {
        toast.success(result.message);
        setViewInquiry(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete inquiry');
    }
  };

  const handleAddNotes = async (inquiryId: string) => {
    if (!notes.trim()) return;

    try {
      const result = await addInquiryNotesAction(inquiryId, notes);
      if (result.success) {
        toast.success(result.message);
        setNotes('');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to add notes');
    }
  };

  const handleUpdateProductStatus = async (productId: string, status: ProductStatus) => {
    setUpdatingProductStatus(productId);
    try {
      const result = await updateProductStatusAction(productId, status);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update product status');
    } finally {
      setUpdatingProductStatus(null);
    }
  };

  const getProductStatusColor = (status: ProductStatus) => {
    switch (status) {
      case 'active':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'inactive':
        return 'text-gray-700 bg-gray-50 border-gray-200';
      case 'draft':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return '';
    }
  };

  const columns: ColumnDef<EnrichedInquiry>[] = useMemo(
    () => [
      {
        accessorKey: 'createdAt',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className="-ml-4"
            >
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = new Date(row.getValue('createdAt'));
          return (
            <div className="text-sm">
              {date.toLocaleDateString()}
              <div className="text-xs text-muted-foreground">
                {date.toLocaleTimeString()}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        cell: ({ row }) => {
          return (
            <div className="max-w-[200px]">
              <div className="font-medium truncate">{row.getValue('customerName')}</div>
              <div className="text-sm text-muted-foreground truncate">
                {row.original.customerEmail}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'productTitle',
        header: 'Product',
        cell: ({ row }) => {
          return (
            <div className="max-w-[200px]">
              <div className="font-medium truncate">{row.getValue('productTitle')}</div>
              {row.original.selectedVariant && (
                <div className="text-xs text-muted-foreground truncate">
                  {row.original.selectedVariant.title}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className="-ml-4"
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const status = row.getValue('status') as RentalInquiryStatus;
          const inquiry = row.original;
          return (
            <Select
              value={status}
              onValueChange={(value) => handleUpdateStatus(inquiry.id, value as RentalInquiryStatus)}
              disabled={updatingStatus === inquiry.id}
            >
              <SelectTrigger className={`w-[130px] ${getStatusColor(status)}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          );
        },
        filterFn: (row, id, value) => {
          return value === 'all' || row.getValue(id) === value;
        },
      },
      {
        accessorKey: 'productStatus',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className="-ml-4"
            >
              Product Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const productStatus = row.getValue('productStatus') as ProductStatus;
          const inquiry = row.original;
          return (
            <Select
              value={productStatus}
              onValueChange={(value) => handleUpdateProductStatus(inquiry.productId, value as ProductStatus)}
              disabled={updatingProductStatus === inquiry.productId}
            >
              <SelectTrigger className={`w-[130px] ${getProductStatusColor(productStatus)}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          );
        },
        filterFn: (row, id, value) => {
          return value === 'all' || row.getValue(id) === value;
        },
      },
      {
        accessorKey: 'rentalDays',
        header: 'Duration',
        cell: ({ row }) => {
          const days = row.original.rentalDays;
          if (!days) return <span className="text-muted-foreground">Not specified</span>;
          return <span>{days} day{days !== 1 ? 's' : ''}</span>;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const inquiry = row.original;

          return (
            <div className="flex items-center gap-2">
              {inquiry.customerEmail && (
                <a
                  href={`mailto:${inquiry.customerEmail}`}
                  title="Email customer"
                >
                  <Button variant="ghost" size="icon">
                    <Mail className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {inquiry.customerPhone && (
                <a
                  href={`tel:${inquiry.customerPhone}`}
                  title="Call customer"
                >
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                </a>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewInquiry(inquiry)}
                title="View details"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(inquiry.id)}
                title="Delete inquiry"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    [updatingStatus, updatingProductStatus]
  );

  const table = useReactTable({
    data: inquiries,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by customer name..."
          value={(table.getColumn('customerName')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('customerName')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        <Select
          value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('status')?.setFilterValue(value === 'all' ? '' : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by inquiry status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Inquiry Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={(table.getColumn('productStatus')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('productStatus')?.setFilterValue(value === 'all' ? '' : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by product status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Product Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No inquiries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} inquiry(ies) found
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* View Inquiry Dialog */}
      {viewInquiry && (
        <Dialog open={!!viewInquiry} onOpenChange={() => setViewInquiry(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Inquiry Details</DialogTitle>
              <DialogDescription>
                View complete inquiry information
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Customer Name</Label>
                  <p className="font-medium">{viewInquiry.customerName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{viewInquiry.customerEmail}</p>
                </div>
              </div>

              {viewInquiry.customerPhone && (
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{viewInquiry.customerPhone}</p>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">Product</Label>
                <p className="font-medium">{viewInquiry.productTitle}</p>
              </div>

              {viewInquiry.selectedVariant && (
                <div>
                  <Label className="text-muted-foreground">Selected Options</Label>
                  <p className="font-medium">{viewInquiry.selectedVariant.title}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {viewInquiry.startDate && (
                  <div>
                    <Label className="text-muted-foreground">Start Date</Label>
                    <p className="font-medium">
                      {new Date(viewInquiry.startDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {viewInquiry.endDate && (
                  <div>
                    <Label className="text-muted-foreground">End Date</Label>
                    <p className="font-medium">
                      {new Date(viewInquiry.endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {viewInquiry.message && (
                <div>
                  <Label className="text-muted-foreground">Customer Message</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{viewInquiry.message}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <Label className="text-muted-foreground">Pricing</Label>
                <div className="space-y-1 mt-2">
                  <p>Daily Rate: ${viewInquiry.dailyRate.toFixed(2)}/day</p>
                  {viewInquiry.weeklyRate && (
                    <p>Weekly Rate: ${viewInquiry.weeklyRate.toFixed(2)}/week</p>
                  )}
                  {viewInquiry.deposit && (
                    <p>Deposit: ${viewInquiry.deposit.toFixed(2)}</p>
                  )}
                  {viewInquiry.estimatedTotal && (
                    <p className="font-bold text-lg">
                      Estimated Total: ${viewInquiry.estimatedTotal.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              {viewInquiry.notes && (
                <div>
                  <Label className="text-muted-foreground">Admin Notes</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{viewInquiry.notes}</p>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Add/Update Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this inquiry..."
                  rows={3}
                />
                <Button
                  onClick={() => handleAddNotes(viewInquiry.id)}
                  className="mt-2"
                  disabled={!notes.trim()}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
