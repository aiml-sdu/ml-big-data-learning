import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { M } from '@/components/Math';

export interface AlgoProperty {
  name: string;
  complete: string;
  optimal: string;
  time: string;
  space: string;
}

interface PropertiesTableProps {
  data: AlgoProperty[];
  activeIndex?: number | null;
}

export default function PropertiesTable({ data, activeIndex = null }: PropertiesTableProps) {
  if (data.length === 0) return null;

  return (
    <div className="my-4 rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Algorithm</TableHead>
            <TableHead>Complete</TableHead>
            <TableHead>Optimal</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Space</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((algo, i) => (
            <TableRow key={algo.name} className={cn(i === activeIndex && 'bg-primary/10 font-medium')}>
              <TableCell className="font-medium">{algo.name}</TableCell>
              <TableCell>{algo.complete}</TableCell>
              <TableCell>{algo.optimal}</TableCell>
              <TableCell><M>{algo.time}</M></TableCell>
              <TableCell><M>{algo.space}</M></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
