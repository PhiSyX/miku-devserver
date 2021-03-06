export type ConfigFileEnvType = "development" | "production" | "test";

export type ConfigFileJSON = Partial<ConfigFileInterface>;

export type Alias = {
  [p: string]: string;
};

export interface ConfigFileInterface {
  env: ConfigFileEnvType;
  hostname: string;
  port: number;
  tls?: {
    key: string;
    cer: string;
  };
  shared: {
    paths: {
      static: string;
      [p: string]: string;
    };
  };
  cache?: boolean;
  alias?: Alias;
}
