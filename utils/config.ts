import ProdConfig from "../configs/prod.json";
import DevelopConfig from "../configs/dev.json";

export type IDevelopConfig = typeof DevelopConfig;

export type IProdConfig = typeof ProdConfig;

export type IConfig = typeof DevelopConfig | typeof ProdConfig;

export function getConfig(): IConfig {
  const config = process.env.DEPLOYMENT_ENV === "prod" ? ProdConfig : DevelopConfig;
  return config;
}
