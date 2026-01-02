// src/routes/auth.ts
import { Elysia, t } from "elysia";
import { PrismaClient } from "@prisma/client";

// Initialize DB
const db = new PrismaClient();

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post(
    "/signup",
    async ({ body, set }) => {
      const existingUser = await db.user.findUnique({
        where: { username: body.username },
      });

      if (existingUser) {
        // 2. Use 'set.status' instead of returning error()
        set.status = 400;
        return { success: false, message: "Username already taken" };
      }

      const hashedPassword = await Bun.password.hash(body.password);

      const newUser = await db.user.create({
        data: {
          username: body.username,
          password: hashedPassword,
        },
      });

      return {
        success: true,
        message: "Account created!",
        userId: newUser.id,
        // 3. (Optional) Fix the link to point to the actual frontend later
        yourLink: `http://localhost:3000/send/${newUser.username}`,
      };
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    }
  );
