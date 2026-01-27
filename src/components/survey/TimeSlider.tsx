'use client';

import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TimeSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export default function TimeSlider({ label, value, onChange }: TimeSliderProps) {
  const [inputValue, setInputValue] = useState(value.toFixed(1));

  // 同步外部value变化到输入框
  useEffect(() => {
    setInputValue(value.toFixed(1));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 允许输入数字和小数点
    const newValue = e.target.value;
    if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
      setInputValue(newValue);
    }
  };

  const handleInputBlur = () => {
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

    // 触发onChange，让父组件调整其他滑块
    if (clampedValue !== value) {
      onChange(clampedValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 按回车键也触发更新
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm font-medium flex-1">{label}</Label>
        <div className="relative">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className="w-[70px] h-7 text-sm font-mono text-right pr-6"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            %
          </span>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([newValue]) => onChange(newValue)}
        min={0}
        max={100}
        step={0.5}
        className="w-full"
      />
    </div>
  );
}
