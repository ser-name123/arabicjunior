"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MoveLeft } from "lucide-react";
import { toast } from "sonner";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button-2";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import type { Teacher } from "@/types/Teacher";
import TeacherForm from "../../TeacherForm";

export default function EditTeacherPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuthAdmin();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token || !id) return;

    let cancelled = false;

    async function fetchTeacher() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/teachers/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to load teacher");

        const json = await res.json();
        if (!cancelled) setTeacher(json.data ?? null);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setNotFound(true);
          toast.error("Could not load that teacher.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTeacher();
    return () => {
      cancelled = true;
    };
  }, [token, id]);

  if (loading) return <Loader />;

  if (notFound || !teacher) {
    return (
      <div className="max-w-3xl mx-auto py-6 space-y-4">
        <Button variant="link" size="icon" type="button" onClick={() => router.back()}>
          <MoveLeft />
        </Button>
        <p className="text-muted-foreground">
          That teacher could not be found. They may have been deleted.
        </p>
      </div>
    );
  }

  // The form seeds react-hook-form from defaultValues, which are only read on
  // mount — so it must not be rendered until the record has arrived.
  return <TeacherForm teacher={teacher} />;
}
