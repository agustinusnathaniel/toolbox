import { UAParser } from 'ua-parser-js';

export const parseUserAgent = (ua?: string) => {
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
