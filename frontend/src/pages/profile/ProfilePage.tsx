import { useState, useRef, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { 
  Camera, 
  Loader2, 
  User, 
  Mail, 
  Shield, 
  CalendarDays,
  BookOpen,
  Users,
  UserPlus
} from "lucide-react"

import { userApi } from "@/features/user/api/userApi"
import { uploadApi } from "@/features/upload/api/uploadApi"
import { useAuthStore } from "@/store/authStore"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const profileSchema = z.object({
  displayName: z.string().min(2, "Tên hiển thị phải có ít nhất 2 ký tự").max(100, "Tên hiển thị quá dài"),
})

export function ProfilePage() {
  const { user: authUser, updateUser } = useAuthStore()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Fetch full profile info
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => userApi.getMyProfile(),
  })

  const profile = profileData?.data

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
    },
  })

  // Sync initial values
  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName,
      })
    }
  }, [profile, form])

  const updateMutation = useMutation({
    mutationFn: (data: { displayName?: string; avatarUrl?: string }) => 
      userApi.updateMyProfile(data),
    onSuccess: (res) => {
      toast.success("Cập nhật thông tin thành công!")
      queryClient.invalidateQueries({ queryKey: ["my-profile"] })
      // Update global auth store so Header avatar updates immediately
      if (res.data) {
        updateUser({
          displayName: res.data.displayName,
          avatarUrl: res.data.avatarUrl,
        })
      }
    },
    onError: (err) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Cập nhật thất bại")
    }
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh hợp lệ")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB")
      return
    }

    setIsUploading(true)
    try {
      const uploadRes = await uploadApi.uploadImage(file)
      if (uploadRes.success && uploadRes.url) {
        // Sau khi upload thành công, gửi update profile
        updateMutation.mutate({ avatarUrl: uploadRes.url })
      }
    } catch (error) {
      toast.error("Upload ảnh thất bại")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    updateMutation.mutate(values)
  }

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-10 space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] md:col-span-2 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground mt-1">Quản lý thông tin và cài đặt tài khoản của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Cột trái: Avatar và Thống kê */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="relative group mb-4">
                <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                  <AvatarImage src={profile?.avatarUrl || authUser?.avatarUrl || ""} />
                  <AvatarFallback className="text-4xl">{profile?.displayName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                
                {/* Upload Overlay */}
                <label 
                  className={`absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity ${isUploading ? "opacity-100" : ""}`}
                >
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 mb-1" />
                      <span className="text-xs font-medium">Đổi Ảnh</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={isUploading || updateMutation.isPending}
                  />
                </label>
              </div>

              <h2 className="text-xl font-bold text-center">{profile?.displayName}</h2>
              <p className="text-muted-foreground text-sm text-center mb-4">@{profile?.username}</p>

              <Badge variant={profile?.role === "admin" ? "default" : "secondary"} className="mb-6 capitalize">
                {profile?.role === "admin" ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                {profile?.role}
              </Badge>

              {/* Stats */}
              <div className="w-full grid grid-cols-3 gap-2 border-t pt-4">
                <div className="text-center">
                  <div className="flex items-center justify-center text-muted-foreground mb-1">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-lg">{profile?._count?.stories || 0}</div>
                  <div className="text-xs text-muted-foreground">Truyện</div>
                </div>
                <div className="text-center border-l border-r">
                  <div className="flex items-center justify-center text-muted-foreground mb-1">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-lg">{profile?._count?.followers || 0}</div>
                  <div className="text-xs text-muted-foreground">Follower</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center text-muted-foreground mb-1">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-lg">{profile?._count?.following || 0}</div>
                  <div className="text-xs text-muted-foreground">Đang theo dõi</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Thông tin thêm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm">
                <CalendarDays className="w-4 h-4 mr-3 text-muted-foreground" />
                <span>
                  Tham gia từ <span className="font-medium">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("vi-VN") : "..."}</span>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột phải: Form cập nhật thông tin */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt tài khoản</CardTitle>
              <CardDescription>
                Cập nhật tên hiển thị của bạn. Tên đăng nhập và Email không thể thay đổi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên hiển thị</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên hiển thị mới" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Readonly fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none">Tên đăng nhập (Username)</label>
                      <Input value={profile?.username || ""} disabled className="bg-muted" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none">Địa chỉ Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input value={authUser?.email || ""} disabled className="pl-9 bg-muted" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={updateMutation.isPending || isUploading}>
                      {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Lưu Thay Đổi
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
