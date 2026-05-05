import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

export function PrivateRoute() {
  const { user } = useAuthStore()

  // Nếu chưa đăng nhập, đá về trang đăng nhập
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Nếu đã đăng nhập, render các component con (Outlet)
  return <Outlet />
}
