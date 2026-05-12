import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"

import { storyApi } from "@/features/novel/api/storyApi"
import { StoryCard } from "@/components/shared/StoryCard"
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

export function SearchPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const q = searchParams.get("q") || ""
  const [inputValue, setInputValue] = useState(q)

  useEffect(() => {
    setInputValue(q)
  }, [q])

  const { data: storiesData, isLoading } = useQuery({
    queryKey: ["search-stories", q],
    queryFn: () => storyApi.getStories({ search: q, limit: 20 }),
    enabled: !!q,
  })

  const storiesList = storiesData?.data || []

  return (
    <div className="container max-w-6xl py-10 flex flex-col gap-8">
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Tìm kiếm truyện</h1>
        </div>
        <p className="text-muted-foreground">
          Nhập từ khóa để tìm kiếm truyện hoặc tác giả bạn yêu thích.
        </p>
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            if (inputValue.trim()) {
              navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`)
            }
          }}
          className="flex w-full max-w-lg items-center space-x-2 pt-2"
        >
          <div className="relative w-full border rounded-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Nhập tên truyện, tác giả..."
              className="w-full pl-10 pr-4 py-2 bg-transparent outline-none"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:bg-primary/90 transition-colors">
            Tìm
          </button>
        </form>
      </section>

      <section className="space-y-6 border-t pt-8">
        {!q ? (
          <div className="py-20 text-center flex flex-col items-center justify-center border rounded-xl border-dashed bg-muted/20">
            <p className="text-muted-foreground">Vui lòng nhập từ khóa để tìm kiếm.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                Tìm thấy {storiesData?.meta?.total || 0} truyện
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {isLoading ? (
                <GridSkeleton count={10} />
              ) : storiesList.length > 0 ? (
                storiesList.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center flex flex-col items-center justify-center border rounded-xl border-dashed bg-muted/20">
                  <p className="text-muted-foreground mb-2">Không tìm thấy truyện nào phù hợp với từ khóa "{q}".</p>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
