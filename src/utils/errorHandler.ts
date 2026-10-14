/**
 * Centralized Error Utility
 */

export function handleApiError(error: any): string {
  if (error.name === 'AbortError') {
    return 'Request timed out. Please try again.';
  }
  
  if (error.message && error.message.includes('fetch')) {
    return 'Network failure. Please check your internet connection.';
  }

  if (error.status === 401 || error.status === 403) {
    return 'Authentication error with the AI service.';
  }

  if (error.status === 429) {
    return 'Rate limit exceeded. Please wait a moment before trying again.';
  }

  if (error.message) {
      return `Server error: ${error.message}`;
  }

  return 'An unexpected error occurred. Please try again.';
}
