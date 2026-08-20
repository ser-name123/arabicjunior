"use client";
import { format } from "date-fns-tz";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Steps, useSteps } from "react-step-builder";
import "react-phone-number-input/style.css";
import PhoneInput, {
  Country,
  isValidPhoneNumber,
} from "react-phone-number-input";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Turnstile from "@/components/Turnstile";
import useTurnstile from "@/hooks/useTurnstile";
import { useCountryCode } from "@/hooks/useCountry";
import { Checkbox } from "@/components/ui/checkbox";
import { addDays } from "date-fns";

const TIME_SLOTS = {
  timeFormat: "12-hour",
  intervalMinutes: 30,
  startTime: "07:00 AM",
  endTime: "11:30 PM",
  availableTimes: [
    { time: "07:00 AM" },
    { time: "07:30 AM" },
    { time: "08:00 AM" },
    { time: "08:30 AM" },
    { time: "09:00 AM" },
    { time: "09:30 AM" },
    { time: "10:00 AM" },
    { time: "10:30 AM" },
    { time: "11:00 AM" },
    { time: "11:30 AM" },
    { time: "12:00 PM" },
    { time: "12:30 PM" },
    { time: "01:00 PM" },
    { time: "01:30 PM" },
    { time: "02:00 PM" },
    { time: "02:30 PM" },
    { time: "03:00 PM" },
    { time: "03:30 PM" },
    { time: "04:00 PM" },
    { time: "04:30 PM" },
    { time: "05:00 PM" },
    { time: "05:30 PM" },
    { time: "06:00 PM" },
    { time: "06:30 PM" },
    { time: "07:00 PM" },
    { time: "07:30 PM" },
    { time: "08:00 PM" },
    { time: "08:30 PM" },
    { time: "09:00 PM" },
    { time: "09:30 PM" },
    { time: "10:00 PM" },
    { time: "10:30 PM" },
    { time: "11:00 PM" },
    { time: "11:30 PM" },
  ],
};

const PREFERRED_DAYS = [
  {
    id: "mon",
    label: "Monday",
  },
  {
    id: "tue",
    label: "Tuesday",
  },
  {
    id: "wed",
    label: "Wednesday",
  },
  {
    id: "thu",
    label: "Thursday",
  },
  {
    id: "fri",
    label: "Friday",
  },
  {
    id: "sat",
    label: "Saturday",
  },
  {
    id: "sun",
    label: "Sunday",
  },
] as const;

type ClassType = "individual" | "group";

const PACKAGE_LIMITS: Record<string, number> = {
  Starter: 1,
  Essential: 2,
  Premium: 3,
  Elite: 4,
};

const PACKAGE_PRICING: Record<
  ClassType,
  { id: string, label: string; price: string; currency: string }[]
> = {
  individual: [
    { id: "Starter", label: "Starter - AED 200", price: "200", currency: "AED" },
    { id: "Essential", label: "Essential - AED 300", price: "300", currency: "AED" },
    { id: "Premium", label: "Premium - AED 400", price: "400", currency: "AED" },
    { id: "Elite", label: "Elite - AED 500", price: "500", currency: "AED" },
  ],
  group: [
    { id: "Starter", label: "Starter - AED 150", price: "150", currency: "AED" },
    { id: "Essential", label: "Essential - AED 250", price: "250", currency: "AED" },
    { id: "Premium", label: "Premium - AED 350", price: "350", currency: "AED" },
    { id: "Elite", label: "Elite - AED 450", price: "450", currency: "AED" },
  ],
};

const validTimes = TIME_SLOTS.availableTimes.map((slot) => slot.time);

const formSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  last_name: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone_number: z.string().refine((value) => isValidPhoneNumber(value), {
    message: "Invalid phone number",
  }),
  class_grade: z
    .number({
      required_error: "Please select a grade",
      invalid_type_error: "Grade must be a number",
    })
    .min(1, "Minimum grade is 1")
    .max(12, "Maximum grade is 12"),
  school_name: z
    .string()
    .trim()
    .min(5, "School name is required")
    .max(100, "School name must be under 100 characters"),
  curriculum: z.string().min(1, "Please select a curriculum"),
  class_type: z.enum(["individual", "group"], {
    required_error: "Please select a class type",
  }),
  pricing_package: z.string({ required_error: "Please select a package" }),
  class_start_date: z
    .date({
      required_error: "Class start date is required",
      invalid_type_error: "Invalid date",
    })
    .refine((date) => date >= new Date(), {
      message: "Class start date cannot be in the past",
    }),
  preferred_time: z
    .string({
      required_error: "Please select a preferred time",
    })
    .refine((val) => validTimes.includes(val), {
      message: "Invalid time selected",
    }),
  gender: z.enum(["male", "female"], { required_error: "Gender is required!", invalid_type_error: 'Invalid gender type.', message: 'Gender is required.' }),
  preferred_days: z.array(z.string()).min(1, "Please select at least one day"),
});

const StudentRegistrationForm = () => {
  const { countryCode } = useCountryCode();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [classType, setClassType] = React.useState<ClassType>("individual");
  const { next, prev, total, current, hasNext, hasPrev, isLast } = useSteps();
  const captcha = useTurnstile();

  // form methods
  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      class_grade: undefined,
      school_name: "",
      curriculum: "",
      class_type: "individual",
      pricing_package: undefined,
      gender: "male",
      class_start_date: addDays(new Date(), 1),
      preferred_time: "",
      preferred_days: [],
    },
  });

  const validateStep = async () => {
    const isValid = await methods.trigger([
      "first_name",
      "last_name",
      "email",
      "phone_number",
      "class_grade",
    ]); // Validate specific fields
    if (isValid) {
      next(); // Move to the next step if valid
    } else {
      console.log("Validation failed:", methods.formState.errors);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!captcha.ready) {
      toast.error(captcha.notReadyMessage);
      return;
    }

    setIsLoading(true);

    try {
      // Detect city via IP geolocation
    const ipResponse = await fetch("https://ipapi.co/json/");
    const ipData = await ipResponse.json();
    const city = ipData?.city || "Unknown";

    // ✅ Extract year, month, day directly — avoids UTC shift
    const date = new Date(values.class_start_date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const fixedClassStartDate = `${year}-${month}-${day}`; // e.g., 2025-11-10

    // ✅ Keep submit time in Dubai timezone
    const formSubmissionDate = new Date().toLocaleString("en-GB", {
      timeZone: "Asia/Dubai",
    });

    // 📨 Prepare payload
    const payload = {
      ...values,
      class_start_date: fixedClassStartDate,
      city,
      formSubmissionDate,
    };


      const api_url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/student-registration`;
      const res = await fetch(api_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload, turnstileToken: captcha.token }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        // Single-use token: it is spent whether or not the server accepted it.
        captcha.reset();
        throw new Error(res.statusText);
      }

      toast.success(data?.message);
      setIsLoading(false);
      router.push("/");
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  // Function to determine if a date should be disabled
  const isDateDisabled = (day: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only

    return day <= today;
  };

  return (
    <React.Fragment>
      <React.Suspense fallback={"Loading"}>
        <div aria-label="progress-wrapper" className="mb-6">
          <Progress value={(current / total) * 100} className="w-full" />
        </div>

        <Form {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="registration-form"
          >
            <Steps>
              {/* FIRST STEP START */}
              <div
                aria-label="first-step"
                className="grid grid-cols-1 sm:grid-cols-2 gap-x-7 gap-y-5"
              >
                {/* First Name */}
                <FormField
                  name="first_name"
                  render={({ field }) => (
                    <FormItem
                      aria-label="form-item"
                      className="space-y-2 col-span-full sm:col-span-1"
                    >
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your first name"
                          className="border border-[#DCDCDC] rounded-lg bg-white h-12 py-3 px-4 flex text-base font-normal text-neutral-500 placeholder:text-base transition-all ease-in-out duration-300 focus-within:border-pink-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Last Name */}
                <FormField
                  name="last_name"
                  render={({ field }) => (
                    <FormItem className="space-y-2 col-span-full sm:col-span-1">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your last name"
                          className="border border-[#DCDCDC] rounded-lg bg-white h-12 py-3 px-4 flex text-base font-normal text-neutral-500 placeholder:text-base transition-all ease-in-out duration-300 focus-within:border-pink-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2 col-span-full sm:col-span-1">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter your email"
                          className="border border-[#DCDCDC] rounded-lg bg-white h-12 py-3 px-4 flex text-base font-normal text-neutral-500 placeholder:text-base transition-all ease-in-out duration-300 focus-within:border-pink-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-2 col-span-full sm:col-span-1">
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex text-orange-500 py-4"
                        >
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="male" />
                            </FormControl>
                            <FormLabel className="font-normal text-black">Male</FormLabel>
                          </FormItem>

                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="female" />
                            </FormControl>
                            <FormLabel className="font-normal text-black">Female</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Number Field */}
                <FormField
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem className="space-y-2 col-span-full">
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <PhoneInput
                          defaultCountry={
                            countryCode == "undefined"
                              ? "AE"
                              : (countryCode as Country)
                          }
                          value={field.value}
                          onChange={(phone) => {
                            field.onChange(phone);
                          }}
                          className="border border-[#DCDCDC] rounded-lg bg-white h-12 py-3 px-4 flex text-base font-normal text-neutral-500 placeholder:text-base transition-all ease-in-out duration-300 focus-within:border-pink-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Grade */}
                <FormField
                  name="class_grade"
                  render={({ field }) => (
                    <FormItem className="space-y-2 col-span-full">
                      <FormLabel>Class Grade</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                        >
                          <SelectTrigger className="border border-[#DCDCDC] rounded-lg bg-white h-12 py-3 px-4 flex text-base font-normal text-neutral-500 placeholder:text-base transition-all ease-in-out duration-300 focus-within:border-pink-400 outline-none focus-within:outline-none">
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                          <SelectContent>
                            {[...Array(10)].map((_, i) => (
                              <SelectItem
                                key={i + 1}
                                value={(i + 1).toString()}
                              >
                                {i + 1 + " - Grade"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* FIRST STEP END */}

              {/* SECOND STEP START */}
              <div
                aria-label="second-step"
                className="grid grid-cols-2 gap-x-7 gap-y-5"
              >
                <div className="grid sm:grid-cols-3 gap-x-7 col-span-2">
                  {/* School Name */}
                  <FormField
                    name="school_name"
                    render={({ field }) => (
                      <FormItem className="space-y-2 w-full col-span-2">
                        <FormLabel>School Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your school"
                            className="border border-[#DCDCDC] rounded-lg bg-white h-12 py-3 px-4 flex text-base font-normal text-neutral-500 placeholder:text-base transition-all ease-in-out duration-300 focus-within:border-pink-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Curriculam */}
                  <FormField
                    name="curriculum"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Curriculum</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange}>
                            <SelectTrigger className="w-full border border-[#DCDCDC] rounded-lg bg-white h-12 py-3 px-4 text-base text-neutral-500 placeholder:text-base focus-within:border-pink-400">
                              <SelectValue placeholder="Select Curriculum" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                "UAE Ministry of Education (MoE) Curriculum",
                                "British Curriculum (UK National Curriculum)",
                                "American Curriculum",
                                "International Baccalaureate (IB)",
                                "Indian CBSE Curriculum",
                                "Indian ICSE Curriculum",
                                "French Curriculum",
                                "German Curriculum",
                                "Canadian Curriculum",
                                "Australian Curriculum",
                                "Philippine Curriculum",
                                "Others",
                              ].map((label, idx) => (
                                <SelectItem key={idx} value={label}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Class type */}
                <FormField
                  name="class_type"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Class Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          defaultChecked={field.value}
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            const selectedType =
                              value.toLowerCase() as ClassType;
                            setClassType(selectedType);
                          }}
                          className="flex items-center gap-y-5 gap-x-4 sm:gap-x-10"
                        >
                          {["individual", "group"].map((option) => (
                            <FormItem
                              key={option}
                              className="radio-item-wrapper w-28 sm:h-16 py-2 px-3 space-y-0 flex items-center justify-center relative bg-neutral-100 rounded-lg overflow-hidden"
                            >
                              <FormControl>
                                <RadioGroupItem
                                  value={option}
                                  id={`class-${option}`}
                                  className="absolute top-0 left-0 w-full h-full opacity-0"
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor={`class-${option}`}
                                className="text-base font-normal text-neutral-800 capitalize"
                              >
                                {option}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pricing Package */}
                <FormField
                  name="pricing_package"
                  render={({ field }) => (
                    <FormItem className="space-y-2 col-span-full">
                      <FormLabel>Pricing Package</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange}>
                          <SelectTrigger className="border border-[#DCDCDC] rounded-lg bg-white h-12 py-3 px-4 flex text-base font-normal text-neutral-500 placeholder:text-base transition-all ease-in-out duration-300 focus-within:border-pink-400 outline-none focus-within:outline-none">
                            <SelectValue placeholder="Select Pricing package" />
                          </SelectTrigger>
                          <SelectContent>
                            {PACKAGE_PRICING[classType].map((item, i) => (
                              <SelectItem key={i} value={item.label}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div
                  aria-label="class-date"
                  className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6 items-center justify-center"
                >
                  {/* class start date */}
                  <FormField
                    control={methods.control}
                    name="class_start_date"
                    render={({ field }) => (
                      <FormItem className="space-y-2 h-full">
                        <FormLabel>Class Start Date</FormLabel>
                        <Calendar
                          mode="single"
                          disabled={isDateDisabled}
                          selected={field.value}
                          onSelect={field.onChange}
                          // initialFocus
                          className="bg-white border border-gray-200 rounded-md max-w-max p-6"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Class Preferred Time */}
                  <FormField
                    name="preferred_time"
                    render={({ field }) => (
                      <FormItem className="space-y-2 h-full">
                        <FormLabel>Preferable Time</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-2 w-full max-h-[25rem] overflow-x-hidden overflow-y-auto"
                          >
                            {TIME_SLOTS.availableTimes.map((slot, index) => (
                              <div
                                key={index}
                                aria-describedby="ratio-item"
                                className="flex items-center"
                              >
                                <RadioGroupItem
                                  className="h-11 bg-neutral-100 border border-neutral-200 shadow-sm w-full rounded-md text-xs font-semibold text-neutral-900 transition-colors ease-in-out duration-300 hover:bg-orange-500 hover:border-orange-500 aria-checked:border-orange-500 hover:text-white aria-checked:text-white aria-checked:bg-orange-500"
                                  value={slot.time}
                                >
                                  {slot.time}
                                </RadioGroupItem>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Preferred days */}
                <FormField
                  name="preferred_days"
                  render={({ field }) => {
                    const selectedPackage = methods.watch("pricing_package");
                    const id = PACKAGE_PRICING[methods.watch('class_type')].find(x => x.label === selectedPackage)?.id;
                    const maxDays = PACKAGE_LIMITS[id!] || 0;
                    return (
                      <FormItem className="col-span-full">
                        <div>
                          <FormLabel className="text-base">
                            Preferred Days
                          </FormLabel>
                        </div>

                        <div
                          aria-describedby="days-wrapper"
                          className="flex items-center gap-4 flex-wrap"
                        >
                          {PREFERRED_DAYS.map((item) => {
                            const isChecked = field.value?.includes(item.label);

                            const toggleDay = (checked: boolean) => {
                              if (checked) {
                                // field.onChange([...(field.value || []), item.label]);
                                if ((field.value?.length || 0) < maxDays) {
                                  field.onChange([...(field.value || []), item.label]);
                                }
                              } else {
                                field.onChange(
                                  (field.value || []).filter(
                                    (v: string) => v !== item.label
                                  )
                                );
                              }
                            };

                            const isDisabled = !isChecked && (field.value?.length || 0) >= maxDays;

                            return (
                              <FormItem
                                key={item.id}
                                className={`checkbox-item w-28 sm:h-16 py-2 px-3 space-y-0 flex items-center justify-center relative rounded-lg overflow-hidden
                                  ${isDisabled ? "bg-gray-200/60" : "bg-gray-200"
                                  }`}
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={isChecked}
                                    disabled={isDisabled}
                                    onCheckedChange={toggleDay}
                                    className="opacity-0 absolute top-0 left-0 w-full h-full border-none"
                                  />
                                </FormControl>
                                <FormLabel className="text-base font-normal cursor-pointer capitalize">
                                  {item.id}
                                </FormLabel>
                              </FormItem>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
              </div>
              {/* SECOND STEP END */}
            </Steps>

            {isLast && (
              <div className="mt-10 max-w-screen-sm mx-auto">
                <Turnstile
                  onVerify={captcha.onVerify}
                  controlRef={captcha.controlRef}
                />
              </div>
            )}

            <div className="navigation mt-14 flex items-center gap-x-4 max-w-screen-sm mx-auto">
              {hasPrev && (
                <Button
                  type="button"
                  onClick={prev}
                  variant={"outline"}
                  className="rounded-lg w-auto flex-1"
                >
                  Back
                </Button>
              )}

              {hasNext ? (
                <Button
                  type="button"
                  onClick={validateStep}
                  className="rounded-lg flex-1"
                >
                  Next
                </Button>
              ) : (
                isLast && (
                  <Button
                    type="submit"
                    variant="default"
                    className="flex-1 rounded-lg flex-shrink-0 flex-grow-1 basis-auto"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <LoaderCircle className="animate-spin" /> Please Wait
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                )
              )}
            </div>
          </form>
        </Form>
      </React.Suspense>
    </React.Fragment>
  );
};

export default StudentRegistrationForm;
