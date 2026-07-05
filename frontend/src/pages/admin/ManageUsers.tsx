import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, ChevronLeft, ChevronRight, ShieldCheck, ShieldOff } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { useUsers, useToggleUserStatus } from '../../hooks/useUsers';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../lib/utils';

const roleOptions = [
  { label: 'Citizen', value: 'citizen' },
  { label: 'Moderator', value: 'moderator' },
  { label: 'Department Head', value: 'department_head' },
  { label: 'Admin', value: 'admin' },
];

export default function ManageUsers() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useUsers({ page, limit: 10, search: debouncedSearch || undefined, role: role || undefined });
  const { mutate: toggleStatus } = useToggleUserStatus();

  const users = data?.users || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">View, filter, and manage platform users.</p>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input placeholder="Search by name or email..." leftIcon={<Search className="h-4 w-4" />} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <Select placeholder="All roles" options={roleOptions} value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} />
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div>{Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}</div>
        ) : users.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Users} title="No users found" description="Try adjusting your search or filters." />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {users.map((u, i) => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={u.name} src={u.avatar} size={40} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email} · Joined {formatDate(u.createdAt)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="capitalize">{u.role.replace('_', ' ')}</Badge>
                  <Badge className={u.isActive ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}>
                    {u.isActive ? 'Active' : 'Suspended'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleStatus(u._id)}
                    leftIcon={u.isActive ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  >
                    {u.isActive ? 'Suspend' : 'Activate'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={!pagination.hasPrevPage} onClick={() => setPage((p) => p - 1)} leftIcon={<ChevronLeft className="h-4 w-4" />}>
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
          <Button variant="outline" size="sm" disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)} rightIcon={<ChevronRight className="h-4 w-4" />}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
