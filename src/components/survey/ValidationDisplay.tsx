'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ValidationDisplayProps {
  total: number;
  isValid: boolean;
}

export default function ValidationDisplay({ total, isValid }: ValidationDisplayProps) {
  const isNearlyValid = Math.abs(total - 100) < 0.01;

  return (
    <Card className={`border-2 ${
      isNearlyValid
        ? 'border-emerald-500 bg-emerald-50'
        : 'border-amber-500 bg-amber-50'
    }`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isNearlyValid ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600" />
            )}
            <span className="text-lg font-semibold">
              总计: {total.toFixed(1)}%
            </span>
          </div>
          <div className={`text-sm font-medium ${
            isNearlyValid ? 'text-emerald-700' : 'text-amber-700'
          }`}>
            {isNearlyValid
              ? '准备提交!'
              : `${(100 - total).toFixed(1)}% ${total > 100 ? '超出' : '剩余'}`
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
