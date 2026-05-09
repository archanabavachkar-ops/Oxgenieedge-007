import React, { useState } from 'react';
import { 
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, 
  AlertDialogDescription, AlertDialogFooter 
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus } from 'lucide-react';

export default function BulkAssignManagerDialog({ isOpen, count, managers, onConfirm, onCancel, isLoading }) {
  const [selectedManager, setSelectedManager] = useState('');

  const handleConfirm = () => {
    if (selectedManager) onConfirm(selectedManager);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onCancel()}>
      <AlertDialogContent className="bg-[#111827] border-gray-800 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-[#F97316]">
            <UserPlus className="w-5 h-5 mr-2" />
            Assign Manager to {count} Items
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400 mt-2">
            Select a manager to assign to all {count} selected items.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <Select value={selectedManager} onValueChange={setSelectedManager}>
            <SelectTrigger className="bg-[#1F2937] border-gray-700 text-white">
              <SelectValue placeholder="Select manager" />
            </SelectTrigger>
            <SelectContent className="bg-[#1F2937] border-gray-700 text-white">
              {managers.map(manager => (
                <SelectItem key={manager.id} value={manager.id}>
                  {manager.fullName || manager.name || manager.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading} className="bg-[#6B7280] text-white hover:bg-[#4B5563] border-transparent">
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading || !selectedManager} className="bg-[#F97316] text-white hover:bg-[#EA580C]">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Assign Manager
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}