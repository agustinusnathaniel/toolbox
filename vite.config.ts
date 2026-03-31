import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "ultracite fix",
  },
  lint: { options: { typeAware: true, typeCheck: true } },
});
