export const SURVEY_CATEGORIES = {
  developmentProcess: {
    title: "研发流程全过程",
    fields: [
      { key: 'requirement_review', label: '需求评审' },
      { key: 'task_breakdown', label: '拆单排期' },
      { key: 'technical_proposal_output', label: '技术方案产出' },
      { key: 'technical_proposal_review', label: '技术方案评审' },
      { key: 'test_case_output', label: '测试用例产出' },
      { key: 'test_case_review', label: '测试用例评审' },
      { key: 'code_development', label: '代码开发' },
      { key: 'feature_integration', label: '功能联调' },
      { key: 'smoke_testing', label: '冒烟测试' },
      { key: 'functional_testing', label: '功能测试' },
      { key: 'bugfix', label: 'Bugfix' },
      { key: 'code_review', label: '代码Review' },
      { key: 'feature_launch', label: '功能上线' }
    ]
  },
  dailyTasks: {
    title: "日常事项",
    fields: [
      { key: 'alert_management', label: '告警治理' },
      { key: 'exception_logs', label: '异常日志' },
      { key: 'daily_qa', label: '日常答疑' },
      { key: 'public_opinion', label: '舆情排查' },
      { key: 'meetings', label: '开会' },
      { key: 'online_emergency', label: '线上问题应急' }
    ]
  }
} as const;

export const TEAM_OPTIONS = [
  '会员业务技术组',
  '内容运营技术组',
  '平台服务端技术组',
  '长音频直播技术组',
  '心遇业务技术组',
  'AIGC社交技术组',
  '稳定性架构组',
  '业务中间件组',
  '安全风控技术组',
  '音乐内容技术组'
] as const;

export type CategoryKey = keyof typeof SURVEY_CATEGORIES;
export type FieldKey = typeof SURVEY_CATEGORIES[CategoryKey]['fields'][number]['key'];
export type TeamOption = typeof TEAM_OPTIONS[number];
