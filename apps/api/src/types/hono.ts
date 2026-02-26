// define conext vars
export interface SessionContext {
  sessionId: string;
  userId: string;
  expiresAt: Date;
}

export interface HonoVariables {
  session: SessionContext;
}
