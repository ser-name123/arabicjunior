"use client";

import React from "react";
import { useParams } from "next/navigation";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import JobForm from "../../JobForm";

export default function EditJobPage() {
  const params = useParams();
  const id = params.id as string;
  const { token } = useAuthAdmin();

  return <JobForm id={id} token={token} />;
}
