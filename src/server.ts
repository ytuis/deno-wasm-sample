import { Application, Router, RouterContext } from "https://deno.land/x/oak@v6.5.0/mod.ts";
import init, { square } from "./pkg/wasm_deno.js";


if (Deno.env.get("ENVIRONMENT") === "production") {
  const res = await fetch(
    "https://raw.githubusercontent.com/ytuis/deno-wasm-sample/main/src/pkg/wasm_deno_bg.wasm"
  );
  await init(await res.arrayBuffer());
} else {
  await init(Deno.readFile("./pkg/wasm_deno_bg.wasm"));
}


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

router.get('/square', (ctx: RouterContext) => {
  const num = Math.floor(Math.random() * 10)
  const ans = square(num);
  ctx.response.body = `${num} squared is ${ans}`;
})

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8080 });