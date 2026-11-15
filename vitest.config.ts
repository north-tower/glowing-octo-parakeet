import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          include: ["lib/**/*.test.ts"],
        },
        resolve: {
          alias: {
            "@": path.resolve(__dirname, "."),
          },
        },
      },
      {
        test: {
          name: "api",
          environment: "node",
          include: ["tests/api/**/*.test.ts"],
          setupFiles: ["tests/api/vitest.setup.ts"],
          testTimeout: 30_000,
        },
        resolve: {
          alias: {
            "@": path.resolve(__dirname, "."),
          },
        },
      },
    ],
  },
});