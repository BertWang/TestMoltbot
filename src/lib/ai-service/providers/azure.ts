import { AIProviderInterface, ProcessedNote, SuggestionResult, APIUsage } from '../types';
import fs from 'fs';

/**
 * Azure Computer Vision OCR 提供商實現
 * 支援多語言 OCR 和文字識別
 */
export class AzureProvider implements AIProviderInterface {
  private endpoint: string;
  private apiKey: string;
  private apiVersion: string = '2024-02-01';

  constructor(endpoint: string, apiKey: string) {
    if (!endpoint || !apiKey) {
      throw new Error('Azure endpoint and API key are required');
    }
    this.endpoint = endpoint.replace(/\/$/, ''); // 移除尾部斜杠
    this.apiKey = apiKey;
  }

  async processNote(filePath: string, _mimeType?: string): Promise<ProcessedNote> {
    try {
      // 讀取檔案為 base64
      const imageData = fs.readFileSync(filePath);
      const base64Image = imageData.toString('base64');

      // 呼叫 Azure 的 Read API
      const analyzeUrl = `${this.endpoint}/vision/v3.2/read/analyzeImage`;
      
      const response = await fetch(analyzeUrl, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/octet-stream',
        },
        body: imageData,
      });

      if (!response.ok) {
        throw new Error(`Azure API error: ${response.status} ${response.statusText}`);
      }

      // 获取操作位置以轮询结果
      const operationLocation = response.headers.get('Operation-Location');
      if (!operationLocation) {
        throw new Error('No Operation-Location header received from Azure');
      }

      // 輪詢結果（最多等待 30 秒）
      const result = await this.pollResult(operationLocation);

      if (!result.analyzeResult || !result.analyzeResult.readResults) {
        throw new Error('No text results from Azure');
      }

      // 提取文本
      const rawOcr = result.analyzeResult.readResults
        .flatMap((r: any) => r.lines.map((l: any) => l.text))
        .join('\n');

      // 提取置信度
      const confidence = result.analyzeResult.readResults
        .flatMap((r: any) => r.lines.flatMap((l: any) => l.words.map((w: any) => w.confidence)))
        .reduce((sum: number, val: number) => sum + val, 0) / (result.analyzeResult.readResults.flatMap((r: any) => r.lines.flatMap((l: any) => l.words)).length || 1);

      // 使用簡單的清理和標記生成
      const refinedContent = this.refineText(rawOcr);
      const summary = await this.generateSummary(rawOcr);
      const tags = await this.generateTags(rawOcr);

      return {
        rawOcr,
        refinedContent,
        summary,
        tags,
        confidence: Math.min(confidence, 1.0),
      };
    } catch (error) {
      console.error('Azure OCR Error:', error);
      throw error;
    }
  }

  async generateSuggestions(text: string): Promise<SuggestionResult[]> {
    // 基本實現：根據文本內容提供建議
    const suggestions: SuggestionResult[] = [];
    
    if (text.length > 1000) {
      suggestions.push({
        title: '內容較長',
        description: '建議將筆記分成多個部分進行組織',
        type: 'action',
      });
    }
    
    if (text.includes('TODO') || text.includes('todo')) {
      suggestions.push({
        title: '檢測到待辦項',
        description: '您可以將這些項目添加到任務列表',
        type: 'action',
      });
    }
    
    return suggestions;
  }

  async generateTags(text: string): Promise<string[]> {
    return this.extractTags(text);
  }

  async generateSummary(text: string): Promise<string> {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) return '無內容';
    
    // 取前 2-3 行作為摘要
    const summary = lines.slice(0, 3).join(' ');
    return summary.length > 100 ? summary.substring(0, 100) + '...' : summary;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.endpoint}/vision/v3.2/models`, {
        method: 'GET',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async testConnection(): Promise<void> {
    try {
      const response = await fetch(`${this.endpoint}/vision/v3.2/models`, {
        method: 'GET',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Azure connection failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Azure connection test failed:', error);
      throw new Error('無法連接 Azure 提供商，請檢查端點和 API 密鑰');
    }
  }

  async getUsage?(): Promise<APIUsage> {
    return {
      requestsToday: 0,
      requestsThisMonth: 0,
      quotaLimit: 0,
    };
  }

  private async pollResult(operationLocation: string, maxAttempts = 30): Promise<any> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await fetch(operationLocation, {
        method: 'GET',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get result: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'succeeded') {
        return result;
      } else if (result.status === 'failed') {
        throw new Error('Azure OCR processing failed');
      }

      // 等待後重試
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Azure OCR processing timeout');
  }

  private refineText(text: string): string {
    // 基本的文本清理
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n\n');
  }

  private extractTags(text: string): string[] {
    // 簡單的標籤提取
    const keywords = text.match(/\b[a-zA-Z]{4,}\b/gi) || [];
    const uniqueKeywords = [...new Set(keywords)];
    return uniqueKeywords.slice(0, 5).map(k => k.toLowerCase());
  }
}

export default AzureProvider;
