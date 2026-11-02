import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";
import { spawn } from "child_process";

// 启动 dev server 时自动调用市民热线 12345 工单接口 / 聚微事件接口拉取最新数据
// （分别写入 public/data.json、public/juwei_summary.json）；
// 最多等待 8s，接口超时/失败时沿用已有数据文件，不阻塞项目启动
function fetchRemoteDataOnStart(): Plugin {
  return {
    name: "fetch-remote-data-on-start",
    async configureServer() {
      const scripts = ["scripts/fetch-real-data.js", "scripts/fetch-juwei-data.js"];
      await Promise.all(
        scripts.map(
          (script) =>
            new Promise<void>((resolve) => {
              const timer = setTimeout(resolve, 8000);
              const child = spawn(process.execPath, [script], {
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
            })
        )
      );
    },
  };
}

export default defineConfig({
  plugins: [
    fetchRemoteDataOnStart(),
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
