import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";
import apiHandler from "./api/index";

const PORT = 3001;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Forward all API requests to the unified Vercel handler
  app.all("/api*", (req, res) => {
    apiHandler(req, res);
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n========================================`);
    console.log(`[V3 SECURITY ENGINE ACTIVE]`);
    console.log(`Local Access: http://localhost:${PORT}`);
    console.log(`Authentication API Route: /api/validate`);
    console.log(`========================================\n`);
  });
}

startServer();
