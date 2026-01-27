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
import { Toaster, toast } from 'sonner';

export default function SurveyForm() {
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Initialize slider values with custom default distribution
  const [values, setValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};

    // 预设值：技术方案产出10%、代码开发30%、功能联调10%、功能上线10%、告警治理5%、异常日志5%、日常答疑10%
    const presetValues: Record<string, number> = {
      'technical_proposal_output': 10,
      'code_development': 30,
      'feature_integration': 10,
      'feature_launch': 10,
      'alert_management': 5,
      'exception_logs': 5,
      'daily_qa': 10
    };

    // 计算预设值总和
    const presetSum = Object.values(presetValues).reduce((sum, val) => sum + val, 0);

    // 剩余需要分配的百分比
    const remaining = 100 - presetSum;

    // 收集所有字段
    const allFields = [
      ...SURVEY_CATEGORIES.developmentProcess.fields,
      ...SURVEY_CATEGORIES.dailyTasks.fields
    ];

    // 找出没有预设值的字段
    const unassignedFields = allFields.filter(field => !presetValues[field.key]);

    // 平均分配剩余百分比
    const equalValue = remaining / unassignedFields.length;

    // 设置初始值
    allFields.forEach(field => {
      initial[field.key] = presetValues[field.key] ?? equalValue;
    });

    return initial;
  });

  // Initialize lock states (all unlocked by default)
  const [lockedFields, setLockedFields] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    const allFields = [
      ...SURVEY_CATEGORIES.developmentProcess.fields,
      ...SURVEY_CATEGORIES.dailyTasks.fields
    ];
    allFields.forEach(field => {
      initial[field.key] = false;
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

  // Simple slider change handler - no proportional scaling
  const handleSliderChange = (key: string, newValue: number) => {
    setValues(prev => ({
      ...prev,
      [key]: newValue
    }));
  };

  // Toggle lock state for a field
  const toggleLock = (key: string) => {
    setLockedFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Auto-adjust unlocked fields to sum to 100%
  const handleAutoAdjust = () => {
    // Calculate sum of locked fields
    const lockedSum = Object.entries(values).reduce((sum, [key, value]) => {
      return sum + (lockedFields[key] ? value : 0);
    }, 0);

    // Check if locked fields already exceed 100%
    if (lockedSum > 100) {
      toast.error('锁定项目的比例之和超过了100%，无法自动调整', {
        description: `锁定项目总和: ${lockedSum.toFixed(1)}%`
      });
      return;
    }

    // Calculate remaining percentage for unlocked fields
    const remaining = 100 - lockedSum;

    // Get unlocked field keys
    const unlockedKeys = Object.keys(values).filter(key => !lockedFields[key]);

    if (unlockedKeys.length === 0) {
      toast.error('所有项目都已锁定，无法自动调整');
      return;
    }

    // Calculate current sum of unlocked fields
    const unlockedSum = unlockedKeys.reduce((sum, key) => sum + values[key], 0);

    // Proportionally adjust unlocked fields
    const newValues = { ...values };
    if (unlockedSum === 0) {
      // Distribute evenly if all unlocked fields are 0
      const perField = remaining / unlockedKeys.length;
      unlockedKeys.forEach(key => {
        newValues[key] = perField;
      });
    } else {
      // Scale proportionally based on current ratios
      const scaleFactor = remaining / unlockedSum;
      unlockedKeys.forEach(key => {
        newValues[key] = values[key] * scaleFactor;
      });
    }

    setValues(newValues);
    toast.success('自动调整完成', {
      description: '已将非锁定项目的比例调整至总和100%'
    });
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

                  // 重置滑块值（使用新的预设值）
                  const initial: Record<string, number> = {};
                  const presetValues: Record<string, number> = {
                    'technical_proposal_output': 10,
                    'code_development': 30,
                    'feature_integration': 10,
                    'feature_launch': 10,
                    'alert_management': 5,
                    'exception_logs': 5,
                    'daily_qa': 10
                  };
                  const presetSum = Object.values(presetValues).reduce((sum, val) => sum + val, 0);
                  const remaining = 100 - presetSum;
                  const allFields = [
                    ...SURVEY_CATEGORIES.developmentProcess.fields,
                    ...SURVEY_CATEGORIES.dailyTasks.fields
                  ];
                  const unassignedFields = allFields.filter(field => !presetValues[field.key]);
                  const equalValue = remaining / unassignedFields.length;
                  allFields.forEach(field => {
                    initial[field.key] = presetValues[field.key] ?? equalValue;
                  });
                  setValues(initial);

                  // 重置锁定状态
                  const initialLocks: Record<string, boolean> = {};
                  allFields.forEach(field => {
                    initialLocks[field.key] = false;
                  });
                  setLockedFields(initialLocks);
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
    <>
      <Toaster position="top-center" richColors />
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
          lockedFields={lockedFields}
          onToggleLock={toggleLock}
        />

        <SliderGroup
          title={SURVEY_CATEGORIES.dailyTasks.title}
          fields={SURVEY_CATEGORIES.dailyTasks.fields}
          values={values}
          groupSum={totals.dailySum}
          onChange={handleSliderChange}
          lockedFields={lockedFields}
          onToggleLock={toggleLock}
        />

        <ValidationDisplay
          total={totals.total}
          isValid={isValid}
          onAutoAdjust={handleAutoAdjust}
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
    </>
  );
}
