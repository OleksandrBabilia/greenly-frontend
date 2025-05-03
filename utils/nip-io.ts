/**
 * Converts a URL to use nip.io if it contains an IP address
 * This is useful for OAuth flows that require domain names instead of IP addresses
 */
export function convertToNipIo(url: string): string {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname
  
    // Check if the hostname is an IP address
    const ipRegex = /^(\d+\.\d+\.\d+\.\d+)$/
    const match = hostname.match(ipRegex)
  
    if (match) {
      // It's an IP address, convert to nip.io format
      const ip = match[1]
      urlObj.hostname = `${ip}.nip.io`
      return urlObj.toString()
    }
  
    // It's already a domain name, return as is
    return url
  }
  
  /**
   * Gets the current origin and converts it to use nip.io if it's an IP address
   */
  export function getNipIoOrigin(): string {
    if (typeof window === "undefined") return ""
  
    const origin = window.location.origin
    return convertToNipIo(origin)
  }
  