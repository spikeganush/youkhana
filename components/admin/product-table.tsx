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
import { RentalProduct, ProductStatus } from '@/types/rental-product';
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
import { EditProductDialog } from './edit-product-dialog';
import { DeleteProductDialog } from './delete-product-dialog';
import {
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Star,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toggleProductStatusAction, toggleFeaturedAction } from '@/app/admin/products/actions';
import { toast } from 'sonner';

interface ProductTableProps {
  products: RentalProduct[];
}

export function ProductTable({ products }: ProductTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [editProduct, setEditProduct] = useState<RentalProduct | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<RentalProduct | null>(null);
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null);

  const getStatusBadgeVariant = (status: ProductStatus) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleToggleStatus = async (product: RentalProduct) => {
    setTogglingStatus(product.id);
    try {
      const newStatus: ProductStatus =
        product.status === 'active' ? 'inactive' : 'active';
      const result = await toggleProductStatusAction(product.id, newStatus);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to toggle product status');
    } finally {
      setTogglingStatus(null);
    }
  };

  const handleToggleFeatured = async (product: RentalProduct) => {
    setTogglingFeatured(product.id);
    try {
      const result = await toggleFeaturedAction(product.id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to toggle featured status');
    } finally {
      setTogglingFeatured(null);
    }
  };

  const columns: ColumnDef<RentalProduct>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className="-ml-4"
            >
              Product
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <div className="max-w-[300px]">
              <div className="font-medium truncate">{row.getValue('title')}</div>
              <div className="text-sm text-muted-foreground truncate">
                {row.original.handle}
              </div>
              {row.original.featured && (
                <Badge variant="outline" className="mt-1 text-xs">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Featured
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'category',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className="-ml-4"
            >
              Category
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        filterFn: (row, id, value) => {
          return value === 'all' || row.getValue(id) === value;
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
          const status = row.getValue('status') as ProductStatus;
          return (
            <Badge variant={getStatusBadgeVariant(status)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value === 'all' || row.getValue(id) === value;
        },
      },
      {
        accessorKey: 'rentalPrice',
        header: 'Rental Price',
        cell: ({ row }) => {
          const price = row.original.rentalPrice;
          return (
            <div className="text-sm">
              <div className="font-medium">
                ${price.daily.toFixed(2)}/day
              </div>
              {price.weekly && (
                <div className="text-muted-foreground">
                  ${price.weekly.toFixed(2)}/wk
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'availableQuantity',
        header: 'Availability',
        cell: ({ row }) => {
          const available = row.original.availableQuantity;
          const total = row.original.totalQuantity;
          const isAvailable = available > 0;
          return (
            <div className="flex items-center gap-2">
              {isAvailable ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {available}/{total} Available
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Out of Stock
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const product = row.original;
          const isTogglingStatus = togglingStatus === product.id;
          const isTogglingFeatured = togglingFeatured === product.id;

          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleToggleStatus(product)}
                disabled={isTogglingStatus}
                title={
                  product.status === 'active'
                    ? 'Mark as inactive'
                    : 'Mark as active'
                }
              >
                {product.status === 'active' ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleToggleFeatured(product)}
                disabled={isTogglingFeatured}
                title={product.featured ? 'Unmark as featured' : 'Mark as featured'}
              >
                <Star
                  className={`h-4 w-4 ${
                    product.featured ? 'fill-current text-yellow-500' : ''
                  }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditProduct(product)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteProduct(product)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    [togglingStatus, togglingFeatured]
  );

  const table = useReactTable({
    data: products,
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

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats).sort();
  }, [products]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search products..."
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        <Select
          value={(table.getColumn('category')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('category')?.setFilterValue(value === 'all' ? '' : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('status')?.setFilterValue(value === 'all' ? '' : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
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
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} product(s) found
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

      {/* Dialogs */}
      <EditProductDialog
        product={editProduct}
        open={!!editProduct}
        onOpenChange={(open) => !open && setEditProduct(null)}
      />
      <DeleteProductDialog
        product={deleteProduct}
        open={!!deleteProduct}
        onOpenChange={(open) => !open && setDeleteProduct(null)}
      />
    </div>
  );
}
