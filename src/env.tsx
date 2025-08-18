// export const API_TOKEN = "your_token_here";
//
export const API_TOKEN = "2d0c9c06260f73f:667d5babc3706d3";
// 97299629556d968:bf70432185b6d73
export const BASE_URL = "https://itsupport.inxeoz.com";

/**
 * Extracts the base URL (protocol + host + optional port) from the current browser URL.
 * Example: from "http://10.120.9.21:8000/app/it_support" it returns "http://10.120.9.21:8000"
 */
export function getBaseUrl(): string {
  const { protocol, host } = window.location;
  return `${protocol}//${host}`;
}

/**
 * Extracts protocol, hostname, port, and base URL from the current browser URL.
 * Example: from "http://10.120.9.21:8000/app/it_support"
 * Returns:
 * {
 *   protocol: "http:",
 *   hostname: "10.120.9.21",
 *   port: "8000",
 *   baseUrl: "http://10.120.9.21:8000"
 * }
 */
export function getUrlParts() {
  const { protocol, hostname, port } = window.location;
  const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  return {
    protocol,
    hostname,
    port,
    baseUrl,
  };
}
