import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";
import { spawn } from "child_process";

// 启动 dev server 时自动调用市民热线 12345 工单接口拉取最新数据（写入 public/data.json）；
// 最多等待 8s，接口超时/失败时沿用已有数据文件，不阻塞项目启动
function fetchRealDataOnStart(): Plugin {
  return {
    name: "fetch-real-data-on-start",
    async configureServer() {
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 8000);
        const child = spawn(process.execPath, ["scripts/fetch-real-data.js"], {
          cwd: __dirname,
          stdio: "inherit",
        });
        child.on("close", () => {
          clearTimeout(timer);
          resolve();
        });
        child.on("error", () => {
          clearTimeout(timer);
          resolve();
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [
    fetchRealDataOnStart(),
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
});
