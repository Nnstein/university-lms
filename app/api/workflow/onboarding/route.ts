import { serve } from "@upstash/workflow/nextjs";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/workflow";

type InitialData = {
  email: string;
  fullname: string;
};
type UserState = "non-active" | "active";

const ONE_DAY_IN_MS = 60 * 60 * 24 * 1000;
const THREE_DAYS_IN_MS = 60 * 60 * 24 * 3 * 1000;
const ONE_MONTH_IN_MS = 60 * 60 * 24 * 30 * 1000;

const getUserState = async (email: string): Promise<UserState> => {
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (user.length === 0) return "non-active";

  const lastActivityDate = new Date(user[0].lastActivityDate!);
  const now = new Date();
  const timeDifference = now.getTime() - lastActivityDate.getTime();

  if (timeDifference > THREE_DAYS_IN_MS && timeDifference <= ONE_MONTH_IN_MS) return "non-active";

  return "active";
};

export const { POST } = serve<InitialData>(async (context) => {
  const { email, fullname } = context.requestPayload;

  // welcome email
  await context.run("new-signup", async () => {
    await sendEmail(email, "Welcome to the platform", `Welcome ${fullname}`);
  });

  await context.sleep("wait-for-3-days", THREE_DAYS_IN_MS);

  while (true) {
    const state = await context.run("check-user-state", async () => {
      return await getUserState(email);
    });

    if (state === "non-active") {
      await context.run("send-email-non-active", async () => {
        await sendEmail(email, "Are you still there?", `Hey ${fullname} we miss you!`);
      });
    } else if (state === "active") {
      await context.run("send-email-active", async () => {
        await sendEmail(email, "Welcome back", `Welcome back ${fullname}!`);
      });
    }

    await context.sleep("wait-for-1-month", ONE_MONTH_IN_MS);
  }
});
