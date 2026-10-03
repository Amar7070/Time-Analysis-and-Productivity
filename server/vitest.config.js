import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.js"],
    fileParallelism: false, // Prevent DB connection clashes
    testTimeout: 20000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
