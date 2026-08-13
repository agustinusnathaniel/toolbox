# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.8.0](https://github.com/agustinusnathaniel/toolbox/compare/v1.7.1...v1.8.0) (2026-08-13)

### Features

* add regex tester tool ([#39](https://github.com/agustinusnathaniel/toolbox/issues/39)) ([8b74274](https://github.com/agustinusnathaniel/toolbox/commit/8b74274895eef4b80aa7d733d91c90796da42ffd))
* add shareable URL state to base64, hash generator, and JWT decoder ([#42](https://github.com/agustinusnathaniel/toolbox/issues/42)) ([8a318ce](https://github.com/agustinusnathaniel/toolbox/commit/8a318cead5a63d62b8de7fa0f23fb950e9450df5))
* add shareable URL state to color converter and JSON formatter ([#38](https://github.com/agustinusnathaniel/toolbox/issues/38)) ([767a7d3](https://github.com/agustinusnathaniel/toolbox/commit/767a7d35f593830690dbc976404adad08027ac39))
* add UUID generator tool ([#46](https://github.com/agustinusnathaniel/toolbox/issues/46)) ([ae7061d](https://github.com/agustinusnathaniel/toolbox/commit/ae7061d970548b4b3f6a0b3f7c9548ba2c665a3a))
* **csv-converter:** add CSV to JSON and JSON to CSV converter tool ([#49](https://github.com/agustinusnathaniel/toolbox/issues/49)) ([3a120cd](https://github.com/agustinusnathaniel/toolbox/commit/3a120cdcafc4fa56e4f7d6fe3abfa9520c5f82c4))
* **text-diff:** add text diff tool with inline word highlighting ([#45](https://github.com/agustinusnathaniel/toolbox/issues/45)) ([e3ec819](https://github.com/agustinusnathaniel/toolbox/commit/e3ec8197ddad0b9175557ebcd7cad7cde61c5131))
* **timestamp-converter:** add timestamp and date converter tool ([#44](https://github.com/agustinusnathaniel/toolbox/issues/44)) ([33e427c](https://github.com/agustinusnathaniel/toolbox/commit/33e427c5202337934585bc32d5b55422de21ad4c))
* **ua-check:** add interactive UA parser with shareable URL state ([#43](https://github.com/agustinusnathaniel/toolbox/issues/43)) ([3a62e4c](https://github.com/agustinusnathaniel/toolbox/commit/3a62e4c8ad05f6689b7adc70b7606e6b8b8d10c2))

### Bug Fixes

* **deps:** pin js-yaml and nanoid to patched versions ([#37](https://github.com/agustinusnathaniel/toolbox/issues/37)) ([4921a0e](https://github.com/agustinusnathaniel/toolbox/commit/4921a0e182f6e7c3a0e6ae7520a576a7b86c2781))
* **qrcode:** escape vCard fields per RFC 2426 to prevent injection ([#48](https://github.com/agustinusnathaniel/toolbox/issues/48)) ([7583310](https://github.com/agustinusnathaniel/toolbox/commit/758331060bc39e4a11cbb5d1fe250259b6cd2adb))
* **regex-tester:** cap match collection to prevent tab freeze on high match counts ([#41](https://github.com/agustinusnathaniel/toolbox/issues/41)) ([e6c40d3](https://github.com/agustinusnathaniel/toolbox/commit/e6c40d39a4b6cb2a79e2be49ea80943fe376bf18))
* **regex-tester:** run matching in worker with deadline to prevent tab freeze ([#40](https://github.com/agustinusnathaniel/toolbox/issues/40)) ([a104ca7](https://github.com/agustinusnathaniel/toolbox/commit/a104ca776594765b29e3f85b694dd05ceea08920))
* **text-diff:** run diff in worker with deadline to prevent tab freeze ([#47](https://github.com/agustinusnathaniel/toolbox/issues/47)) ([c437be2](https://github.com/agustinusnathaniel/toolbox/commit/c437be2801165ab3c6406eb79c763456978ae034))
* **toolbox:** polish metadata navigation clipboard and outcomes ([#36](https://github.com/agustinusnathaniel/toolbox/issues/36)) ([a38d25f](https://github.com/agustinusnathaniel/toolbox/commit/a38d25f85915c63a53b21f3a7efb35ec0f331234))
## [1.7.1](https://github.com/agustinusnathaniel/toolbox/compare/v1.7.0...v1.7.1) (2026-08-08)

### Features

* add pinned tools with homepage and command menu sections ([#32](https://github.com/agustinusnathaniel/toolbox/issues/32)) ([8857547](https://github.com/agustinusnathaniel/toolbox/commit/885754768f76d06094b64badd0864fb9d5584b48))
* **homepage:** add marketing landing page ([#34](https://github.com/agustinusnathaniel/toolbox/issues/34)) ([b8e42bb](https://github.com/agustinusnathaniel/toolbox/commit/b8e42bba9f6ea6e4cb5455d181634781fbab0084))

### Bug Fixes

* mobile sidebar issue ([#33](https://github.com/agustinusnathaniel/toolbox/issues/33)) ([55b0fdb](https://github.com/agustinusnathaniel/toolbox/commit/55b0fdb6bb0703e5586a4671dbc8076c5c1d89f0))
## [1.7.0](https://github.com/agustinusnathaniel/toolbox/compare/v1.6.6...v1.7.0) (2026-08-05)

### Features

* **base-64:** add Base64 Encoder/Decoder tool with UTF-8 support ([#26](https://github.com/agustinusnathaniel/toolbox/issues/26)) ([0939123](https://github.com/agustinusnathaniel/toolbox/commit/0939123df3aa2d85cebc92c0e08a0b97ebb9b0bd))
* **color-converter:** add Color Converter tool with HEX/RGB/HSL/OKLCH support ([#20](https://github.com/agustinusnathaniel/toolbox/issues/20)) ([505369d](https://github.com/agustinusnathaniel/toolbox/commit/505369db2d8f3eae713d3ef95ea16ef48a48be83))
* **hash-generator:** add Hash Generator tool with Web Crypto hashing ([#28](https://github.com/agustinusnathaniel/toolbox/issues/28)) ([95ffca8](https://github.com/agustinusnathaniel/toolbox/commit/95ffca8e439cc3a7eaab3bad2e1ae53ed0a340b0))
* **json-formatter:** add JSON Formatter tool with format, validate, and minify support ([#22](https://github.com/agustinusnathaniel/toolbox/issues/22)) ([947b34a](https://github.com/agustinusnathaniel/toolbox/commit/947b34a00159ca46031f2bd33ea9c5afa3e48b7f))
* **jwt-decoder:** add JWT Decoder tool with HMAC signature verification ([#30](https://github.com/agustinusnathaniel/toolbox/issues/30)) ([04a07c0](https://github.com/agustinusnathaniel/toolbox/commit/04a07c043838926e497258965b14f3306b6cb4d4))
* **password-generator:** add Password Generator tool with Web Crypto randomness ([#27](https://github.com/agustinusnathaniel/toolbox/issues/27)) ([6145a68](https://github.com/agustinusnathaniel/toolbox/commit/6145a68a5cc66d4bf4a6837fd5a9bdd5727dc88b))

### Bug Fixes

* **deps:** harden transitive dependencies with pnpm overrides ([#29](https://github.com/agustinusnathaniel/toolbox/issues/29)) ([883e8b5](https://github.com/agustinusnathaniel/toolbox/commit/883e8b511699cdfd58e04a257bc64b5c7a888dd6))
* **security:** sync HSTS header across all deployment configs ([#16](https://github.com/agustinusnathaniel/toolbox/issues/16)) ([aefe459](https://github.com/agustinusnathaniel/toolbox/commit/aefe459ed369e2a43f13d22d9a745463d59c47d1))
* wrap startViewTransition in try/catch via pnpm patch ([#10](https://github.com/agustinusnathaniel/toolbox/issues/10)) ([50faf04](https://github.com/agustinusnathaniel/toolbox/commit/50faf048b52b45e91b10f10d59fa7998c069688c))
## [1.6.6](https://github.com/agustinusnathaniel/toolbox/compare/v1.6.5...v1.6.6) (2026-07-07)

## [1.6.5](https://github.com/agustinusnathaniel/toolbox/compare/v1.6.4...v1.6.5) (2026-06-19)

## [1.6.4](https://github.com/agustinusnathaniel/toolbox/compare/v1.6.3...v1.6.4) (2026-06-12)


### Features

* **routes:** add shareable links to QR Code via URL search params ([9c285ed](https://github.com/agustinusnathaniel/toolbox/commit/9c285ed4bdbbb270d59bce1dd41ef6cef7b62d93))


### Bug Fixes

* **routes:** allow clearing EV Charging inputs without auto-prefill ([0ca3886](https://github.com/agustinusnathaniel/toolbox/commit/0ca388669e264a4bb8ddcb4479deadb2dcdb2151))
* **routes:** balance Battery Capacity and Charger Type input widths ([35ae5af](https://github.com/agustinusnathaniel/toolbox/commit/35ae5af18277f075386c7d1b1596ac084d653c5e))
* **routes:** fall through to hardcoded defaults on reload ([e26dc81](https://github.com/agustinusnathaniel/toolbox/commit/e26dc8145c467bc70d792354baf9526226315a71))
* **routes:** restore onInput + sync chargingPower on charger change ([a3f3a39](https://github.com/agustinusnathaniel/toolbox/commit/a3f3a39d7a753c3ac684eb6183209bce0cd33d8e))

## [1.6.3](https://github.com/agustinusnathaniel/toolbox/compare/v1.6.2...v1.6.3) (2026-06-11)

## [1.6.2](https://github.com/agustinusnathaniel/toolbox/compare/v1.6.1...v1.6.2) (2026-06-10)


### Bug Fixes

* **ev-charging:** widen FocusEvent type to fix type:check error ([f6f3248](https://github.com/agustinusnathaniel/toolbox/commit/f6f32484623442b72696884afb3d76f811495428))
* route transition to use css ([62cfc33](https://github.com/agustinusnathaniel/toolbox/commit/62cfc332568bc80267d986c871e00c9ea81bfbef))

## [1.6.1](https://github.com/agustinusnathaniel/toolbox/compare/v1.6.0...v1.6.1) (2026-06-09)


### Features

* **ev-charging:** power-based efficiency, graduated SOC penalty, and smart defaults ([ffae156](https://github.com/agustinusnathaniel/toolbox/commit/ffae156a1984708d469912a45018ccdcfb72616a))
* shorten tool paths with 301 redirects ([518f6c3](https://github.com/agustinusnathaniel/toolbox/commit/518f6c389eadc68ac187e585667c36362734bc0f))


### Bug Fixes

* **ev-charging:** clear endSOC validation when startSOC changes ([7fe0fce](https://github.com/agustinusnathaniel/toolbox/commit/7fe0fce109b6267e97f75c22b7ee87461f97737e))
* **ev-charging:** reset advanced fields on blur instead of on input ([2183088](https://github.com/agustinusnathaniel/toolbox/commit/21830889edcbcef480ec0601d8edc7c2f15f220a))

## [1.6.0](https://github.com/agustinusnathaniel/toolbox/compare/v1.5.1...v1.6.0) (2026-06-08)


### Features

* add user-facing changelog page ([#4](https://github.com/agustinusnathaniel/toolbox/issues/4)) ([18aa918](https://github.com/agustinusnathaniel/toolbox/commit/18aa918286bb784aece12598604a878a8c1ff86d))
* **components:** replace custom theme provider with next-themes ([#5](https://github.com/agustinusnathaniel/toolbox/issues/5)) ([592a529](https://github.com/agustinusnathaniel/toolbox/commit/592a52906f52f5a76177903bdb00155526ef06ed))

## [1.5.1](https://github.com/agustinusnathaniel/toolbox/compare/v1.5.0...v1.5.1) (2026-06-05)

## [1.5.0](https://github.com/agustinusnathaniel/toolbox/compare/v1.4.0...v1.5.0) (2026-06-05)


### Features

* **components:** switch PWA to prompt-for-update to prevent data loss ([f4c6983](https://github.com/agustinusnathaniel/toolbox/commit/f4c6983f71a2d238101d12199d4af175e98e3e81))

## [1.4.0](https://github.com/agustinusnathaniel/toolbox/compare/v1.3.0...v1.4.0) (2026-06-05)


### Features

* **ev-charging:** calibrate model against real-world data and add calibration factor ([b40fa33](https://github.com/agustinusnathaniel/toolbox/commit/b40fa3325fee9c143ae2ba93a224241447421930))


### Bug Fixes

* EV charging estimator validation, live calculation, and navigation ([b0f5ad3](https://github.com/agustinusnathaniel/toolbox/commit/b0f5ad37e711ae6f8903308982e1036158af90ca))

## [1.3.1](https://github.com/agustinusnathaniel/toolbox/compare/v1.3.0...v1.3.1) (2026-06-05)


### Bug Fixes

* EV charging estimator validation, live calculation, and navigation ([b0f5ad3](https://github.com/agustinusnathaniel/toolbox/commit/b0f5ad37e711ae6f8903308982e1036158af90ca))

## [1.3.0](https://github.com/agustinusnathaniel/toolbox/compare/v1.2.0...v1.3.0) (2026-06-05)


### Features

* **ev-charging:** calibrate model against real-world data and add calibration factor ([64a4289](https://github.com/agustinusnathaniel/toolbox/commit/64a42895ee469363be62a4023a4459918124ecf6))
* persist EV charging estimator inputs to localStorage ([c7be050](https://github.com/agustinusnathaniel/toolbox/commit/c7be050e79468e5061abc3d1ee0b6e9f9ee3481b))


### Bug Fixes

* allow data: font-src in CSP for fontsource variable fonts ([c75450d](https://github.com/agustinusnathaniel/toolbox/commit/c75450d3451cc81e84dbfea1707924593ee91f68))
* exclude js-perf worker from SW precache, switch WASM to NetworkFirst ([78a75a0](https://github.com/agustinusnathaniel/toolbox/commit/78a75a0fee47071729503b20ff42cc86bbf0d90d))
* remove navigateFallback causing non-precached-url error ([0d9bcc0](https://github.com/agustinusnathaniel/toolbox/commit/0d9bcc04b0be9c5bb18233333152638c79da6400))
* stop infinite render loop in EV Charging Estimator form ([82f3b70](https://github.com/agustinusnathaniel/toolbox/commit/82f3b70df1da796e2427747ded67ea778459f6d2))
* use virtual:pwa-register for SW registration ([7895a1e](https://github.com/agustinusnathaniel/toolbox/commit/7895a1ea1ced2eb18473250669bf048c2e76e2f0))

## [1.2.0](https://github.com/agustinusnathaniel/toolbox/compare/v1.1.0...v1.2.0) (2026-06-04)


### Features

* add EV Charging Estimator tool ([c94a718](https://github.com/agustinusnathaniel/toolbox/commit/c94a718fbcfd55a9176508742274a6d3dda587c4))
* align PWA config with cartrack conventions ([3850570](https://github.com/agustinusnathaniel/toolbox/commit/385057003354014c3f81627c4e0a41771709a1f7))

## 1.1.0 (2026-05-31)


### ⚠ BREAKING CHANGES

* **toolbox-web:** tool routes relocated under /_tools; update any links, imports, and router configuration accordingly

* **toolbox-web:** migrate tools routes to _tools and update env ([81530e0](https://github.com/agustinusnathaniel/toolbox/commit/81530e041a757f59f4c4170ffa03d94dfec4f877))


### Features

* **hooks:** integrate Umami tracking with tool-level event analytics ([18c6662](https://github.com/agustinusnathaniel/toolbox/commit/18c6662a7547c4869a389331b934889deb839748))
* **js-perf-comparator:** add Stability mode with multi-round aggregation and comparison insights ([5a9f491](https://github.com/agustinusnathaniel/toolbox/commit/5a9f491776c8ba8467e422335b6f6097c443c8f5))
* migrate add-to-cal ([1bcd74f](https://github.com/agustinusnathaniel/toolbox/commit/1bcd74fb4a089e46e80915c9973bee5555460ebe))
* migrate qrcode gen and ua-check ([7402b49](https://github.com/agustinusnathaniel/toolbox/commit/7402b49538f9120bd4eb9ff1ee813613165b3e40))
* replace TOOL_META constant with per-route staticData.meta and Tool Registry ([3d29227](https://github.com/agustinusnathaniel/toolbox/commit/3d29227cf99b86e0a569a7a8d677ba9a9ca1bdc1))
* **routes:** add compression stats card to zippy image tool ([cd6f47f](https://github.com/agustinusnathaniel/toolbox/commit/cd6f47f1d159d4715d41876b6112aa94e4f3d3dd))
* **routes:** add dark mode QR code preset ([d8efca3](https://github.com/agustinusnathaniel/toolbox/commit/d8efca39c542cb1159afe8d810762f0f4d5b1b7a))
* **routes:** add keyboard shortcuts for tool navigation ([502bc3b](https://github.com/agustinusnathaniel/toolbox/commit/502bc3ba57981485b05557ee3563fed4f1af91af))
* **routes:** add persistent tool state via localStorage ([b396e44](https://github.com/agustinusnathaniel/toolbox/commit/b396e44afb04e76b3b594b7e1e660b0ded0429be))
* **routes:** add shareable URLs for WA Link and Calendar ([d14be7b](https://github.com/agustinusnathaniel/toolbox/commit/d14be7bb55b71400f0206de0fb592a31683c88b4))
* **toolbox-web:** add WhatsApp Link Helper tool ([0b73342](https://github.com/agustinusnathaniel/toolbox/commit/0b73342f266a8f078710900af19f5fd30a8c876a))
* **toolbox-web:** add zippy, consolidate devDeps, consolidate scripts ([4f2c8e5](https://github.com/agustinusnathaniel/toolbox/commit/4f2c8e52b6a7d7a3646feafc7c71199ebed33395))
* **toolbox-web:** js perf comparator ([d6880ad](https://github.com/agustinusnathaniel/toolbox/commit/d6880ad41d68e20772012d1f0cf223817aab0f19))
* **wa-link-core:** extract WhatsApp link generation logic ([21cabe2](https://github.com/agustinusnathaniel/toolbox/commit/21cabe2dd4a8d4966bc55054726e912ea30a49fc))


### Bug Fixes

* **components:** stack command menu descriptions below labels ([cb24ed3](https://github.com/agustinusnathaniel/toolbox/commit/cb24ed3f9896cafc04d5da2202f15c5d490b1ee0))
* guard edge cases across all tools ([584cc7a](https://github.com/agustinusnathaniel/toolbox/commit/584cc7a8efabec937c567bf397934b184d058ffd))
* qr code issues - save and color picker ([7210f9a](https://github.com/agustinusnathaniel/toolbox/commit/7210f9a10e8ea9040382335b4b83bce0afc5ad72))
* routing in global command menu shortcut ([50213a1](https://github.com/agustinusnathaniel/toolbox/commit/50213a1ed6ebd147ae28425711ba3d371d267d5b))
* uses vite import worker ([38b569f](https://github.com/agustinusnathaniel/toolbox/commit/38b569fd67e4d0845089d1823e58b4ec9134f174))

## 1.0.0 (2026-05-28)


### ⚠ BREAKING CHANGES

* **toolbox-web:** tool routes relocated under /_tools; update any links, imports, and router configuration accordingly

* **toolbox-web:** migrate tools routes to _tools and update env ([81530e0](https://github.com/agustinusnathaniel/toolbox/commit/81530e041a757f59f4c4170ffa03d94dfec4f877))


### Features

* **js-perf-comparator:** add Stability mode with multi-round aggregation and comparison insights ([5a9f491](https://github.com/agustinusnathaniel/toolbox/commit/5a9f491776c8ba8467e422335b6f6097c443c8f5))
* migrate add-to-cal ([1bcd74f](https://github.com/agustinusnathaniel/toolbox/commit/1bcd74fb4a089e46e80915c9973bee5555460ebe))
* migrate qrcode gen and ua-check ([7402b49](https://github.com/agustinusnathaniel/toolbox/commit/7402b49538f9120bd4eb9ff1ee813613165b3e40))
* **toolbox-web:** add WhatsApp Link Helper tool ([0b73342](https://github.com/agustinusnathaniel/toolbox/commit/0b73342f266a8f078710900af19f5fd30a8c876a))
* **toolbox-web:** add zippy, consolidate devDeps, consolidate scripts ([4f2c8e5](https://github.com/agustinusnathaniel/toolbox/commit/4f2c8e52b6a7d7a3646feafc7c71199ebed33395))
* **toolbox-web:** js perf comparator ([d6880ad](https://github.com/agustinusnathaniel/toolbox/commit/d6880ad41d68e20772012d1f0cf223817aab0f19))
* **wa-link-core:** extract WhatsApp link generation logic ([21cabe2](https://github.com/agustinusnathaniel/toolbox/commit/21cabe2dd4a8d4966bc55054726e912ea30a49fc))


### Bug Fixes

* qr code issues - save and color picker ([7210f9a](https://github.com/agustinusnathaniel/toolbox/commit/7210f9a10e8ea9040382335b4b83bce0afc5ad72))
* routing in global command menu shortcut ([50213a1](https://github.com/agustinusnathaniel/toolbox/commit/50213a1ed6ebd147ae28425711ba3d371d267d5b))
* uses vite import worker ([38b569f](https://github.com/agustinusnathaniel/toolbox/commit/38b569fd67e4d0845089d1823e58b4ec9134f174))
