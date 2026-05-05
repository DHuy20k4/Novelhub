import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { PlusCircle, Settings, Book } from "lucide-react"

import { storyApi } from "@/features/novel/api/storyApi"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function StudioPage() {
  const { user } = useAuthStore()

  const { data: storiesData, isLoading } = useQuery({
    queryKey: ["my-stories", user?.id],
    queryFn: () => storyApi.getStories({ uploaderId: user?.id, sortBy: "updated" }),
    enabled: !!user?.id,
  })

  const myStories = storiesData?.data || []

  return (
    <div className="container max-w-5xl py-10 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Khu vực Tác giả</h1>
          <p className="text-muted-foreground mt-1">Quản lý các bộ truyện bạn đã đăng tải.</p>
        </div>
        <Button asChild>
          <Link to="/create-story">
            <PlusCircle className="mr-2 h-4 w-4" />
            Đăng Truyện Mới
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : myStories.length > 0 ? (
        <div className="grid gap-4">
          {myStories.map((story) => (
            <Card key={story.id} className="overflow-hidden">
              <CardContent className="p-0 flex flex-col sm:flex-row">
                <div className="w-full sm:w-32 h-40 sm:h-auto bg-muted">
                  <img
                    src={story.coverUrl || "https://placehold.co/200x300/e2e8f0/1e293b?text=No+Cover"}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-xl font-bold line-clamp-2">{story.title}</h3>
                      <Badge variant={story.moderationStatus === "published" ? "default" : "secondary"}>
                        {story.moderationStatus === "published" ? "Đã xuất bản" : "Bản nháp"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {story.summary || "Chưa có giới thiệu..."}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="default" size="sm" asChild>
                      <Link to={`/studio/story/${story.id}/chapters`}>
                        <Book className="mr-2 h-4 w-4" />
                        Quản lý chương ({story.chapterCount || 0})
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/story/${story.slug}`}>
                        <Settings className="mr-2 h-4 w-4" />
                        Chi tiết truyện
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border rounded-xl border-dashed bg-muted/10">
          <h3 className="text-lg font-semibold mb-2">Bạn chưa đăng truyện nào</h3>
          <p className="text-muted-foreground mb-6">Hãy bắt đầu hành trình sáng tác của bạn ngay hôm nay!</p>
          <Button asChild>
            <Link to="/create-story">Bắt đầu viết truyện</Link>
          </Button>
        </div>
      )}

    </div>
  )
}
