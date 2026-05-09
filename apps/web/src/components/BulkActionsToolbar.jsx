import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw, UserPlus, Download, X } from 'lucide-react';

export default function BulkActionsToolbar({ 
  selectedCount, 
  onClear, 
  onDelete, 
  onChangeStatus, 
  onAssignManager, 
  onExport 
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bulk-toolbar-enter">
      <div className="bg-[#111827] border border-gray-800 shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-3 border-r border-gray-700 pr-4 sm:pr-6">
          <span className="bg-[#F97316] text-white text-xs font-bold px-2 py-1 rounded-full">
            {selectedCount}
          </span>
          <span className="text-white font-medium hidden sm:inline">Selected</span>
        </div>

        <div className="flex items-center gap-2">
          {onDelete && (
            <Button size="sm" variant="ghost" onClick={onDelete} className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/10">
              <Trash2 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          )}
          {onChangeStatus && (
            <Button size="sm" variant="ghost" onClick={onChangeStatus} className="text-[#F97316] hover:text-[#F97316] hover:bg-[#F97316]/10">
              <RefreshCw className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Status</span>
            </Button>
          )}
          {onAssignManager && (
            <Button size="sm" variant="ghost" onClick={onAssignManager} className="text-[#F97316] hover:text-[#F97316] hover:bg-[#F97316]/10">
              <UserPlus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Assign</span>
            </Button>
          )}
          {onExport && (
            <Button size="sm" variant="ghost" onClick={onExport} className="text-[#F97316] hover:text-[#F97316] hover:bg-[#F97316]/10">
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
        </div>

        <div className="border-l border-gray-700 pl-2 sm:pl-4">
          <Button size="icon" variant="ghost" onClick={onClear} className="text-[#6B7280] hover:text-white hover:bg-white/10 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}