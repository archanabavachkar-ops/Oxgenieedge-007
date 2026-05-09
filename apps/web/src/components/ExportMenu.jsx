import React from 'react';
import { Download, FileSpreadsheet, FileText, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function ExportMenu({ onExportCSV, onExportExcel, totalCount, filteredCount, selectedCount }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-[#111827] border-gray-700 text-white hover:bg-gray-800 hover:text-white">
          <Download className="w-4 h-4 mr-2 text-[#F97316]" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-[#111827] border-gray-800 text-white">
        <DropdownMenuLabel className="text-gray-400 text-xs uppercase tracking-wider">
          Export Data
        </DropdownMenuLabel>
        <div className="px-2 py-1.5 text-xs text-gray-400 bg-white/5 rounded-sm mb-2 mx-2">
          {selectedCount > 0 ? `${selectedCount} selected items` : `${filteredCount} filtered items`}
        </div>
        <DropdownMenuSeparator className="bg-gray-800" />
        <DropdownMenuItem onClick={onExportCSV} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
          <FileText className="w-4 h-4 mr-2 text-[#F97316]" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportExcel} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
          <FileSpreadsheet className="w-4 h-4 mr-2 text-[#10B981]" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}