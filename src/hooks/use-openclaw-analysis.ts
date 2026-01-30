import { useEffect, useState, useCallback } from 'react';

interface OpenClawAnalysis {
  recommendations: string[];
  issues: Array<{
    severity: 'error' | 'warning' | 'info';
    message: string;
    suggestion: string;
  }>;
  optimizations: Array<{
    category: string;
    current: string;
    recommended: string;
  }>;
}

/**
 * Hook to integrate with openclaw.ai for system analysis and optimization
 * Helps collect configuration information and provide intelligent recommendations
 */
export function useOpenClawAnalysis(config: {
  aiProvider?: string;
  modelName?: string;
  integrationsCount?: number;
  enabledIntegrationsCount?: number;
}) {
  const [analysis, setAnalysis] = useState<OpenClawAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeConfig = useCallback(async () => {
    if (!config.aiProvider) return;

    setLoading(true);
    setError(null);

    try {
      // 模擬 openclaw.ai API 調用
      // 實際部署時應連接到真實的 openclaw.ai 服務
      const response = await fetch('/api/integrations/openclaw/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // 提供本地分析作為備用
      setAnalysis(getLocalAnalysis(config));
    } finally {
      setLoading(false);
    }
  }, [config]);

  // 在配置改變時自動分析
  useEffect(() => {
    const timer = setTimeout(() => {
      analyzeConfig();
    }, 500);

    return () => clearTimeout(timer);
  }, [config, analyzeConfig]);

  return { analysis, loading, error, analyzeConfig };
}

/**
 * 提供本地配置分析作為備用方案
 */
function getLocalAnalysis(config: {
  aiProvider?: string;
  modelName?: string;
  integrationsCount?: number;
  enabledIntegrationsCount?: number;
}): OpenClawAnalysis {
  const recommendations: string[] = [];
  const issues: OpenClawAnalysis['issues'] = [];
  const optimizations: OpenClawAnalysis['optimizations'] = [];

  // 檢查 AI 提供商
  if (!config.aiProvider) {
    issues.push({
      severity: 'error',
      message: '未配置 AI 提供商',
      suggestion: '前往 AI 設定頁面選擇一個 AI 提供商',
    });
  } else {
    recommendations.push(`✓ AI 提供商已設置為 ${config.aiProvider}`);
  }

  // 檢查模型選擇
  if (config.modelName?.includes('gemini-2.0-flash')) {
    recommendations.push('✓ 使用最新的 Gemini 2.0 Flash 模型 - 最佳性能');
  } else if (config.modelName) {
    issues.push({
      severity: 'info',
      message: `模型: ${config.modelName}`,
      suggestion: '考慮升級到 Gemini 2.0 Flash 以獲得最佳性能',
    });
  }

  // 檢查整合
  if (config.integrationsCount === 0) {
    issues.push({
      severity: 'info',
      message: '未配置任何整合服務',
      suggestion: '添加 MCP 伺服器或 Notion 整合以擴展功能',
    });
  } else if (config.enabledIntegrationsCount === 0) {
    issues.push({
      severity: 'warning',
      message: '配置了整合但未啟用',
      suggestion: '啟用至少一個整合服務以開始使用',
    });
  } else {
    recommendations.push(
      `✓ 已啟用 ${config.enabledIntegrationsCount} 個整合服務`
    );
  }

  // 優化建議
  optimizations.push({
    category: '性能',
    current: 'Stream 模式',
    recommended: '啟用 Stream 以改善大型回應的性能',
  });

  optimizations.push({
    category: '用戶體驗',
    current: '標準聊天',
    recommended: '啟用 Deep Think 模式用於複雜問題',
  });

  return {
    recommendations,
    issues,
    optimizations,
  };
}

/**
 * Hook 用於收集設置建議
 */
export function useSettingSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateSuggestions = useCallback(async () => {
    try {
      const response = await fetch('/api/integrations/openclaw/suggestions');
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    }
  }, []);

  return { suggestions, generateSuggestions };
}
