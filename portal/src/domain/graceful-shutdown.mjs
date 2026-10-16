/**
 * Stop accepting new connections, allow in-flight requests to finish, and
 * close remaining connections after a bounded grace period.
 */
export function closeServerGracefully(server, { timeoutMs = 10_000, onTimeout = () => {} } = {}) {
  return new Promise((resolve) => {
    let finished = false;
    let timer;
    const finish = (timedOut) => {
      if (finished) return;
      finished = true;
      if (timer) clearTimeout(timer);
      if (timedOut) {
        onTimeout();
        server.closeAllConnections?.();
      }
      resolve({ timedOut });
    };
    timer = setTimeout(() => finish(true), timeoutMs);
    server.close(() => finish(false));
    // Node's server.close() closes idle connections on supported runtimes;
    // this explicit call is best-effort and must not terminate active requests.
    server.closeIdleConnections?.();
  });
}
