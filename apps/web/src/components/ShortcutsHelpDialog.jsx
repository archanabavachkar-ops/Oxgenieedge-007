import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

export default function ShortcutsHelpDialog({ isOpen, onClose }) {
  const shortcuts = [
    { category: 'Global', items: [
      { keys: ['Ctrl', 'K'], desc: 'Focus Search' },
      { keys: ['Ctrl', '/'], desc: 'Show Keyboard Shortcuts' },
      { keys: ['Esc'], desc: 'Close Modals / Clear Selection' },
      { keys: ['Enter'], desc: 'Submit Forms' },
      { keys: ['Space'], desc: 'Activate Buttons' },
      { keys: ['Tab'], desc: 'Navigate Forward' },
      { keys: ['Shift', 'Tab'], desc: 'Navigate Backward' },
    ]},
    { category: 'Actions', items: [
      { keys: ['Ctrl', 'N'], desc: 'Create New Item' },
      { keys: ['Ctrl', 'S'], desc: 'Save Changes' },
      { keys: ['Ctrl', 'D'], desc: 'Delete Selected' },
      { keys: ['Ctrl', 'E'], desc: 'Export Data' },
    ]}
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#111827] border-gray-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Keyboard className="w-5 h-5 mr-2 text-[#F97316]" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {shortcuts.map((group, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-bold text-[#F97316] uppercase tracking-wider mb-3">
                {group.category}
              </h3>
              <div className="space-y-3">
                {group.items.map((shortcut, sIdx) => (
                  <div key={sIdx} className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">{shortcut.desc}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, kIdx) => (
                        <React.Fragment key={kIdx}>
                          <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded-md text-xs font-mono text-gray-300 shadow-sm">
                            {key}
                          </kbd>
                          {kIdx < shortcut.keys.length - 1 && <span className="text-gray-500 text-xs">+</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}