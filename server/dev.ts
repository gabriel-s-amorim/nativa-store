import { createApiApp } from "./app";

const port = Number(process.env.API_PORT) || 3001;
const app = createApiApp();

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
