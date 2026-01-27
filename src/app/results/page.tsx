'use client';

import { useEffect, useState, useMemo } from 'react';
import { SURVEY_CATEGORIES } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ReactECharts from 'echarts-for-react';

interface SurveyResponse {
  id: number;
  name: string;
  team: string;
  time_allocation: string | Record<string, number>;
  created_at: string;
  updated_at: string;
}

interface ProcessedResponse extends SurveyResponse {
  timeAllocation: Record<string, number>;
  devSum: number;
  dailySum: number;
}

export default function ResultsPage() {
  const [responses, setResponses] = useState<ProcessedResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchResponses() {
      try {
        const res = await fetch('/api/responses');
        const data = await res.json();

        const processed = data.map((response: SurveyResponse) => {
          const timeAllocation = typeof response.time_allocation === 'string'
            ? JSON.parse(response.time_allocation)
            : response.time_allocation;

          const devSum = SURVEY_CATEGORIES.developmentProcess.fields
            .reduce((sum, field) => sum + (Number(timeAllocation[field.key]) || 0), 0);

          const dailySum = SURVEY_CATEGORIES.dailyTasks.fields
            .reduce((sum, field) => sum + (Number(timeAllocation[field.key]) || 0), 0);

          return {
            ...response,
            timeAllocation,
            devSum,
            dailySum
          };
        });

        setResponses(processed);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch responses:', error);
        setIsLoading(false);
      }
    }

    fetchResponses();
  }, []);

  // 切换行展开状态
  const toggleRow = (id: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 本地搜索
  const filteredResponses = useMemo(() => {
    if (!searchQuery.trim()) {
      return responses;
    }
    return responses.filter(response =>
      response.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [responses, searchQuery]);

  // 统计数据
  const stats = useMemo(() => {
    if (responses.length === 0) return null;

    const totalResponses = responses.length;
    const avgDevProcess = responses.reduce((sum, r) => sum + r.devSum, 0) / totalResponses;
    const avgDailyTasks = responses.reduce((sum, r) => sum + r.dailySum, 0) / totalResponses;

    // 每个字段的平均值
    const fieldAverages: Record<string, number> = {};
    const allFields = [
      ...SURVEY_CATEGORIES.developmentProcess.fields,
      ...SURVEY_CATEGORIES.dailyTasks.fields
    ];

    allFields.forEach(field => {
      const sum = responses.reduce((s, r) => s + (r.timeAllocation[field.key] || 0), 0);
      fieldAverages[field.key] = sum / totalResponses;
    });

    return {
      totalResponses,
      avgDevProcess,
      avgDailyTasks,
      fieldAverages
    };
  }, [responses]);

  // ECharts 配置 - 饼图
  const pieOption = useMemo(() => {
    if (!stats) return {};

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}%'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          type: 'pie',
          radius: '60%',
          data: [
            { value: Number(stats.avgDevProcess.toFixed(2)), name: '研发流程' },
            { value: Number(stats.avgDailyTasks.toFixed(2)), name: '日常事项' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            formatter: '{b}: {c}%'
          }
        }
      ]
    };
  }, [stats]);

  // ECharts 配置 - 研发流程柱状图
  const devProcessBarOption = useMemo(() => {
    if (!stats) return {};

    const data = SURVEY_CATEGORIES.developmentProcess.fields.map(field => ({
      name: field.label,
      value: Number(stats.fieldAverages[field.key].toFixed(2))
    }));

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: '{b}: {c}%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.name),
        axisLabel: {
          rotate: 45,
          interval: 0
        }
      },
      yAxis: {
        type: 'value',
        name: '时间占比 (%)'
      },
      series: [
        {
          type: 'bar',
          data: data.map(d => d.value),
          itemStyle: {
            color: '#4f46e5'
          }
        }
      ]
    };
  }, [stats]);

  // ECharts 配置 - 日常事项柱状图
  const dailyTasksBarOption = useMemo(() => {
    if (!stats) return {};

    const data = SURVEY_CATEGORIES.dailyTasks.fields.map(field => ({
      name: field.label,
      value: Number(stats.fieldAverages[field.key].toFixed(2))
    }));

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: '{b}: {c}%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.name)
      },
      yAxis: {
        type: 'value',
        name: '时间占比 (%)'
      },
      series: [
        {
          type: 'bar',
          data: data.map(d => d.value),
          itemStyle: {
            color: '#06b6d4'
          }
        }
      ]
    };
  }, [stats]);

  // 按小组统计
  const teamStats = useMemo(() => {
    const teamMap = new Map<string, { count: number; avgDev: number; avgDaily: number }>();

    responses.forEach(r => {
      if (!teamMap.has(r.team)) {
        teamMap.set(r.team, { count: 0, avgDev: 0, avgDaily: 0 });
      }
      const stat = teamMap.get(r.team)!;
      stat.count += 1;
      stat.avgDev += r.devSum;
      stat.avgDaily += r.dailySum;
    });

    const result = Array.from(teamMap.entries()).map(([team, stat]) => ({
      team,
      count: stat.count,
      avgDev: stat.avgDev / stat.count,
      avgDaily: stat.avgDaily / stat.count
    }));

    return result.sort((a, b) => b.count - a.count);
  }, [responses]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">问卷结果分析</h1>
        <p className="text-muted-foreground">数据统计与明细</p>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                总提交数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalResponses}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                平均研发流程占比
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.avgDevProcess.toFixed(1)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                平均日常事项占比
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.avgDailyTasks.toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 饼图 - 研发流程 vs 日常事项 */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>时间分配总览</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={pieOption} style={{ height: '400px' }} />
          </CardContent>
        </Card>
      )}

      {/* 柱状图 - 研发流程各环节平均时间 */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>研发流程各环节平均时间分配</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={devProcessBarOption} style={{ height: '400px' }} />
          </CardContent>
        </Card>
      )}

      {/* 柱状图 - 日常事项各环节平均时间 */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>日常事项各环节平均时间分配</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={dailyTasksBarOption} style={{ height: '300px' }} />
          </CardContent>
        </Card>
      )}

      {/* 按小组统计 */}
      {teamStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>按小组统计</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>小组</TableHead>
                  <TableHead className="text-right">提交人数</TableHead>
                  <TableHead className="text-right">平均研发流程</TableHead>
                  <TableHead className="text-right">平均日常事项</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamStats.map((stat) => (
                  <TableRow key={stat.team}>
                    <TableCell>
                      <Badge variant="outline">{stat.team}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{stat.count}</TableCell>
                    <TableCell className="text-right">{stat.avgDev.toFixed(1)}%</TableCell>
                    <TableCell className="text-right">{stat.avgDaily.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* 搜索框和问卷明细列表 */}
      <Card>
        <CardHeader>
          <CardTitle>问卷明细列表</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="按姓名搜索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            {searchQuery && (
              <Badge variant="secondary">
                找到 {filteredResponses.length} 条记录
              </Badge>
            )}
          </div>

          {filteredResponses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? '没有找到匹配的记录' : '暂无数据'}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>姓名</TableHead>
                    <TableHead>小组</TableHead>
                    <TableHead>研发流程</TableHead>
                    <TableHead>日常事项</TableHead>
                    <TableHead>更新时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResponses.map((response) => (
                    <>
                      <TableRow key={response.id} className="cursor-pointer hover:bg-gray-50">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRow(response.id)}
                          >
                            {expandedRows.has(response.id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{response.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{response.team}</Badge>
                        </TableCell>
                        <TableCell>{response.devSum.toFixed(1)}%</TableCell>
                        <TableCell>{response.dailySum.toFixed(1)}%</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(response.updated_at).toLocaleString('zh-CN')}
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(response.id) && (
                        <TableRow key={`${response.id}-detail`}>
                          <TableCell colSpan={6} className="bg-gray-50">
                            <div className="p-4 space-y-4">
                              {/* 研发流程详情 */}
                              <div>
                                <h4 className="font-semibold mb-2">研发流程全过程</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                  {SURVEY_CATEGORIES.developmentProcess.fields.map(field => (
                                    <div key={field.key} className="flex justify-between items-center p-2 bg-white rounded border">
                                      <span className="text-sm text-gray-700">{field.label}</span>
                                      <span className="text-sm font-semibold text-indigo-600">
                                        {(response.timeAllocation[field.key] || 0).toFixed(1)}%
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* 日常事项详情 */}
                              <div>
                                <h4 className="font-semibold mb-2">日常事项</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                  {SURVEY_CATEGORIES.dailyTasks.fields.map(field => (
                                    <div key={field.key} className="flex justify-between items-center p-2 bg-white rounded border">
                                      <span className="text-sm text-gray-700">{field.label}</span>
                                      <span className="text-sm font-semibold text-cyan-600">
                                        {(response.timeAllocation[field.key] || 0).toFixed(1)}%
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
