import { ChevronDown } from 'lucide-react';

interface FormatSelectorProps {
  supportedFormats: string[];
  selectedFormat: string;
  onFormatChange: (format: string) => void;
  disabled?: boolean;
}

export function FormatSelector({
  supportedFormats,
  selectedFormat,
  onFormatChange,
  disabled = false
}: FormatSelectorProps) {
  const formatLabels: Record<string, string> = {
    pdf: 'PDF Document',
    docx: 'Word Document (.docx)',
    md: 'Markdown (.md)',
    html: 'HTML Page',
    epub: 'E-Book (.epub)',
    pptx: 'PowerPoint (.pptx)',
    txt: 'Plain Text'
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
        Convert to
      </label>
      <div className="relative">
        <select
          value={selectedFormat}
          onChange={(e) => onFormatChange(e.target.value)}
          disabled={disabled || supportedFormats.length === 0}
          className="w-full appearance-none px-4 py-3 pr-12 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed smooth-transition modern-shadow"
        >
          {supportedFormats.length === 0 ? (
            <option>Select a file first</option>
          ) : (
            supportedFormats.map((format) => (
              <option key={format} value={format}>
                {formatLabels[format] || format.toUpperCase()}
              </option>
            ))
          )}
        </select>
        <ChevronDown 
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" 
          size={20} 
        />
      </div>
    </div>
  );
}
