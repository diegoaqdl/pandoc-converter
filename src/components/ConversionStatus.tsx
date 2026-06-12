import { CheckCircle, XCircle, Loader2, FolderOpen } from 'lucide-react';
import { revealItemInDir } from '@tauri-apps/plugin-opener';

interface ConversionStatusProps {
  status: 'idle' | 'converting' | 'success' | 'error';
  message?: string;
  outputPath?: string;
}

export function ConversionStatus({ status, message, outputPath }: ConversionStatusProps) {
  const handleOpenFolder = async () => {
    if (outputPath) {
      await revealItemInDir(outputPath);
    }
  };

  if (status === 'idle') return null;

  return (
    <div className={`
      p-6 rounded-2xl border-2 smooth-transition
      ${status === 'converting' ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : ''}
      ${status === 'success' ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800' : ''}
      ${status === 'error' ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' : ''}
    `}>
      <div className="flex items-center gap-4">
        {status === 'converting' && <Loader2 className="animate-spin text-blue-600 dark:text-blue-400 flex-shrink-0" size={28} />}
        {status === 'success' && <CheckCircle className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" size={28} />}
        {status === 'error' && <XCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={28} />}
        
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-base
            ${status === 'converting' ? 'text-blue-900 dark:text-blue-100' : ''}
            ${status === 'success' ? 'text-emerald-900 dark:text-emerald-100' : ''}
            ${status === 'error' ? 'text-red-900 dark:text-red-100' : ''}
          `}>
            {message || (status === 'converting' ? 'Converting your document...' : '')}
          </p>
          {outputPath && status === 'success' && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 break-all">
              {outputPath}
            </p>
          )}
        </div>

        {status === 'success' && outputPath && (
          <button
            onClick={handleOpenFolder}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium smooth-transition modern-shadow hover:modern-shadow-lg"
          >
            <FolderOpen size={18} />
            <span>Open</span>
          </button>
        )}
      </div>
    </div>
  );
}
