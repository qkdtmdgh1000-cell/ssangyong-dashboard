import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <AlertTriangle size={40} className="text-red-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
        데이터를 불러오지 못했습니다
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
        {error?.message || '알 수 없는 오류가 발생했습니다.'}
      </p>
      {resetErrorBoundary && (
        <button
          onClick={resetErrorBoundary}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
        >
          <RefreshCw size={15} />
          다시 시도
        </button>
      )}
    </div>
  );
}
