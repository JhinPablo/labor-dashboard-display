// components/DependencyRatioMapModal.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { DependencyRatioMap } from "./DashboardCharts";
import { Map } from "lucide-react";

export const DependencyRatioMapModal = ({ data, year }: {
  data: any[];
  year: number;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-labor-100 transition">
          <Map className="w-4 h-4 text-labor-600" />
          <span className="text-sm font-medium text-labor-700">View Dependency Map</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl p-6">
        <DialogHeader>
          <DialogTitle>Dependency Ratio by Country - {year}</DialogTitle>
        </DialogHeader>

        {/* Aquí el mapa completo y tarjetas */}
        <div className="max-h-[75vh] overflow-y-auto">
          <DependencyRatioMap data={data} year={year} />
        </div>

        <div className="mt-4 text-right">
          <DialogClose asChild>
            <button className="text-sm text-labor-600 hover:underline">Close</button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};