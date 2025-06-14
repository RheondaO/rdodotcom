import fs from "fs";
import path from "path";
import { log } from "./vite";

export function checkDeploymentReadiness(): boolean {
  const buildPath = path.resolve(import.meta.dirname, "public");
  const fallbackPath = path.resolve(import.meta.dirname, "../dist/public");
  
  if (fs.existsSync(buildPath)) {
    const files = fs.readdirSync(buildPath);
    const hasIndex = files.includes('index.html');
    
    if (hasIndex) {
      // Check if it's a full build (with assets) or minimal build
      const hasAssets = files.some(f => f.startsWith('assets') || f.endsWith('.js') || f.endsWith('.css'));
      const buildType = hasAssets ? 'full' : 'minimal';
      log(`✅ Deployment ready: ${buildType} build with ${files.length} files`, "deployment");
      return true;
    } else {
      log(`⚠️ Build directory exists but missing index.html`, "deployment");
      return false;
    }
  } else if (fs.existsSync(fallbackPath)) {
    log(`✅ Build found in fallback location: ${fallbackPath}`, "deployment");
    return true;
  } else {
    log(`❌ No build found. Run build command first`, "deployment");
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