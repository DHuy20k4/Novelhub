import { Routes, Route } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import { PrivateRoute } from "@/components/layout/PrivateRoute"
import { Home } from "@/pages/Home"
import { LoginPage } from "@/pages/auth/LoginPage"
import { RegisterPage } from "@/pages/auth/RegisterPage"
import { CreateStoryPage } from "@/pages/creator/CreateStoryPage"

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        
        {/* Private routes (Yêu cầu đăng nhập) */}
        <Route element={<PrivateRoute />}>
          <Route path="create-story" element={<CreateStoryPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
