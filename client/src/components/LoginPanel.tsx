import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Link } from "wouter"
import { X } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginPanel({ isOpen, onClose }: LoginPanelProps) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    // TODO: Implement login logic
    console.log(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] h-screen sm:h-auto overflow-y-auto fixed right-0 top-0 rounded-l-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">LOGIN</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email<span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
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
                  <FormLabel>Password<span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
              SIGN IN
            </Button>
          </form>
        </Form>

        <div className="mt-6 space-y-4">
          <Link href="/register" className="block text-center text-sm">
            New customer? Create your account
          </Link>
          <Link href="/forgot-password" className="block text-center text-sm">
            Lost password? Recover password
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
