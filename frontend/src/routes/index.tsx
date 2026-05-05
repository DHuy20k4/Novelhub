import { Routes, Route } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import { PrivateRoute } from "@/components/layout/PrivateRoute"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { Home } from "@/pages/Home"
import { LoginPage } from "@/pages/auth/LoginPage"
import { RegisterPage } from "@/pages/auth/RegisterPage"
import { CreateStoryPage } from "@/pages/creator/CreateStoryPage"
import { Categories } from "@/pages/Categories"
import { StudioPage } from "@/pages/creator/StudioPage"
import { ManageChaptersPage } from "@/pages/creator/ManageChaptersPage"
import { ChapterFormPage } from "@/pages/creator/ChapterFormPage"
import { AdminDashboard } from "@/pages/admin/AdminDashboard"
import { AdminCategories } from "@/pages/admin/AdminCategories"

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="categories" element={<Categories />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        
        {/* Private routes (Yêu cầu đăng nhập) */}
        <Route element={<PrivateRoute />}>
          <Route path="create-story" element={<CreateStoryPage />} />
          <Route path="studio" element={<StudioPage />} />
          <Route path="studio/story/:storyId/chapters" element={<ManageChaptersPage />} />
          <Route path="studio/story/:storyId/chapter/create" element={<ChapterFormPage />} />
          <Route path="studio/story/:storyId/chapter/:chapterId/edit" element={<ChapterFormPage />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="categories" element={<AdminCategories />} />
        {/* <Route path="users" element={<AdminUsers />} /> */}
      </Route>
    </Routes>
  )
}
