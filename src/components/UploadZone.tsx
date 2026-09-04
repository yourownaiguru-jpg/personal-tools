import { useCallback, useRef, useState } from 'react'
import { extractLinesFromPdf } from '../lib/pdf'

export interface ParsedStatement {
  fileName: string
  pages: string[][]
}

interface UploadZoneProps {
  onStatementsExtracted: (statements: ParsedStatement[]) => void
}

export function UploadZone({ onStatementsExtracted }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter(
        (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'),
      )
      if (files.length === 0) {
        setError('Please choose PDF statement files.')
        return
      }

      setError(null)
      setIsProcessing(true)
      try {
        const results: ParsedStatement[] = []
        for (const file of files) {
          try {
            const pages = await extractLinesFromPdf(file)
            results.push({ fileName: file.name, pages })
          } catch {
            setError(
              (prev) =>
                `${prev ? prev + ' ' : ''}Could not read "${file.name}" — it may be encrypted, scanned as an image, or corrupted.`,
            )
          }
        }
        if (results.length > 0) onStatementsExtracted(results)
      } finally {
        setIsProcessing(false)
      }
    },
    [onStatementsExtracted],
  )

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload PDF statements"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          if (e.dataTransfer.files.length) void processFiles(e.dataTransfer.files)
        }}
        className={`rounded-xl border border-dashed p-12 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-sky-400 bg-sky-950/30'
            : 'border-slate-700 hover:border-slate-600'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) void processFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <p className="text-slate-300 font-medium">
          {isProcessing
            ? 'Reading statement in your browser…'
            : 'Drop bank or credit card statement PDFs here, or click to choose files'}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Files are parsed locally. Nothing is ever uploaded or stored on a
          server.
        </p>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-rose-400">
          {error}
        </p>
      )}
    </div>
  )
}
