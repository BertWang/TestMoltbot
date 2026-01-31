import { AIProviderInterface, ProcessedNote, SuggestionResult, APIUsage } from '../types';
import fs from 'fs';

/**
 * Google Cloud Vision OCR 提供商實現
 * 支援高精度 OCR 和多語言識別
 */
export class GoogleVisionProvider implements AIProviderInterface {
  private apiKey: string;
  private endpoint: string = 'https://vision.googleapis.com/v1';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Google Cloud Vision API key is required');
    }
    this.apiKey = apiKey;
  }

  async processNote(filePath: string, mimeType: string = 'image/jpeg'): Promise<ProcessedNote> {
    try {
      // 讀取檔案為 base64
      const imageData = fs.readFileSync(filePath);
      const base64Image = imageData.toString('base64');

      // 構建請求
      const request = {
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'DOCUMENT_TEXT_DETECTION',
                maxResults: 1,
              },
              {
                type: 'TEXT_DETECTION',
                maxResults: 10,
              },
            ],
            imageContext: {
              languageHints: ['zh-TW', 'zh', 'en'],
            },
          },
        ],
      };

      // 呼叫 Google Cloud Vision API
      const response = await fetch(
        `${this.endpoint}/images:annotate?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new Error(`Google Vision API error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.responses || result.responses.length === 0) {
        throw new Error('No response from Google Vision API');
      }

      const annotations = result.responses[0];

      if (annotations.error) {
        throw new Error(`Google Vision API error: ${annotations.error.message}`);
      }

      // 提取文本
      let rawOcr = '';
      let confidence = 0;

      if (annotations.textAnnotations && annotations.textAnnotations.length > 0) {
        // 使用完整文本注釋（第一個是整個文本）
        rawOcr = annotations.textAnnotations[0].description || '';
        
        // 計算置信度
        const confidences = annotations.textAnnotations
          .slice(1)
          .map((a: any) => a.confidence || 0.5);
        confidence = confidences.length > 0
          ? confidences.reduce((a: number, b: number) => a + b) / confidences.length
          : 0.8;
      }

      if (!rawOcr) {
        throw new Error('No text detected in image');
      }

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
      console.error('Google Vision OCR Error:', error);
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
      await this.testConnection();
      return true;
    } catch {
      return false;
    }
  }

  async testConnection(): Promise<void> {
    try {
      // 測試 API 金鑰有效性
      const response = await fetch(
        `${this.endpoint}/projects:batchAnnotateImages?key=${this.apiKey}`,
        {
          method: 'OPTIONS',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200 && response.status !== 204 && response.status !== 405) {
        throw new Error(`Connection test failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Google Vision connection test failed:', error);
      throw new Error('無法連接 Google Cloud Vision，請檢查 API 密鑰和配額');
    }
  }

  async getUsage?(): Promise<APIUsage> {
    return {
      requestsToday: 0,
      requestsThisMonth: 0,
      quotaLimit: 0,
    };
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
    // 簡單的標籤提取（提取常見詞彙）
    const keywords = text.match(/\b[a-zA-Z]{4,}\b/gi) || [];
    const uniqueKeywords = [...new Set(keywords)];
    return uniqueKeywords.slice(0, 5).map(k => k.toLowerCase());
  }
}

export default GoogleVisionProvider;
