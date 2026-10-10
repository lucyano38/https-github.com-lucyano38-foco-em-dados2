import { useState, useRef, useCallback, type JSX } from 'react';
import clsx from 'clsx';

type UploadState = 'idle' | 'dragover' | 'uploading' | 'success' | 'error';

interface UploadZoneProps {
  onFile: (file: File) => void;
  accept?: string;
  maxSize?: number;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function UploadZone({
  onFile,
  accept = '.csv,.xlsx,.xls',
  maxSize = DEFAULT_MAX_SIZE,
}: UploadZoneProps): JSX.Element {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setUploadState('idle');
    setFileName(null);
    setErrorMessage(null);
  }, []);

  const validateAndProcess = useCallback(
    (file: File) => {
      setFileName(file.name);

      if (maxSize > 0 && file.size > maxSize) {
        setUploadState('error');
        setErrorMessage(
          `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo: ${(maxSize / 1024 / 1024).toFixed(0)}MB`
        );
        return;
      }

      setUploadState('uploading');
      setErrorMessage(null);

      // Simulate brief upload state, then pass file
      // Parent can handle actual upload
      onFile(file);
      setUploadState('success');
    },
    [maxSize, onFile]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadState('dragover');
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadState('idle');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files?.[0];
      if (file) {
        validateAndProcess(file);
      } else {
        setUploadState('error');
        setErrorMessage('Nenhum arquivo detectado.');
      }
    },
    [validateAndProcess]
  );

  const handleClick = useCallback(() => {
    if (uploadState === 'uploading') return;
    reset();
    inputRef.current?.click();
  }, [uploadState, reset]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        validateAndProcess(file);
      }
    },
    [validateAndProcess]
  );

  const isDragover = uploadState === 'dragover';
  const isUploading = uploadState === 'uploading';
  const isSuccess = uploadState === 'success';
  const isError = uploadState === 'error';

  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={clsx(
        'upload-zone relative',
        isDragover &&
          '!border-vivid-purple !bg-vivid-purple/[0.08] !border-solid',
        isUploading && 'pointer-events-none opacity-70',
        (isSuccess || isError) && '!border-solid'
      )}
      role="button"
      tabIndex={0}
      aria-label="Upload de arquivo — arraste ou clique para selecionar"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {isSuccess ? (
        <div className="flex flex-col items-center gap-2 animate-[fadeIn_0.3s_ease]">
          <span className="material-symbols-outlined text-5xl text-emerald-400">
            check_circle
          </span>
          <p className="font-mono text-sm text-emerald-400 font-medium">
            {fileName || 'Arquivo carregado'}
          </p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 animate-[fadeIn_0.3s_ease]">
          <span className="material-symbols-outlined text-5xl text-red-400">
            error
          </span>
          <p className="font-mono text-sm text-red-400 font-medium">
            {errorMessage || 'Erro ao carregar arquivo'}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              reset();
            }}
            className="font-mono text-[11px] uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors mt-1 cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <>
              <span className="material-symbols-outlined text-5xl text-vivid-purple animate-pulse">
                cloud_upload
              </span>
              <p className="font-mono text-sm text-slate-300">Enviando...</p>
              {fileName && (
                <p className="font-mono text-xs text-slate-500">{fileName}</p>
              )}
            </>
          ) : (
            <>
              <span
                className={clsx(
                  'material-symbols-outlined text-5xl transition-colors',
                  isDragover ? 'text-vivid-purple' : 'text-slate-500'
                )}
              >
                cloud_upload
              </span>
              <div className="space-y-1">
                <p className="font-display font-bold text-base text-slate-300">
                  {isDragover
                    ? 'Solte o arquivo aqui'
                    : 'Solte seu arquivo aqui'}
                </p>
                <p className="font-mono text-xs text-slate-500">
                  CSV ou XLSX até{' '}
                  {(maxSize / 1024 / 1024).toFixed(0)}MB
                </p>
              </div>
              {fileName && (
                <p className="font-mono text-xs text-vivid-purple">
                  {fileName}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
