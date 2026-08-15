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
import { addDays } from "date-fns";
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
import { useCountryCode } from "@/hooks/useCountry";

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

const timeOptions = TIME_SLOTS.availableTimes.map((slot) => slot.time) as [
  string,
  ...string[]
]; // Non-empty tuple

const formSchema = z.object({
  // Step 1
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  phoneNumber: z.string().refine((value) => isValidPhoneNumber(value), {
    message: "Invalid phone number",
  }),
  grade: z
    .number({ invalid_type_error: "Grade is required" })
    .min(1, { message: "Please select a grade" })
    .max(12, { message: "Invalid grade selection" }),
  gender: z.enum(["male", "female"], { required_error: "Gender is required!", invalid_type_error: 'Invalid gender type.', message: 'Gender is required.' }),
  // Step 2
  howManyJoin: z.enum(["1", "2", "3", "4", "5"], {
    errorMap: () => ({ message: "Select how many students will join" }),
  }),
  preferredTeacher: z.enum(["Male", "Female", "Others"], {
    errorMap: () => ({ message: "Please select a preferred teacher" }),
  }),
  classStartDate: z.date({
    required_error: "Please select a class start date",
    invalid_type_error: "Invalid date",
  }),
  classStartTime: z.enum([...(timeOptions as [string, ...string[]])], {
    errorMap: () => ({ message: "Please select a valid class time" }),
  }),
  howFindUs: z.enum(["Friends", "Social Media", "Email", "Google", "Other"], {
    errorMap: () => ({ message: "Please select how you found us" }),
  }),
});

const MultiStepRegistrationForm = () => {
  const { countryCode } = useCountryCode();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { next, prev, total, current, hasNext, hasPrev, isLast } = useSteps();

  // form methods
  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      gender: "male",
      phoneNumber: "",
      grade: 0,
      howManyJoin: "1",
      preferredTeacher: "Male",
      classStartDate: addDays(new Date(), 1),
      classStartTime: undefined,
      howFindUs: "Friends",
    },
  });

  const validateStep = async () => {
    const isValid = await methods.trigger([
      "email",
      "phoneNumber",
      "firstName",
      "lastName",
      "grade",
    ]); // Validate specific fields
    if (isValid) {
      next(); // Move to the next step if valid
    } else {
      console.log("Validation failed:", methods.formState.errors);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Now loading
      setIsLoading(true);

      // Fetch user city using IP API
    const cityRes = await fetch("https://ipapi.co/json/");
    const locationData = await cityRes.json();

      
// Prepare payload
const selectedDate = new Date(values.classStartDate);

// ✅ Fix timezone issue (prevents shifting to previous day)
const fixedClassStartDate = new Date(
  selectedDate.getFullYear(),
  selectedDate.getMonth(),
  selectedDate.getDate(),
  0, 0, 0
)
  .toISOString()
  .split("T")[0]; // YYYY-MM-DD format

const payload = {
  ...values,
  classStartDate: fixedClassStartDate, // ✅ Corrected date
  city: locationData.city || "Unknown", // ✅ Auto-detected city
  submittedAt: new Date().toISOString(), // ✅ Form submission timestamp
};


      const registerURL = process.env.NEXT_PUBLIC_API_BASE_URL + "/register";
      const res = await fetch(registerURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Registration response error: ${res.status}`);
      }

      const serverResponse = await res.json();
      // finished loading
      setIsLoading(false);

      // toast notification
      toast.success(serverResponse.message, {
        cancel: {
          label: "Cancel",
          onClick: () => { },
        },
      });
      // redirect to welcome page after successful
      router.push("/register/thank-you");
    } catch (error) {
      // toast notification
      toast.error("Something went wrong! Sorry for that.", {
        cancel: {
          label: "Cancel",
          onClick: () => { },
        },
      });
      methods.reset({
        firstName: "",
        lastName: "",
        email: "",
        gender: "male",
        phoneNumber: "",
        grade: 0,
        howManyJoin: "1",
        preferredTeacher: "Male",
        classStartDate: addDays(new Date(), 1),
        classStartTime: undefined,
        howFindUs: "Friends",
      });
      window.location.reload();
      console.log("registration failed:", error);
    }
  };

  // Calculate the date 7 days from now
  const sevenDaysFromNow = addDays(new Date(), 7);

  // Function to determine if a date should be disabled
  const isDateDisabled = (day: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only

    return day <= today;
    // return (
    //   day < today || // Disable dates before today
    //   day > sevenDaysFromNow // Disable dates more than 7 days from now
    // );
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
                  name="firstName"
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
                  name="lastName"
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

                {/* Gender */}
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
                  name="phoneNumber"
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
                  name="grade"
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
                className="grid grid-cols-2 gap-x-7 gap-y-10"
              >
                {/* How Many Joining */}
                <FormField
                  name="howManyJoin"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel className="text-neutral-800 font-semibold text-lg sm:text-2xl">
                        How many students will join?
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="grid grid-cols-5 gap-y-5 gap-x-3 place-items-center sm:gap-x-10"
                        >
                          {Array.from({ length: 5 }).map((_, index) => (
                            <FormItem
                              key={index}
                              className="radio-item-wrapper w-10 h-10 sm:w-20 sm:h-20 space-y-0 flex items-center justify-center relative bg-neutral-100 rounded-full overflow-hidden"
                            >
                              <FormControl>
                                <RadioGroupItem
                                  value={String(index + 1)}
                                  className="absolute top-0 left-0 w-full h-full opacity-0"
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor={`join-${index + 1}`}
                                className="text-lg sm:text-3xl font-semibold text-neutral-800"
                              >
                                {index + 1}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preferred Teacher */}
                <FormField
                  name="preferredTeacher"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel className="text-neutral-800 font-semibold text-lg sm:text-2xl">
                        Preferred Teacher
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex items-center gap-y-5 gap-x-4 sm:gap-x-10"
                        >
                          {["Male", "Female", "Others"].map((option) => (
                            <FormItem
                              key={option}
                              className="radio-item-wrapper w-28 sm:h-16 py-2 px-3 space-y-0 flex items-center justify-center relative bg-neutral-100 rounded-lg overflow-hidden"
                            >
                              <FormControl>
                                <RadioGroupItem
                                  value={option}
                                  id={`teacher-${option}`}
                                  className="absolute top-0 left-0 w-full h-full opacity-0"
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor={`teacher-${option}`}
                                className="text-base sm:text-lg font-normal sm:font-semibold text-neutral-800"
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

                <div
                  aria-label="class-date"
                  className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6 items-center justify-center"
                >
                  <h4 className="text-neutral-800 font-semibold text-lg sm:text-2xl col-span-full">
                    When do you want to start the classes
                  </h4>
                  {/* class start date */}
                  <FormField
                    control={methods.control}
                    name="classStartDate"
                    render={({ field }) => (
                      <FormItem className="space-y-2 h-full">
                        <FormLabel>Select a date and time</FormLabel>
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

                  {/* Class Start Time */}
                  <FormField
                    name="classStartTime"
                    render={({ field }) => (
                      <FormItem className="space-y-2 h-full">
                        <FormLabel>Available Time</FormLabel>
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

                {/* How Find US Teacher */}
                <FormField
                  name="howFindUs"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel className="text-neutral-800 font-semibold text-lg sm:text-2xl">
                        How did you find us?
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-5 gap-x-4 sm:gap-x-9"
                        >
                          {[
                            "Friends",
                            "Social Media",
                            "Email",
                            "Google",
                            "Other",
                          ].map((option, index) => (
                            <FormItem
                              key={index}
                              className="radio-item-wrapper space-y-0 flex px-4 py-2 items-center justify-center relative bg-neutral-100 rounded-lg overflow-hidden"
                            >
                              <FormControl>
                                <RadioGroupItem
                                  value={option}
                                  className="absolute top-0 left-0 w-full h-full opacity-0"
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor={`find-${option}`}
                                className="text-lg text-center font-semibold text-neutral-800"
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
              </div>
              {/* SECOND STEP END */}
            </Steps>

            <div className="navigation mt-14 flex items-center gap-x-4 max-w-screen-sm ml-auto">
              {hasPrev && (
                <Button
                  type="button"
                  onClick={prev}
                  variant={"outline"}
                  className="w-auto flex-1 rounded-lg"
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

export default MultiStepRegistrationForm;
