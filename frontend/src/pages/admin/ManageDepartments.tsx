import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Plus, Pencil, Trash2, ArrowUpRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { BarChartCard } from '../../components/charts/BarChartCard';
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '../../hooks/useDepartments';
import { useDashboardStats } from '../../hooks/useAnalytics';
import { Department } from '../../types';

interface DeptForm {
  name: string;
  code: string;
  description: string;
  email: string;
  phone?: string;
  color: string;
}

const defaultColor = '#6366f1';

export default function ManageDepartments() {
  const { data: departments, isLoading } = useDepartments();
  const { data: dashboard } = useDashboardStats();
  const { mutate: createDept, isPending: isCreating } = useCreateDepartment();
  const { mutate: updateDept, isPending: isUpdating } = useUpdateDepartment();
  const { mutate: deleteDept } = useDeleteDepartment();
  const [editing, setEditing] = useState<Department | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm<DeptForm>({ defaultValues: { color: defaultColor } });

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', code: '', description: '', email: '', phone: '', color: defaultColor });
    setIsOpen(true);
  };

  const openEdit = (d: Department) => {
    setEditing(d);
    reset({ name: d.name, code: d.code, description: d.description, email: d.email, phone: d.phone, color: d.color });
    setIsOpen(true);
  };

  const onSubmit = (data: DeptForm) => {
    if (editing) {
      updateDept({ id: editing._id, data }, { onSuccess: () => setIsOpen(false) });
    } else {
      createDept(data, { onSuccess: () => setIsOpen(false) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage departments that handle citizen feedback.</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Add Department
        </Button>
      </div>

      {!!dashboard?.charts.departmentStats.length && (
        <BarChartCard
          title="Global Department Comparison"
          labels={dashboard.charts.departmentStats.map((d) => d.code)}
          datasets={[
            { label: 'Total', data: dashboard.charts.departmentStats.map((d) => d.total) },
            { label: 'Resolved', data: dashboard.charts.departmentStats.map((d) => d.resolved), color: '#10b981' },
          ]}
        />
      )}

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : !departments?.length ? (
        <EmptyState icon={Building2} title="No departments yet" description="Create your first department to start routing feedback." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d, i) => (
            <motion.div key={d._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card hover glow className="relative p-5">
                <div className="flex items-start justify-between">
                  <Link to={`/admin/departments/${d._id}`} className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white" style={{ backgroundColor: d.color }}>
                      {d.code.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.code}</p>
                    </div>
                  </Link>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => openEdit(d)} className="text-muted-foreground hover:text-foreground">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => window.confirm('Delete this department?') && deleteDept(d._id)} className="text-muted-foreground hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{d.description}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Resolved</span>
                    <span>{d.resolvedFeedback} / {d.totalFeedback}</span>
                  </div>
                  <ProgressBar value={d.totalFeedback ? (d.resolvedFeedback / d.totalFeedback) * 100 : 0} className="mt-1.5" />
                </div>
                <Link
                  to={`/admin/departments/${d._id}`}
                  className="mt-4 flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  View department analytics <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Edit Department' : 'Add Department'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" {...register('name', { required: true })} />
          <Input label="Code" placeholder="e.g. SAN, WTR, ELE" {...register('code', { required: true })} />
          <Textarea label="Description" rows={3} {...register('description', { required: true })} />
          <Input label="Contact Email" type="email" {...register('email', { required: true })} />
          <Input label="Contact Phone (optional)" {...register('phone')} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground/90">Color</label>
            <input type="color" className="h-11 w-full rounded-xl border border-white/10 bg-white/5" {...register('color')} />
          </div>
          <Button type="submit" className="w-full" isLoading={isCreating || isUpdating}>
            {editing ? 'Save Changes' : 'Create Department'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
