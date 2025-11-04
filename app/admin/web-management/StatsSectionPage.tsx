'use client';
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

interface Stat {
  title: string;
  value: number;
}

interface StatsData {
  stats: Stat[];
}

const StatsSectionPage: React.FC = () => {
  const { control, register, handleSubmit, formState: { errors }, reset } = useForm<StatsData>({
    defaultValues: { stats: [{ title: '', value: 0 }] },
  });

  const { fields, append, remove } = useFieldArray<StatsData, 'stats'>({
    control,
    name: 'stats',  // Clear path for the wrapped array
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error('Failed to fetch');
        const data: Stat[] = await response.json();
        reset({ stats: data.length > 0 ? data : [{ title: '', value: 0 }] });
      } catch (err) {
        console.error('Error fetching stats data:', err);
        setError('Failed to load stats data.');
      }
    };
    fetchStatsData();
  }, [reset]);

  const onSubmit = async (data: StatsData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.stats),  // Send unwrapped array to API
      });
      if (!response.ok) throw new Error('Failed to update');
      const updatedData: Stat[] = await response.json();
      reset({ stats: updatedData.length > 0 ? updatedData : [{ title: '', value: 0 }] });
      alert('Stats updated successfully!');
    } catch (err) {
      setError('Failed to update stats.');
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Stats Management</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stats</label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex space-x-2 mb-4 p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <input
                      {...register(`stats.${index}.title`, { required: 'Title is required' })}
                      placeholder="Stat Title (e.g., Users)"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] text-black"
                    />
                    {errors.stats?.[index]?.title && (
                      <p className="mt-1 text-sm text-red-500">{errors.stats[index]?.title?.message}</p>
                    )}
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      {...register(`stats.${index}.value`, { valueAsNumber: true, required: 'Value is required', min: 0 })}
                      placeholder="Value"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] text-black"
                    />
                    {errors.stats?.[index]?.value && (
                      <p className="mt-1 text-sm text-red-500">{errors.stats[index]?.value?.message}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => append({ title: '', value: 0 })}
                className="text-[#326101] underline hover:no-underline"
              >
                Add Stat
              </button>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#326101] text-white rounded-lg hover:bg-[#2a5101] disabled:bg-gray-400"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StatsSectionPage;