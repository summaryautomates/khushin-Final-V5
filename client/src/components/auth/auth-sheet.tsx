import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { UserCircle2 } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

interface AuthSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  showTrigger?: boolean;
}

export function AuthSheet({ open, onOpenChange, onSuccess, showTrigger = true }: AuthSheetProps) {
  const { loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      first_name: "",
      last_name: "",
    },
  });

  const onLogin = async (data: LoginData) => {
    try {
      await loginMutation.mutateAsync(data);
      onSuccess?.();
      onOpenChange?.(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const onRegister = async (data: RegisterData) => {
    try {
      console.log("Submitting registration data from auth-sheet:", data);
      const { confirmPassword, ...userDataWithoutConfirm } = data;
      console.log("Sending to server:", userDataWithoutConfirm);
      await registerMutation.mutateAsync(userDataWithoutConfirm);
      console.log("Registration successful!");
      onSuccess?.();
      onOpenChange?.(false);
    } catch (error) {
      console.error("Registration error in sheet:", error);
      // Error is handled by the mutation
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {showTrigger && (
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="relative group hover:bg-white/10 transition-all duration-300"
          >
            <UserCircle2 className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-300" />
            <span className="sr-only">Login</span>
          </Button>
        </SheetTrigger>
      )}

      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
        <Tabs defaultValue="login" className="h-full">
          <TabsList className="w-full rounded-none h-16 px-6">
            <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
            <TabsTrigger value="register" className="flex-1">Register</TabsTrigger>
          </TabsList>

          <div className="px-6 py-4">
            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    {...loginForm.register("username")}
                    className="bg-background"
                  />
                  {loginForm.formState.errors.username && (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.username.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...loginForm.register("password")}
                    className="bg-background"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      {...registerForm.register("first_name")}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      {...registerForm.register("last_name")}
                      className="bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-username">Username</Label>
                  <Input
                    id="reg-username"
                    {...registerForm.register("username")}
                    className="bg-background"
                  />
                  {registerForm.formState.errors.username && (
                    <p className="text-sm text-destructive">
                      {registerForm.formState.errors.username.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...registerForm.register("email")}
                    className="bg-background"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    {...registerForm.register("password")}
                    className="bg-background"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...registerForm.register("confirmPassword")}
                    className="bg-background"
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}