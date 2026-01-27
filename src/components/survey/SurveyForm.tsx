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
      ...values
    } as any;

    const result = await submitSurvey(formData);

    setIsSubmitting(false);
    setSubmitStatus({
      type: result.success ? 'success' : 'error',
      message: result.message
    });
  };

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

      {submitStatus.type && (
        <div
          className={`p-4 rounded-lg ${
            submitStatus.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      <Button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? '提交中...' : '提交问卷'}
      </Button>
    </form>
  );
}
