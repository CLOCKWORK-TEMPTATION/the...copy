export function generateGeminiCacheKey(...parts: unknown[]) {
  return parts
    .map((part) => {
      if (typeof part === "string" || typeof part === "number") {
        return String(part)
      }

      try {
        return JSON.stringify(part)
      } catch {
        return String(part)
      }
    })
    .join(":")
}

type CacheOptions = {
  ttl?: number
}

export async function cachedGeminiCall<T>(
  _key: string,
  fn: () => Promise<T>,
  _options?: CacheOptions
): Promise<T>
export async function cachedGeminiCall<T>(
  _key: string,
  _ttlSeconds: number,
  fn: () => Promise<T>
): Promise<T>
export async function cachedGeminiCall<T>(
  _key: string,
  arg2: number | (() => Promise<T>),
  arg3?: CacheOptions | (() => Promise<T>)
): Promise<T> {
  const fn = typeof arg2 === "function" ? arg2 : (arg3 as () => Promise<T>)
  return fn()
}

export default {
  generateGeminiCacheKey,
  cachedGeminiCall,
}
