import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Layers } from "lucide-react"

import { categoryApi } from "@/features/category/api/categoryApi"
import { storyApi } from "@/features/novel/api/storyApi"
import { StoryCard } from "@/components/shared/StoryCard"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const GridSkeleton = ({ count = 8 }) => (
  <>
    {Array(count)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-[250px] w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
  </>
)

export function Categories() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Lấy danh sách thể loại
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.getAllCategories(),
  })

  // Lấy danh sách truyện dựa trên thể loại đang chọn
  // Nếu mảng rỗng, ta truyền undefined để lấy tất cả truyện
  const categorySlugs = selectedCategories.length > 0 ? selectedCategories.join(",") : undefined
  
  const { data: storiesData, isLoading: isLoadingStories } = useQuery({
    queryKey: ["stories", "byCategory", categorySlugs],
    queryFn: () => storyApi.getStories({ categories: categorySlugs, limit: 20 }),
  })

  const categoriesList = categoriesData?.data || []
  const storiesList = storiesData?.data || []

  // Xử lý khi click vào 1 thể loại
  const handleToggleCategory = (slug: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(slug)) {
        // Bỏ chọn nếu đã có
        return prev.filter((item) => item !== slug)
      } else {
        // Thêm vào mảng nếu chưa có
        return [...prev, slug]
      }
    })
  }


  return (
    <div className="container max-w-6xl py-10 flex flex-col gap-8">
      
      {/* Header & Danh sách Thể loại */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Thể Loại Truyện</h1>
        </div>
        
        <p className="text-muted-foreground">
          Chọn một hoặc nhiều thể loại dưới đây để tìm kiếm bộ truyện phù hợp với bạn.
        </p>

        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {isLoadingCategories ? (
            Array(10).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-full" />)
          ) : (
            categoriesList.map((cat) => {
              const isSelected = selectedCategories.includes(cat.slug)
              return (
                <Badge
                  key={cat.id}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer text-sm px-4 py-1.5 hover:bg-primary/90 hover:text-primary-foreground transition-colors"
                  onClick={() => handleToggleCategory(cat.slug)}
                >
                  {cat.name}
                </Badge>
              )
            })
          )}
        </div>
      </section>

      {/* Danh sách Truyện */}
      <section className="space-y-6 border-t pt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {selectedCategories.length === 0 
              ? "Tất cả truyện" 
              : `Kết quả lọc (${storiesData?.meta?.total || 0} truyện)`}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {isLoadingStories ? (
            <GridSkeleton count={10} />
          ) : storiesList.length > 0 ? (
            storiesList.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center border rounded-xl border-dashed bg-muted/20">
              <p className="text-muted-foreground mb-2">Không tìm thấy bộ truyện nào phù hợp với các thể loại này.</p>
              <button 
                onClick={() => setSelectedCategories([])}
                className="text-primary hover:underline text-sm font-medium"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
