"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AdminUser {
  _id: string;
  email: string;
  twoFactorEnabled?: boolean;
}

const useAuthAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // const token = typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null;
  // Get token from localStorage initially
  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken");
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser))
    if (storedToken) {
      setToken(JSON.parse(storedToken));
    }
    else if (!storedToken) {
      router.replace("/login");
      setLoading(false);
      return;
    }
  }, [router]);

  // Fetch profile
  const fetchUser = useCallback(async () => {
    if (!token) {
      setAuthenticated(false);
      setUser(null);
      setLoading(false);
      router.replace("/login");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data); // store user details
        setAuthenticated(true);
        return data
      } else {
        localStorage.removeItem("jwtToken");
        setUser(null);
        setAuthenticated(false);
        setToken(null);
        router.replace("/login");
      }
    } catch (err) {
      console.error("Auth fetch failed", err);
      localStorage.removeItem("jwtToken");
      setUser(null);
      setAuthenticated(false);
      setToken(null);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router, token]);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser, token]);


  // useEffect(() => {
  //   const token = localStorage.getItem("jwtToken");

  //   if (!token) {
  //     router.replace("/login");
  //     setLoading(false);
  //     return;
  //   }

  //   fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/admin/profile", {
  //     method: "GET",
  //     headers: {
  //       Authorization: `Bearer ${JSON.parse(token)}`,
  //       "Content-Type": "application/json",
  //     },
  //   })
  //     .then((res) => {
  //       if (res.ok) {
  //         setAuthenticated(true);
  //       } else {
  //         localStorage.removeItem("jwtToken");
  //         router.replace("/login");
  //       }
  //     })
  //     .catch(() => {
  //       localStorage.removeItem("jwtToken");
  //       router.replace("/login");
  //     })
  //     .finally(() => setLoading(false));
  // }, [router]);

  return { loading, authenticated, user, token, fetchUser };
};

export default useAuthAdmin;
