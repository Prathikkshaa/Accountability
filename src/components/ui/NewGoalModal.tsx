'use client';

import React, { useState } from 'react';
import { X, Target, Sparkles, Lock, Eye, Clock } from 'lucide-react';
import { Button } from './Button';
import { MeasurementType, GoalVisibility } from '@/lib/types';
import { clsx } from 'clsx';

interface NewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onGoalCreated: () => void;
}

const PRESET_GOALS = [
  { name: 'Morning Run', category: 'Fitness', measurementType: 'FREQUENCY' as MeasurementType, targetValue: 3, targetUnit: 'times/wk' },
  { name: 'Workout Session', category: 'Fitness', measurementType: 'BINARY' as MeasurementType, targetValue: 1 },
  { name: 'Deep Study', category: 'Learning', measurementType: 'DURATION' as MeasurementType, targetValue: 60, targetUnit: 'min' },
  { name: 'Read Book', category: 'Learning', measurementType: 'QUANTITY' as MeasurementType, targetValue: 20, targetUnit: 'pages' },
  { name: 'Meditate', category: 'Mindfulness', measurementType: 'DURATION' as MeasurementType, targetValue: 15, targetUnit: 'min' },
  { name: 'Journaling', category: 'Mindfulness', measurementType: 'BINARY' as MeasurementType, targetValue: 1 },
  { name: 'Drink Water', category: 'Health', measurementType: 'QUANTITY' as MeasurementType, targetValue: 2, targetUnit: 'litres' },
  { name: 'Wake Up Early', category: 'Habits', measurementType: 'BINARY' as MeasurementType, targetValue: 1 },
];

export function NewGoalModal({ isOpen, onClose, userId, onGoalCreated }: NewGoalModalProps) {
  const [tab, setTab] = useState<'preset' | 'custom'>('preset');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Fitness');
  const [description, setDescription] = useState('');
  const [measurementType, setMeasurementType] = useState<MeasurementType>('BINARY');
  const [targetValue, setTargetValue] = useState('1');
  const [targetUnit, setTargetUnit] = useState('');
  const [frequencyPerWeek, setFrequencyPerWeek] = useState('3');
  const [visibility, setVisibility] = useState<GoalVisibility>('PARTNER_VISIBLE');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectPreset = (preset: typeof PRESET_GOALS[0]) => {
    setName(preset.name);
    setCategory(preset.category);
    setMeasurementType(preset.measurementType);
    setTargetValue(String(preset.targetValue));
    setTargetUnit(preset.targetUnit || '');
    setTab('custom');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Goal name is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: name.trim(),
          category,
          description: description.trim(),
          measurementType,
          targetValue: Number(targetValue) || 1,
          targetUnit,
          frequencyPerWeek: measurementType === 'FREQUENCY' ? Number(frequencyPerWeek) : undefined,
          visibility,
          reminderTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create goal');

      onGoalCreated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-pop-in">
      <div className="w-full max-w-lg bg-card rounded-t-2xl sm:rounded-2xl border border-border p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-foreground" />
            <h3 className="text-lg font-semibold">Create Goal</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setTab('preset')}
            className={`flex-1 py-2 text-sm font-medium border-b-2 ${
              tab === 'preset' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'
            }`}
          >
            Sensible Presets
          </button>
          <button
            type="button"
            onClick={() => setTab('custom')}
            className={`flex-1 py-2 text-sm font-medium border-b-2 ${
              tab === 'custom' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'
            }`}
          >
            Custom Goal
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs bg-danger/10 text-danger border border-danger/20 rounded-xl font-medium">
            {error}
          </div>
        )}

        {tab === 'preset' ? (
          <div className="grid grid-cols-2 gap-2.5 py-2">
            {PRESET_GOALS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectPreset(p)}
                className="p-3 text-left rounded-xl border border-border bg-card hover:bg-muted transition-all duration-150 group"
              >
                <span className="text-xs font-semibold text-muted-foreground block">{p.category}</span>
                <span className="text-sm font-semibold text-foreground group-hover:text-accent block mt-0.5">
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Goal Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Morning Run"
                className="w-full p-3 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full p-3 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
                >
                  <option value="Fitness">Fitness</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Learning">Learning</option>
                  <option value="Mindfulness">Mindfulness</option>
                  <option value="Health">Health</option>
                  <option value="Habits">Habits</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</label>
                <select
                  value={measurementType}
                  onChange={e => setMeasurementType(e.target.value as MeasurementType)}
                  className="w-full p-3 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
                >
                  <option value="BINARY">Yes / No Check</option>
                  <option value="DURATION">Duration (Minutes)</option>
                  <option value="QUANTITY">Quantity (Pages/Km)</option>
                  <option value="FREQUENCY">Frequency (Times/Wk)</option>
                </select>
              </div>
            </div>

            {measurementType !== 'BINARY' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Value</label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={e => setTargetValue(e.target.value)}
                    className="w-full p-3 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit</label>
                  <input
                    type="text"
                    value={targetUnit}
                    onChange={e => setTargetUnit(e.target.value)}
                    placeholder="e.g. min, pages, km"
                    className="w-full p-3 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Accountability Visibility</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility('PARTNER_VISIBLE')}
                  className={clsx(
                    'p-3 rounded-xl border text-xs font-medium text-left flex items-center gap-2',
                    visibility === 'PARTNER_VISIBLE' ? 'border-foreground bg-foreground text-background' : 'border-border bg-card text-foreground'
                  )}
                >
                  <Eye className="w-4 h-4" /> Partner Visible
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('PRIVATE')}
                  className={clsx(
                    'p-3 rounded-xl border text-xs font-medium text-left flex items-center gap-2',
                    visibility === 'PRIVATE' ? 'border-amber-500 bg-amber-500 text-white' : 'border-border bg-card text-foreground'
                  )}
                >
                  <Lock className="w-4 h-4" /> Private Goal
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button variant="ghost" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" loading={loading} type="submit">
                Create Goal
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
