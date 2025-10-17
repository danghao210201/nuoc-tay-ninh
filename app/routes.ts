import type { RouteConfig } from "@react-router/dev/routes";

export default [
  {
    path: "/",
    file: "routes/home.tsx",
  },
  {
    path: "/reflection/:id",
    file: "routes/reflection-detail.tsx",
  },
  {
    path: "/send-reflection",
    file: "routes/send-reflection.tsx",
  },
] satisfies RouteConfig;
