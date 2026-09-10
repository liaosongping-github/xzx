import { closeSync, openSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";

function processIsRunning(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === "EPERM";
  }
}

function lockOwner(lockPath) {
  try { return JSON.parse(readFileSync(lockPath, "utf8")); }
  catch { return {}; }
}

export function acquireWorkerLock(lockPath, label) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const handle = openSync(lockPath, "wx");
      writeFileSync(handle, `${JSON.stringify({ pid: process.pid, label, startedAt: new Date().toISOString() })}\n`, "utf8");
      closeSync(handle);
      break;
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      const owner = lockOwner(lockPath);
      if (processIsRunning(Number(owner.pid))) {
        const duplicate = new Error(`${label} 已在运行（PID ${owner.pid}）`);
        duplicate.code = "WORKER_ALREADY_RUNNING";
        throw duplicate;
      }
      try { unlinkSync(lockPath); } catch (unlinkError) {
        if (unlinkError?.code !== "ENOENT") throw unlinkError;
      }
    }
  }

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    const owner = lockOwner(lockPath);
    if (Number(owner.pid) !== process.pid) return;
    try { unlinkSync(lockPath); } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  };

  process.once("exit", release);
  for (const signal of ["SIGINT", "SIGTERM", "SIGBREAK"]) {
    process.once(signal, () => {
      release();
      process.exit(0);
    });
  }
  return release;
}
