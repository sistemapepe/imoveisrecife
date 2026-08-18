import { lazy, Component, ReactNode } from "react";

/**
 * A specialized lazy loader that handles "Failed to fetch dynamically imported module" errors
 * by forcing a page reload once. This often happens after a new deployment where old asset
 * hashes no longer exist on the server.
 */
export function safeLazy(importFn: () => Promise<{ default: any }>) {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.error("Lazy load failed:", error);
      
      // Check if this error happened before
      const hasRetried = window.sessionStorage.getItem("lazy_retry_occurred");
      
      if (!hasRetried && (
        error.message?.includes("Failed to fetch dynamically imported module") ||
        error.message?.includes("Importing a module script failed") ||
        error.name === "ChunkLoadError"
      )) {
        window.sessionStorage.setItem("lazy_retry_occurred", "true");
        window.location.reload();
        // Return a promise that never resolves while the page reloads
        return new Promise(() => {});
      }
      
      throw error;
    }
  });
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Basic ErrorBoundary to catch chunk load errors at the component level
 */
export class SafeSuspenseBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    if (
      error.message?.includes("Failed to fetch dynamically imported module") ||
      error.name === "ChunkLoadError"
    ) {
      const hasRetried = window.sessionStorage.getItem("lazy_retry_occurred");
      if (!hasRetried) {
        window.sessionStorage.setItem("lazy_retry_occurred", "true");
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}
