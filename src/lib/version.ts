/**
 * 版本資訊工具
 * 提供應用程式版本、構建時間和環境資訊
 */

export interface VersionInfo {
  version: string;
  buildTime: string;
  environment: string;
  nodeVersion: string;
}

export function getVersionInfo(): VersionInfo {
  return {
    version: process.env.NEXT_PUBLIC_APP_VERSION || 'dev',
    buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.env.NEXT_PUBLIC_NODE_VERSION || process.version || 'unknown',
  };
}

/**
 * 格式化版本資訊為易讀字串
 */
export function formatVersionInfo(info: VersionInfo): string {
  return `v${info.version} | ${info.environment} | ${new Date(info.buildTime).toLocaleDateString()}`;
}
