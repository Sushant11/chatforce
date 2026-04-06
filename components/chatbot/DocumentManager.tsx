'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, File, Trash2, Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react'
import { cn, formatBytes, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { Document } from '@/types'

interface DocumentManagerProps {
  chatbotId: string
  initialDocuments: Document[]
}

interface UploadingFile {
  name: string
  progress: number
  status: 'uploading' | 'processing' | 'done' | 'error'
  error?: string
}

export default function DocumentManager({ chatbotId, initialDocuments }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [uploading, setUploading] = useState<UploadingFile[]>([])
  const [deleting, setDeleting] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        const uploadEntry: UploadingFile = {
          name: file.name,
          progress: 0,
          status: 'uploading',
        }
        setUploading((prev) => [...prev, uploadEntry])

        const formData = new FormData()
        formData.append('file', file)
        formData.append('chatbotId', chatbotId)

        try {
          // Fake progress
          const progressInterval = setInterval(() => {
            setUploading((prev) =>
              prev.map((u) =>
                u.name === file.name && u.status === 'uploading'
                  ? { ...u, progress: Math.min(u.progress + 15, 85) }
                  : u
              )
            )
          }, 300)

          const res = await api.post('/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })

          clearInterval(progressInterval)

          setUploading((prev) =>
            prev.map((u) => (u.name === file.name ? { ...u, progress: 100, status: 'processing' } : u))
          )

          // Give a moment for processing state to show
          await new Promise((r) => setTimeout(r, 800))

          setUploading((prev) =>
            prev.map((u) => (u.name === file.name ? { ...u, status: 'done' } : u))
          )

          setDocuments((prev) => [res.data.document, ...prev])
          toast.success(`${file.name} uploaded and processed`)
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Upload failed'
          setUploading((prev) =>
            prev.map((u) => (u.name === file.name ? { ...u, status: 'error', error: msg } : u))
          )
          toast.error(`Failed to upload ${file.name}`)
        }
      }

      // Clean up done/error entries after a few seconds
      setTimeout(() => {
        setUploading((prev) => prev.filter((u) => u.status === 'uploading' || u.status === 'processing'))
      }, 3000)
    },
    [chatbotId]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'text/csv': ['.csv'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  })

  const deleteDocument = async (docId: string, filename: string) => {
    setDeleting(docId)
    try {
      await api.delete(`/documents/${docId}`)
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
      toast.success(`${filename} deleted`)
    } catch {
      toast.error('Failed to delete document')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-blue-500 bg-blue-500/5'
            : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 text-slate-500 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-300">
          {isDragActive ? 'Drop files here...' : 'Drag & drop files, or click to browse'}
        </p>
        <p className="text-xs text-slate-500 mt-1">PDF, TXT, MD, CSV · Max 10MB per file</p>
      </div>

      {/* Uploading files */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((f) => (
            <Card key={f.name} className="bg-slate-800 border-slate-700">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 truncate">{f.name}</p>
                    {f.status === 'uploading' && (
                      <>
                        <Progress value={f.progress} className="mt-1 h-1" />
                        <p className="text-xs text-slate-500 mt-1">Uploading... {f.progress}%</p>
                      </>
                    )}
                    {f.status === 'processing' && (
                      <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Processing & generating embeddings...
                      </p>
                    )}
                    {f.status === 'done' && (
                      <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Ready
                      </p>
                    )}
                    {f.status === 'error' && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {f.error}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Document list */}
      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-3">
          {documents.length > 0 ? `${documents.length} Document${documents.length !== 1 ? 's' : ''}` : 'No documents yet'}
        </h3>

        {documents.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">
            Upload documents to give your chatbot knowledge.
          </p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <Card key={doc.id} className="bg-slate-900 border-slate-800">
                <CardContent className="p-3 flex items-center gap-3">
                  <File className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{doc.original_filename || doc.filename}</p>
                    <p className="text-xs text-slate-500">
                      {doc.file_size ? formatBytes(doc.file_size) : ''} · {formatDate(doc.created_at)}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-green-700 text-green-400 text-xs flex-shrink-0">
                    Ready
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-500 hover:text-red-400 flex-shrink-0"
                    onClick={() => deleteDocument(doc.id, doc.original_filename || doc.filename)}
                    disabled={deleting === doc.id}
                  >
                    {deleting === doc.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
