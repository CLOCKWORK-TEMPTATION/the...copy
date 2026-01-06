/**
 * API client stub
 * TODO: Implement actual API client
 */

export async function get(url: string) {
  const response = await fetch(url)
  return response.json()
}

export async function post(url: string, data?: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return response.json()
}

export default { get, post }
