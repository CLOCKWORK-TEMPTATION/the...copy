export interface MetricsSnapshot {
  timestamp?: string
  [key: string]: unknown
}

export interface DashboardSummary {
  status?: string
  [key: string]: unknown
}

export interface HealthStatus {
  status?: string
  [key: string]: unknown
}

export interface PerformanceReport {
  generatedAt?: string
  [key: string]: unknown
}

export interface DatabaseMetrics {
  status?: string
  [key: string]: unknown
}

export interface RedisMetrics {
  status?: string
  [key: string]: unknown
}

export interface QueueMetrics {
  status?: string
  [key: string]: unknown
}

export interface ApiMetrics {
  status?: string
  [key: string]: unknown
}

export interface ResourceMetrics {
  status?: string
  [key: string]: unknown
}

export interface GeminiMetrics {
  status?: string
  [key: string]: unknown
}
