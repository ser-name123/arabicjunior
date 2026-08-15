"use client";

import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";
import ThankYouModal from "@/components/ThankYouModal";

const formSchema = z.object({
  email: z.string().email(),
});

const NewsletterForm = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState<z.infer<typeof formSchema> | null>(null);
  const [thanksPopupOpen, setThanksPopupOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleConfirmSubmit = async () => {
    if (!formValues) return;

    setShowConfirm(false);
    try {
      setIsLoading(true);
      toast.loading("Please wait...", { id: "newsletter-submit" });

      const newsletterURL = process.env.NEXT_PUBLIC_API_BASE_URL + "/newsletter/subscribe";
      const res = await fetch(newsletterURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      if (!res.ok) {
        throw new Error(`Error response: ${res.status}`);
      }

      const response = await res.json();
      toast.success(response.message || "Successfully subscribed!", { id: "newsletter-submit" });
      setThanksPopupOpen(true);
      form.reset();
    } catch (error) {
      toast.error("Something went wrong. Please try again later.", { id: "newsletter-submit" });
      console.error("Newsletter submission failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        title="Subscribe to our Newsletter?"
        description="We will send you updates and exclusive content. You can unsubscribe anytime."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Email Address" {...field} className="h-12 rounded-lg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="rounded-lg h-12 md:h-12">Submit</Button>
        </form>
      </Form>
      <ThankYouModal title="Thank you for subscribing!" message="You're now on our list. Stay tuned for updates!" open={thanksPopupOpen} onClose={() => setThanksPopupOpen(false)} />

    </React.Fragment>
  );
};

export default NewsletterForm;
