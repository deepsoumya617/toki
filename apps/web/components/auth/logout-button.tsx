'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { SESSION_QUERY_KEY } from '@xd/shared';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface LogoutButtonProps {
  redirectTo?: string;
  className?: string;
}

export function LogoutButton({
  redirectTo = '/sign-in',
  className,
}: LogoutButtonProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const logoutMutation = useMutation({
    mutationFn: authClient.logout,
    onSuccess: async () => {
      queryClient.setQueryData(SESSION_QUERY_KEY, {
        session: null,
        user: null,
      });
      await queryClient.invalidateQueries({
        queryKey: SESSION_QUERY_KEY,
        exact: true,
      });

      toast.success('Logged out successfully!');
      router.push(redirectTo);
    },
    onError: error => {
      toast.error(error.message || 'Logout failed');
    },
  });

  return (
    <Button
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
      className={className}
    >
      {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
    </Button>
  );
}
