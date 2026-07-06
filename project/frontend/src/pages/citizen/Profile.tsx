import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { User, Mail, Phone, MapPin, Eye, EyeOff, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/authService';

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

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const { updateProfile, isUpdateLoading, changePassword, isChangePasswordLoading } = useAuth();
  const { register, handleSubmit, reset } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name,
      phone: user?.phone,
      address: user?.address,
      city: user?.city,
      state: user?.state,
      pincode: user?.pincode,
    },
  });

  // Always pull the freshest copy from the database, in case fields (like phone/city/state
  // saved at registration) aren't yet reflected in the locally cached user.
  const { data: freshUser } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
    select: (res) => res.data.data.user,
  });

  useEffect(() => {
    if (freshUser) {
      updateUser(freshUser);
      reset({
        name: freshUser.name,
        phone: freshUser.phone,
        address: freshUser.address,
        city: freshUser.city,
        state: freshUser.state,
        pincode: freshUser.pincode,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freshUser]);

  const {
    register: registerPw,
    handleSubmit: handlePwSubmit,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm<PasswordForm>();
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const onChangePassword = (data: PasswordForm) => {
    changePassword(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      { onSuccess: () => resetPw() }
    );
  };

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
            <span className="mt-1 inline-block rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs capitalize text-indigo-400">
              {user?.role}
            </span>
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

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePwSubmit(onChangePassword)} className="space-y-4">
            <Input
              label="Current Password"
              type={showCurrentPw ? 'text' : 'password'}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((v) => !v)}
                  className="pointer-events-auto text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={pwErrors.currentPassword?.message}
              {...registerPw('currentPassword', { required: 'Current password is required' })}
            />
            <Input
              label="New Password"
              type={showNewPw ? 'text' : 'password'}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowNewPw((v) => !v)}
                  className="pointer-events-auto text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={pwErrors.newPassword?.message}
              {...registerPw('newPassword', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Must be at least 6 characters' },
              })}
            />
            <Button type="submit" variant="outline" isLoading={isChangePasswordLoading}>
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
