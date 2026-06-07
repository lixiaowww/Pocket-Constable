import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";
import app from "./api-app";

const PORT = 3001;

// Vite Setup for Development / Static serving for production
async function startServer() {
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
    console.log(`[V3 SECURITY ENGINE ACTIVED]`);
    console.log(`Local Access: http://localhost:${PORT}`);
    console.log(`Authentication API Route: /api/validate`);
    console.log(`========================================\n`);
  });
}

startServer();
