import { useForm } from 'react-hook-form';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../stores/authStore';

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
  const { user } = useAuthStore();
  const { updateProfile, isUpdateLoading } = useAuth();
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
          <form
            onSubmit={handlePwSubmit(async (data) => {
              const { authService } = await import('../../services/authService');
              await authService.changePassword(data.currentPassword, data.newPassword);
              resetPw();
            })}
            className="space-y-4"
          >
            <Input label="Current Password" type="password" {...registerPw('currentPassword', { required: true })} />
            <Input label="New Password" type="password" {...registerPw('newPassword', { required: true, minLength: 6 })} />
            <Button type="submit" variant="outline">
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
