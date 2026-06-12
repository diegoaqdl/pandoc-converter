import { FileText } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';

interface FileSelectorProps {
  onFileSelected: (filePath: string) => void;
  disabled?: boolean;
}

export function FileSelector({ onFileSelected, disabled = false }: FileSelectorProps) {
  const handleSelectFile = async () => {
    try {
      console.log('Opening file dialog...');
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Documents',
            extensions: ['md', 'docx', 'html', 'htm', 'txt', 'rst', 'epub', 'tex', 'latex', 'odt', 'rtf']
          }
        ]
      });

      console.log('File selected:', selected);
      
      if (selected && typeof selected === 'string') {
        onFileSelected(selected);
      } else if (selected === null) {
        console.log('User cancelled file selection');
      }
    } catch (error) {
      console.error('Error opening file dialog:', error);
      alert(`Error opening file dialog: ${error}`);
    }
  };

  return (
    <button
      onClick={handleSelectFile}
      disabled={disabled}
      className="group relative flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-md font-semibold smooth-transition modern-shadow hover:modern-shadow-lg disabled:cursor-not-allowed"
    >
      <FileText size={24} />
      <span>Select File</span>
    </button>
  );
}
