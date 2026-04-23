import type { ApiErrorResponse } from '@/types/api';

export class ApiErrorClient extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export async function parseApiError(
  response: Response,
  fallbackMessage: string
): Promise<Error> {
  try {
    const errorBody = (await response.json()) as ApiErrorResponse;
    return new ApiErrorClient(
      errorBody.error?.code ?? 'UNKNOWN',
      errorBody.error?.message ?? fallbackMessage
    );
  } catch {
    return new Error(fallbackMessage);
  }
}
