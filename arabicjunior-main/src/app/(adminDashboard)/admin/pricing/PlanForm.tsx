"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { GripVertical, MoveLeft, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input-2";
import { Button } from "@/components/ui/button-2";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Loader from "@/components/loader";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import { revalidateContent } from "@/lib/revalidateContent";
import type { AccentColor, PricingGroup, PricingPlan } from "@/types/Pricing";

const ACCENT_SWATCH: Record<AccentColor, string> = {
  yellow: "bg-yellow-500",
  pink: "bg-pink-500",
  green: "bg-light-green-500",
  orange: "bg-orange-500",
};

const planSchema = z.object({
  groupKey: z.string().min(1, "Choose which tab this plan belongs to."),
  title: z.string().min(1, "Plan name is required.").max(40),
  price: z.coerce.number().min(0, "Price cannot be negative."),
  currency: z.string().min(1).max(6),
  accentColor: z.enum(["yellow", "pink", "green", "orange"]),
  features: z
    .array(
      z.object({
        title: z.string().min(1, "Write the feature text or remove the line."),
        included: z.boolean(),
      })
    )
    .min(1, "Add at least one feature line."),
  actionLabel: z.string().min(1, "Button text is required.").max(30),
  actionUrl: z
    .string()
    .min(1, "Button link is required.")
    .refine(
      (v) => v.startsWith("/") || /^https?:\/\//.test(v),
      "Must start with / or be a full http(s) address."
    ),
  status: z.enum(["draft", "published"]),
  order: z.coerce.number().int().min(0, "Order cannot be negative."),
});

type PlanFormData = z.infer<typeof planSchema>;

export default function PlanForm({ plan }: { plan?: PricingPlan }) {
  const router = useRouter();
  const { token } = useAuthAdmin();
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState<PricingGroup[]>([]);

  const isEdit = Boolean(plan);

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      groupKey: plan?.groupKey ?? "",
      title: plan?.title ?? "",
      price: plan?.price ?? 0,
      currency: plan?.currency ?? "AED",
      accentColor: plan?.accentColor ?? "yellow",
      features: plan?.features?.length
        ? plan.features
        : [{ title: "", included: true }],
      actionLabel: plan?.actionLabel ?? "Lets start",
      actionUrl: plan?.actionUrl ?? "/register",
      status: plan?.status ?? "draft",
      order: plan?.order ?? 0,
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "features",
  });

  // The tab list drives the group dropdown, so a plan can never be filed under
  // a tab that does not exist.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/pricing/groups`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        if (cancelled) return;

        const list: PricingGroup[] = json.data ?? [];
        setGroups(list);
        if (!plan && list.length > 0 && !form.getValues("groupKey")) {
          form.setValue("groupKey", list[0].key);
        }
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, plan, form]);

  const onSubmit = async (data: PlanFormData) => {
    if (!token) {
      toast.error("Your session has expired. Please sign in again.");
      return;
    }

    try {
      setIsLoading(true);
      toast.loading("Saving plan...", { id: "plan-save" });

      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/pricing/plans/${plan?._id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/pricing/plans`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to save plan");

      await revalidateContent(token);

      toast.success(isEdit ? "Plan updated!" : "Plan added!", { id: "plan-save" });
      router.push("/admin/pricing");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
        { id: "plan-save" }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Button variant="link" size="icon" type="button" onClick={() => router.back()}>
              <MoveLeft />
            </Button>
            <h3 className="text-2xl font-semibold flex-1">
              {isEdit ? "Edit plan" : "Add plan"}
            </h3>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-9 w-36 text-xs">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-[120px] flex items-center gap-2"
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex gap-2 items-center">
                  <Loader noPadding />
                  Saving...
                </div>
              ) : (
                <>
                  <Save size={16} /> Save
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="groupKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Tab</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a tab" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.key} value={group.key}>
                            {group.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Which tab on the pricing page this card sits under.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Plan name</FormLabel>
                  <FormControl>
                    <Input placeholder="Starter" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Currency</FormLabel>
                  <FormControl>
                    <Input placeholder="AED" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Price</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accentColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Colour</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(ACCENT_SWATCH) as AccentColor[]).map((colour) => (
                          <SelectItem key={colour} value={colour}>
                            <span className="flex items-center gap-2 capitalize">
                              <span
                                className={`w-3 h-3 rounded-full ${ACCENT_SWATCH[colour]}`}
                              />
                              {colour}
                            </span>
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
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Order</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Features */}
          <div className="space-y-3 rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <div>
                <FormLabel className="text-base">Features</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Turn the switch off to show the line with a red cross instead of a
                  green tick.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ title: "", included: true })}
                className="gap-1 shrink-0"
              >
                <Plus size={14} /> Add line
              </Button>
            </div>

            <div className="space-y-2">
              {fields.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                      className="text-neutral-400 hover:text-neutral-700 disabled:opacity-30 leading-none text-xs"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={index === fields.length - 1}
                      onClick={() => move(index, index + 1)}
                      className="text-neutral-400 hover:text-neutral-700 disabled:opacity-30 leading-none text-xs"
                    >
                      ▼
                    </button>
                  </div>

                  <GripVertical size={14} className="text-neutral-300 shrink-0" />

                  <FormField
                    control={form.control}
                    name={`features.${index}.title`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="2 Weekly Classes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`features.${index}.included`}
                    render={({ field }) => (
                      <FormItem className="shrink-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            aria-label="Included in this plan"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove line"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    className="shrink-0 text-neutral-400 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              ))}
            </div>

            {form.formState.errors.features?.root && (
              <p className="text-sm text-red-600">
                {form.formState.errors.features.root.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="actionLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Button text</FormLabel>
                  <FormControl>
                    <Input placeholder="Lets start" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="actionUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Button link</FormLabel>
                  <FormControl>
                    <Input placeholder="/register" {...field} />
                  </FormControl>
                  <FormDescription>
                    A page on this site (/register) or a full address.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
