import { useForm } from 'react-hook-form';
import { User, Mail, Phone, MapPin, Monitor, Smartphone, ShieldCheck, LogOut, Chrome } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { useAuth, useSessions, useRevokeSession } from '../../hooks/useAuth';
import { useAuthStore } from '../../stores/authStore';
import { timeAgo } from '../../lib/utils';

interface ProfileForm {
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
}

const deviceIcon = (userAgent?: string) => {
  if (userAgent && /mobile|android|iphone/i.test(userAgent)) return Smartphone;
  return Monitor;
};

export default function Profile() {
  const { user } = useAuthStore();
  const { updateProfile, isUpdateLoading, logoutAll, isLogoutLoading } = useAuth();
  const { data: sessions, isLoading: isSessionsLoading } = useSessions();
  const { mutate: revokeSession } = useRevokeSession();

  const { register, handleSubmit } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name,
      phone: user?.phone,
      address: user?.address,
      city: user?.city,
      state: user?.state,
      pincode: user?.pincode,
    },
  });
  const { register: registerPw, handleSubmit: handlePwSubmit, reset: resetPw } = useForm<PasswordForm>();

  const isGoogleAccount = user?.authProvider === 'google';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your personal information and security.</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar name={user?.name || 'U'} src={user?.avatar} size={64} />
          <div>
            <p className="font-semibold text-foreground">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <Badge className="capitalize">{user?.role}</Badge>
              {user?.isVerified && (
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </Badge>
              )}
              {isGoogleAccount && (
                <Badge variant="outline">
                  <Chrome className="h-3 w-3" /> Google Account
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((data) => updateProfile(data))} className="space-y-4">
            <Input label="Full Name" leftIcon={<User className="h-4 w-4" />} {...register('name')} />
            <Input label="Email" leftIcon={<Mail className="h-4 w-4" />} value={user?.email} disabled />
            <Input label="Phone" leftIcon={<Phone className="h-4 w-4" />} {...register('phone')} />
            <Input label="Address" leftIcon={<MapPin className="h-4 w-4" />} {...register('address')} />
            <div className="grid grid-cols-3 gap-3">
              <Input label="City" {...register('city')} />
              <Input label="State" {...register('state')} />
              <Input label="Pincode" {...register('pincode')} />
            </div>
            <Button type="submit" isLoading={isUpdateLoading}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {!isGoogleAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handlePwSubmit(async (data) => {
                const { authService } = await import('../../services/authService');
                await authService.changePassword(data.currentPassword, data.newPassword);
                resetPw();
              })}
              className="space-y-4"
            >
              <Input label="Current Password" type="password" {...registerPw('currentPassword', { required: true })} />
              <Input
                label="New Password"
                type="password"
                placeholder="8+ chars, uppercase, lowercase, number"
                {...registerPw('newPassword', { required: true, minLength: 8 })}
              />
              <Button type="submit" variant="outline">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Sessions</CardTitle>
          {!!sessions?.length && (
            <Button size="sm" variant="outline" isLoading={isLogoutLoading} leftIcon={<LogOut className="h-3.5 w-3.5" />} onClick={() => logoutAll()}>
              Log out everywhere
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isSessionsLoading ? (
            <div className="space-y-3">
              <CardSkeleton />
            </div>
          ) : !sessions?.length ? (
            <p className="text-sm text-muted-foreground">No active sessions found.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => {
                const Icon = deviceIcon(s.userAgent);
                return (
                  <div
                    key={s.tokenId}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="rounded-lg bg-white/5 p-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-foreground">
                          {s.userAgent ? s.userAgent.slice(0, 60) : 'Unknown device'}
                          {s.isCurrent && <span className="ml-2 text-xs text-emerald-400">(this device)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.ip ? `${s.ip} · ` : ''}Active {timeAgo(s.lastActive)}
                        </p>
                      </div>
                    </div>
                    {!s.isCurrent && (
                      <button onClick={() => revokeSession(s.tokenId)} className="shrink-0 text-xs text-red-400 hover:text-red-300">
                        Revoke
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
