/*
 * Change from https://gist.github.com/unki2aut/4ac81c33be2e8f121e80a26eba1735d7
 * - Use top level await (Node.js v14.8.0+)
 *   - To use top level await, you need to write a script as ES Modules
 * - Set chokidar options to avoid duplicate building
 * - Define NODE_ENV (For React)
 * - Add API proxy setting by using proxy-middleware
 */
import chokidar from "chokidar";
import esbuild from "esbuild";
import liveServer from "live-server";
import proxy from "proxy-middleware";
import url from "url";

const builder = await esbuild.build({
  color: true,
  define: {
    "process.env.NODE_ENV": '"development"',
  },
  entryPoints: ["./src/index.tsx"],
  outfile: "./build/index.js",
  minify: false,
  bundle: true,
  sourcemap: true,
  logLevel: "error",
  incremental: true,
});

chokidar
  .watch("src/**/*.{ts,tsx}", { awaitWriteFinish: true, ignoreInitial: true })
  .on("all", (eventName, path) => {
    console.log(`${path} ${eventName}`);
    return builder.rebuild();
  });

liveServer.start({
  root: "./build",
  open: true,
  port: 1234,
  middleware: [
    proxy({ ...url.parse("http://127.0.0.1:8080/api"), route: "/api" }),
    proxy({ ...url.parse("http://127.0.0.1:8080/images"), route: "/images" }),
  ],
});
