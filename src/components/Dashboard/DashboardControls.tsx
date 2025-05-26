
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Region = {
  id: string;
  name: string;
};

type DashboardControlsProps = {
  selectedRegion: string;
  selectedYear: number;
  regions: Region[];
  availableYears: number[];
  onRegionChange: (value: string) => void;
  onYearChange: (value: string) => void;
};

const DashboardControls: React.FC<DashboardControlsProps> = ({
  selectedRegion,
  selectedYear,
  regions,
  availableYears,
  onRegionChange,
  onYearChange
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Select
        value={selectedRegion === 'all' ? 'all' : selectedRegion}
        onValueChange={onRegionChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Regions</SelectItem>
          {regions.map((region) => (
            <SelectItem key={region.id} value={region.name}>
              {region.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select 
        value={selectedYear.toString()} 
        onValueChange={onYearChange}
        disabled={availableYears.length === 0}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {availableYears.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DashboardControls;
