# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

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
