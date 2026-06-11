/// <reference types="vite-plus/client" />

type ImportMetaEnvAugmented =
  import('@julr/vite-plugin-validate-env').ImportMetaEnvAugmented<
    typeof import('../env').default
  >;

interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv extends ImportMetaEnvAugmented {}

interface Umami {
  identify(id: string, data?: object): void;
  identify(data: object): void;
  track(
    event: string | object | ((props: object) => object),
    data?: object
  ): void;
}

interface Window {
  umami?: Umami;
}
