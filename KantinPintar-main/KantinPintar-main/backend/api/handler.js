import app, { ensureDBConnected } from "./index.js";

export default async function handler(req, res) {
  await ensureDBConnected(); // pastikan database connect
  app(req, res); // delegasi ke express
}
