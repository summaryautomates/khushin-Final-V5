import fs from 'fs';
import path from 'path';
import os from 'os';
import { createServer } from 'net';

export class PortManager {
  private lockDir: string;
  private lockFiles: Set<string>;

  constructor() {
    this.lockDir = path.join(os.tmpdir(), 'port-locks');
    this.lockFiles = new Set();

    // Ensure lock directory exists
    if (!fs.existsSync(this.lockDir)) {
      fs.mkdirSync(this.lockDir, { recursive: true });
    }

    // Clean up stale locks on startup
    this.cleanupStaleLocks();
  }

  private getLockPath(port: number): string {
    return path.join(this.lockDir, `port-${port}.lock`);
  }

  private isProcessRunning(pid: number): boolean {
    try {
      // Send signal 0 to check if process exists
      process.kill(pid, 0);
      return true;
    } catch (err) {
      return false;
    }
  }

  private cleanupStaleLocks(): void {
    console.log('Cleaning up stale port locks...');
    if (fs.existsSync(this.lockDir)) {
      const files = fs.readdirSync(this.lockDir);
      let cleanedCount = 0;

      for (const file of files) {
        const lockPath = path.join(this.lockDir, file);
        try {
          const content = fs.readFileSync(lockPath, 'utf-8');
          const pid = parseInt(content, 10);
          const stat = fs.statSync(lockPath);
          const now = new Date().getTime();
          const isStale = now - stat.mtime.getTime() > 3600000; // 1 hour

          if (isStale || !this.isProcessRunning(pid)) {
            fs.unlinkSync(lockPath);
            cleanedCount++;
            console.log(`Cleaned stale lock: ${file} (PID: ${pid})`);
          }
        } catch (err) {
          // If we can't read the file or it's invalid, remove it
          try {
            fs.unlinkSync(lockPath);
            cleanedCount++;
            console.log(`Removed invalid lock file: ${file}`);
          } catch (unlinkErr) {
            console.warn(`Failed to remove invalid lock: ${file}`, unlinkErr);
          }
        }
      }
      console.log(`Cleanup complete. Removed ${cleanedCount} stale locks.`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryWithDelay<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 500
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries) {
          console.log(`Retry attempt ${attempt} failed, waiting ${delayMs}ms before next attempt...`);
          await this.sleep(delayMs);
        }
      }
    }

    throw lastError;
  }

  async acquirePort(startPort: number, endPort: number): Promise<number> {
    console.log(`Attempting to acquire port in range ${startPort}-${endPort}`);

    for (let port = startPort; port <= endPort; port++) {
      const lockPath = this.getLockPath(port);
      console.log(`Trying port ${port}...`);

      try {
        // Check if lock exists and is valid
        if (fs.existsSync(lockPath)) {
          const content = fs.readFileSync(lockPath, 'utf-8');
          const pid = parseInt(content, 10);

          if (this.isProcessRunning(pid)) {
            console.log(`Port ${port} is locked by running process ${pid}`);
            continue;
          } else {
            console.log(`Found stale lock for port ${port}, cleaning up`);
            fs.unlinkSync(lockPath);
            // Add a small delay after removing stale lock
            await this.sleep(100);
          }
        }

        // Try to create lock file
        fs.writeFileSync(lockPath, process.pid.toString(), { flag: 'wx' });
        this.lockFiles.add(lockPath);
        console.log(`Created lock file for port ${port}`);

        // Add a small delay before testing port
        await this.sleep(100);

        // Test if port is actually available with retries
        await this.retryWithDelay(
          () => this.testPort(port),
          3,
          500
        );

        console.log(`Successfully acquired port ${port}`);
        return port;

      } catch (err) {
        if (fs.existsSync(lockPath) && !this.lockFiles.has(lockPath)) {
          try {
            fs.unlinkSync(lockPath);
            // Add a small delay after cleanup
            await this.sleep(100);
          } catch (unlinkErr) {
            console.warn(`Failed to cleanup lock after error: ${lockPath}`, unlinkErr);
          }
        }
        console.log(`Port ${port} is not available: ${err instanceof Error ? err.message : 'Unknown error'}`);
        continue;
      }
    }

    throw new Error(`No available ports found between ${startPort} and ${endPort}. Please try again later or contact system administrator.`);
  }

  private testPort(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const server = createServer();
      let timeoutId: NodeJS.Timeout;

      const cleanup = () => {
        clearTimeout(timeoutId);
        server.close();
      };

      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error(`Port ${port} test timed out`));
      }, 3000);

      server.once('error', (err: NodeJS.ErrnoException) => {
        cleanup();
        if (err.code === 'EADDRINUSE') {
          this.releasePort(port);
          reject(new Error(`Port ${port} is in use`));
        } else {
          reject(err);
        }
      });

      server.once('listening', () => {
        cleanup();
        resolve();
      });

      server.listen(port, '0.0.0.0');
    });
  }

  releasePort(port: number): void {
    const lockPath = this.getLockPath(port);
    console.log(`Releasing port ${port}`);
    try {
      if (fs.existsSync(lockPath)) {
        fs.unlinkSync(lockPath);
        this.lockFiles.delete(lockPath);
        console.log(`Released port ${port} successfully`);
      }
    } catch (err) {
      console.warn(`Failed to release port ${port}`, err);
    }
  }

  releaseAll(): void {
    console.log('Releasing all ports...');
    Array.from(this.lockFiles).forEach(lockPath => {
      try {
        if (fs.existsSync(lockPath)) {
          fs.unlinkSync(lockPath);
          console.log(`Released lock: ${lockPath}`);
        }
      } catch (err) {
        console.warn(`Failed to release lock: ${lockPath}`, err);
      }
    });
    this.lockFiles.clear();
    console.log('All ports released');
  }
}

// Create singleton instance
export const portManager = new PortManager();

// Cleanup on process exit
process.on('exit', () => {
  portManager.releaseAll();
});

process.on('SIGINT', () => {
  portManager.releaseAll();
  process.exit();
});

process.on('SIGTERM', () => {
  portManager.releaseAll();
  process.exit();
});