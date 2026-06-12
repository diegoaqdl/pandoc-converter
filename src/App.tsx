import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { FileSelector } from "./components/FileSelector";
import { FormatSelector } from "./components/FormatSelector";
import { ConversionStatus } from "./components/ConversionStatus";
import { FileText, Sparkles } from "lucide-react";
import "./App.css";

interface FormatInfo {
  extension: string;
  format: string;
  supported_outputs: string[];
}

interface ConversionResult {
  success: boolean;
  message: string;
  output_path?: string;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [formatInfo, setFormatInfo] = useState<FormatInfo | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [conversionStatus, setConversionStatus] = useState<'idle' | 'converting' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [outputPath, setOutputPath] = useState<string>("");

  const handleFilePathSelected = async (filePath: string) => {
    try {
      setSelectedFile(filePath);
      const name = filePath.split('\\').pop() || filePath.split('/').pop() || filePath;
      setFileName(name);
      setConversionStatus('idle');
      
      // Detect format
      const info = await invoke<FormatInfo>("detect_format", { filePath });
      setFormatInfo(info);
      
      // Set default output format
      if (info.supported_outputs.length > 0) {
        setSelectedFormat(info.supported_outputs[0]);
      }
    } catch (error) {
      setConversionStatus('error');
      setStatusMessage(`Error: ${error}`);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile || !selectedFormat) return;

    try {
      setConversionStatus('converting');
      setStatusMessage('Converting document...');
      
      const result = await invoke<ConversionResult>("convert_document", {
        inputPath: selectedFile,
        outputFormat: selectedFormat,
        outputPath: null
      });

      if (result.success) {
        setConversionStatus('success');
        setStatusMessage(result.message);
        setOutputPath(result.output_path || '');
      } else {
        setConversionStatus('error');
        setStatusMessage(result.message);
      }
    } catch (error) {
      setConversionStatus('error');
      setStatusMessage(`Conversion failed: ${error}`);
    }
  };

  return (
    <div className="app-background min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-3">
            Pandoc Converter
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
            Convert documents into polished formats with a clean workflow and a modern desktop UI.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] bg-white modern-shadow-xl">
          <div className="absolute inset-0 pointer-events-none opacity-90">
            <div className="absolute -top-20 -right-16 h-40 w-40 rounded-full bg-indigo-100 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-sky-100 blur-3xl" />
            <div className="absolute top-10 left-10 h-20 w-20 rotate-12 rounded-[1.75rem] border border-indigo-200/80" />
            <div className="absolute right-12 bottom-12 h-16 w-16 rotate-45 rounded-2xl border border-sky-200/80" />
          </div>

          <div className="relative p-8 sm:p-10">
            <div className="mb-8 flex justify-center">
              <FileSelector
                onFileSelected={handleFilePathSelected}
                disabled={conversionStatus === 'converting'}
              />
            </div>

            {fileName && (
              <div className="document-pattern mb-8 rounded-[1.75rem] border border-slate-200 p-6 modern-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl gradient-primary modern-shadow">
                    <FileText className="text-white" size={26} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-semibold text-slate-900">{fileName}</p>
                    {formatInfo && (
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        Detected format: {formatInfo.format.toUpperCase()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {formatInfo && (
              <div className="mb-8">
                <FormatSelector
                  supportedFormats={formatInfo.supported_outputs}
                  selectedFormat={selectedFormat}
                  onFormatChange={setSelectedFormat}
                  disabled={conversionStatus === 'converting'}
                />
              </div>
            )}

            {selectedFile && formatInfo && (
              <button
                onClick={handleConvert}
                disabled={conversionStatus === 'converting' || !selectedFormat}
                className="w-full rounded-2xl gradient-primary px-6 py-4 text-base font-semibold text-white modern-shadow-lg smooth-transition hover:modern-shadow-xl disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-3"
              >
                {conversionStatus === 'converting' ? (
                  <>Converting...</>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Convert to {selectedFormat.toUpperCase()}
                  </>
                )}
              </button>
            )}

            {conversionStatus !== 'idle' && (
              <div className="mt-8">
                <ConversionStatus
                  status={conversionStatus}
                  message={statusMessage}
                  outputPath={outputPath}
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Powered by Pandoc • Built with Tauri + React
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
