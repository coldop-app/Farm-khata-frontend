import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { saveTokenWithExpiry } from '@/lib/utils';

export const Route = createFileRoute('/login')({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const setFarmer = useAuthStore((state) => state.setFarmer);

  const loginMutation = useMutation({
    mutationFn: async (data: { mobileNumber: string; password: string }) => {
      const { data: response } = await apiClient.post(API_ENDPOINTS.login, data);
      return response;
    },
    onSuccess: (data) => {
      // Backend returns: { success: true, data: { _id, name, mobileNumber, location, role, token } }
      if (data.data?.token) {
        saveTokenWithExpiry(data.data.token);
        // Extract farmer data without token
        const { token: _token, ...farmerData } = data.data;
        setFarmer(farmerData);
      } else {
        setFarmer(data.data);
      }
      toast.success('Logged in successfully');
      navigate({ to: '/dashboard' });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
        (error as { message?: string })?.message ||
        'Invalid credentials';
      toast.error(errorMessage);
    },
  });

  const { register, handleSubmit } = useForm<{
    mobileNumber: string;
    password: string;
  }>();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                type="tel"
                placeholder="Enter mobile number"
                {...register('mobileNumber', { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                {...register('password', { required: true })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate({ to: '/register' })}
                className="text-primary hover:underline"
              >
                Register
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
