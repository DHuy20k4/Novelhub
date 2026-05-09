import React from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"

import { chapterApi } from "@/features/novel/api/chapterApi"
import { storyApi } from "@/features/novel/api/storyApi"
import { Skeleton } from "@/components/ui/skeleton"

export function ChapterReadingPage() {
  const { slug, chapterId } = useParams<{ slug: string; chapterId: string }>()
  const navigate = useNavigate()

  const { data: chapterData, isLoading: isLoadingChapter, error } = useQuery({
    queryKey: ["chapter", chapterId],
    queryFn: () => chapterApi.getChapterById(chapterId as string),
    enabled: !!chapterId,
  })

  const chapter = chapterData?.data

  const { data: storyData, isLoading: isLoadingStory } = useQuery({
    queryKey: ["story", slug],
    queryFn: () => storyApi.getStoryBySlug(slug as string),
    enabled: !!slug,
  })

  const story = storyData?.data

  const { data: chaptersData } = useQuery({
    queryKey: ["chapters", story?.id],
    queryFn: () => chapterApi.getChaptersByStoryId(story?.id as string),
    enabled: !!story?.id,
  })

  const sortedChapters = [...(chaptersData?.data || [])].sort(
    (a, b) => a.chapterIndex - b.chapterIndex
  )
  const currentIndex = sortedChapters.findIndex((c) => c.id === chapterId)
  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null
  const nextChapter = currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null

  // --- Loading ---
  if (isLoadingChapter || isLoadingStory) {
    return (
      <div style={styles.page}>
        <div style={styles.wrapper}>
          <Skeleton className="h-5 w-40 mx-auto mb-6" />
          <Skeleton className="h-9 w-2/3 mx-auto mb-3" />
          <Skeleton className="h-4 w-1/3 mx-auto mb-12" />
          {Array(14).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full mb-3" />
          ))}
        </div>
      </div>
    )
  }

  // --- Error ---
  if (error || !chapter) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.wrapper, textAlign: "center", paddingTop: "80px" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "18px", marginBottom: "24px" }}>
            Không tìm thấy chương này.
          </p>
          <Link to={slug ? `/story/${slug}` : "/"} style={styles.textLink}>
            ← Quay lại trang truyện
          </Link>
        </div>
      </div>
    )
  }

  const paragraphs = chapter.content
    .split("\n")
    .filter((line) => line.trim() !== "")

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>

        {/* Tên truyện — link về trang truyện */}
        <div style={styles.storyName}>
          <Link to={`/story/${slug}`} style={styles.storyNameLink}>
            {story?.title || slug}
          </Link>
        </div>

        {/* Tiêu đề chương */}
        <div style={styles.chapterHeader}>
          <p style={styles.chapterLabel}>Chương {chapter.chapterIndex}</p>
          <h1 style={styles.chapterTitle}>{chapter.title}</h1>
          <p style={styles.chapterDate}>
            {new Date(chapter.createdAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Đường kẻ */}
        <div style={styles.divider} />

        {/* Nội dung chương */}
        <div style={styles.content}>
          {paragraphs.map((para, idx) => (
            <p key={idx} style={styles.paragraph}>
              {para}
            </p>
          ))}
        </div>

        {/* Đường kẻ */}
        <div style={styles.divider} />

        {/* Điều hướng chương đơn giản */}
        <div style={styles.nav}>
          <span style={styles.navItem}>
            {prevChapter ? (
              <button
                onClick={() => navigate(`/story/${slug}/read/${prevChapter.id}`)}
                style={styles.navButton}
              >
                ← Chương trước
              </button>
            ) : (
              <span style={styles.navDisabled}>← Chương trước</span>
            )}
          </span>

          <Link to={`/story/${slug}`} style={styles.textLink}>
            [ Mục lục ]
          </Link>

          <span style={styles.navItem}>
            {nextChapter ? (
              <button
                onClick={() => navigate(`/story/${slug}/read/${nextChapter.id}`)}
                style={styles.navButton}
              >
                Chương sau →
              </button>
            ) : (
              <span style={styles.navDisabled}>Chương sau →</span>
            )}
          </span>
        </div>

      </div>
    </div>
  )
}

// ── Inline styles ──────────────────────────────────────────
const FONT = "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif"
const TEXT_COLOR = "var(--foreground)"
const MUTED = "var(--muted-foreground)"

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "var(--background)",
    minHeight: "100vh",
    padding: "40px 16px 80px",
  },
  wrapper: {
    maxWidth: "1350px",
    margin: "0 auto",
  },
  storyName: {
    textAlign: "center",
    marginBottom: "28px",
  },
  storyNameLink: {
    fontFamily: FONT,
    fontSize: "14px",
    color: MUTED,
    textDecoration: "none",
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
  },
  chapterHeader: {
    textAlign: "center",
    marginBottom: "24px",
  },
  chapterLabel: {
    fontFamily: FONT,
    fontSize: "13px",
    color: MUTED,
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    marginBottom: "10px",
  },
  chapterTitle: {
    fontFamily: FONT,
    fontSize: "clamp(22px, 4vw, 30px)",
    fontWeight: "bold",
    color: TEXT_COLOR,
    lineHeight: "1.35",
    margin: "0 0 10px",
  },
  chapterDate: {
    fontFamily: FONT,
    fontSize: "12px",
    color: MUTED,
    fontStyle: "italic",
  },
  divider: {
    width: "60px",
    height: "1px",
    background: "var(--border)",
    margin: "28px auto",
  },
  content: {
    fontFamily: FONT,
    fontSize: "18px",
    lineHeight: "2",
    color: TEXT_COLOR,
  },
  paragraph: {
    margin: "0 0 1.5em",
    textAlign: "justify",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginTop: "8px",
    padding: "8px 0",
  },
  navItem: {
    flex: 1,
  },
  navButton: {
    fontFamily: FONT,
    fontSize: "14px",
    color: TEXT_COLOR,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  },
  navDisabled: {
    fontFamily: FONT,
    fontSize: "14px",
    color: MUTED,
    opacity: 0.4,
  },
  textLink: {
    fontFamily: FONT,
    fontSize: "14px",
    color: TEXT_COLOR,
    textDecoration: "underline",
    textUnderlineOffset: "3px",
    textAlign: "center" as const,
    display: "block",
    flex: 1,
  },
}
