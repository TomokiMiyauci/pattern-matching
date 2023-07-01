import { BuildOptions } from "https://deno.land/x/dnt@0.37.0/mod.ts";

export const makeOptions = (version: string): BuildOptions => ({
  test: false,
  shims: {},
  compilerOptions: { lib: ["ESNext"] },
  typeCheck: "both",
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  package: {
    name: "@miyauci/pattern-matching",
    version,
    description:
      "Syntax-free pattern matching, feature parity with TC39 proposal-pattern-matching",
    keywords: [
      "pattern-matching",
      "pattern",
      "match",
      "binding",
      "proposal-pattern-matching",
    ],
    license: "MIT",
    homepage: "https://github.com/TomokiMiyauci/pattern-matching",
    repository: {
      type: "git",
      url: "git+https://github.com/TomokiMiyauci/pattern-matching.git",
    },
    bugs: {
      url: "https://github.com/TomokiMiyauci/pattern-matching/issues",
    },
    sideEffects: false,
    type: "module",
    publishConfig: { access: "public" },
  },
  packageManager: "pnpm",
  mappings: {
    "https://deno.land/x/isx@1.4.0/is_object.ts": {
      name: "@miyauci/isx",
      version: "1.4.0",
      subPath: "is_object.js",
    },
    "https://deno.land/x/isx@1.4.0/is_function.ts": {
      name: "@miyauci/isx",
      version: "1.4.0",
      subPath: "is_function.js",
    },
    "https://deno.land/x/isx@1.4.0/is_reg_exp.ts": {
      name: "@miyauci/isx",
      version: "1.4.0",
      subPath: "is_reg_exp.js",
    },
    "https://deno.land/x/isx@1.4.0/is_iterable.ts": {
      name: "@miyauci/isx",
      version: "1.4.0",
      subPath: "is_iterable.js",
    },
    "https://deno.land/x/isx@1.4.0/is_array.ts": {
      name: "@miyauci/isx",
      version: "1.4.0",
      subPath: "is_array.js",
    },
    "https://deno.land/x/isx@1.4.0/is_string.ts": {
      name: "@miyauci/isx",
      version: "1.4.0",
      subPath: "is_string.js",
    },
    "https://deno.land/x/upsert@1.2.0/mod.ts": {
      name: "@miyauci/upsert",
      version: "1.2.0",
    },
    "https://deno.land/x/seqtools@1.0.0/head.ts": {
      name: "@miyauci/seqtools",
      version: "1.0.0",
      subPath: "head.js",
    },
    "https://deno.land/x/seqtools@1.0.0/last.ts": {
      name: "@miyauci/seqtools",
      version: "1.0.0",
      subPath: "last.js",
    },
    "https://deno.land/x/seqtools@1.0.0/init.ts": {
      name: "@miyauci/seqtools",
      version: "1.0.0",
      subPath: "init.js",
    },
    "https://deno.land/x/seqtools@1.0.0/init_last.ts": {
      name: "@miyauci/seqtools",
      version: "1.0.0",
      subPath: "init_last.js",
    },
  },
});
