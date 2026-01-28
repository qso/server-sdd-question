import SurveyForm from '@/components/survey/SurveyForm';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          AI 研发提效问卷
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          请填写您在日常工作中的时间分配情况
        </p>
        <p className="text-sm text-gray-500">
          调整滑块分配时间比例,总和必须为 100%
        </p>
      </div>

      <SurveyForm />
    </main>
  );
}
