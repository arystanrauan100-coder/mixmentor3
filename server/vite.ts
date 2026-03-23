import { type Express, type Request, type Response, type NextFunction } from "express";
import { type Server } from "http";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

export async function setupVite(server: Server, app: Express) {
  // Use indirect dynamic imports to prevent TypeScript from statically analyzing
  // the vite module chain (which would resolve "vite" to root vite.ts via baseUrl)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vite: any = await (0, eval)('import("vite")');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const react: any = await (0, eval)('import("@vitejs/plugin-react")');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorOverlay: any = await (0, eval)('import("@replit/vite-plugin-runtime-error-modal")');

  const viteServer = await vite.createServer({
    plugins: [react.default(), errorOverlay.default()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "..", "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "..", "shared"),
      },
    },
    root: path.resolve(import.meta.dirname, "..", "client"),
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: { server, path: "/vite-hmr" },
      allowedHosts: true,
    },
    appType: "custom",
  });

  app.use(viteServer.middlewares);

  app.use("/{*path}", async (req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await viteServer.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      viteServer.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
