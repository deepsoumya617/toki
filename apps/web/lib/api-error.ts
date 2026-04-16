import type { ApiErrorResponse } from '@/types/api';

export async function parseApiError(
  response: Response,
  fallbackMessage: string
): Promise<Error> {
  try {
    const errorBody = (await response.json()) as ApiErrorResponse;
    return new Error(errorBody.error?.message ?? fallbackMessage);
  } catch {
    return new Error(fallbackMessage);
  }
}
