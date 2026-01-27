'use client';

import { useState, useMemo } from 'react';
import { SURVEY_CATEGORIES, TEAM_OPTIONS } from '@/lib/constants';
import { submitSurvey } from '@/lib/actions';
import SliderGroup from './SliderGroup';
import ValidationDisplay from './ValidationDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SurveyForm() {
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Initialize all slider values with equal distribution
  const [values, setValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    const allFields = [
      ...SURVEY_CATEGORIES.developmentProcess.fields,
      ...SURVEY_CATEGORIES.dailyTasks.fields
    ];

    const equalValue = 100 / allFields.length;
    allFields.forEach(field => {
      initial[field.key] = equalValue;
    });
    return initial;
  });

  // Calculate totals
  const totals = useMemo(() => {
    const devSum = SURVEY_CATEGORIES.developmentProcess.fields
      .reduce((sum, field) => sum + (values[field.key] || 0), 0);

    const dailySum = SURVEY_CATEGORIES.dailyTasks.fields
      .reduce((sum, field) => sum + (values[field.key] || 0), 0);

    const total = devSum + dailySum;

    return { devSum, dailySum, total };
  }, [values]);

  const isValid = Math.abs(totals.total - 100) < 0.01 && !!name.trim() && !!team.trim();

  // Proportional scaling algorithm
  const handleSliderChange = (key: string, newValue: number) => {
    const otherKeys = Object.keys(values).filter(k => k !== key);
    const otherSum = otherKeys.reduce((sum, k) => sum + values[k], 0);
    const remaining = 100 - newValue;

    if (otherSum === 0 || remaining < 0) {
      // Distribute evenly among other sliders
      const perSlider = Math.max(0, remaining) / otherKeys.length;
      const newValues: Record<string, number> = { [key]: newValue };
      otherKeys.forEach(k => {
        newValues[k] = perSlider;
      });
      setValues(newValues);
    } else {
      // Scale proportionally based on current ratios
      const scaleFactor = remaining / otherSum;
      const newValues: Record<string, number> = { [key]: newValue };
      otherKeys.forEach(k => {
        newValues[k] = values[k] * scaleFactor;
      });
      setValues(newValues);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) return;

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    const formData = {
      name: name.trim(),
      team: team.trim(),
      time_allocation: values
    };

    const result = await submitSurvey(formData);

    setIsSubmitting(false);

    if (result.success) {
      // 提交成功，设置成功状态
      setSubmitStatus({
        type: 'success',
        message: result.message
      });
    } else {
      // 提交失败，只显示错误信息
      setSubmitStatus({
        type: 'error',
        message: result.message
      });
    }
  };

  // 如果提交成功，显示感谢页面
  if (submitStatus.type === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <Card className="border-2 border-emerald-200 bg-emerald-50/50 backdrop-blur-sm max-w-2xl w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            {/* 成功图标 */}
            <div className="flex justify-center">
              <div className="rounded-full bg-emerald-100 p-4">
                <svg
                  className="w-16 h-16 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* 感谢文字 */}
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-gray-900">
                感谢您的填写！
              </h2>
              <p className="text-lg text-gray-700">
                您的问卷已成功提交
              </p>
              <p className="text-sm text-gray-600">
                您的反馈对我们评估 AI 研发提效非常重要
              </p>
            </div>

            {/* 提交信息 */}
            <div className="bg-white rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">提交人：</span>
                <span className="font-medium text-gray-900">{name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">所属小组：</span>
                <span className="font-medium text-gray-900">{team}</span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 justify-center pt-4">
              <Button
                onClick={() => {
                  // 重置表单
                  setName('');
                  setTeam('');
                  setSubmitStatus({ type: null, message: '' });
                  // 重置滑块值
                  const initial: Record<string, number> = {};
                  const allFields = [
                    ...SURVEY_CATEGORIES.developmentProcess.fields,
                    ...SURVEY_CATEGORIES.dailyTasks.fields
                  ];
                  const equalValue = 100 / allFields.length;
                  allFields.forEach(field => {
                    initial[field.key] = equalValue;
                  });
                  setValues(initial);
                }}
                size="lg"
              >
                再填一份
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-2 border-indigo-200 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl">基本信息</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">姓名 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入您的姓名"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team">小组 *</Label>
            <Select value={team} onValueChange={setTeam} required>
              <SelectTrigger>
                <SelectValue placeholder="请选择您的小组" />
              </SelectTrigger>
              <SelectContent>
                {TEAM_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <SliderGroup
        title={SURVEY_CATEGORIES.developmentProcess.title}
        fields={SURVEY_CATEGORIES.developmentProcess.fields}
        values={values}
        groupSum={totals.devSum}
        onChange={handleSliderChange}
      />

      <SliderGroup
        title={SURVEY_CATEGORIES.dailyTasks.title}
        fields={SURVEY_CATEGORIES.dailyTasks.fields}
        values={values}
        groupSum={totals.dailySum}
        onChange={handleSliderChange}
      />

      <ValidationDisplay
        total={totals.total}
        isValid={isValid}
      />

      {submitStatus.type === 'error' && (
        <div className="p-4 rounded-lg bg-rose-50 text-rose-900 border border-rose-200">
          {submitStatus.message}
        </div>
      )}

      <Button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting && (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {isSubmitting ? '提交中...' : '提交问卷'}
      </Button>
    </form>
  );
}
