import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useNavigate, Link } from "react-router-dom"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { authApi } from "../api/authApi"
import { useAuthStore } from "@/store/authStore"

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, { message: "Vui lòng nhập tên tài khoản hoặc email." }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    try {
      const payload = {
        username: data.usernameOrEmail,
        password: data.password,
      }

      const res = await authApi.login(payload)

      if (res.success && res.data) {
        toast.success(res.message || "Đăng nhập thành công!")
        setAuth(res.data.user, res.data.token)
        navigate("/")
      } else {
        toast.error(res.message || "Đăng nhập thất bại!")
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-[400px] shadow-lg border-muted">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
        <CardDescription className="text-center">
          Nhập tài khoản và mật khẩu để tiếp tục
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="usernameOrEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đăng nhập</FormLabel>
                  <FormControl>
                    <Input placeholder="novelhub_user" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <p className="mt-2 text-xs text-center text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-primary hover:underline font-semibold">
            Đăng ký ngay
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
