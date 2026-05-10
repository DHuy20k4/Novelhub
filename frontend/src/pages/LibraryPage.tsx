import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Library, BookOpen } from "lucide-react"

import { bookmarkApi } from "@/features/novel/api/bookmarkApi"
import { StoryCard } from "@/components/shared/StoryCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function LibraryPage() {
  const { data: bookmarksData, isLoading } = useQuery({
    queryKey: ["my-bookmarks"],
    queryFn: () => bookmarkApi.getBookmarks(),
  })

  const bookmarks = bookmarksData?.data || []

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/10 p-3 rounded-full">
          <Library className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tủ sách của tôi</h1>
          <p className="text-muted-foreground mt-1">
            Những bộ truyện bạn đang theo dõi sẽ xuất hiện ở đây.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array(10)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full aspect-[2/3] rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-muted/20 border-dashed">
          <BookOpen className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Tủ sách trống</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Bạn chưa theo dõi bộ truyện nào. Hãy khám phá và thêm các truyện yêu thích vào tủ sách nhé!
          </p>
          <Button asChild size="lg">
            <Link to="/">Khám phá truyện ngay</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {bookmarks.map((bookmark) => (
            <StoryCard key={bookmark.id} story={bookmark.story} />
          ))}
        </div>
      )}
    </div>
  )
}
