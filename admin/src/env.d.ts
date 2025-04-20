/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface Window {
  customApis: {
    getConfig: () => Promise<{
      port: number;
      publicPath: string;
      maxConnections: number;
      allowAnonymous: boolean;
      accessPassword: string;
      logLevel: string;
      cacheSize: number;
    }>;
    verifyPassword: (password: string) => Promise<{
      success: boolean;
      error?: string;
      token?: string;
    }>;
  };
}
