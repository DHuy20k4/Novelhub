import { Routes, Route } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import { PrivateRoute } from "@/components/layout/PrivateRoute"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { AdminRoute } from "@/components/layout/AdminRoute"
import { Home } from "@/pages/Home"
import { LoginPage } from "@/pages/auth/LoginPage"
import { RegisterPage } from "@/pages/auth/RegisterPage"
import { CreateStoryPage } from "@/pages/creator/CreateStoryPage"
import { Categories } from "@/pages/Categories"
import { SearchPage } from "@/pages/SearchPage"
import { StudioPage } from "@/pages/creator/StudioPage"
import { ManageChaptersPage } from "@/pages/creator/ManageChaptersPage"
import { ChapterFormPage } from "@/pages/creator/ChapterFormPage"
import { AdminDashboard } from "@/pages/admin/AdminDashboard"
import { AdminCategories } from "@/pages/admin/AdminCategories"
import { AdminUsers } from "@/pages/admin/AdminUsers"
import { AdminStories } from "@/pages/admin/AdminStories"
import { ProfilePage } from "@/pages/profile/ProfilePage"
import { StoryDetailPage } from "@/pages/StoryDetailPage"
import { ChapterReadingPage } from "@/pages/ChapterReadingPage"
import { LibraryPage } from "@/pages/LibraryPage"
import { ReadingHistoryPage } from "@/pages/ReadingHistoryPage"

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="categories" element={<Categories />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="story/:slug" element={<StoryDetailPage />} />
        <Route path="story/:slug/read/:chapterId" element={<ChapterReadingPage />} />
        
        {/* Private routes (Yêu cầu đăng nhập) */}
        <Route element={<PrivateRoute />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="history" element={<ReadingHistoryPage />} />
          <Route path="create-story" element={<CreateStoryPage />} />
          <Route path="studio" element={<StudioPage />} />
          <Route path="studio/story/:storyId/chapters" element={<ManageChaptersPage />} />
          <Route path="studio/story/:storyId/chapter/create" element={<ChapterFormPage />} />
          <Route path="studio/story/:storyId/chapter/:chapterId/edit" element={<ChapterFormPage />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="stories" element={<AdminStories />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Route>
    </Routes>
  )
}
