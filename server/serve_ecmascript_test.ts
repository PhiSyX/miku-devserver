import { readFile } from "../packages/helpers/deno/fs.ts";
import { assertEquals } from "../packages/helpers/deno/test_mod.ts";

import { serveEcmaScript } from "./serve_ecmascript.ts";

const config = {} as any;
const configAlias = {
  alias: {
    "foo": "bar",
    "miku-devserver": "/~/index.ts",
  },
} as any;
const request = {
  url: { pathname: "/client/main.jsx" },
} as any;

Deno.test("serve_ecmascript: file", async () => {
  const jsxFile = await readFile("client/main.jsx", "utf-8");

  const response = await serveEcmaScript(config)(request, {
    body: jsxFile,
  });

  assertEquals(response.rawStatus, 200);
  assertEquals(response.sourceStatus, response.rawStatus);
});

Deno.test("serve_ecmascript: import alias not found", async () => {
  const response = await serveEcmaScript(config)(request, {
    body: `
      import Test from "miku-devserver";
      console.log(Test);
    `,
  });

  assertEquals(
    response.source,
    `import Test from "miku-devserver";
console.log(Test);
`,
  );
});

Deno.test("serve_ecmascript: import alias found", async () => {
  const response = await serveEcmaScript(configAlias)(request, {
    body: `
      import Test1 from "miku-devserver";
      import Test2 from "foo";
      console.log(Test1, Test2);
    `,
  });

  assertEquals(
    response.source,
    `import Test1 from "/~/index.ts";
import Test2 from "bar";
console.log(Test1, Test2);
`,
  );
});
