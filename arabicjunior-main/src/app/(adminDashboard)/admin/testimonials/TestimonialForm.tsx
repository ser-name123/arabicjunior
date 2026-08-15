"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MoveLeft, Save, Star } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input-2";
import { Textarea } from "@/components/ui/textarea";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Loader from "@/components/loader";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import { revalidateContent } from "@/lib/revalidateContent";
import MediaPicker from "@/components/admin/MediaPicker";
import type { Testimonial } from "@/types/Testimonial";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const isFile = (value: unknown): value is File =>
  typeof File !== "undefined" && value instanceof File;

const testimonialSchema = z
  .object({
    type: z.enum(["text", "video"]),
    authorName: z
      .string()
      .min(2, "Name must be at least 2 characters.")
      .max(60, "Name should not exceed 60 characters."),
    profession: z
      .string()
      .min(2, "Please say who this is — for example Mother, Father or Student.")
      .max(40, "Should not exceed 40 characters."),
    comment: z.string().max(600, "Comment should not exceed 600 characters.").optional(),
    rating: z.coerce.number().int().min(1).max(5),
    order: z.coerce.number().int().min(0, "Order cannot be negative."),
    status: z.enum(["draft", "published"]),

    videoSource: z.enum(["link", "upload"]).optional(),
    videoUrl: z.string().optional(),

    photo: z.any().optional(),
    video: z.any().optional(),
    thumbnail: z.any().optional(),

    // Filled in edit mode so the checks below know a video already exists.
    hasExistingVideo: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "text" && !data.comment?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["comment"],
        message: "A text testimonial needs a comment.",
      });
    }

    if (data.type === "video") {
      if (data.videoSource === "link") {
        if (!data.videoUrl?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["videoUrl"],
            message: "Paste the YouTube or Vimeo link.",
          });
        }
      } else if (!isFile(data.video) && !data.hasExistingVideo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["video"],
          message: "Choose a video file to upload.",
        });
      }
    }

    for (const [key, limit, label] of [
      ["photo", MAX_IMAGE_BYTES, "Photo"],
      ["thumbnail", MAX_IMAGE_BYTES, "Thumbnail"],
      ["video", MAX_VIDEO_BYTES, "Video"],
    ] as const) {
      const value = data[key];
      if (isFile(value) && value.size > limit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${label} is too large (maximum ${Math.round(limit / 1024 / 1024)} MB).`,
        });
      }
    }
  });

type TestimonialFormData = z.infer<typeof testimonialSchema>;

export default function TestimonialForm({
  testimonial,
}: {
  testimonial?: Testimonial;
}) {
  const router = useRouter();
  const { token } = useAuthAdmin();
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = Boolean(testimonial);

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      type: testimonial?.type ?? "text",
      authorName: testimonial?.authorName ?? "",
      profession: testimonial?.profession ?? "Mother",
      comment: testimonial?.comment ?? "",
      rating: testimonial?.rating ?? 5,
      order: testimonial?.order ?? 0,
      status: testimonial?.status ?? "draft",
      videoSource: testimonial?.videoSource ?? "link",
      videoUrl: testimonial?.videoSource === "link" ? testimonial?.videoUrl ?? "" : "",
      hasExistingVideo: Boolean(testimonial?.videoUrl),
    },
  });

  const type = form.watch("type");
  const videoSource = form.watch("videoSource");

  const onSubmit = async (data: TestimonialFormData) => {
    if (!token) {
      toast.error("Your session has expired. Please sign in again.");
      return;
    }

    try {
      setIsLoading(true);
      toast.loading("Saving testimonial...", { id: "testimonial-save" });

      const formData = new FormData();
      formData.append("type", data.type);
      formData.append("authorName", data.authorName);
      formData.append("profession", data.profession);
      formData.append("rating", String(data.rating));
      formData.append("order", String(data.order));
      formData.append("status", data.status);
      if (data.comment?.trim()) formData.append("comment", data.comment.trim());

      if (data.type === "video") {
        formData.append("videoSource", data.videoSource ?? "link");
        if (data.videoSource === "link" && data.videoUrl?.trim()) {
          formData.append("videoUrl", data.videoUrl.trim());
        }
        if (data.videoSource === "upload" && isFile(data.video)) {
          formData.append("video", data.video);
        }
        if (isFile(data.thumbnail)) formData.append("thumbnail", data.thumbnail);
      }

      if (isFile(data.photo)) formData.append("photo", data.photo);

      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/testimonials/${testimonial?._id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/testimonials`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json().catch(() => ({}));
      // The API explains exactly what was wrong (bad link, file too large,
      // missing comment). Showing a generic message instead would leave the
      // admin guessing.
      if (!res.ok) throw new Error(json?.message || "Failed to save testimonial");

      await revalidateContent(token);

      toast.success(
        isEdit ? "Testimonial updated!" : "Testimonial added!",
        { id: "testimonial-save" }
      );
      router.push("/admin/testimonials");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
        { id: "testimonial-save" }
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
              {isEdit ? "Edit testimonial" : "Add testimonial"}
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

          {/* Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Testimonial type</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex gap-8"
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <RadioGroupItem value="text" /> Text
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <RadioGroupItem value="video" /> Video
                    </label>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="authorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Fatima Al Mansoori" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Relation</FormLabel>
                  <FormControl>
                    <Input placeholder="Mother / Father / Student" {...field} />
                  </FormControl>
                  <FormDescription>Shown under the name on the card.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Rating</FormLabel>
                  <FormControl>
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 4, 3, 2, 1].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            <span className="flex items-center gap-1">
                              {n}
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
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
                  <FormLabel className="text-base">Display order</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormDescription>
                    Lower numbers appear first on the homepage.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Comment */}
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">
                  Comment {type === "video" && <span className="text-neutral-400">(optional)</span>}
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder="What did the parent or student say?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Photo */}
          <FormField
            control={form.control}
            name="photo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">
                  Photo <span className="text-neutral-400">(optional)</span>
                </FormLabel>
                <MediaPicker
                  accept="image/*"
                  kind="image"
                  initialUrl={testimonial?.image}
                  onSelect={field.onChange}
                />
                <FormDescription>
                  Square works best. Maximum 5 MB. Without one, the card shows the
                  first letter of the name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Video */}
          {type === "video" && (
            <div className="space-y-6 rounded-xl border border-neutral-200 p-5">
              <FormField
                control={form.control}
                name="videoSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Where is the video?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex flex-col sm:flex-row gap-4 sm:gap-8"
                      >
                        <label className="flex items-center gap-2 cursor-pointer">
                          <RadioGroupItem value="link" /> Paste a YouTube / Vimeo link
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <RadioGroupItem value="upload" /> Upload a video file
                        </label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {videoSource === "link" ? (
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Video link</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://www.youtube.com/watch?v=..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        YouTube and Vimeo links are supported, including youtu.be and
                        Shorts.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="video"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Video file</FormLabel>
                      <MediaPicker
                        accept="video/*"
                        kind="video"
                        initialUrl={
                          testimonial?.videoSource === "upload"
                            ? testimonial?.videoUrl
                            : undefined
                        }
                        onSelect={field.onChange}
                      />
                      <FormDescription>
                        MP4, WebM or MOV. Maximum 50 MB — trim longer clips or use a
                        YouTube link instead.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      Cover image <span className="text-neutral-400">(optional)</span>
                    </FormLabel>
                    <MediaPicker
                      accept="image/*"
                      kind="image"
                      initialUrl={testimonial?.videoThumbnail}
                      onSelect={field.onChange}
                    />
                    <FormDescription>
                      The still shown before the video plays. YouTube and uploaded
                      videos get one automatically — Vimeo does not.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
