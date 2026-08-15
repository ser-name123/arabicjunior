import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";

const loginFormSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(32),
});

const otpFormSchema = z.object({
    code: z.string().min(6, { message: "Code must be 6 digit." }),
});

export function AdminLoginFormV2({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter();
    const [step, setStep] = useState<"login" | "otp">("login")
    const [tempToken, setTempToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [code, setCode] = useState("")

    // 1. Define your form.
    const loginForm = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const otpForm = useForm<z.infer<typeof otpFormSchema>>({
        resolver: zodResolver(otpFormSchema),
        defaultValues: {
            code: "",
        },
    });

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof loginFormSchema>) {
        setLoading(true)
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
                loginForm.reset();
                return;
            }

            const data = await res.json();

            if (data.twoFactorRequired) {
                setTempToken(data.tempToken)
                setStep("otp")
                toast("Enter your 2FA code")
            } else {
                const token = data?.token;
                if (typeof window !== undefined) {
                    localStorage.setItem('jwtToken', JSON.stringify(token));
                }
                toast.success(data?.message || "Login successful!")
                router.push("/admin")
            }
        } catch (error) {
            console.error("Login Error", error);
            toast.error("Login failed")
        } finally {
            setLoading(false)
            loginForm.reset()
            // otpForm.reset()
        }
    }

    async function onVerify2FA(values: z.infer<typeof otpFormSchema>) {
        if (!tempToken) return
        setLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/2fa/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: tempToken, code: values.code }),
            })

            if (!res.ok) {
                toast.error("Invalid 2FA code")
                return
            }

            const data = await res.json()
            localStorage.setItem("jwtToken", JSON.stringify(data.token))
            toast.success("2FA verification successful")
            router.push("/admin")
        } catch (err) {
            console.error(err)
            toast.error("Verification failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-12">
            <div className="w-full max-w-[360px]">
                <div className={cn("flex flex-col gap-6", className)} {...props}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{step === "login" ? "Login to your account" : "Two-Factor Authentication"}</CardTitle>
                            <CardDescription>
                                {step === "login"
                                    ? "Enter your email and password"
                                    : "Enter the 6-digit code from your Authenticator app"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {step === "login" && (
                                <Form {...loginForm}>
                                    <form onSubmit={loginForm.handleSubmit(onSubmit)}>
                                        <div className="flex flex-col gap-6">
                                            <FormField
                                                control={loginForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="email"
                                                                className="rounded-lg border placeholder:text-sm"
                                                                placeholder="Your Email" {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={loginForm.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <div className="flex items-center">
                                                            <FormLabel>Password</FormLabel>
                                                            <Link
                                                                href="#"
                                                                className="ml-auto inline-block text-xs underline-offset-4 hover:underline"
                                                            >
                                                                Forgot your password?
                                                            </Link>
                                                        </div>
                                                        <FormControl>
                                                            <Input
                                                                type="password"
                                                                placeholder="Your Password"
                                                                className="rounded-lg border placeholder:text-sm"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="flex flex-col gap-3">
                                                <Button type="submit" size={'sm'} disabled={loading} className="w-full rounded-lg !text-sm">
                                                    {loading ? "Logging in..." : "Login"}
                                                </Button>
                                                <Button variant="outline" disabled size={'sm'} className="w-full rounded-lg !text-sm">
                                                    Login with Google
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="mt-4 text-center text-sm">
                                            Don&apos;t have an account?{" "}
                                            <Link href="#" className="underline text-sm underline-offset-4">
                                                Sign up
                                            </Link>
                                        </div>
                                    </form>
                                </Form>
                            )}

                            {step === 'otp' && (
                                <Form {...otpForm}>
                                    <form onSubmit={otpForm.handleSubmit(onVerify2FA)}>
                                        <div className="flex flex-col gap-6">
                                            <FormField
                                                control={otpForm.control}
                                                name="code"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel>2FA Code</FormLabel>
                                                        <FormControl>
                                                            {/* <InputOTP maxLength={6} {...field}>
                                                                <InputOTPGroup>
                                                                    <InputOTPSlot index={0} />
                                                                    <InputOTPSlot index={1} />
                                                                    <InputOTPSlot index={2} />
                                                                    <InputOTPSlot index={3} />
                                                                    <InputOTPSlot index={4} />
                                                                    <InputOTPSlot index={5} />
                                                                </InputOTPGroup>
                                                            </InputOTP> */}
                                                            <InputOTP
                                                                maxLength={6}
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                            >
                                                                <InputOTPGroup>
                                                                    <InputOTPSlot index={0} />
                                                                    <InputOTPSlot index={1} />
                                                                    <InputOTPSlot index={2} />
                                                                </InputOTPGroup>
                                                                <InputOTPSeparator />
                                                                <InputOTPGroup>
                                                                    <InputOTPSlot index={3} />
                                                                    <InputOTPSlot index={4} />
                                                                    <InputOTPSlot index={5} />
                                                                </InputOTPGroup>
                                                            </InputOTP>
                                                        </FormControl>
                                                        <FormDescription>
                                                            Please enter the 2FA code.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="flex flex-col gap-3">
                                                <Button className="rounded-lg !text-sm" size={'sm'} type="submit" disabled={loading}>
                                                    {loading ? "Verifying..." : "Verify"}
                                                </Button>
                                            </div>
                                        </div>
                                    </form>
                                </Form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    )
}
