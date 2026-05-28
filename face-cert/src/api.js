const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || ""

export function apiUrl(path) {
  if (!path.startsWith("/api")) {
    return path
  }

  if (!API_BASE_URL) {
    return path
  }

  return `${API_BASE_URL}${path.replace(/^\/api/, "")}`
}

const originalFetch = window.fetch.bind(window)

window.fetch = (input, init) => {
  if (typeof input === "string") {
    return originalFetch(apiUrl(input), init)
  }

  if (input instanceof Request) {
    return originalFetch(
      new Request(apiUrl(input.url), input),
      init
    )
  }

  return originalFetch(input, init)
}
