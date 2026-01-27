'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TimeSlider from './TimeSlider';

interface Field {
  readonly key: string;
  readonly label: string;
}

interface SliderGroupProps {
  title: string;
  fields: readonly Field[];
  values: Record<string, number>;
  groupSum: number;
  onChange: (key: string, value: number) => void;
  lockedFields?: Record<string, boolean>;
  onToggleLock?: (key: string) => void;
}

export default function SliderGroup({
  title,
  fields,
  values,
  groupSum,
  onChange,
  lockedFields = {},
  onToggleLock
}: SliderGroupProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className={`text-lg font-mono ${
            groupSum > 0 ? 'text-indigo-600' : 'text-gray-400'
          }`}>
            {groupSum.toFixed(1)}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map(field => (
          <TimeSlider
            key={field.key}
            label={field.label}
            value={values[field.key] || 0}
            onChange={(value) => onChange(field.key, value)}
            locked={lockedFields[field.key] || false}
            onToggleLock={onToggleLock ? () => onToggleLock(field.key) : undefined}
          />
        ))}
      </CardContent>
    </Card>
  );
}
