import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

export function AdminRoute() {
  const { user } = useAuthStore()

  // Nếu chưa đăng nhập hoặc không phải admin, đá về trang chủ
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />
  }

  // Nếu là admin, cho phép truy cập
  return <Outlet />
}
