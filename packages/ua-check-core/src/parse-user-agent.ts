import UAParser from "ua-parser-js";

import type { UAParseResult } from "./types";

export type { BrowserInfo, CPUInfo, DeviceInfo, EngineInfo, OSInfo, UAParseResult } from "./types";

export const parseUserAgent = (ua?: string): UAParseResult => {
  const parser = new UAParser(ua);
  const browser = parser.getBrowser();
  const cpu = parser.getCPU();
  const device = parser.getDevice();
  const engine = parser.getEngine();
  const os = parser.getOS();
  const result = parser.getResult();

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
    ua: result.ua,
  };
};
