import { Link } from "react-router-dom"
import { Eye, Star, BookOpen } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Story } from "@/features/novel/api/storyApi"

interface StoryCardProps {
  story: Story
  variant?: "default" | "compact"
}

export function StoryCard({ story, variant = "default" }: StoryCardProps) {
  const isCompact = variant === "compact"

  return (
    <Link to={`/story/${story.slug || story.id}`}>
      <Card className="overflow-hidden h-full hover:shadow-md transition-all duration-300 group border-muted">
        <CardContent className={`p-0 flex ${isCompact ? "flex-row h-28" : "flex-col h-full"}`}>
          {/* Cover Image */}
          <div className={`relative overflow-hidden ${isCompact ? "w-20 min-w-20" : "w-full aspect-[2/3]"}`}>
            <img
              src={story.coverUrl || "https://placehold.co/400x600/e2e8f0/1e293b?text=No+Cover"}
              alt={story.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {!isCompact && story.categories?.[0] && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-primary/90 hover:bg-primary shadow-sm">
                  {story.categories[0].category.name}
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className={`flex flex-col flex-1 ${isCompact ? "p-3 justify-center" : "p-4"}`}>
            <h3 className={`font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors ${isCompact ? "text-sm" : "text-base"}`}>
              {story.title}
            </h3>
            
            {!isCompact && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {story.summary || "Chưa có giới thiệu..."}
              </p>
            )}

            <div className="mt-auto flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate max-w-[120px]">{story.author?.displayName || "Ẩn danh"}</span>
                {isCompact && story.categories?.[0] && (
                  <span className="text-primary truncate max-w-[80px]">
                    {story.categories[0].category.name}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{story.viewCount >= 1000 ? `${(story.viewCount / 1000).toFixed(1)}k` : story.viewCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500/20" />
                  <span>{story.averageRating > 0 ? story.averageRating.toFixed(1) : "-"}</span>
                </div>
                {!isCompact && (
                  <div className="flex items-center gap-1 ml-auto">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{story.chapterCount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
