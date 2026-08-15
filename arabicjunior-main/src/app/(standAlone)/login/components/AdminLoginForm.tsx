"use client";

import React from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(32),
});

const AdminLoginForm = () => {
  const router = useRouter();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    try {
      const res = await fetch(
        (process.env.NEXT_PUBLIC_API_BASE_URL as string) + "/admin/login",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!res.ok) {
        // notify user
        toast("Incorrect password and email");
        form.reset();
        return;
      }

      const data = await res.json();
      const token = data?.token;


      if (typeof window !== undefined) {
        localStorage.setItem('jwtToken', JSON.stringify(token));
      }

      // notify user
      toast(data?.message || "Login successful!");
      // redirect to admin dashboard
      router.push("/admin");
    } catch (error) {
      console.error("Login Error", error);
    }
  }

  return (
    <React.Fragment>
      <div aria-describedby="admin-login-form" className="container">
        <div
          aria-describedby="main-wrapper"
          className="h-screen flex items-center justify-center flex-col w-full"
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 max-w-screen-sm mx-auto bg-gray-100 shadow-md p-5"
            >
              <div className="flex items-center justify-center">
                <h4 className="text-2xl text-gray-800 font-medium text-center">
                  Admin Login
                </h4>
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Your Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Your Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Login</Button>
            </form>
          </Form>
        </div>
      </div>
    </React.Fragment>
  );
};

export default AdminLoginForm;
