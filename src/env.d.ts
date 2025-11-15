// Type definitions for environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    API_URL?: string;
    SOCKET_URL?: string;
    NODE_ENV?: 'development' | 'production' | 'test';
  }
}

// For webpack DefinePlugin
declare const process: {
  env: {
    API_URL: string;
    SOCKET_URL: string;
    NODE_ENV: string;
  };
};
