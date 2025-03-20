import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Loader2, Train } from "lucide-react";
import { Redirect } from "wouter";
import { useState } from "react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const form = useForm({
    resolver: zodResolver(insertUserSchema),
  });

  if (user) {
    return <Redirect to="/" />;
  }

  const onSubmit = form.handleSubmit((data) => {
    if (isLogin) {
      loginMutation.mutate(data);
    } else {
      registerMutation.mutate(data);
    }
  });

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...form.register("username")}
                  error={form.formState.errors.username?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  error={form.formState.errors.password?.message}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending || registerMutation.isPending}
              >
                {(loginMutation.isPending || registerMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isLogin ? "Login" : "Register"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin
                  ? "Don't have an account? Register"
                  : "Already have an account? Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div
        className="hidden lg:flex items-center justify-center bg-cover bg-center p-8"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1474579141827-94112b73ba39')",
        }}
      >
        <div className="bg-black/60 p-8 rounded-lg text-white max-w-lg">
          <div className="flex items-center mb-4">
            <Train className="h-8 w-8 mr-2" />
            <h2 className="text-2xl font-bold">Railway Reservation System</h2>
          </div>
          <p className="text-lg">
            Book your train tickets easily and securely. Travel to your favorite
            destinations with comfort and convenience.
          </p>
        </div>
      </div>
    </div>
  );
}
