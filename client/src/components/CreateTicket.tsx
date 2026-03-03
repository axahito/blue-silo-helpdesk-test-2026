import React from 'react';
import { privateApi } from '../api/axios';
import { useAuth } from '../auth/AuthProvider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createTicketSchema } from '../schemas';

export default function CreateTicket({ onCreated, role }: { onCreated: () => void; role: string }) {
  const { user } = useAuth();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { title: '', description: '', category: 'General', expectedCompletion: '', priority: 'Med', escalation: 'L1' },
  });

  async function onSubmit(data: any) {
    try {
      const payload = {
        ...data,
        // send undefined rather than empty string for optional date
        expectedCompletion: data.expectedCompletion || undefined,
        createdBy: user?.username || 'ui-user',
      };
      // ensure escalation is always present (server expects non-null)
      if (!payload.escalation) payload.escalation = 'L1';
      // include escalation (default L1) to satisfy any server expectations
      await privateApi.post('/tickets', payload);
      reset({ title: '', description: '', category: 'General', expectedCompletion: '', priority: 'Med', escalation: 'L1' });
      onCreated();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create ticket');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-3 border rounded">
      <h3 className="font-medium mb-2">Create Ticket</h3>
      <input {...register('title')} className="w-full border p-2 mb-2" placeholder="Title" />
      {errors.title && <div className="text-red-600 text-sm mb-2">{(errors.title as any)?.message}</div>}
      <textarea {...register('description')} className="w-full border p-2 mb-2" placeholder="Description" />
      <div className="flex gap-2">
        <input {...register('category')} className="border p-2" placeholder="Category" />
        <input {...register('expectedCompletion')} type="date" className="border p-2" />
        <select {...register('priority')} className="border p-2">
          <option value="Low">Low</option>
          <option value="Med">Med</option>
          <option value="High">High</option>
        </select>
      </div>
      {/* hidden escalation - default L1 */}
      <input type="hidden" {...register('escalation')} />
      <div className="mt-2"><button className="px-3 py-1 bg-green-600 text-white rounded" type="submit">Create</button></div>
    </form>
  );
}
