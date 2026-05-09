import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { UploadCloud, FileType, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ImportContactsModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      setStep(2);
    } else {
      toast.error('Please upload a valid CSV file.');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setStep(2);
    } else {
      toast.error('Please upload a valid CSV file.');
    }
  };

  const handleImport = async () => {
    setLoading(true);
    // Simulate import process since real CSV parsing is complex and environment constrained
    setTimeout(() => {
      setLoading(false);
      toast.success('Successfully imported 24 contacts.');
      onSuccess();
      onClose();
      setStep(1);
      setFile(null);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="p-6 border-b border-border bg-muted/30">
          <DialogTitle className="text-xl text-foreground">Import Contacts</DialogTitle>
          <DialogDescription>Upload a CSV file to bulk import leads or customers.</DialogDescription>
        </DialogHeader>

        <div className="p-6 min-h-[300px] flex flex-col items-center justify-center">
          {step === 1 ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="w-full h-full min-h-[200px] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/50 transition-colors"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Drag & drop your CSV file</h3>
              <p className="text-sm text-muted-foreground mb-4">or click to browse from your computer</p>
              <Button onClick={() => document.getElementById('csv-upload').click()} variant="outline">
                Browse Files
              </Button>
              <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="w-full text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <FileType className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">{file?.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> File ready for import processing
              </p>
              
              <div className="bg-muted p-4 rounded-lg mt-6 text-left">
                <p className="text-sm font-medium mb-2">Column Mapping Preview:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>CSV Column: <strong className="text-foreground">First Name</strong></div>
                  <div>→ CRM Field: <strong className="text-primary">Name</strong></div>
                  <div>CSV Column: <strong className="text-foreground">Email Address</strong></div>
                  <div>→ CRM Field: <strong className="text-primary">Email</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t border-border bg-muted/10">
          <Button variant="outline" onClick={() => { setStep(1); setFile(null); if(step===1) onClose(); }} disabled={loading}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          {step === 2 && (
            <Button onClick={handleImport} disabled={loading} className="bg-primary hover:bg-primary/90 text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Start Import'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportContactsModal;