"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { DefaultValues, FieldValues, Path, useForm, Control } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ImageUpload from "./imageUpload";
import { FIELD_TYPES, FIELD_NAMES } from "@/app/constants";

interface Props<T extends FieldValues> {
  type: "SIGN_IN" | "SIGN_UP";
  schema: z.ZodSchema<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string }>;
}

const AuthForm = <T extends FieldValues>({ type, schema, defaultValues, onSubmit }: Props<T>) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const isSignIn = type === "SIGN_IN";

  const form = useForm<T>({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit = async (data: T) => {
    const result = await onSubmit(data);

    if (result.success) {
      toast({
        title: `Success ${isSignIn ? "signing in" : "signing up"}`,
        description: isSignIn
          ? "You have successfully signed in"
          : "You have successfully signed up",
      });

      router.push("/");
    } else {
      toast({
        title: `Error ${isSignIn ? "signing in" : "signing up"}`,
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-white">
        {isSignIn ? "Welcome back to BookSurf" : "Create an account"}
      </h1>
      <p className="text-light-100">
        {isSignIn
          ? "Access the vast collections of resources, and stay updated"
          : "Please complete all fields and upload a valid university card to gain access to the library"}
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full space-y-6">
          {Object.keys(defaultValues).map((fieldKey) => (
            <FormField
              key={fieldKey}
              control={form.control as Control<T>}
              name={fieldKey as Path<T>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    {FIELD_NAMES[fieldKey as keyof typeof FIELD_NAMES]}
                  </FormLabel>
                  <FormControl>
                    {fieldKey === "universityCard" ? (
                      <ImageUpload onFileChange={field.onChange} />
                    ) : fieldKey === "password" ? (
                      <div className="relative">
                        <Input
                          required
                          type={showPassword ? "text" : "password"}
                          placeholder={FIELD_NAMES[fieldKey as keyof typeof FIELD_NAMES]}
                          {...field}
                          className="form-input pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-200"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <Input
                        required
                        type={FIELD_TYPES[fieldKey as keyof typeof FIELD_TYPES]}
                        placeholder={FIELD_NAMES[fieldKey as keyof typeof FIELD_NAMES]}
                        {...field}
                        className="form-input"
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button type="submit" className="form-btn">
            {isSignIn ? "Sign In" : "Sign Up"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-base font-medium">
        {isSignIn ? "New to BookSurf? " : "Already have an account? "}
        <Link href={isSignIn ? "/sign-up" : "/sign-in"} className="text-primary font-bold">
          {isSignIn ? "Create an account" : "Sign In"}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;
