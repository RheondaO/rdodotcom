import fs from "fs";
import path from "path";
import { log } from "./vite";

export function checkDeploymentReadiness(): boolean {
  const buildPath = path.resolve(import.meta.dirname, "public");
  const fallbackPath = path.resolve(import.meta.dirname, "../dist/public");
  
  if (fs.existsSync(buildPath)) {
    const files = fs.readdirSync(buildPath);
    const hasIndex = files.includes('index.html');
    const hasAssets = files.some(f => f.startsWith('assets') || f.endsWith('.js') || f.endsWith('.css'));
    
    if (hasIndex && hasAssets) {
      log(`✅ Deployment ready: ${files.length} files in server/public`, "deployment");
      return true;
    } else {
      log(`⚠️ Incomplete build: missing ${!hasIndex ? 'index.html' : 'assets'}`, "deployment");
      return false;
    }
  } else if (fs.existsSync(fallbackPath)) {
    log(`⚠️ Build found in fallback location: ${fallbackPath}`, "deployment");
    return true;
  } else {
    log(`❌ No build found. Run 'npm run build' first`, "deployment");
    return false;
  }
}

export function getStaticPath(): string | null {
  const buildPath = path.resolve(import.meta.dirname, "public");
  const fallbackPath = path.resolve(import.meta.dirname, "../dist/public");
  
  if (fs.existsSync(buildPath)) {
    return buildPath;
  } else if (fs.existsSync(fallbackPath)) {
    return fallbackPath;
  }
  return null;
}