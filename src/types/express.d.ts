// Extends Express Request type with authenticated user payload

import { RoleName } from "./common";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: RoleName };
    }
  }
}

export {};

