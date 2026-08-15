"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button-2";
import { Input } from "@/components/ui/input-2";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { z } from "zod";
import useAuthAdmin from "@/hooks/useAuthAdmin";

export const passwordResetSchema = z.object({
  oldPassword: z
    .string()
    .min(4, "Password must be at least 4 characters long"),
  newpassword: z
    .string()
    .min(4, "Password must be at least 4 characters long"),
  confirmpassword: z
    .string()
    .min(4, "Password must be at least 4 characters long"),
}).refine((data) => data.newpassword === data.confirmpassword, {
  message: "Passwords do not match",
  path: ["confirmpassword"],
});;

export type passwordResetSchemaType = z.infer<
  typeof passwordResetSchema
>;

const PasswordResetForm = () => {
  const [loading, setLoading] = useState(false);
  const { token } = useAuthAdmin();

  const form = useForm<passwordResetSchemaType>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      newpassword: "",
      oldPassword: "",
      confirmpassword: ""
    },
  });

  const onSubmit = useCallback(
    async (values: passwordResetSchemaType) => {
      toast.loading("Updating, Please wait!", {
        id: "update-password",
      });
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/update-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: values.oldPassword,
            newPassword: values.newpassword,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Something went wrong");
        }

        toast.success("Password updated successfully!", {
          id: "update-password",
        });
        form.reset({
          newpassword: "",
          oldPassword: "",
          confirmpassword: ""
        });
      } catch (error: any) {
        toast.error(error.message || "Failed to Update Password", {
          id: "update-password",
        });
      } finally {
        setLoading(false);
      }
    },
    [form, token]
  );

  useEffect(() => {
    form.reset({
      newpassword: "",
      oldPassword: "",
      confirmpassword: ""
    });
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 items-top">
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1 items-center">
                  Previous Password
                  <p className="text-xs text-primary">*</p>
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    className="focus-visible:ring-transparent bg-[#EEEEEE] dark:bg-secondary/70"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newpassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1 items-center">
                  New Password
                  <p className="text-xs text-primary">*</p>
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    className="focus-visible:ring-transparent bg-[#EEEEEE] dark:bg-secondary/70"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmpassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-1 items-center">
                  Confirm Password
                  <p className="text-xs text-primary">*</p>
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    className="focus-visible:ring-transparent bg-[#EEEEEE] dark:bg-secondary/70"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="w-full mx-auto flex items-center justify-center py-4">
          <Button
            type="submit"
            disabled={loading}
            size={'sm'}
            className="w-52 mt-8 md:mt-8 mx-auto sm:col-span-2 md:col-span-1 lg:col-span-1 shadow-xl py-2.5 px-4 text-sm font-semibold rounded text-white focus:outline-none"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader spinnerClassname="w-4 h-4" />
                Please wait!
              </div>
            ) : (
              "Reset Password"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PasswordResetForm;
