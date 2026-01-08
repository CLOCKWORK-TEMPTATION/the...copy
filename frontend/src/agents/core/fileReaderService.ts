export interface ProcessedFile {
  name?: string
  filename?: string
  content: string
  mimeType?: string
  fileType?: string
  isBase64?: boolean
  size?: number
  metadata?: Record<string, unknown>
}

export async function readFileStub(): Promise<ProcessedFile | null> {
  return null
}

export default {
  readFileStub,
}
