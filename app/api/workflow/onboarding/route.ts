import { serve } from "@upstash/workflow/nextjs";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/workflow";

type InitialData = {
  email: string;
  fullName: string;
};
type UserState = "non-active" | "active";

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24; // 1 day
const THREE_DAYS_IN_MS = 1000 * 60 * 60 * 24 * 3; // 3 days
const SEVEN_DAYS_IN_MS = 1000 * 60 * 60 * 24 * 7; // 7 days (QStash max)

const getUserState = async (email: string): Promise<UserState> => {
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (user.length === 0) return "non-active";

  const lastActivityDate = new Date(user[0].lastActivityDate!);
  const now = new Date();
  const timeDifference = now.getTime() - lastActivityDate.getTime();

  if (timeDifference > THREE_DAYS_IN_MS && timeDifference <= SEVEN_DAYS_IN_MS) return "non-active";

  return "active";
};

export const { POST } = serve<InitialData>(async (context) => {
  const { email, fullName } = context.requestPayload;

  // welcome email
  await context.run("new-signup", async () => {
    await sendEmail(
      email,
      "Welcome to BookSurf!",
      `<h1>Welcome ${fullName}!</h1><p>We're excited to have you at BookSurf. Start exploring our library today!</p>`
    );
  });

  await context.sleep("wait-for-3-days", THREE_DAYS_IN_MS);

  while (true) {
    const state = await context.run("check-user-state", async () => {
      return await getUserState(email);
    });

    if (state === "non-active") {
      await context.run("send-email-non-active", async () => {
        await sendEmail(
          email,
          "We miss you at BookSurf!",
          `<h2>Hey ${fullName}!</h2><p>We noticed you haven't been active lately. Come back and check out what's new!</p>`
        );
      });
    } else if (state === "active") {
      await context.run("send-email-active", async () => {
        await sendEmail(
          email,
          "New books added to BookSurf!",
          `<h2>Welcome back ${fullName}!</h2><p>Check out our latest collection of books added this week!</p>`
        );
      });
    }

    await context.sleep("wait-for-7-days", SEVEN_DAYS_IN_MS);
  }
});
