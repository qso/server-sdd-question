'use client';

import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Lock, Unlock } from 'lucide-react';

interface TimeSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  locked?: boolean;
  onToggleLock?: () => void;
}

export default function TimeSlider({ label, value, onChange, locked = false, onToggleLock }: TimeSliderProps) {
  const [inputValue, setInputValue] = useState(value.toFixed(1));

  // 同步外部value变化到输入框
  useEffect(() => {
    setInputValue(value.toFixed(1));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (locked) return; // Prevent changes when locked

    // 允许输入数字和小数点
    const newValue = e.target.value;
    if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
      setInputValue(newValue);
    }
  };

  const handleInputBlur = () => {
    if (locked) return; // Prevent changes when locked

    const numValue = parseFloat(inputValue);

    // 验证输入
    if (isNaN(numValue)) {
      // 无效输入，恢复原值
      setInputValue(value.toFixed(1));
      return;
    }

    // 限制范围 0-100
    const clampedValue = Math.max(0, Math.min(100, numValue));
    setInputValue(clampedValue.toFixed(1));

    // 触发onChange
    if (clampedValue !== value) {
      onChange(clampedValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (locked) return; // Prevent changes when locked

    // 按回车键也触发更新
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm font-medium flex-1">{label}</Label>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              disabled={locked}
              className={`w-[70px] h-7 text-sm font-mono text-right pr-6 ${
                locked ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
              %
            </span>
          </div>
          {onToggleLock && (
            <button
              type="button"
              onClick={onToggleLock}
              className={`p-1.5 rounded-md transition-colors ${
                locked
                  ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={locked ? '点击解锁' : '点击锁定'}
            >
              {locked ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([newValue]) => !locked && onChange(newValue)}
        min={0}
        max={100}
        step={0.5}
        disabled={locked}
        className={`w-full ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  );
}
