import type { PublicUser } from '@xd/db/schema/users';
import type { SessionPayload } from '@xd/shared';

export interface SessionResponse {
  session: SessionPayload | null;
  user: PublicUser | null;
}
