import { UAParser } from 'ua-parser-js';

export const parseUserAgent = (ua?: string) => {
  const { browser, cpu, device, engine, os, ua: uaCopy } = UAParser(ua);

  return {
    browser: {
      major: browser.major,
      name: browser.name,
      version: browser.version,
    },
    cpu: {
      architecture: cpu.architecture,
    },
    device: {
      model: device.model,
      type: device.type,
      vendor: device.vendor,
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
