import { getAllSurveyResponses, getSurveyStats } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  try {
    const [responses, stats] = await Promise.all([
      getAllSurveyResponses(),
      getSurveyStats()
    ]);

    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">问卷数据后台</h1>
            <p className="text-muted-foreground">查看所有提交的问卷数据</p>
          </div>
          <Link
            href="/"
            className="text-sm text-indigo-600 hover:text-indigo-800 underline"
          >
            返回问卷
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                总提交数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total_responses || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                平均研发流程占比
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {stats.avg_dev_process ? Number(stats.avg_dev_process).toFixed(1) : '0.0'}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                平均日常事项占比
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {stats.avg_daily_tasks ? Number(stats.avg_daily_tasks).toFixed(1) : '0.0'}%
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>所有提交记录</CardTitle>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无提交数据
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>姓名</TableHead>
                      <TableHead>小组</TableHead>
                      <TableHead>研发流程</TableHead>
                      <TableHead>日常事项</TableHead>
                      <TableHead>更新时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {responses.map((response: any) => {
                      const devSum = Number(response.requirement_analysis || 0) +
                        Number(response.requirement_output || 0) +
                        Number(response.requirement_review || 0) +
                        Number(response.task_breakdown || 0) +
                        Number(response.technical_proposal_output || 0) +
                        Number(response.technical_proposal_review || 0) +
                        Number(response.test_case_output || 0) +
                        Number(response.test_case_review || 0) +
                        Number(response.code_development || 0) +
                        Number(response.feature_integration || 0) +
                        Number(response.smoke_testing || 0) +
                        Number(response.functional_testing || 0) +
                        Number(response.bugfix || 0) +
                        Number(response.code_review || 0) +
                        Number(response.feature_launch || 0);

                      const dailySum = Number(response.alert_management || 0) +
                        Number(response.exception_logs || 0) +
                        Number(response.daily_qa || 0) +
                        Number(response.public_opinion || 0) +
                        Number(response.meetings || 0) +
                        Number(response.online_emergency || 0);

                      return (
                        <TableRow key={response.id}>
                          <TableCell className="font-medium">{response.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{response.team}</Badge>
                          </TableCell>
                          <TableCell>{devSum.toFixed(1)}%</TableCell>
                          <TableCell>{dailySum.toFixed(1)}%</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(response.updated_at).toLocaleString('zh-CN')}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Failed to load admin data:', error);
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-900">
              加载数据失败。请确保数据库已正确配置。
            </p>
            <p className="text-sm text-red-700 mt-2">
              错误信息: {error instanceof Error ? error.message : '未知错误'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}
