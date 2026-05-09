import { useEffect } from 'react';

export const useKeyboardShortcuts = (onSearch, onHelp, onSave, onDelete, onExport, onNew) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in an input, textarea, or select
      const activeElement = document.activeElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName) || activeElement.isContentEditable;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'k':
          case 'f':
            e.preventDefault();
            if (onSearch) onSearch();
            break;
          case '/':
            e.preventDefault();
            if (onHelp) onHelp();
            break;
          case 's':
            if (!isInput && onSave) {
              e.preventDefault();
              onSave();
            }
            break;
          case 'd':
            if (!isInput && onDelete) {
              e.preventDefault();
              onDelete();
            }
            break;
          case 'e':
            if (!isInput && onExport) {
              e.preventDefault();
              onExport();
            }
            break;
          case 'n':
            if (!isInput && onNew) {
              e.preventDefault();
              onNew();
            }
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearch, onHelp, onSave, onDelete, onExport, onNew]);
};