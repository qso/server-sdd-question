// 职能类型
export const ROLE_TYPES = {
  SERVER: 'server',
  FRONTEND: 'frontend',
  QA: 'qa'
} as const;

export const ROLE_OPTIONS = [
  { value: ROLE_TYPES.SERVER, label: '服务端' },
  { value: ROLE_TYPES.FRONTEND, label: '大前端' },
  { value: ROLE_TYPES.QA, label: 'QA' }
] as const;

// 服务端配置
export const SERVER_CATEGORIES = {
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
      { key: 'online_emergency', label: '线上问题应急' },
      { key: 'research_and_sharing', label: '调研和分享' },
      { key: 'other', label: '其他' }
    ]
  }
} as const;

export const SERVER_TEAMS = [
  '会员业务技术组',
  '内容运营技术组',
  '用户社区技术组',
  '平台服务端技术组',
  '长音频直播技术组',
  '心遇业务技术组',
  'AIGC社交技术组',
  '稳定性架构组',
  '业务中间件组',
  '安全风控技术组',
  '音乐内容技术组'
] as const;

// 大前端配置
export const FRONTEND_CATEGORIES = {
  developmentProcess: {
    title: "研发流程全过程",
    fields: [
      { key: 'fe_requirement_review', label: '需求评审' },
      { key: 'fe_requirement_communication', label: '需求沟通' },
      { key: 'fe_task_breakdown', label: '拆单排期' },
      { key: 'fe_technical_proposal_output', label: '技术方案产出' },
      { key: 'fe_technical_proposal_review', label: '技术方案评审' },
      { key: 'fe_test_case_output', label: '测试用例产出' },
      { key: 'fe_test_case_review', label: '测试用例评审' },
      { key: 'fe_code_development', label: '代码开发' },
      { key: 'fe_build_package', label: '编译打包' },
      { key: 'fe_feature_integration', label: '功能联调' },
      { key: 'fe_smoke_testing', label: '冒烟测试' },
      { key: 'fe_functional_testing', label: '功能测试' },
      { key: 'fe_bugfix', label: 'Bugfix' },
      { key: 'fe_code_review', label: '代码Review' },
      { key: 'fe_code_merge', label: '代码合入' },
      { key: 'fe_feature_launch', label: '功能上线' }
    ]
  },
  dailyTasks: {
    title: "日常事项",
    fields: [
      { key: 'fe_public_opinion', label: '舆情排查' },
      { key: 'fe_exception_management', label: '异常治理（Crash/ANR等）' },
      { key: 'fe_daily_qa', label: '日常答疑' },
      { key: 'fe_meetings', label: '开会' },
      { key: 'fe_online_emergency', label: '线上应急' },
      { key: 'fe_research_sharing', label: '调研分享' },
      { key: 'fe_other', label: '其他' }
    ]
  }
} as const;

export const FRONTEND_TEAMS = [
  '会员大前端组',
  '平台大前端组',
  '创新大前端组',
  '心遇大前端组',
  '内容大前端组',
  '用户社区大前端组'
] as const;

// QA配置
export const QA_CATEGORIES = {
  developmentProcess: {
    title: "研发流程全过程",
    fields: [
      { key: 'qa_requirement_review', label: '需求评审&澄清' },
      { key: 'qa_scheduling', label: '排期' },
      { key: 'qa_technical_review', label: '技术方案评审' },
      { key: 'qa_test_case_writing', label: '测试方案/用例编写' },
      { key: 'qa_case_review', label: '用例评审' },
      { key: 'qa_functional_testing', label: '功能测试(线下，功能测试、接口测试、回归测试)' },
      { key: 'qa_offline_review', label: '线下走查' },
      { key: 'qa_communication', label: '沟通与协调' },
      { key: 'qa_online_review', label: '线上走查' },
      { key: 'qa_online_quality', label: '线上质量保障（接口巡检、页面巡检、自动化用例补齐、压测等）' },
      { key: 'qa_activity_support', label: '活动走查/保障' }
    ]
  },
  dailyTasks: {
    title: "日常事项",
    fields: [
      { key: 'qa_alert_handling', label: '线上告警处理（gotest、巡检、指标、舆情告警等）' },
      { key: 'qa_daily_qa', label: '日常答疑' },
      { key: 'qa_public_opinion', label: '舆情排查/问题跟进' },
      { key: 'qa_meetings', label: '开会' },
      { key: 'qa_online_issue', label: '线上问题处理' },
      { key: 'qa_research_sharing', label: '调研和分享' },
      { key: 'qa_automation', label: '自动化新增&维护（接口、ui自动化、监控的新增、维护、调优等）' },
      { key: 'qa_tool_development', label: '效率工具研发' },
      { key: 'qa_release_regression', label: '发版回归' },
      { key: 'qa_bugbash', label: 'bugbash' },
      { key: 'qa_requirement_grab', label: '需求抢单' },
      { key: 'qa_special_project', label: '专项（例如mara、dobby等的研发和运营）' },
      { key: 'qa_other', label: '其他（赏金猎人、协助别人构造数据等）' }
    ]
  }
} as const;

export const QA_TEAMS = [
  '内容质量组',
  '平台质量组',
  '创新质量组',
  '稳定性质量组',
  '舆情体验组'
] as const;

// 根据职能获取配置
export function getCategoriesByRole(role: string) {
  switch (role) {
    case ROLE_TYPES.FRONTEND:
      return FRONTEND_CATEGORIES;
    case ROLE_TYPES.QA:
      return QA_CATEGORIES;
    case ROLE_TYPES.SERVER:
    default:
      return SERVER_CATEGORIES;
  }
}

export function getTeamsByRole(role: string) {
  switch (role) {
    case ROLE_TYPES.FRONTEND:
      return FRONTEND_TEAMS;
    case ROLE_TYPES.QA:
      return QA_TEAMS;
    case ROLE_TYPES.SERVER:
    default:
      return SERVER_TEAMS;
  }
}

// 为了向后兼容，保留原有的导出
export const SURVEY_CATEGORIES = SERVER_CATEGORIES;
export const TEAM_OPTIONS = SERVER_TEAMS;

export type CategoryKey = keyof typeof SURVEY_CATEGORIES;
export type FieldKey = typeof SURVEY_CATEGORIES[CategoryKey]['fields'][number]['key'];
export type TeamOption = typeof TEAM_OPTIONS[number];
