"use client"

import { useState, useCallback } from "react"
import { Upload } from "lucide-react"

/**
 * FileUpload Component
 * Handles file uploads (PDF, DOCX, TXT)
 */
interface FileUploadProps {
  onFileContent: (content: string, filename: string) => void
  accept?: string
  maxSize?: number
}

export function FileUpload({
  onFileContent,
  accept = ".pdf,.docx,.txt",
  maxSize = 10 * 1024 * 1024 // 10MB
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)

    // Check file size
    if (file.size > maxSize) {
      setError("حجم الملف كبير جدًا")
      return
    }

    // Check file type
    const extension = file.name.split(".").pop()?.toLowerCase()
    if (!["pdf", "docx", "txt"].includes(extension || "")) {
      setError("نوع الملف غير مدعوم")
      return
    }

    setIsLoading(true)

    try {
      let content = ""

      if (extension === "txt") {
        content = await file.text()
      } else if (extension === "pdf") {
        // PDF extraction would go here
        content = "محتوى PDF - يتطلب مكتبة PDFjs"
      } else if (extension === "docx") {
        // DOCX extraction would go here
        content = "محتوى DOCX - يتطلب مكتبة Mammoth"
      }

      onFileContent(content, file.name)
    } catch (err) {
      setError("فشل في قراءة الملف")
    } finally {
      setIsLoading(false)
    }
  }, [maxSize, onFileContent])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging
          ? "border-[#FFD700] bg-[#FFD700]/10"
          : "border-gray-600 hover:border-gray-500"
      }`}
    >
      <input
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isLoading}
      />

      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />

      {isLoading ? (
        <p className="text-sm text-gray-400">جاري المعالجة...</p>
      ) : (
        <>
          <p className="text-sm text-gray-300 mb-1">
            اسحب ملفًا هنا أو انقر للاختيار
          </p>
          <p className="text-xs text-gray-500">
            PDF, DOCX, TXT (حد أقصى {maxSize / 1024 / 1024}MB)
          </p>
        </>
      )}

      {error && (
        <p className="text-sm text-red-400 mt-2">{error}</p>
      )}
    </div>
  )
}

export default FileUpload
