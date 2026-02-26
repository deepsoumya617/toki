export interface SessionPayload<TExpiresAt = Date> {
  sessionId: string;
  userId: string;
  expiresAt: TExpiresAt;
}
