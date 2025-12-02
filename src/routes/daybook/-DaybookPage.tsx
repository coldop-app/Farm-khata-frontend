import { useBearStore } from '@/stores/useBearStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function DaybookPage() {
  const bears = useBearStore((state) => state.bears);
  const increasePopulation = useBearStore((state) => state.increasePopulation);
  const removeAllBears = useBearStore((state) => state.removeAllBears);

  const handleIncrease = () => {
    increasePopulation();
    toast.success('Bear population increased!', {
      description: `There are now ${bears + 1} bears.`,
    });
  };

  const handleRemoveAll = () => {
    removeAllBears();
    toast('All bears removed', {
      description: 'The bear population has been reset to zero.',
      action: {
        label: 'Undo',
        onClick: () => {
          increasePopulation();
          toast.info('Bear restored');
        },
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        <h1 className="font-lusitana">Lusitana font</h1>
        <p className="font-montserrat">Montserrat font</p>
        <code className="font-geist-mono">Geist Mono font</code>
      </div>
      <h1 className="text-3xl font-bold mb-6">Daybook</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">{bears} bears around here...</h2>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleIncrease}>One up</Button>
          <Button onClick={handleRemoveAll} variant="destructive">
            Remove all bears
          </Button>
        </div>

        <div className="mt-8 space-y-2">
          <h3 className="text-lg font-semibold">Toast Examples</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => toast('Event has been created')}>
              Default Toast
            </Button>
            <Button variant="outline" onClick={() => toast.success('Success! Operation completed')}>
              Success
            </Button>
            <Button variant="outline" onClick={() => toast.info('Information message')}>
              Info
            </Button>
            <Button variant="outline" onClick={() => toast.warning('Warning: Check your input')}>
              Warning
            </Button>
            <Button variant="outline" onClick={() => toast.error('Error: Something went wrong')}>
              Error
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
