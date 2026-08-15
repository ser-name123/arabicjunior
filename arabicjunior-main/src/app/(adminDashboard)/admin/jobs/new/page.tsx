"use client";

import useAuthAdmin from "@/hooks/useAuthAdmin";
import JobForm from "../JobForm";

export default function NewJobPage() {
  const { token } = useAuthAdmin();
  return <JobForm token={token} />;
}
