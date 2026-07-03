import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Upload, X, FileText, Image as ImageIcon, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { StarRating } from '../../components/ui/StarRating';
import { useDepartments } from '../../hooks/useDepartments';
import { useCategories } from '../../hooks/useCategories';
import { useSubmitFeedback } from '../../hooks/useFeedback';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(20, 'Please describe the issue in at least 20 characters'),
  department: z.string().min(1, 'Select a department'),
  category: z.string().min(1, 'Select a category'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  rating: z.number().min(1).max(5),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  isAnonymous: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function SubmitFeedback() {
  const [files, setFiles] = useState<File[]>([]);
  const { data: departments } = useDepartments({ isActive: true });
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium', rating: 3, isAnonymous: false },
  });
  const selectedDepartment = watch('department');
  const { data: categories } = useCategories(selectedDepartment);
  const { mutate: submit, isPending } = useSubmitFeedback();

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).slice(0, 5 - files.length);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const onSubmit = (data: FormData) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('department', data.department);
    formData.append('category', data.category);
    formData.append('priority', data.priority);
    formData.append('rating', String(data.rating));
    formData.append('isAnonymous', String(data.isAnonymous));
    formData.append(
      'location',
      JSON.stringify({ address: data.address, city: data.city, state: data.state, pincode: data.pincode })
    );
    files.forEach((file) => formData.append('attachments', file));

    submit(formData, {
      onSuccess: () => {
        reset();
        setFiles([]);
      },
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Submit Feedback</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe the issue clearly — our AI will analyze urgency and sentiment automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
            <CardDescription>Provide a clear title and detailed description.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input label="Title" placeholder="e.g. Broken streetlight on Main St" error={errors.title?.message} {...register('title')} />
            <Textarea
              label="Description"
              placeholder="Describe the issue in detail — location context, how long it's been happening, severity..."
              rows={5}
              error={errors.description?.message}
              {...register('description')}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                label="Department"
                placeholder="Select department"
                options={(departments || []).map((d) => ({ label: d.name, value: d._id }))}
                error={errors.department?.message}
                {...register('department')}
              />
              <Select
                label="Category"
                placeholder={selectedDepartment ? 'Select category' : 'Select department first'}
                options={(categories || []).map((c) => ({ label: c.name, value: c._id }))}
                disabled={!selectedDepartment}
                error={errors.category?.message}
                {...register('category')}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                label="Priority"
                options={[
                  { label: 'Low', value: 'low' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'High', value: 'high' },
                  { label: 'Critical', value: 'critical' },
                ]}
                {...register('priority')}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground/90">Rate your experience</label>
                <Controller
                  control={control}
                  name="rating"
                  render={({ field }) => <StarRating value={field.value} onChange={field.onChange} />}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Address (optional)" placeholder="Street address" {...register('address')} />
              <Input label="City (optional)" placeholder="City" {...register('city')} />
              <Input label="State (optional)" placeholder="State" {...register('state')} />
              <Input label="Pincode (optional)" placeholder="Pincode" {...register('pincode')} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground/90">Attachments (images or PDF, max 5)</label>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] py-8 text-center hover:bg-white/[0.04] transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload or drag files here</span>
                <input type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={onFilesChange} />
              </label>
              {files.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {files.map((file, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-foreground"
                    >
                      {file.type.startsWith('image') ? <ImageIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                      <span className="max-w-[140px] truncate">{file.name}</span>
                      <button type="button" onClick={() => removeFile(i)}>
                        <X className="h-3.5 w-3.5 text-muted-foreground hover:text-red-400" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <label className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-muted-foreground">
              <input type="checkbox" className="rounded border-white/20 bg-white/5" {...register('isAnonymous')} />
              <EyeOff className="h-4 w-4" />
              Submit anonymously — your identity will be hidden from public and department views
            </label>

            <Button type="submit" className="w-full" isLoading={isPending}>
              Submit Feedback
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
