"use client";

import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ConfirmDialog from "@/components/ConfirmDialog";

const formSchema = z.object({
  your_name: z.string().min(2, { message: 'Name must contain at least 2 character(s)' }).max(50, { message: 'Name must contain at most 50 character(s)' }),
  email: z.string().email(),
  user_message: z.string().min(10).max(255)
});

const FaqForm = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState<z.infer<typeof formSchema> | null>(null);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      your_name: "",
      email: '',
      user_message: '',
    },
  });

  const handleConfirmSubmit = async () => {
    if (!formValues) return;
    setShowConfirm(false);
    try {
      setIsLoading(true)
      toast.loading("Please wait for a moment..", {
        id: "submit-question",
      });
      const registerURL = process.env.NEXT_PUBLIC_API_BASE_URL + "/faq/submit";
      const res = await fetch(registerURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });

      if (!res.ok) {
        throw new Error(`Registration response error: ${res.status}`);
      }

      const response = await res.json();
      setIsLoading(false);

      toast.success(response.message, {
        id: 'submit-question',
        cancel: {
          label: "Cancel",
          onClick: () => { },
        },
      });
      form.reset()
    } catch (error) {
      toast.error("Something went wrong! Sorry for that.", {
        id: 'submit-question',
        cancel: {
          label: "Cancel",
          onClick: () => { },
        },
      });
      form.reset();
      // window.location.reload();
      console.log("Sending question to admin failed:", error);
    }
  };

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    setFormValues(values);
    setShowConfirm(true);
  }

  return (
    <React.Fragment>
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleConfirmSubmit}
        title="Are you sure you want to send this message?"
        description="Your query will be forwarded to the admin team and they will get back to you via email."
      />
      <div
        aria-describedby="faq-form-wrapper"
        className="bg-[#FAF8F8] rounded-lg p-5 md:p-12"
      >
        <div aria-describedby="title-wrapper" className="mb-6 md:mb-12">
          <h4 className="text-2xl sm:text-4xl font-bold text-neutral-800 text-center">
            Any other Question?
          </h4>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-6"
          >
            <FormField
              control={form.control}
              name="your_name"
              render={({ field }) => (
                <FormItem className="col-span-full md:col-span-1">
                  <FormLabel className="text-neutral-800">Your Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your name"
                      {...field}
                      className="rounded-lg h-10 border border-neutral-200"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="col-span-full md:col-span-1">
                  <FormLabel className="text-neutral-800">
                    Your email address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Type your email"
                      {...field}
                      className="rounded-lg h-10 border border-neutral-200"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user_message"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel className="text-neutral-800">Short your personal message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type here"
                      className="resize-none bg-white shadow-none border border-neutral-200 focus-within:border-neutral-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="col-span-full">
              Send
            </Button>
          </form>
        </Form>
      </div>
    </React.Fragment>
  );
};

export default FaqForm;
