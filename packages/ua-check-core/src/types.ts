export interface BrowserInfo {
  name: string | undefined;
  version: string | undefined;
  major: string | undefined;
}

export interface DeviceInfo {
  type: string | undefined;
  vendor: string | undefined;
  model: string | undefined;
}

export interface OSInfo {
  name: string | undefined;
  version: string | undefined;
}

export interface CPUInfo {
  architecture: string | undefined;
}

export interface EngineInfo {
  name: string | undefined;
  version: string | undefined;
}

export interface UAParseResult {
  browser: BrowserInfo;
  cpu: CPUInfo;
  device: DeviceInfo;
  engine: EngineInfo;
  os: OSInfo;
  ua: string;
}
