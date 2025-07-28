export interface ApiError {
  /** The HTTP status code of the error. */
  statusCode: number;
  /** A specific, internal error code (e.g., 'USER_NOT_FOUND', 'INVALID_CREDENTIALS'). */
  code: string;
  /** A human-readable message describing the error. */
  message: string;
  /** Optional: Additional details about the error, e.g., validation errors. */
  details?: Record<string, any> | string[] | string;
  /** The timestamp when the error occurred. */
  timestamp: string;
  /** The path of the request that caused the error. */
  path: string;
}
