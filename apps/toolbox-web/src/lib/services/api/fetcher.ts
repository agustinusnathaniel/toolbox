import ky, { type Options } from 'ky';

import { API_BASE_URL } from './constants';

const service = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 60_000,
});

export type APIFetcherParams = {
  rootPath?: string;
  path: string;
  config?: Options;
};

/**
 * @note must remove leading slash when using prefixURL
 * https://github.com/sindresorhus/ky?tab=readme-ov-file#prefixurl
 */
const fetcherOriginResp = async <ResponseDataType>({
  rootPath = '',
  path,
  config,
}: APIFetcherParams) =>
  service<ResponseDataType>(
    `${rootPath}${
      path
      // biome-ignore lint/performance/useTopLevelRegex: -
    }`.replace(/^\/+/, ''),
    config
  );

export const fetcher = async <ResponseDataType>({
  rootPath,
  path,
  config,
}: APIFetcherParams) =>
  fetcherOriginResp<ResponseDataType>({
    rootPath,
    path,
    config,
  }).then(async (res) => await res.json());
