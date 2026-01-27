'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ValidationDisplayProps {
  total: number;
  isValid: boolean;
  onAutoAdjust?: () => void;
}

export default function ValidationDisplay({ total, isValid, onAutoAdjust }: ValidationDisplayProps) {
  const isNearlyValid = Math.abs(total - 100) < 0.01;

  return (
    <Card className={`border-2 ${
      isNearlyValid
        ? 'border-emerald-500 bg-emerald-50'
        : 'border-rose-500 bg-rose-50'
    }`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isNearlyValid ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-rose-600" />
            )}
            <span className="text-lg font-semibold">
              总计: {total.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-sm font-medium ${
              isNearlyValid ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {isNearlyValid
                ? '准备提交!'
                : `${Math.abs(100 - total).toFixed(1)}% ${total > 100 ? '超出' : '不足'}`
              }
            </div>
            {!isNearlyValid && onAutoAdjust && (
              <Button
                type="button"
                onClick={onAutoAdjust}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                自动调整
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
