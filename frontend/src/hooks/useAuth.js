import { useCallback, useEffect, useState } from "react";

import { getCurrentUser, logoutUser } from "../services/authService.js";

export default function useAuth(requiredRole) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshUser = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { user: currentUser } = await getCurrentUser();

      if (requiredRole && currentUser.role !== requiredRole) {
        throw new Error("You are not authorized to access this page.");
      }

      setUser(currentUser);
      return currentUser;
    } catch (err) {
      setUser(null);
      const message =
        err.response?.data?.message || err.message || "Failed to load user session.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [requiredRole]);

  const signOut = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshUser().catch(() => {});
    }, 0);

    return () => clearTimeout(timer);
  }, [refreshUser]);

  return {
    user,
    loading,
    error,
    refreshUser,
    signOut,
  };
}
