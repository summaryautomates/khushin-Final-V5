import fs from 'fs';
import path from 'path';
import os from 'os';
import { createServer } from 'net';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

  private async forceKillPort(port: number): Promise<void> {
    try {
      console.log(`Attempting to force kill processes on port ${port}...`);
      if (process.platform === 'win32') {
        const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
        console.log(`Windows port check output:`, stdout);
      } else {
        const { stdout, stderr } = await execAsync(`lsof -i:${port}`);
        console.log(`Port usage check output:`, stdout);
        if (stderr) console.error(`Port usage check error:`, stderr);

        await execAsync(`lsof -i:${port} -t | xargs kill -9`).catch(() => {
          console.log('No processes to kill or kill command failed');
        });
      }
      await this.sleep(2000); // Wait for processes to be killed
      console.log(`Force kill completed for port ${port}`);
    } catch (err) {
      console.log(`No active process found on port ${port} or kill command failed:`, err);
    }
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

  async acquirePort(startPort: number, endPort: number): Promise<number> {
    console.log(`Process ID ${process.pid} attempting to acquire port ${startPort}`);

    // Release all ports and clean locks before starting
    await this.releaseAll();
    await this.sleep(1000); // Wait for cleanup to complete

    const lockPath = this.getLockPath(startPort);
    console.log(`Checking for stale lock file: ${lockPath}`);
    if (fs.existsSync(lockPath)) {
      console.log(`Found stale lock file for port ${startPort}`);
    }

    // Force kill any process using the desired port
    await this.forceKillPort(startPort);

    // Multiple retry attempts for specific port
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Attempt ${attempt} of ${maxRetries} to acquire port ${startPort}`);

      try {
        await this.testPort(startPort);
        fs.writeFileSync(lockPath, process.pid.toString(), { flag: 'wx' });
        this.lockFiles.add(lockPath);
        this.currentPort = startPort;
        console.log(`Successfully acquired port ${startPort} on attempt ${attempt}`);
        return startPort;
      } catch (err) {
        console.log(`Attempt ${attempt} failed:`, err);
        if (attempt < maxRetries) {
          console.log(`Waiting before retry...`);
          await this.sleep(2000 * attempt); // Increasingly longer waits
          await this.forceKillPort(startPort); // Try killing processes again
        } else {
          throw new Error(`Failed to acquire port ${startPort} after ${maxRetries} attempts`);
        }
      }
    }

    throw new Error(`Could not acquire required port ${startPort}`);
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

  async releasePort(port: number): Promise<void> {
    const lockPath = this.getLockPath(port);
    console.log(`Releasing port ${port}`);
    try {
      // Force kill any process using the port
      await this.forceKillPort(port);

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

  async releaseAll(): Promise<void> {
    console.log('Releasing all ports...');
    // Force kill the current port if it exists
    if (this.currentPort !== null) {
      await this.forceKillPort(this.currentPort);
    }
    this.cleanupAllLocks();
    this.lockFiles.clear();
    this.currentPort = null;
    console.log('All ports released');
  }
}

export const portManager = new PortManager();