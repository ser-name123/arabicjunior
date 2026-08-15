"use client";

import React from "react";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import { redirect } from "next/navigation";
import { AdminLoginFormV2 } from "./components/AdminLoginFormV2";


const AdminLoginPage = () => {
  const { authenticated } = useAuthAdmin();


  if (authenticated) {
    return redirect('/admin')
  }

  return (
    <React.Fragment>
      <AdminLoginFormV2 />
    </React.Fragment>
  );
};

export default AdminLoginPage;
