"use client";
import ConfirmDialog from "@/components/ConfirmDialog";
import ThankYouModal from "@/components/ThankYouModal";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  fullName: z
    .string()
    .min(2, {
      message: "must be at least 2 characters.",
    })
    .max(50, {
      message: "must be maximum 50 characters.",
    }),
  email: z.string().email({ message: "Invalid email address." }),
  contactingPurpose: z.enum(
    [
      "General Inquiry",
      "Enroll in a Course",
      "Request Course Information",
      "Request a Demo Class",
      "Technical Support",
      "Ask About Study Materials",
      "One-on-One Tutoring Request",
      "Others",
    ],
    {
      message: "Please select a purpose.",
    }
  ),
  message: z
    .string()
    .min(10, {
      message: "Must be minimum 10 characters.",
    })
    .max(500, {
      message: "Must be maxmimum 500 characters.",
    }),
});

const ContactForm = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [thanksPopupOpen, setThanksPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState<z.infer<typeof formSchema> | null>(null);

  const formMethods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      contactingPurpose: undefined,
      message: "",
    },
  });

  const handleConfirmSubmit = async () => {
    if (!formValues) return;

    setShowConfirm(false);
    try {
      setIsLoading(true);
      toast.loading("Submitting your message...", { id: "contact-submit" });

      const contactURL = process.env.NEXT_PUBLIC_API_BASE_URL + "/contact/submit";
      const res = await fetch(contactURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      if (!res.ok) {
        throw new Error(`Error response: ${res.status}`);
      }

      const response = await res.json();
      toast.success(response.message || "Message sent successfully!", { id: "contact-submit" });
      setThanksPopupOpen(true);
      formMethods.reset();
    } catch (error) {
      toast.error("Something went wrong. Please try again later.", { id: "contact-submit" });
      console.error("Contact submission failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setFormValues(values);
    setShowConfirm(true);
  };

  return (
    <React.Fragment>
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleConfirmSubmit}
        title="Send this Message?"
        description="We will reach out to you as soon as possible."
      />
      <Form {...formMethods}>
        <form
          aria-label="contact-form-wrapper"
          onSubmit={formMethods.handleSubmit(onSubmit)}
        >
          <div
            aria-label="form-field-wrapper"
            className="grid grid-cols-1 gap-y-5"
          >
            <FormField
              name="fullName"
              control={formMethods.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-neutral-800">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Name"
                      className="h-12 rounded-lg bg-transparent border border-[#DCDCDC] focus-within:border-light-green-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="email"
              control={formMethods.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-neutral-800">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Email address"
                      className="h-12 rounded-lg bg-transparent border border-[#DCDCDC] focus-within:border-light-green-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="contactingPurpose"
              control={formMethods.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-neutral-800">
                    Purpose for contacting us
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="h-12 rounded-lg bg-transparent border border-[#DCDCDC] focus-within:border-light-green-500">
                        <SelectValue placeholder="Please select a purpose" />
                      </SelectTrigger>

                      <SelectContent>
                        {[
                          "General Inquiry",
                          "Enroll in a Course",
                          "Request Course Information",
                          "Request a Demo Class",
                          "Technical Support",
                          "Ask About Study Materials",
                          "One-on-One Tutoring Request",
                          "Others",
                        ].map((purpose, index) => (
                          <SelectItem key={index} value={purpose}>
                            {purpose}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="message"
              control={formMethods.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-neutral-800">
                    Message
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Your message"
                      className="rounded-lg bg-transparent border border-[#DCDCDC]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="mt-5 w-full text-lg">
            {isLoading ? "Submitting..." : "Submit Now"}
          </Button>
        </form>
      </Form>
      <ThankYouModal
        title="Thank you for contacting us."
        message="Your message has been received. Our team will get back to you shortly."
        open={thanksPopupOpen}
        onClose={() => setThanksPopupOpen(false)}
      />

    </React.Fragment>
  );
};

export default ContactForm;
