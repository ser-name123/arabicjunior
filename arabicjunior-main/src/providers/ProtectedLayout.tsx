"use client";

import useAuthAdmin from "@/hooks/useAuthAdmin";
import IdleLogout from "@/components/admin/IdleLogout";

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

  return (
    <>
      {/* Mounted here rather than in a page so the timer covers every admin
          screen, and only starts once there is a session to protect. */}
      <IdleLogout />
      {children}
    </>
  );
};

export default ProtectedLayout;
