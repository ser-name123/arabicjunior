"use client";

import useAuthAdmin from "@/hooks/useAuthAdmin";

const ProtectedLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { authenticated, loading } = useAuthAdmin();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return null;
  }

  return children;
};

export default ProtectedLayout;
