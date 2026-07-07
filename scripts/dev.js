import { spawn } from 'node:child_process';
import net from 'node:net';

const probeHost = (port, host) => new Promise((resolve) => {
  const probe = net.createServer();
  probe.once('error', () => resolve(false));
  probe.once('listening', () => probe.close(() => resolve(true)));
  probe.listen(port, host);
});

const isPortFree = async (port) => {
  const results = await Promise.all([
    probeHost(port, '127.0.0.1'),
    probeHost(port, '::1'),
  ]);

  return results.every(Boolean);
};

const processes = [];

const shutdown = () => {
  for (const child of processes) {
    if (!child.killed) {
      child.kill();
    }
  }
};

const start = async () => {
  if (await isPortFree(4000)) {
    processes.push(spawn('npm', ['run', 'start:server'], { stdio: 'inherit', shell: true }));
  } else {
    console.log('Mock server already running on port 4000, starting Vite only.');
  }

  processes.push(spawn('npm', ['run', 'dev:client'], { stdio: 'inherit', shell: true }));
};

start().then(() => {
  for (const child of processes) {
    child.on('exit', (code) => {
      if (code && code !== 0) {
        shutdown();
        process.exit(code);
      }
    });
  }
}).catch((error) => {
  console.error(error);
  process.exit(1);
});

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});
