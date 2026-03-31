import { queryOptions } from '@tanstack/react-query';

import { type APIFetcherParams, fetcher } from './fetcher';

type UseAppFetcherParams<ResDataType> = APIFetcherParams & {
  isReady?: boolean;
  refreshInterval?: number;
  customFetcher?: (params: APIFetcherParams) => Promise<ResDataType>;
};

export const appQueryOptionsConstructor = <ResDataType>({
  rootPath,
  path,
  config,
  isReady = true,
  customFetcher,
  refreshInterval,
}: UseAppFetcherParams<ResDataType>) =>
  queryOptions({
    retryOnMount: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled: isReady,
    queryKey: [rootPath, path, config],
    queryFn: () => {
      if (customFetcher) {
        return customFetcher({
          rootPath,
          path,
          config,
        });
      }

      return fetcher<ResDataType>({
        rootPath,
        path,
        config,
      });
    },
    refetchInterval: refreshInterval,
  });
