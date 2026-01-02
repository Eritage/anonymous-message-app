import { Elysia, t } from "elysia";
import { PrismaClient } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

const db = new PrismaClient();

export const messageRoutes = new Elysia({ prefix: "/api" })
  .post(
    "/send/:username",
    async ({ params, body, set }) => {
      // Find the user who receives the message
      const recipient = await db.user.findUnique({
        where: { username: params.username },
      });

      if (!recipient) {
        set.status = 404;
        return { success: false, message: "User not found" };
      }

      // Create the message
      const newMessage = await db.message.create({
        data: {
          content: body.content,
          recipientId: recipient.id,
        },
      });

      return {
        success: true,
        message: "Message sent anonymously! 👻",
        sentTo: recipient.username,
        data: newMessage,
      };
    },
    {
      // Validation Schema
      params: t.Object({
        username: t.String(),
      }),
      body: t.Object({
        content: t.String(),
      }),
    }
  )

  .get(
    "/read/:username",
    async ({ params, set, headers }) => {
      // Extract password from a custom header (we'll call it 'x-password')
      const password = headers["x-password"];

      const user = await db.user.findUnique({
        where: { username: params.username },
      });

      if (!user) {
        set.status = 404;
        return { success: false, message: "User not found" };
      }

      // Simple password check (MVP Style)
      // If the password in URL doesn't match the one in DB (hashed), block access.
      // Note: For now, we are skipping the hash check for simplicity,
      // but normally you'd use Bun.password.verify(password, user.password)
      const isMatch = await Bun.password.verify(password || "", user.password);

      if (!isMatch) {
        set.status = 401;
        return { success: false, message: "Wrong password! 🔒" };
      }

      // Fetch messages for this user if password is correct
      const messages = await db.message.findMany({
        where: { recipientId: user.id },
        orderBy: { createdAt: "desc" },
      });

      // Format the data nicely
      return {
        success: true,
        username: user.username,
        total: messages.length,
        messages: messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          sentAt: msg.createdAt,
          // The Magic Line: Calculates "5 minutes ago"
          timeAgo: formatDistanceToNow(new Date(msg.createdAt), {
            addSuffix: true,
          }),
        })),
      };
    },
    {
      params: t.Object({ username: t.String() }),

      // Update Validation to expect a Header string
      headers: t.Object({
        "x-password": t.String(),
      }),
    }
  )

  // 👇 ADD THIS AFTER THE .get() BLOCK
  .delete(
    "/message/:id",
    async ({ params, set, headers }) => {
      // 1. Get the message ID to delete
      const messageId = params.id;
      const password = headers["x-password"];

      // 2. Find the message first (to see who owns it)
      const message = await db.message.findUnique({
        where: { id: messageId },
        include: { recipient: true }, // Helper: Grab the User data too
      });

      if (!message) {
        set.status = 404;
        return { success: false, message: "Message not found" };
      }

      // 3. SECURITY CHECK: Verify the password of the MESSAGE OWNER
      const isMatch = await Bun.password.verify(
        password || "",
        message.recipient.password
      );

      if (!isMatch) {
        set.status = 401;
        return {
          success: false,
          message: "You are not authorized to delete this! 😡",
        };
      }

      // 4. Actually delete it
      await db.message.delete({
        where: { id: messageId },
      });

      return {
        success: true,
        message: "Message deleted successfully 🗑️",
      };
    },
    {
      params: t.Object({ id: t.String() }),
      headers: t.Object({ "x-password": t.String() }),
    }
  );
