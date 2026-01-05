// src/index.ts
import { Elysia } from "elysia";
import swagger from "@elysiajs/swagger";
import { authRoutes } from "./routes/auth";
import { messageRoutes } from "./routes/messages";

const app = new Elysia()
  .get("/", () => "Anonymous App Backend 🚀")
  .use(
    swagger({
      documentation: {
        info: {
          title: "Anonymous Messaging Documentation",
          version: "1.0.0",
        },
      },
    })
  )

  // Register the routes
  .use(authRoutes)
  .use(messageRoutes)
  .listen(3000);

console.log(`🦊 Server running at ${app.server?.hostname}:${app.server?.port}`);
