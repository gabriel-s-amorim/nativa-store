import type { IncomingMessage, ServerResponse } from "http";
import { createApiApp } from "./app";

const app = createApiApp();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}
