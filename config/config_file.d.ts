export type ConfigFileEnvType = "development" | "production" | "test";

export type ConfigFileJSON = Partial<ConfigFileInterface>;

export interface ConfigFileInterface {
  env: ConfigFileEnvType;
  hostname: string;
  port: number;
  tls?: {
    key: string;
    cert: string;
  };
  shared: {
    paths: {
      static: string;
      [p: string]: string;
    };
  };
}
