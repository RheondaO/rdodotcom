import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { log } from "./vite";
import { checkDeploymentReadiness, getStaticPath } from "./deployment-check";

export function serveStaticWithFallback(app: Express) {
  const isReady = checkDeploymentReadiness();
  const staticPath = getStaticPath();

  if (!isReady || !staticPath) {
    log(`Deployment not ready. Build the application first.`, "express");
    
    // Create a graceful fallback to prevent crashes
    app.use("*", (_req, res) => {
      res.status(503).json({ 
        error: "Application not built", 
        message: "Run 'npm run build' to build the application for production",
        buildRequired: true
      });
    });
    return;
  }

  log(`Serving static files from: ${staticPath}`, "express");
  app.use(express.static(staticPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(staticPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(503).json({ 
        error: "Index file not found", 
        message: "Build artifacts are incomplete. Rebuild the application.",
        buildPath: staticPath
      });
    }
  });
}