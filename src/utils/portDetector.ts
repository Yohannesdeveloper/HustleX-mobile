/**
 * Utility to detect the backend server port dynamically
 * Tries multiple methods:
 * 1. API endpoint /api/port
 * 2. port.json file
 * 3. Common ports (5000, 5001, etc.)
 */

const PORT_CACHE_KEY = 'hustlex_backend_port';
const PORT_CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

/**
 * Get the dev server hostname (IP address) for React Native/Expo
 */
function getDevServerHostname(): string | null {
  try {
    // Try using Expo Constants (most reliable for Expo)
    if (typeof require !== 'undefined') {
      try {
        const Constants = require('expo-constants');
        if (Constants.default) {
          const expoConfig = Constants.default.expoConfig;
          if (expoConfig?.hostUri) {
            // hostUri is like "192.168.1.3:8081"
            const hostname = expoConfig.hostUri.split(':')[0];
            if (hostname && /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
              return hostname;
            }
          }
          // Try debuggerHost
          if (Constants.default.debuggerHost) {
            const hostname = Constants.default.debuggerHost.split(':')[0];
            if (hostname && /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
              return hostname;
            }
          }
        }
      } catch (e) {
        // expo-constants not available or error, continue
      }
    }
  } catch (e) {
    // Can't use require, continue
  }
  return null;
}

interface PortInfo {
  port: number;
  url: string;
  timestamp: number;
}

function getSafeLocalStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

/**
 * Try to detect port by attempting to fetch from API
 */
async function detectPortFromAPI(basePort: number, hostname: string = 'localhost'): Promise<number | null> {
  // Try 5001 first (default backend port), then 5002 (when 5001 is busy), then basePort, then 5000, then others
  const commonPorts = [5001, 5002, basePort, 5000, 5003, 3000, 3001];
  
  for (const port of commonPorts) {
    try {
      const response = await fetch(`http://${hostname}:${port}/api/port`, {
        method: 'GET',
        signal: AbortSignal.timeout(1000), // 1 second timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.port) {
          console.log(`[portDetector] Found port ${data.port} via /api/port on ${hostname}:${port}`);
          return data.port;
        }
      }
    } catch (error) {
      // Port not available, try next
      continue;
    }
  }
  
  return null;
}

/**
 * Try to read port from port.json file
 * Tries multiple methods: direct file fetch, and via backend API endpoints
 */
async function detectPortFromFile(hostname: string = 'localhost'): Promise<number | null> {
  // Method 1: Try to fetch port.json directly (works in web environments)
  try {
    const response = await fetch('/port.json', {
      method: 'GET',
      signal: AbortSignal.timeout(1000),
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.port) {
        console.log(`[portDetector] Found port from port.json: ${data.port}`);
        return data.port;
      }
    }
  } catch (error) {
    // File not available via direct fetch, try via backend
  }
  
  // Method 2: Try to get port.json via backend API on common ports
  // This works when the backend serves the port.json file
  const commonPorts = [5001, 5002, 5000, 5003];
  for (const port of commonPorts) {
    try {
      const response = await fetch(`http://${hostname}:${port}/port.json`, {
        method: 'GET',
        signal: AbortSignal.timeout(1000),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.port) {
          console.log(`[portDetector] Found port from backend port.json (${hostname}:${port}): ${data.port}`);
          return data.port;
        }
      }
    } catch (error) {
      // Port not available, try next
      continue;
    }
  }
  
  return null;
}

/**
 * Try common ports by checking health endpoint
 */
async function detectPortByHealthCheck(basePort: number, hostname: string = 'localhost'): Promise<number | null> {
  // Try 5001 first (default backend port), then 5002 (when 5001 is busy), then basePort, then 5000, then others
  const commonPorts = [5001, 5002, basePort, 5000, 5003, 3000, 3001];
  
  for (const port of commonPorts) {
    try {
      const response = await fetch(`http://${hostname}:${port}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(1000),
      });
      
      if (response.ok) {
        console.log(`[portDetector] Found backend on ${hostname}:${port} via health check`);
        return port;
      }
    } catch (error) {
      // Port not available, try next
      continue;
    }
  }
  
  return null;
}

/**
 * Get cached port if still valid
 */
function getCachedPort(): number | null {
  try {
    const storage = getSafeLocalStorage();
    const cached = storage ? storage.getItem(PORT_CACHE_KEY) : null;
    if (cached) {
      const portInfo: PortInfo = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - portInfo.timestamp < PORT_CACHE_TIMEOUT) {
        return portInfo.port;
      }
    }
  } catch (error) {
    // Invalid cache, ignore
  }
  
  return null;
}

/**
 * Cache the detected port
 */
function cachePort(port: number): void {
  try {
    const portInfo: PortInfo = {
      port,
      url: `http://localhost:${port}`,
      timestamp: Date.now(),
    };
    const storage = getSafeLocalStorage();
    if (storage) {
      storage.setItem(PORT_CACHE_KEY, JSON.stringify(portInfo));
    }
  } catch (error) {
    // localStorage not available, ignore
  }
}

/**
 * Clear the cached port
 * Useful when the backend port changes
 */
export function clearPortCache(): void {
  try {
    const storage = getSafeLocalStorage();
    if (storage) {
      storage.removeItem(PORT_CACHE_KEY);
      console.log('[portDetector] Port cache cleared');
    }
  } catch (error) {
    console.warn('[portDetector] Failed to clear port cache:', error);
  }
}

/**
 * Detect backend port using multiple methods
 */
export async function detectBackendPort(basePort: number = 5000, hostname: string = 'localhost'): Promise<number> {
  // Check cache first
  const cachedPort = getCachedPort();
  if (cachedPort) {
    // Verify cached port is still working (try both hostname and localhost)
    for (const testHostname of [hostname, 'localhost']) {
      try {
        const response = await fetch(`http://${testHostname}:${cachedPort}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(500),
        });
        if (response.ok) {
          console.log(`[portDetector] Using cached port ${cachedPort} on ${testHostname}`);
          return cachedPort;
        }
      } catch (error) {
        // Try next hostname
        continue;
      }
    }
  }
  
  // Try reading from port.json file FIRST (most reliable if backend wrote it)
  // Try both hostname and localhost
  for (const testHostname of [hostname, 'localhost']) {
    const detectedPort = await detectPortFromFile(testHostname);
    if (detectedPort) {
      cachePort(detectedPort);
      return detectedPort;
    }
  }
  
  // Try API endpoint (will try common ports including 5002)
  // Try both hostname and localhost
  for (const testHostname of [hostname, 'localhost']) {
    const detectedPort = await detectPortFromAPI(basePort, testHostname);
    if (detectedPort) {
      cachePort(detectedPort);
      return detectedPort;
    }
  }
  
  // Try health check on common ports (prioritize 5001 as default, then 5002 as fallback)
  // Try both hostname and localhost
  for (const testHostname of [hostname, 'localhost']) {
    const detectedPort = await detectPortByHealthCheck(basePort, testHostname);
    if (detectedPort) {
      cachePort(detectedPort);
      return detectedPort;
    }
  }
  
  // Fallback to base port
  console.warn(`[portDetector] Could not detect port on ${hostname} or localhost, using fallback: ${basePort}`);
  return basePort;
}

/**
 * Get backend base URL
 */
export async function getBackendUrl(): Promise<string> {
  // Method 0: Check for production/hosted backend URL (highest priority)
  try {
    if (typeof require !== 'undefined') {
      const Constants = require('expo-constants');
      if (Constants?.default?.expoConfig?.extra?.backendUrl) {
        const hostedUrl = Constants.default.expoConfig.extra.backendUrl;
        if (hostedUrl && hostedUrl !== 'null' && hostedUrl.trim() !== '') {
          console.log(`[portDetector] Using hosted backend URL: ${hostedUrl}`);
          return hostedUrl;
        }
      }
      // Also check environment variable
      if (Constants?.default?.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL) {
        const envUrl = Constants.default.expoConfig.extra.EXPO_PUBLIC_BACKEND_URL;
        if (envUrl && envUrl !== 'null' && envUrl.trim() !== '') {
          console.log(`[portDetector] Using environment backend URL: ${envUrl}`);
          return envUrl;
        }
      }
    }
  } catch (e) {
    // expo-constants not available, continue
  }
  
  let hostname = 'localhost';
  
  // Method 1: Try Expo Constants (most reliable for React Native/Expo)
  const expoHostname = getDevServerHostname();
  if (expoHostname) {
    hostname = expoHostname;
    console.log(`[portDetector] Using Expo hostname: ${hostname}`);
  }
  
  // Try to detect the dev server IP from various sources
  if (typeof window !== 'undefined') {
    // Check for devtunnels
    if (window.location && window.location.hostname && window.location.hostname.includes("devtunnels")) {
      return `https://${window.location.hostname}`;
    }
    
    // Method 2: Get from window.location.hostname
    if (hostname === 'localhost' && window.location && window.location.hostname) {
      const locationHostname = window.location.hostname;
      const isIPAddress = /^\d+\.\d+\.\d+\.\d+$/.test(locationHostname);
      const isLocalhost = locationHostname === 'localhost' || locationHostname === '127.0.0.1' || locationHostname === '0.0.0.0';
      
      if (isIPAddress && !isLocalhost) {
        hostname = locationHostname;
        console.log(`[portDetector] Using window.location hostname: ${hostname}`);
      }
    }
  }
  
  console.log(`[portDetector] Detecting port for hostname: ${hostname}`);
  const port = await detectBackendPort(5000, hostname);
  const url = `http://${hostname}:${port}`;
  console.log(`[portDetector] Final backend URL: ${url}`);
  return url;
}

/**
 * Get backend API URL
 */
export async function getBackendApiUrl(): Promise<string> {
  const baseUrl = await getBackendUrl();
  return `${baseUrl}/api`;
}

/**
 * Synchronous version that uses cached port or falls back to default
 * Use this for immediate needs, but prefer async versions
 * Defaults to 5001 (default backend port)
 */
export function getBackendPortSync(defaultPort: number = 5001): number {
  const cached = getCachedPort();
  // Try to read from port.json if available (synchronous fetch won't work, so use cached or default)
  // The async version will update the cache
  return cached || defaultPort;
}

export function getBackendUrlSync(): string {
  // Method 0: Check for production/hosted backend URL (highest priority)
  try {
    if (typeof require !== 'undefined') {
      const Constants = require('expo-constants');
      if (Constants?.default?.expoConfig?.extra?.backendUrl) {
        const hostedUrl = Constants.default.expoConfig.extra.backendUrl;
        if (hostedUrl && hostedUrl !== 'null' && hostedUrl.trim() !== '') {
          console.log(`[portDetector] Using hosted backend URL (sync): ${hostedUrl}`);
          return hostedUrl;
        }
      }
      // Also check environment variable
      if (Constants?.default?.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL) {
        const envUrl = Constants.default.expoConfig.extra.EXPO_PUBLIC_BACKEND_URL;
        if (envUrl && envUrl !== 'null' && envUrl.trim() !== '') {
          console.log(`[portDetector] Using environment backend URL (sync): ${envUrl}`);
          return envUrl;
        }
      }
    }
  } catch (e) {
    // expo-constants not available, continue
  }
  
  let hostname = 'localhost';
  
  // Method 1: Try Expo Constants (most reliable for React Native/Expo)
  const expoHostname = getDevServerHostname();
  if (expoHostname) {
    hostname = expoHostname;
    console.log(`[portDetector] Detected IP from Expo Constants: ${hostname}`);
  }
  
  // Try to detect the dev server IP from various sources
  if (typeof window !== 'undefined') {
    // Check for devtunnels
    if (window.location && window.location.hostname && window.location.hostname.includes("devtunnels")) {
      return `https://${window.location.hostname}`;
    }
    
    // Method 2: Get from window.location.hostname (works in web and some RN environments)
    if (hostname === 'localhost' && window.location && window.location.hostname) {
      const locationHostname = window.location.hostname;
      const isIPAddress = /^\d+\.\d+\.\d+\.\d+$/.test(locationHostname);
      const isLocalhost = locationHostname === 'localhost' || locationHostname === '127.0.0.1' || locationHostname === '0.0.0.0';
      
      if (isIPAddress && !isLocalhost) {
        hostname = locationHostname;
        console.log(`[portDetector] Detected IP from window.location: ${hostname}`);
      }
    }
    
    // Method 3: Try to extract from bundle URL (for React Native/Expo web)
    if (hostname === 'localhost' && typeof document !== 'undefined') {
      try {
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
          const src = scripts[i].src;
          if (src && src.includes('://')) {
            try {
              const url = new URL(src);
              const urlHostname = url.hostname;
              const isIPAddress = /^\d+\.\d+\.\d+\.\d+$/.test(urlHostname);
              if (isIPAddress && urlHostname !== '127.0.0.1' && urlHostname !== '0.0.0.0') {
                hostname = urlHostname;
                console.log(`[portDetector] Detected IP from script src: ${hostname}`);
                break;
              }
            } catch (e) {
              // Invalid URL, continue
            }
          }
        }
      } catch (e) {
        // Can't access scripts, continue
      }
    }
    
    // Method 4: Try to extract from current page URL
    if (hostname === 'localhost' && window.location && window.location.href) {
      try {
        const url = new URL(window.location.href);
        const urlHostname = url.hostname;
        const isIPAddress = /^\d+\.\d+\.\d+\.\d+$/.test(urlHostname);
        if (isIPAddress && urlHostname !== '127.0.0.1' && urlHostname !== '0.0.0.0') {
          hostname = urlHostname;
          console.log(`[portDetector] Detected IP from window.location.href: ${hostname}`);
        }
      } catch (e) {
        // Invalid URL, continue
      }
    }
  }
  
  const port = getBackendPortSync();
  const url = `http://${hostname}:${port}`;
  console.log(`[portDetector] Final backend URL: ${url}`);
  return url;
}

export function getBackendApiUrlSync(): string {
  const baseUrl = getBackendUrlSync();
  return `${baseUrl}/api`;
}
