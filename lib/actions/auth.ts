"use server";

import { signIn } from "@/auth";
import { db } from "@/database/drizzle";
import { eq } from "drizzle-orm";
import { users } from "@/database/schema";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import ratelimit from "../ratelimit";
import { redirect } from "next/navigation";
import { workflowClient } from "../workflow";
import config from "../config";

export const signInWithCredentials = async (
  params: Pick<AuthCredentials, "email" | "password">
): Promise<{ success: boolean; error?: string }> => {
  const { email, password } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect("/too-fast");

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.log(error, "Error signing in");
    return {
      success: false,
      error: "Signin error",
    };
  }
};

export const signUp = async (
  params: AuthCredentials
): Promise<{ success: boolean; error?: string }> => {
  const { fullName, email, password, universityId, universityCard } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect("/too-fast");

  // Check for duplicate email
  const existingEmail = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existingEmail.length > 0) {
    return {
      success: false,
      error: "Email already registered. Please sign in instead.",
    };
  }

  // Check for duplicate university ID
  const existingUniversityId = await db
    .select()
    .from(users)
    .where(eq(users.universityId, universityId))
    .limit(1);

  if (existingUniversityId.length > 0) {
    return {
      success: false,
      error:
        "This University ID is already registered. Please contact support if this is an error.",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.insert(users).values({
      fullName,
      email,
      password: hashedPassword,
      universityId,
      universityCard,
    });

    await workflowClient.trigger({
      url: `${config.env.prodApiEndpoint}/api/workflows/onboarding`,
      body: {
        email,
        fullName,
      },
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.log(error, "Error creating user");

    // Handle specific database errors
    if (error?.code === "23505") {
      if (error.constraint === "users_email_unique") {
        return {
          success: false,
          error: "Email already registered. Please sign in instead.",
        };
      }
      if (error.constraint === "users_university_id_unique") {
        return {
          success: false,
          error:
            "This University ID is already registered. Please contact support if this is an error.",
        };
      }
    }

    return {
      success: false,
      error: "An error occurred during signup. Please try again.",
    };
  }
};
