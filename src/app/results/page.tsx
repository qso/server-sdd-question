'use client';

import { useEffect, useState, useMemo, Fragment } from 'react';
import { ROLE_TYPES, ROLE_OPTIONS, getCategoriesByRole } from '@/lib/constants';
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
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

interface SurveyResponse {
  id: number;
  name: string;
  team: string;
  role?: string;
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
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>(ROLE_TYPES.SERVER);

  useEffect(() => {
    async function fetchResponses() {
      try {
        const res = await fetch('/api/responses');
        const data = await res.json();

        const processed = data.map((response: SurveyResponse) => {
          const timeAllocation = typeof response.time_allocation === 'string'
            ? JSON.parse(response.time_allocation)
            : response.time_allocation;

          const role = response.role || 'server';
          const categories = getCategoriesByRole(role);

          const devSum = categories.developmentProcess.fields
            .reduce((sum, field) => sum + (Number(timeAllocation[field.key]) || 0), 0);

          const dailySum = categories.dailyTasks.fields
            .reduce((sum, field) => sum + (Number(timeAllocation[field.key]) || 0), 0);

          return {
            ...response,
            role,
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
    // 首先按职能过滤
    const roleFiltered = responses.filter(r => r.role === selectedRole);

    if (!searchQuery.trim()) {
      return roleFiltered;
    }
    return roleFiltered.filter(response =>
      response.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [responses, searchQuery, selectedRole]);

  // 获取当前职能的配置
  const currentCategories = useMemo(() => getCategoriesByRole(selectedRole), [selectedRole]);

  // 统计数据 - 基于过滤后的响应
  const stats = useMemo(() => {
    if (filteredResponses.length === 0) return null;

    const totalResponses = filteredResponses.length;
    const avgDevProcess = filteredResponses.reduce((sum, r) => sum + r.devSum, 0) / totalResponses;
    const avgDailyTasks = filteredResponses.reduce((sum, r) => sum + r.dailySum, 0) / totalResponses;

    // 每个字段的平均值
    const fieldAverages: Record<string, number> = {};
    const allFields = [
      ...currentCategories.developmentProcess.fields,
      ...currentCategories.dailyTasks.fields
    ];

    allFields.forEach(field => {
      const sum = filteredResponses.reduce((s, r) => s + (r.timeAllocation[field.key] || 0), 0);
      fieldAverages[field.key] = sum / totalResponses;
    });

    return {
      totalResponses,
      avgDevProcess,
      avgDailyTasks,
      fieldAverages
    };
  }, [filteredResponses, currentCategories]);

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

    const data = currentCategories.developmentProcess.fields.map(field => ({
      name: field.label,
      value: Number(stats.fieldAverages[field.key].toFixed(2))
    }));

    // 处理标签：移除括号内容并截断过长文本
    const processLabel = (label: string) => {
      // 移除括号及其内容
      const withoutParentheses = label.replace(/[（(].*?[）)]/g, '').trim();
      // 如果长度超过10个字符，截断并添加省略号
      return withoutParentheses.length > 10
        ? withoutParentheses.slice(0, 10) + '...'
        : withoutParentheses;
    };

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const dataIndex = params[0].dataIndex;
          return `${data[dataIndex].name}: ${params[0].value}%`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(d => processLabel(d.name)),
        axisLabel: {
          rotate: 45,
          interval: 0,
          fontSize: 11
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
  }, [stats, currentCategories]);

  // ECharts 配置 - 日常事项柱状图
  const dailyTasksBarOption = useMemo(() => {
    if (!stats) return {};

    const data = currentCategories.dailyTasks.fields.map(field => ({
      name: field.label,
      value: Number(stats.fieldAverages[field.key].toFixed(2))
    }));

    // 处理标签：移除括号内容并截断过长文本
    const processLabel = (label: string) => {
      // 移除括号及其内容
      const withoutParentheses = label.replace(/[（(].*?[）)]/g, '').trim();
      // 如果长度超过10个字符，截断并添加省略号
      return withoutParentheses.length > 10
        ? withoutParentheses.slice(0, 10) + '...'
        : withoutParentheses;
    };

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const dataIndex = params[0].dataIndex;
          return `${data[dataIndex].name}: ${params[0].value}%`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(d => processLabel(d.name)),
        axisLabel: {
          rotate: 45,
          interval: 0,
          fontSize: 11
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
            color: '#06b6d4'
          }
        }
      ]
    };
  }, [stats, currentCategories]);

  // 按小组统计 - 基于过滤后的响应
  const teamStats = useMemo(() => {
    const teamMap = new Map<string, { count: number; avgDev: number; avgDaily: number }>();

    filteredResponses.forEach(r => {
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
  }, [filteredResponses]);

  // 获取小组的详细时间分布
  const getTeamDetailData = (teamName: string) => {
    const teamResponses = filteredResponses.filter(r => r.team === teamName);
    if (teamResponses.length === 0) return [];

    // 计算每个字段的平均值
    const allFields = [
      ...currentCategories.developmentProcess.fields.map(f => ({ ...f, category: 'dev' })),
      ...currentCategories.dailyTasks.fields.map(f => ({ ...f, category: 'daily' }))
    ];

    const fieldData = allFields.map(field => {
      const sum = teamResponses.reduce((s, r) => s + (r.timeAllocation[field.key] || 0), 0);
      const avg = sum / teamResponses.length;
      return {
        label: field.label,
        value: Number(avg.toFixed(2)),
        category: field.category
      };
    });

    // 按百分比从大到小排列
    return fieldData.sort((a, b) => b.value - a.value);
  };

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

      {/* 职能TAB切换 */}
      <Tabs value={selectedRole} onValueChange={setSelectedRole}>
        <TabsList className="grid w-full grid-cols-3">
          {ROLE_OPTIONS.map(option => (
            <TabsTrigger key={option.value} value={option.value}>
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {ROLE_OPTIONS.map(option => (
          <TabsContent key={option.value} value={option.value} className="space-y-6">
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
                  <TableHead className="text-right">操作</TableHead>
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
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTeam(stat.team)}
                      >
                        <Info className="w-4 h-4 mr-1" />
                        详情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* 小组详情弹窗 */}
      <Dialog open={selectedTeam !== null} onOpenChange={(open: boolean) => !open && setSelectedTeam(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTeam} - 时间比例分布</DialogTitle>
          </DialogHeader>
          {selectedTeam && (() => {
            const teamData = getTeamDetailData(selectedTeam);
            // 处理标签：移除括号内容并截断过长文本
            const processLabel = (label: string) => {
              const withoutParentheses = label.replace(/[（(].*?[）)]/g, '').trim();
              return withoutParentheses.length > 12
                ? withoutParentheses.slice(0, 12) + '...'
                : withoutParentheses;
            };

            return (
              <div className="mt-4">
                <ReactECharts
                  option={{
                    tooltip: {
                      trigger: 'axis',
                      axisPointer: {
                        type: 'shadow'
                      },
                      formatter: (params: any) => {
                        const dataIndex = params[0].dataIndex;
                        return `${teamData[dataIndex].label}: ${params[0].value}%`;
                      }
                    },
                    grid: {
                      left: '18%',
                      right: '4%',
                      bottom: '3%',
                      top: '3%',
                      containLabel: true
                    },
                    xAxis: {
                      type: 'value',
                      name: '时间占比 (%)',
                      axisLabel: {
                        formatter: '{value}%'
                      }
                    },
                    yAxis: {
                      type: 'category',
                      data: teamData.map(d => processLabel(d.label)),
                      axisLabel: {
                        interval: 0,
                        fontSize: 11
                      }
                    },
                  series: [
                    {
                      type: 'bar',
                      data: teamData.map(d => ({
                        value: d.value,
                        itemStyle: {
                          color: d.category === 'dev' ? '#1e40af' : '#7dd3fc'
                        }
                      })),
                      barWidth: '60%',
                      label: {
                        show: true,
                        position: 'right',
                        formatter: '{c}%'
                      }
                    }
                  ]
                }}
                style={{ height: '600px' }}
              />
            </div>
          );
          })()}
        </DialogContent>
      </Dialog>

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
                    <Fragment key={response.id}>
                      <TableRow className="cursor-pointer hover:bg-gray-50">
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
                                  {currentCategories.developmentProcess.fields.map(field => (
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
                                  {currentCategories.dailyTasks.fields.map(field => (
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
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
