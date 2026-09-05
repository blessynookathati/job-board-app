import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";

console.log("=======================================================");
console.log("🚀 Starting JobConnect Full-Stack Recruitment Platform");
console.log("=======================================================");

// 1. Start Server
const server = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(rootDir, "server"),
  stdio: "inherit",
  shell: true
});

// 2. Start Client
const client = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(rootDir, "client"),
  stdio: "inherit",
  shell: true
});

const cleanup = () => {
  server.kill();
  client.kill();
  process.exit();
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
