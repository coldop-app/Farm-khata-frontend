import { useState, useMemo } from 'react';
import { useDaybookEntries } from '@/hooks/useDaybook';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import type { DaybookEntry } from '@/api/types';

export function DaybookList() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    type: '',
    allocation: '',
    page: 1,
    limit: 50,
  });

  const { data, isLoading } = useDaybookEntries(filters);

  const columns = useMemo<ColumnDef<DaybookEntry>[]>(
    () => [
      {
        accessorKey: 'date',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => {
          return (
            <div className="font-medium">{format(new Date(row.original.date), 'MMM dd, yyyy')}</div>
          );
        },
      },
      {
        accessorKey: 'item_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Item" />,
        cell: ({ row }) => {
          return <div className="font-medium">{row.getValue('item_name')}</div>;
        },
      },
      {
        accessorKey: 'type',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ row }) => {
          const type = row.getValue('type') as 'cash_in' | 'cash_out';
          return (
            <Badge
              variant={type === 'cash_in' ? 'default' : 'outline'}
              className={
                type === 'cash_out'
                  ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400'
                  : ''
              }
            >
              {type === 'cash_in' ? 'Cash In' : 'Cash Out'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('amount'));
          return <div className="text-right font-semibold">₹{amount.toLocaleString('en-IN')}</div>;
        },
      },
      {
        accessorKey: 'allocation',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Allocation" />,
        cell: ({ row }) => {
          const allocation = row.getValue('allocation') as string;
          const allocationLabels: Record<string, string> = {
            farm_inputs: 'Farm Inputs',
            labour: 'Labour',
            sold_stock: 'Sold Stock',
            other: 'Other',
          };
          return <div className="capitalize">{allocationLabels[allocation] || allocation}</div>;
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const entry = row.original;
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  navigate({ to: `/daybook/${entry._id}` as any });
                }}
                className="h-8"
              >
                View
              </Button>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [navigate]
  );

  // Data is already filtered by server-side filters (type, allocation)
  const tableData = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Filters</CardTitle>
          <CardAction>
            <Button
              onClick={() =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                navigate({ to: '/daybook/new' as any })
              }
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type Select */}
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) =>
                setFilters({ ...filters, type: value === 'all' ? '' : value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="cash_in">Cash In</SelectItem>
                <SelectItem value="cash_out">Cash Out</SelectItem>
              </SelectContent>
            </Select>

            {/* Allocation Select */}
            <Select
              value={filters.allocation || 'all'}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  allocation: value === 'all' ? '' : value,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Allocations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Allocations</SelectItem>
                <SelectItem value="farm_inputs">Farm Inputs</SelectItem>
                <SelectItem value="labour">Labour</SelectItem>
                <SelectItem value="sold_stock">Sold Stock</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-border/40 shadow-sm">
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={tableData}
            searchKey="item_name"
            searchPlaceholder="Search by item name..."
            isLoading={isLoading}
            emptyMessage="No entries found"
            emptyDescription="Try adjusting your filters or add a new entry"
          />
        </CardContent>
      </Card>
    </div>
  );
}
