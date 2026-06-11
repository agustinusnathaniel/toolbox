import { UAParser } from 'ua-parser-js';

export interface BrowserInfo {
  major: string | undefined;
  name: string | undefined;
  version: string | undefined;
}

export interface DeviceInfo {
  model: string | undefined;
  type: string | undefined;
  vendor: string | undefined;
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

export const parseUserAgent = (ua?: string): UAParseResult => {
  const { browser, cpu, device, engine, os, ua: uaCopy } = UAParser(ua);

  return {
    browser: {
      name: browser.name,
      version: browser.version,
      major: browser.major,
    },
    cpu: {
      architecture: cpu.architecture,
    },
    device: {
      type: device.type,
      vendor: device.vendor,
      model: device.model,
    },
    engine: {
      name: engine.name,
      version: engine.version,
    },
    os: {
      name: os.name,
      version: os.version,
    },
    ua: uaCopy,
  };
};
