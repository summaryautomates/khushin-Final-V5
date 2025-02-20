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
import { useAuth } from "@/hooks/use-auth"

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginPanel({ isOpen, onClose }: LoginPanelProps) {
  const { loginMutation } = useAuth();
  const { toast } = useToast()
  const [_, setLocation] = useLocation()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(data);
      toast({
        title: "Success",
        description: "Logged in successfully",
      })
      onClose()
      setLocation("/") // Redirect to home after successful login
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to login",
        variant: "destructive"
      });
    }
  }

  const handleNavigation = (path: string) => {
    onClose()
    setLocation(path)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-[425px] h-[100dvh] sm:h-auto overflow-y-auto fixed right-0 top-0 sm:relative sm:right-auto sm:top-auto sm:rounded-lg bg-gradient-to-br from-background/95 via-background/98 to-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border-0 sm:border"
      >
        <DialogTitle className="text-2xl font-light tracking-tight">
          LOGIN
        </DialogTitle>
        <DialogDescription>
          Please sign in to continue
        </DialogDescription>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="absolute right-4 top-4 hover:bg-background/80 transition-colors duration-200" 
          aria-label="Close login panel"
        >
          <X className="h-4 w-4" />
        </Button>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Username<span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      disabled={loginMutation.isPending}
                      className="bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50 transition-all duration-200 h-11"
                      placeholder="Enter your username"
                      aria-required="true" 
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Password<span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="password" 
                      disabled={loginMutation.isPending}
                      className="bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50 transition-all duration-200 h-11"
                      placeholder="Enter your password"
                      aria-required="true" 
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-black hover:bg-black/90 text-white font-medium tracking-wide h-11 transition-all duration-200 hover:shadow-lg"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "SIGN IN"}
            </Button>
          </form>
        </Form>

        <div className="mt-8 space-y-4 text-center">
          <button 
            onClick={() => handleNavigation("/register")} 
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            New customer? <span className="underline underline-offset-4">Create your account</span>
          </button>
          <button 
            onClick={() => handleNavigation("/forgot-password")} 
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Lost password? <span className="underline underline-offset-4">Recover password</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}