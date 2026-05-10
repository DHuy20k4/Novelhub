import { useQuery } from "@tanstack/react-query"
import { Flame, Clock, Trophy } from "lucide-react"

import { storyApi } from "@/features/novel/api/storyApi"
import { StoryCard } from "@/components/shared/StoryCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const GridSkeleton = ({ count = 6 }) => (
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

const CompactSkeleton = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array(count)
      .fill(0)
      .map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-xl" />
      ))}
  </div>
)

export function Home() {
  // Fetch Top View stories for Hero Carousel
  const { data: topViewData, isLoading: isLoadingTop } = useQuery({
    queryKey: ["stories", "topView"],
    queryFn: () => storyApi.getStories({ sortBy: "topView", limit: 5 }),
  })

  // Fetch Recently Updated stories
  const { data: updatedData, isLoading: isLoadingUpdated } = useQuery({
    queryKey: ["stories", "updated"],
    queryFn: () => storyApi.getStories({ sortBy: "updated", limit: 12 }),
  })

  // Fetch Top Rated stories for Sidebar
  const { data: topRateData, isLoading: isLoadingTopRate } = useQuery({
    queryKey: ["stories", "topRate"],
    queryFn: () => storyApi.getStories({ sortBy: "topRate", limit: 10 }),
  })

  const topStories = topViewData?.data || []
  const updatedStories = updatedData?.data || []
  const topRateStories = topRateData?.data || []

  return (
    <div className="flex flex-col gap-10 pb-10">
      
      {/* Hero Section: Top View Carousel */}
      <section className="w-full relative">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold tracking-tight">Truyện Hot Trong Tuần</h2>
        </div>
        
        {isLoadingTop ? (
          <Skeleton className="h-[350px] w-full rounded-xl" />
        ) : topStories.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {topStories.map((story) => (
                <CarouselItem key={story.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div className="p-1 h-full">
                    <StoryCard story={story} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-background/80 backdrop-blur-sm hidden sm:flex" />
            <CarouselNext className="right-2 bg-background/80 backdrop-blur-sm hidden sm:flex" />
          </Carousel>
        ) : (
          <div className="h-[200px] flex items-center justify-center border rounded-xl bg-muted/20">
            <p className="text-muted-foreground">Chưa có truyện nổi bật</p>
          </div>
        )}
      </section>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recently Updated (70%) */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Mới Cập Nhật</h2>
            </div>
            <Button variant="link" className="text-muted-foreground">Xem tất cả &rarr;</Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {isLoadingUpdated ? (
              <GridSkeleton count={8} />
            ) : updatedStories.length > 0 ? (
              updatedStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground border rounded-xl border-dashed">
                Hiện tại chưa có truyện nào được đăng tải.
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Top Rated (30%) */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b pb-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold tracking-tight">Đánh Giá Cao</h2>
          </div>

          <div className="flex flex-col gap-4">
            {isLoadingTopRate ? (
              <CompactSkeleton />
            ) : topRateStories.length > 0 ? (
              topRateStories.map((story, index) => (
                <div key={story.id} className="relative">
                  <div className="absolute -left-2 -top-2 z-10 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-md">
                    {index + 1}
                  </div>
                  <StoryCard story={story} variant="compact" />
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground border rounded-xl border-dashed">
                Chưa có đánh giá nào.
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
