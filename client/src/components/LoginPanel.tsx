import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Link, useLocation } from "wouter"
import { X } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

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
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [_, setLocation] = useLocation()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true)
      // TODO: Implement login logic with backend
      console.log(data)
      toast({
        title: "Success",
        description: "Logged in successfully",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to login. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNavigation = (path: string) => {
    onClose()
    setLocation(path)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-[425px] h-[100dvh] sm:h-auto overflow-y-auto fixed right-0 top-0 sm:relative sm:right-auto sm:top-auto sm:rounded-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        aria-describedby="login-dialog-description"
      >
        <DialogTitle>Login to your account</DialogTitle>
        <DialogDescription id="login-dialog-description" className="sr-only">
          Enter your email and password to access your KHUSH.IN account
        </DialogDescription>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">LOGIN</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="hover:bg-background/80" 
            aria-label="Close login panel"
          >
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
                  <FormLabel>Email<span className="text-red-500" aria-hidden="true">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="email" 
                      disabled={isLoading}
                      className="bg-background/50 backdrop-blur-sm"
                      placeholder="Enter your email"
                      aria-required="true" 
                    />
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
                  <FormLabel>Password<span className="text-red-500" aria-hidden="true">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="password" 
                      disabled={isLoading}
                      className="bg-background/50 backdrop-blur-sm"
                      placeholder="Enter your password"
                      aria-required="true" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-black hover:bg-black/90 text-white font-medium tracking-wide"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "SIGN IN"}
            </Button>
          </form>
        </Form>

        <div className="mt-8 space-y-4">
          <button 
            onClick={() => handleNavigation("/register")} 
            className="w-full text-center text-sm hover:underline"
          >
            New customer? Create your account
          </button>
          <button 
            onClick={() => handleNavigation("/forgot-password")} 
            className="w-full text-center text-sm hover:underline"
          >
            Lost password? Recover password
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}