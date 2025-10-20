import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    proxy: {
      "/api-tayninh": {
        target: "https://api.tayninh.gov.vn",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-tayninh/, ""),
      },
    },
  },
});
