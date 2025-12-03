'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';

export type DaybookEntry = {
  _id: string;
  date: string;
  createdAt?: string;
  item_name: string;
  type: 'cash_in' | 'cash_out';
  amount: number;
  qty?: number | null;
  unit?: string | null;
  payment_type?: 'credit' | 'full' | 'partial';
  supplier_id?: {
    _id: string;
    name: string;
    phone?: string;
  } | null;
  buyer?: string | null;
  allocation?: 'farm_inputs' | 'labour' | 'sold_stock' | 'other';
  inventory_lines?: Array<{
    item_id:
      | string
      | {
          _id: string;
          name: string;
          unit: string;
        };
    qty: number;
    unit_cost: number;
  }>;
};

export const columns: ColumnDef<DaybookEntry>[] = [
  {
    accessorKey: '_id',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-0 font-semibold"
        >
          Ref. No.
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex((r) => r.id === row.id);
      return <div className="font-medium ml-4">{index + 1}</div>;
    },
    size: 80,
  },
  {
    accessorKey: 'item_name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-0 font-semibold"
        >
          Item Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium ml-2">{row.getValue('item_name')}</div>,
    size: 150,
  },
  {
    accessorKey: 'date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-0 font-semibold"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('date'));
      return <div className="font-medium">{format(date, 'dd.MM.yyyy')}</div>;
    },
    size: 120,
  },
  {
    id: 'time',
    header: () => {
      return <div className="font-semibold">Time</div>;
    },
    cell: ({ row }) => {
      const entry = row.original;
      const timeSource = entry.createdAt || entry.date;
      const date = new Date(timeSource);
      return <div className="font-medium">{format(date, 'h:mm a')}</div>;
    },
    size: 100,
  },
  {
    accessorKey: 'qty',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-0 font-semibold"
        >
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const entry = row.original;
      let qty = entry.qty;

      // If qty is not available at top level, check inventory_lines for farm_inputs
      if (
        (qty == null || qty === null) &&
        entry.allocation === 'farm_inputs' &&
        entry.inventory_lines &&
        entry.inventory_lines.length > 0
      ) {
        qty = entry.inventory_lines[0].qty;
      }

      return <div className="font-medium ml-4">{qty != null ? qty : '-'}</div>;
    },
    size: 100,
  },
  {
    accessorKey: 'unit',
    header: () => {
      return <div className="font-semibold">UOM</div>;
    },
    cell: ({ row }) => {
      const entry = row.original;
      let unit = entry.unit;

      // If unit is not available at top level, check inventory_lines for farm_inputs
      if (
        !unit &&
        entry.allocation === 'farm_inputs' &&
        entry.inventory_lines &&
        entry.inventory_lines.length > 0
      ) {
        const firstLine = entry.inventory_lines[0];
        if (
          firstLine.item_id &&
          typeof firstLine.item_id === 'object' &&
          'unit' in firstLine.item_id
        ) {
          unit = firstLine.item_id.unit;
        }
      }

      return <div className="font-medium">{unit || '-'}</div>;
    },
    size: 100,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-0 font-semibold"
        >
          Amount (Rs.)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const paymentType = row.original.payment_type;
      const formatted = amount.toLocaleString('en-IN');
      const isPaid = paymentType === 'full';
      return (
        <div className="font-semibold flex items-center gap-2">
          {isPaid ? (
            <CheckCircle2 className="h-4 w-4 text-red-600" />
          ) : (
            <Circle className="h-4 w-4 text-red-600 fill-red-600" />
          )}
          <span>{formatted}</span>
        </div>
      );
    },
    size: 140,
  },
  {
    accessorKey: 'payment_type',
    header: () => {
      return <div className="font-semibold">Payment Type</div>;
    },
    cell: ({ row }) => {
      const paymentType = row.getValue('payment_type') as string | undefined;
      if (!paymentType) return <div className="text-muted-foreground">-</div>;
      const labels: Record<string, string> = {
        credit: 'On Credit',
        full: 'Fully Paid',
        partial: 'Partial Payment',
      };
      return <div className="font-medium">{labels[paymentType] || paymentType}</div>;
    },
    size: 130,
  },
  {
    id: 'supplier_buyer',
    header: () => {
      return <div className="font-semibold">Supplier/Buyer</div>;
    },
    cell: ({ row }) => {
      const entry = row.original;
      if (entry.supplier_id && typeof entry.supplier_id === 'object') {
        return <div className="font-medium">{entry.supplier_id.name}</div>;
      }
      if (entry.buyer) {
        return <div className="font-medium">{entry.buyer}</div>;
      }
      return <div className="text-muted-foreground">NA</div>;
    },
    size: 150,
  },
  {
    accessorKey: 'allocation',
    header: () => {
      return <div className="font-semibold">Allocation Status</div>;
    },
    cell: ({ row }) => {
      const allocation = row.getValue('allocation') as string | undefined;
      if (!allocation) return <div className="text-muted-foreground">-</div>;
      const labels: Record<string, string> = {
        farm_inputs: 'Inventory',
        labour: 'Labour',
        sold_stock: 'Sold Stock',
        other: 'Other',
      };
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-900"
        >
          {labels[allocation] || allocation}
        </Badge>
      );
    },
    size: 150,
  },
];
