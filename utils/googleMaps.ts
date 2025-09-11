/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * Google Maps API Utilities
 */

declare global {
  interface Window {
    google?: any;
    googleMapsCallback?: () => void;
  }
}

interface GoogleMapsLoaderOptions {
  libraries?: string[];
  apiKey?: string;
}

class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private loadPromise: Promise<void> | null = null;
  private isLoaded = false;
  private readonly requiredLibraries = new Set<string>();

  private constructor() {}

  static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  /**
   * Add required libraries for Google Maps
   */
  addLibraries(libraries: string[]): void {
    libraries.forEach(lib => this.requiredLibraries.add(lib));
  }

  /**
   * Check if Google Maps API is already loaded
   */
  isGoogleMapsLoaded(): boolean {
    return typeof window !== 'undefined' && 
           window.google && 
           window.google.maps && 
           this.isLoaded;
  }

  /**
   * Load Google Maps API with all required libraries
   */
  async loadGoogleMaps(options: GoogleMapsLoaderOptions = {}): Promise<void> {
    // Return existing promise if already loading
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Return immediately if already loaded
    if (this.isGoogleMapsLoaded()) {
      return Promise.resolve();
    }

    // Add any additional libraries from options
    if (options.libraries) {
      this.addLibraries(options.libraries);
    }

    // Get API key
    const apiKey = options.apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    // Create loading promise
    this.loadPromise = new Promise<void>((resolve, reject) => {
      try {
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          console.warn('Google Maps script already exists, waiting for load...');
          
          // Wait for existing script to load
          const checkLoaded = () => {
            if (this.isGoogleMapsLoaded()) {
              this.isLoaded = true;
              resolve();
            } else {
              setTimeout(checkLoaded, 100);
            }
          };
          checkLoaded();
          return;
        }

        // Create callback function
        const callbackName = 'googleMapsCallback';
        (window as any)[callbackName] = () => {
          this.isLoaded = true;
          delete (window as any)[callbackName];
          resolve();
        };

        // Create script element
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.defer = true;
        
        // Build URL with all required libraries and proper async loading
        const libraries = Array.from(this.requiredLibraries).join(',');
        const params = new URLSearchParams({
          key: apiKey,
          callback: callbackName,
          loading: 'async',  // Explicitly set loading=async for performance
          ...(libraries && { libraries })
        });
        
        script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
        
        script.onerror = () => {
          this.loadPromise = null;
          reject(new Error('Failed to load Google Maps API'));
        };

        // Add script to document
        document.head.appendChild(script);

        console.log(`🗺️ Loading Google Maps API with libraries: ${libraries || 'none'}`);
        
      } catch (error) {
        this.loadPromise = null;
        reject(error);
      }
    });

    return this.loadPromise;
  }

  /**
   * Ensure Google Maps is loaded with specific libraries
   */
  async ensureLoaded(libraries: string[] = []): Promise<void> {
    this.addLibraries(libraries);
    return this.loadGoogleMaps();
  }

  /**
   * Reset the loader (useful for testing)
   */
  reset(): void {
    this.loadPromise = null;
    this.isLoaded = false;
    this.requiredLibraries.clear();
  }
}

// Export singleton instance
export const googleMapsLoader = GoogleMapsLoader.getInstance();

// Convenience functions
export const loadGoogleMaps = (libraries: string[] = []) => 
  googleMapsLoader.ensureLoaded(libraries);

export const isGoogleMapsLoaded = () => 
  googleMapsLoader.isGoogleMapsLoaded();

// Common library combinations
export const GOOGLE_MAPS_LIBRARIES = {
  PLACES: ['places'],
  GEOMETRY: ['geometry'],
  DRAWING: ['drawing'],
  VISUALIZATION: ['visualization'],
  PLACES_AND_GEOMETRY: ['places', 'geometry'],
  ALL: ['places', 'geometry', 'drawing', 'visualization']
} as const;
