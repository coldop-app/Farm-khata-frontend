'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import type { NavigateOptions } from '@tanstack/react-router';

export type Supplier = {
  _id: string;
  name: string;
  phone?: string;
  outstanding_amount: number;
  total_purchases?: number;
  total_paid?: number;
};

export const columns: ColumnDef<Supplier>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string | undefined;
      return phone ? (
        <div className="text-sm">{phone}</div>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: 'total_purchases',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Purchases
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = Number(row.getValue('total_purchases')) || 0;
      const formatted = `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'total_paid',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Paid
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = Number(row.getValue('total_paid')) || 0;
      const formatted = `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      return <div className="font-medium text-green-600 dark:text-green-400">{formatted}</div>;
    },
  },
  {
    accessorKey: 'outstanding_amount',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Outstanding
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const outstanding = Number(row.getValue('outstanding_amount')) || 0;
      const totalPurchases = Number(row.original.total_purchases) || 0;
      const totalPaid = Number(row.original.total_paid) || 0;
      const formatted = `₹${outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

      // Determine payment status
      let statusBadge = null;
      if (totalPurchases === 0) {
        statusBadge = (
          <Badge variant="outline" className="ml-2 text-xs">
            No Transactions
          </Badge>
        );
      } else if (outstanding === 0 && totalPurchases > 0) {
        statusBadge = (
          <Badge variant="default" className="ml-2 text-xs bg-green-600">
            Fully Paid
          </Badge>
        );
      } else if (outstanding > 0 && totalPaid > 0) {
        statusBadge = (
          <Badge variant="secondary" className="ml-2 text-xs">
            Partial
          </Badge>
        );
      } else if (outstanding > 0) {
        statusBadge = (
          <Badge variant="destructive" className="ml-2 text-xs">
            Credit
          </Badge>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <div className="font-semibold">
            {outstanding > 0 ? (
              <Badge variant="destructive" className="font-semibold">
                {formatted}
              </Badge>
            ) : (
              <Badge variant="secondary" className="font-semibold">
                {formatted}
              </Badge>
            )}
          </div>
          {statusBadge}
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const supplier = row.original;
      // Get navigate function from table meta
      const navigate = (table.options.meta as { navigate?: (options: NavigateOptions) => void })
        ?.navigate;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(supplier._id)}>
              Copy supplier ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (navigate) {
                  navigate({ to: '/suppliers/$id', params: { id: supplier._id } });
                }
              }}
            >
              View details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (navigate) {
                  navigate({ to: '/suppliers/$id/edit', params: { id: supplier._id } });
                }
              }}
            >
              Edit supplier
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
