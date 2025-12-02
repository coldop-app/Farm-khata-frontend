import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { BookOpen, Package, Users, MapPin } from 'lucide-react';

import { useDaybookEntries } from '@/hooks/useDaybook';
import { useInventoryItems } from '@/hooks/useInventory';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useLands } from '@/hooks/useLands';

export function Dashboard() {
  const { data: daybookData } = useDaybookEntries({ limit: 5 });
  const { data: inventoryData } = useInventoryItems({ limit: 5 });
  const { data: suppliersData } = useSuppliers({ limit: 5 });
  const { data: landsData } = useLands({ limit: 5 });

  const daybook = daybookData?.data ?? [];
  const inventory = inventoryData?.data ?? [];
  const suppliers = suppliersData?.data ?? [];
  const lands = landsData?.data ?? [];

  const stats = [
    {
      name: 'Daybook Entries',
      value: daybook.length,
      icon: BookOpen,
      href: '/daybook',
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      name: 'Inventory Items',
      value: inventory.length,
      icon: Package,
      href: '/inventory',
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      name: 'Suppliers',
      value: suppliers.length,
      icon: Users,
      href: '/suppliers',
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      name: 'Lands',
      value: lands.length,
      icon: MapPin,
      href: '/lands',
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6 px-1 sm:px-0">
      {/* Top Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link key={stat.name} to={stat.href}>
              <Card className="hover:shadow-lg transition-all cursor-pointer border border-border/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </CardTitle>

                  <div className={`p-2 rounded-full ${stat.bg}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent + Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Recent Daybook */}
        <Card className="border border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Daybook Entries</CardTitle>
            <CardDescription className="text-sm">Latest cash transactions</CardDescription>
          </CardHeader>

          <CardContent>
            {daybook.length === 0 ? (
              <p className="text-sm text-muted-foreground">No entries yet</p>
            ) : (
              <div className="space-y-3">
                {daybook.slice(0, 5).map((entry) => (
                  <div key={entry._id} className="flex justify-between">
                    <span className="text-sm">{entry.item_name}</span>
                    <span className="font-medium text-sm">₹{entry.amount}</span>
                  </div>
                ))}
              </div>
            )}

            <Separator className="my-4" />

            <Link to="/daybook">
              <Button variant="outline" className="w-full">
                View All
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            <CardDescription className="text-sm">Shortcuts to common tasks</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <Link to="/daybook/new">
              <Button variant="ghost" className="w-full justify-start">
                Add Daybook Entry
              </Button>
            </Link>

            <Link to="/inventory">
              <Button variant="ghost" className="w-full justify-start">
                Manage Inventory
              </Button>
            </Link>

            <Link to="/suppliers">
              <Button variant="ghost" className="w-full justify-start">
                View Suppliers
              </Button>
            </Link>

            <Link to="/lands">
              <Button variant="ghost" className="w-full justify-start">
                Manage Lands
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
