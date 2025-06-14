import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { log } from "./vite";

export function serveStaticWithFallback(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");
  const fallbackDistPath = path.resolve(import.meta.dirname, "../dist/public");

  let actualDistPath = distPath;

  // Check primary build location first
  if (!fs.existsSync(distPath)) {
    // Check fallback location (original vite config output)
    if (fs.existsSync(fallbackDistPath)) {
      actualDistPath = fallbackDistPath;
      log(`Using fallback build directory: ${fallbackDistPath}`, "express");
    } else {
      log(`No build directory found. Searched: ${distPath} and ${fallbackDistPath}`, "express");
      
      // Create a graceful fallback to prevent crashes
      app.use("*", (_req, res) => {
        res.status(503).json({ 
          error: "Application not built", 
          message: "Please run 'npm run build' or 'node build-production.js' first",
          searchedPaths: [distPath, fallbackDistPath]
        });
      });
      return;
    }
  } else {
    log(`Using primary build directory: ${distPath}`, "express");
  }

  app.use(express.static(actualDistPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(actualDistPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(503).json({ 
        error: "Index file not found", 
        message: "Build artifacts are incomplete",
        buildPath: actualDistPath
      });
    }
  });
}