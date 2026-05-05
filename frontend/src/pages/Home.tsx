import { Button } from "@/components/ui/button"

export function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 text-center mt-12">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
        Khám phá thế giới <span className="text-primary">Truyện Chữ</span>
      </h1>
      <p className="text-xl text-muted-foreground max-w-[600px]">
        Nơi hội tụ hàng ngàn bộ truyện hấp dẫn được cập nhật mỗi ngày. 
        Đắm chìm vào những chuyến phiêu lưu không giới hạn.
      </p>
      <div className="flex gap-4">
        <Button size="lg">Đọc truyện ngay</Button>
        <Button variant="outline" size="lg">Khám phá thể loại</Button>
      </div>
    </div>
  )
}
