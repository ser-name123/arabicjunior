"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MoveLeft } from "lucide-react";
import { toast } from "sonner";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button-2";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import type { Testimonial } from "@/types/Testimonial";
import TestimonialForm from "../../TestimonialForm";

export default function EditTestimonialPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuthAdmin();

  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token || !id) return;

    let cancelled = false;

    async function fetchTestimonial() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/testimonials/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to load testimonial");

        const json = await res.json();
        if (!cancelled) setTestimonial(json.data ?? null);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setNotFound(true);
          toast.error("Could not load that testimonial.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTestimonial();
    return () => {
      cancelled = true;
    };
  }, [token, id]);

  if (loading) return <Loader />;

  if (notFound || !testimonial) {
    return (
      <div className="max-w-3xl mx-auto py-6 space-y-4">
        <Button variant="link" size="icon" type="button" onClick={() => router.back()}>
          <MoveLeft />
        </Button>
        <p className="text-muted-foreground">
          That testimonial could not be found. It may have been deleted.
        </p>
      </div>
    );
  }

  // The form seeds react-hook-form from defaultValues, which are only read on
  // mount — so it must not be rendered until the record has arrived.
  return <TestimonialForm testimonial={testimonial} />;
}
