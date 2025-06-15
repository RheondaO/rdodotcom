import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Trust proxy for production deployments
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Enable gzip compression
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Add response headers for better caching
app.use((req, res, next) => {
  if (req.path.startsWith('/api/public/')) {
    res.set('Cache-Control', 'public, max-age=300'); // Cache public data for 5 minutes
  } else if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'no-cache');
  }
  next();
});

// CORS configuration for production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && origin.includes('replit.app')) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    }
    next();
  });
}

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'bellejournalapp-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to false for Replit deployments
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Optimized request logging middleware - only in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;

    res.on("finish", () => {
      if (path.startsWith("/api")) {
        const duration = Date.now() - start;
        log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
      }
    });

    next();
  });
}

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup Vite in development, serve static files in production
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();