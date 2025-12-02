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
import { format } from 'date-fns';
import type { NavigateOptions } from '@tanstack/react-router';

export type InventoryItem = {
  _id: string;
  name: string;
  category?: string;
  total_qty: number;
  unit: string;
  avg_cost: number;
  supplier_id?: string | { _id: string; name: string; phone?: string };
  last_purchase?: string;
};

export const columns: ColumnDef<InventoryItem>[] = [
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
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const category = row.getValue('category') as string | undefined;
      return category ? (
        <Badge variant="secondary">{category}</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
    filterFn: (row, id, value) => {
      const category = row.getValue(id) as string | undefined;
      if (!value || value === 'all') return true;
      return category === value;
    },
  },
  {
    accessorKey: 'total_qty',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const qty = parseFloat(row.getValue('total_qty'));
      const unit = row.original.unit;
      return (
        <div className="font-medium">
          {qty.toLocaleString('en-IN', { minimumFractionDigits: 2 })} {unit}
        </div>
      );
    },
  },
  {
    accessorKey: 'avg_cost',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Avg Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const cost = parseFloat(row.getValue('avg_cost'));
      const formatted = `₹${cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'supplier_id',
    header: 'Supplier',
    cell: ({ row }) => {
      const supplier = row.getValue('supplier_id');
      if (!supplier) {
        return <span className="text-muted-foreground">—</span>;
      }
      const supplierName =
        typeof supplier === 'object' && supplier !== null && 'name' in supplier
          ? (supplier as { name: string }).name
          : 'Unknown';
      return <div className="text-sm">{supplierName}</div>;
    },
  },
  {
    accessorKey: 'last_purchase',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Last Purchase
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('last_purchase') as string | undefined;
      if (!date) {
        return <span className="text-muted-foreground">Never</span>;
      }
      return <div className="text-sm">{format(new Date(date), 'MMM dd, yyyy')}</div>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const item = row.original;
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item._id)}>
              Copy item ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (navigate) {
                  navigate({ to: '/inventory/$id', params: { id: item._id } });
                }
              }}
            >
              View details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (navigate) {
                  navigate({ to: '/inventory/$id/edit', params: { id: item._id } });
                }
              }}
            >
              Edit item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
