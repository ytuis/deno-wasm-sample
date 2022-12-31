import { Application, Router, RouterContext } from "https://deno.land/x/oak@v6.5.0/mod.ts";
import { init, WASI } from 'https://deno.land/x/wasm/wasi.ts';

await init();

let wasi = new WASI({
  env: {},
  args: [],
});

const moduleBytes = fetch("https://github.com/ytuis/deno-wasm-sample/wasm/wasm-deno.wasm");
const module = await WebAssembly.compileStreaming(moduleBytes);
// Instantiate the WASI module
await wasi.instantiate(module, {});


const app = new Application();
const router = new Router();

app.addEventListener("listen", ({ hostname, port, secure }) => {
  console.log(
    `Listening on: ${secure ? "https://" : "http://"}${hostname ??
    "localhost"}:${port}`,
  );
});

app.addEventListener("error", (evt) => {
  console.log(evt.error);
});

router.get('/', (ctx: RouterContext) => {
  ctx.response.body = "Hello World!";
})

router.get('/', (ctx: RouterContext) => {
  // Run the start function
  let exitCode = wasi.start(1);
  let stdout = wasi.getStdoutString();

  ctx.response.body = stdout;
})

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8080 });