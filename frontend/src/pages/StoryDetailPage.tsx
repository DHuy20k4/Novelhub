import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Eye, Star, BookOpen, Clock, Heart, Loader2, List, User } from "lucide-react"
import { toast } from "sonner"

import { storyApi } from "@/features/novel/api/storyApi"
import { chapterApi } from "@/features/novel/api/chapterApi"
import { bookmarkApi } from "@/features/novel/api/bookmarkApi"
import { useAuthStore } from "@/store/authStore"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function StoryDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isAuthenticated = !!user;
  const queryClient = useQueryClient()

  // 1. Lấy thông tin truyện
  const { data: storyData, isLoading: isLoadingStory, error } = useQuery({
    queryKey: ["story", slug],
    queryFn: () => storyApi.getStoryBySlug(slug as string),
    enabled: !!slug,
  })

  const story = storyData?.data

  // 2. Lấy danh sách chương của truyện (chỉ gọi khi đã có story.id)
  const { data: chaptersData, isLoading: isLoadingChapters } = useQuery({
    queryKey: ["chapters", story?.id],
    queryFn: () => chapterApi.getChaptersByStoryId(story?.id as string),
    enabled: !!story?.id,
  })

  const chapters = chaptersData?.data || []
  // Sắp xếp chương theo thứ tự
  const sortedChapters = [...chapters].sort((a, b) => a.chapterIndex - b.chapterIndex)

  const firstChapter = sortedChapters[0]
  const latestChapter = sortedChapters[sortedChapters.length - 1]

  // 3. Kiểm tra xem user đã theo dõi (bookmark) chưa
  const { data: bookmarksData } = useQuery({
    queryKey: ["my-bookmarks"],
    queryFn: () => bookmarkApi.getBookmarks(),
    enabled: isAuthenticated,
  })

  const isBookmarked = bookmarksData?.data?.some(b => b.storyId === story?.id)

  // 4. Action Theo dõi / Bỏ theo dõi
  const toggleBookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!story?.id) return
      if (isBookmarked) {
        return bookmarkApi.removeBookmark(story.id)
      } else {
        return bookmarkApi.addBookmark({ storyId: story.id })
      }
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Đã cập nhật theo dõi")
      queryClient.invalidateQueries({ queryKey: ["my-bookmarks"] })
    },
    onError: (err) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra")
    }
  })

  const handleToggleBookmark = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để theo dõi truyện")
      navigate("/login")
      return
    }
    toggleBookmarkMutation.mutate()
  }

  // --- Render logic ---

  if (isLoadingStory) {
    return (
      <div className="container max-w-6xl py-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-full md:w-[300px] aspect-[2/3] rounded-xl" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>
            <Skeleton className="h-32 w-full mt-6" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">Không tìm thấy truyện</h2>
        <p className="text-muted-foreground mb-6">Truyện này không tồn tại hoặc đã bị xóa.</p>
        <Button asChild>
          <Link to="/">Về trang chủ</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8">
      {/* 1. Hero Section: Thông tin chính */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Cột trái: Ảnh Bìa */}
        <div className="w-full md:w-[300px] shrink-0">
          <div className="rounded-xl overflow-hidden shadow-xl aspect-[2/3] relative">
            <img 
              src={story.coverUrl || "https://placehold.co/400x600/e2e8f0/1e293b?text=No+Cover"} 
              alt={story.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Cột phải: Chi tiết */}
        <div className="flex-1 flex flex-col">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-foreground">
            {story.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
              <User className="w-4 h-4" />
              <span className="font-medium">{story.uploader?.displayName || "Ẩn danh"}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Cập nhật {new Date(story.updatedAt).toLocaleDateString("vi-VN")}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {story.categories?.map((cat) => (
              <Badge key={cat.id} variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                {cat.name}
              </Badge>
            ))}
          </div>

          {/* Box Thống kê */}
          <div className="flex gap-6 md:gap-10 p-4 bg-muted/30 rounded-lg border mb-6 max-w-fit">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-1">
                <BookOpen className="w-4 h-4" /> Chương
              </div>
              <div className="text-xl font-semibold">{story.chapterCount || 0}</div>
            </div>
            <div className="w-px bg-border"></div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-1">
                <Eye className="w-4 h-4" /> Lượt xem
              </div>
              <div className="text-xl font-semibold">{story.viewCount >= 1000 ? `${(story.viewCount / 1000).toFixed(1)}k` : story.viewCount}</div>
            </div>
            <div className="w-px bg-border"></div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" /> Đánh giá
              </div>
              <div className="text-xl font-semibold">{story.averageRating > 0 ? story.averageRating.toFixed(1) : "-"} <span className="text-sm text-muted-foreground font-normal">/5</span></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Button size="lg" className="font-semibold" disabled={!firstChapter} asChild={!!firstChapter}>
              {firstChapter ? (
                <Link to={`/story/${story.slug}/read/${firstChapter.id}`}>
                  <BookOpen className="mr-2 h-5 w-5" />
                  Đọc Truyện
                </Link>
              ) : (
                <>
                  <BookOpen className="mr-2 h-5 w-5" />
                  Chưa có chương
                </>
              )}
            </Button>
            
            <Button size="lg" variant="secondary" disabled={!latestChapter} asChild={!!latestChapter}>
              {latestChapter ? (
                <Link to={`/story/${story.slug}/read/${latestChapter.id}`}>
                  Đọc mới nhất
                </Link>
              ) : (
                <>Đọc mới nhất</>
              )}
            </Button>
            
            <Button 
              size="lg" 
              variant={isBookmarked ? "outline" : "default"} 
              className={!isBookmarked ? "bg-rose-500 hover:bg-rose-600 text-white" : "text-rose-500 border-rose-200 bg-rose-50 hover:bg-rose-100"}
              onClick={handleToggleBookmark}
              disabled={toggleBookmarkMutation.isPending}
            >
              {toggleBookmarkMutation.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Heart className={`mr-2 h-5 w-5 ${isBookmarked ? "fill-rose-500" : ""}`} />
              )}
              {isBookmarked ? "Đã theo dõi" : "Theo dõi"}
            </Button>
          </div>

          {/* Tóm tắt nội dung */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <List className="w-5 h-5 text-primary" />
              Giới thiệu
            </h3>
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
              {story.summary || "Truyện chưa có tóm tắt..."}
            </div>
          </div>
        </div>
      </div>

      <hr className="my-8" />

      {/* 2. Danh sách chương */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Danh sách Chương</h2>
          <span className="text-muted-foreground">{chapters.length} chương</span>
        </div>

        {isLoadingChapters ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        ) : chapters.length === 0 ? (
          <div className="text-center py-10 bg-muted/20 rounded-lg border border-dashed">
            <p className="text-muted-foreground">Truyện đang được cập nhật chương mới.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedChapters.map((chapter) => (
              <Link 
                key={chapter.id} 
                to={`/story/${story.slug}/read/${chapter.id}`}
                className="group"
              >
                <Card className="h-full border-muted hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="overflow-hidden">
                      <div className="text-sm font-medium text-muted-foreground mb-1 group-hover:text-primary transition-colors">
                        Chương {chapter.chapterIndex}
                      </div>
                      <div className="font-medium truncate group-hover:text-primary transition-colors">
                        {chapter.title}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0 ml-2">
                      <Clock className="w-3 h-3" />
                      {new Date(chapter.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
