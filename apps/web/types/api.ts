export interface ApiErrorResponse {
  success?: boolean;
  error?: {
    code?: string;
    message?: string;
  };
}
