import fs from 'fs';
import path from 'path';
import os from 'os';
import { createServer } from 'net';

export class PortManager {
  private lockDir: string;
  private lockFiles: Set<string>;
  private currentPort: number | null;

  constructor() {
    this.lockDir = path.join(os.tmpdir(), 'port-locks');
    this.lockFiles = new Set();
    this.currentPort = null;

    // Ensure lock directory exists
    if (!fs.existsSync(this.lockDir)) {
      fs.mkdirSync(this.lockDir, { recursive: true });
    }

    // Always clean up stale locks on startup
    this.cleanupAllLocks();

    // Ensure cleanup on process exit
    process.on('exit', () => this.releaseAll());
    process.on('SIGINT', () => {
      this.releaseAll();
      process.exit();
    });
    process.on('SIGTERM', () => {
      this.releaseAll();
      process.exit();
    });
  }

  private getLockPath(port: number): string {
    return path.join(this.lockDir, `port-${port}.lock`);
  }

  private cleanupAllLocks(): void {
    console.log('Performing complete lock cleanup...');
    if (fs.existsSync(this.lockDir)) {
      const files = fs.readdirSync(this.lockDir);
      files.forEach(file => {
        const lockPath = path.join(this.lockDir, file);
        try {
          fs.unlinkSync(lockPath);
          console.log(`Removed lock file: ${file}`);
        } catch (err) {
          console.warn(`Failed to remove lock file: ${file}`, err);
        }
      });
      console.log('Complete lock cleanup finished');
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async acquirePort(startPort: number = 3000, endPort: number = 5100): Promise<number> {
    // If we already have a port, release it first
    if (this.currentPort !== null) {
      this.releasePort(this.currentPort);
    }

    console.log(`Attempting to acquire port in range ${startPort}-${endPort}`);

    // Clean all locks before starting
    this.cleanupAllLocks();
    await this.sleep(1000); // Wait for any cleanup to complete

    // Try preferred port first
    try {
      console.log(`Testing preferred port ${startPort}...`);
      await this.testPort(startPort);
      
      // If we get here, the preferred port is available
      const lockPath = this.getLockPath(startPort);
      fs.writeFileSync(lockPath, process.pid.toString(), { flag: 'wx' });
      this.lockFiles.add(lockPath);
      this.currentPort = startPort;
      
      console.log(`Successfully acquired preferred port ${startPort}`);
      return startPort;
    } catch (err) {
      console.log(`Preferred port ${startPort} is not available: ${err instanceof Error ? err.message : 'Unknown error'}`);
      // Continue to try other ports
    }

    // Try other ports in the range
    const portsToTry = Array.from(
      { length: endPort - startPort }, 
      (_, i) => startPort + i + 1
    );
    
    // Shuffle the ports to avoid contention
    portsToTry.sort(() => Math.random() - 0.5);

    for (const port of portsToTry) {
      console.log(`Testing port ${port}...`);

      try {
        // Test if port is actually available
        await this.testPort(port);

        // If we get here, the port is available
        const lockPath = this.getLockPath(port);
        fs.writeFileSync(lockPath, process.pid.toString(), { flag: 'wx' });
        this.lockFiles.add(lockPath);
        this.currentPort = port;

        console.log(`Successfully acquired port ${port}`);
        return port;
      } catch (err) {
        console.log(`Port ${port} is not available: ${err instanceof Error ? err.message : 'Unknown error'}`);
        continue; // Try next port
      }
    }

    throw new Error(`No available ports found between ${startPort} and ${endPort}`);
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
          reject(new Error(`Port ${port} is in use`));
        } else {
          reject(err);
        }
      });

      server.once('listening', () => {
        cleanup();
        resolve();
      });

      try {
        server.listen(port, '0.0.0.0');
      } catch (err) {
        cleanup();
        reject(err);
      }
    });
  }

  releasePort(port: number): void {
    const lockPath = this.getLockPath(port);
    console.log(`Releasing port ${port}`);
    try {
      if (fs.existsSync(lockPath)) {
        fs.unlinkSync(lockPath);
        this.lockFiles.delete(lockPath);
        if (this.currentPort === port) {
          this.currentPort = null;
        }
        console.log(`Released port ${port} successfully`);
      }
    } catch (err) {
      console.warn(`Failed to release port ${port}`, err);
    }
  }

  releaseAll(): void {
    console.log('Releasing all ports...');
    this.cleanupAllLocks();
    this.lockFiles.clear();
    this.currentPort = null;
    console.log('All ports released');
  }
}

// Create singleton instance
export const portManager = new PortManager();