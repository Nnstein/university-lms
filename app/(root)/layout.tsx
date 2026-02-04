import React from "react";
import Header from "@/components/Header";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session) {
    return redirect("/sign-in");
  }

  after(async () => {
    if (!session?.user?.id) return;

    // Get the user and check if the last activity date is today
    const user = await db.select().from(users).where(eq(users.id, session?.user?.id)).limit(1);

    // Safety check: ensure user exists
    if (!user || user.length === 0) return;

    // Check if last activity date is today
    const today = new Date().toISOString().slice(0, 10);
    if (user[0].lastActivityDate === today) {
      return;
    }

    // Update last activity date
    await db.update(users).set({ lastActivityDate: today }).where(eq(users.id, session?.user?.id));
  });

  return (
    <main className="root-container">
      <div className="mx-auto max-w-7xl">
        <Header session={session} />
        <div className="mt-20 pb-20">{children}</div>
      </div>
    </main>
  );
};

export default Layout;
