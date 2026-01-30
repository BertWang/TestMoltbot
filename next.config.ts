import type { NextConfig } from "next";
import { readFileSync } from "fs";
import { join } from "path";

// 讀取 package.json 以獲取版本號
const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), "package.json"), "utf-8")
);

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_NODE_VERSION: process.version,
  },
};

export default nextConfig;
