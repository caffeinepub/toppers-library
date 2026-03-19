import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function AdminLoginPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/admin" });
  }, [navigate]);
  return null;
}
