
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AISimulationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 自然語言解析記帳
export const parseNaturalLanguageTransaction = async (text: string): Promise<Partial<Transaction>> => {
  const prompt = `
    你是一個記帳助手。請解析以下文字並返回結構化 JSON：
    文字： "${text}"
    要求：
    1. amount: 數字
    2. category: 從 [餐飲食品, 交通運輸, 購物休閒, 娛樂生活, 居家住宅, 公共帳單, 醫療保健, 薪資收入, 投資獲利, 訂閱服務, 其他] 中選一
    3. description: 簡短描述
    4. type: income 或 expense
    5. merchant: 識別商家（若有）
    
    現在日期是 ${new Date().toISOString().split('T')[0]}。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { type: Type.STRING },
            merchant: { type: Type.STRING }
          }
        }
      }
    });
    // Ensure .text property is used directly
    return JSON.parse(response.text || '{}');
  } catch (err) {
    console.error(err);
    return {};
  }
};

// 從截圖中提取交易明細
export const parseTransactionsFromImage = async (base64DataUrl: string): Promise<Partial<Transaction>[]> => {
  // Extract data and mimeType from base64 string
  const [header, data] = base64DataUrl.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';

  const prompt = `
    你是一個記帳助手。請從這張截圖中提取所有的記帳明細，並返回 JSON 陣列。
    每個物件包含：
    1. amount: 數字
    2. category: 從 [餐飲食品, 交通運輸, 購物休閒, 娛樂生活, 居家住宅, 公共帳單, 醫療保健, 薪資收入, 投資獲利, 訂閱服務, 其他] 中選一
    3. description: 描述
    4. type: income 或 expense
    5. date: YYYY-MM-DD (若無則用今天：${new Date().toISOString().split('T')[0]})
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { type: Type.STRING },
              date: { type: Type.STRING }
            },
            required: ['amount', 'category', 'description', 'type', 'date']
          }
        }
      }
    });
    // Ensure .text property is used directly
    return JSON.parse(response.text || '[]');
  } catch (err) {
    console.error(err);
    return [];
  }
};

// 財務壓力測試與未來預測
export const getFinancialHealthAnalysis = async (transactions: Transaction[], netWorth: number): Promise<string> => {
  const prompt = `
    基於以下財務數據提供深度分析：
    - 總資產：${netWorth}
    - 最近交易：${JSON.stringify(transactions.slice(0, 10))}
    
    請包含以下三個模塊：
    1. 緊急預備金測試（目前生活水準能撐多久）
    2. 勞動價值提醒（以時薪 200 元計算，最近的高額支出代表多少勞動時間）
    3. 未來 3 個月現金流警示。
    語言：繁體中文（台灣），語氣：親切且具有啟發性。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Ensure .text property is used directly
    return response.text || "無法生成分析報告。";
  } catch (err) {
    return "無法生成分析報告。";
  }
};

// 「如果...會怎樣？」模擬器
export const runFinancialSimulation = async (scenario: string, currentStatus: any): Promise<AISimulationResult> => {
  const prompt = `
    模擬情境： "${scenario}"
    當前狀態： ${JSON.stringify(currentStatus)}
    
    請評估此決定對未來 12 個月現金流的影響。
    返回 JSON：
    - scenario: 簡短描述
    - impactOnCashFlow: 具體的數字變動與存款走勢
    - recommendation: 專業建議
    - safetyScore: 0-100（安全分數）
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenario: { type: Type.STRING },
            impactOnCashFlow: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            safetyScore: { type: Type.NUMBER }
          }
        }
      }
    });
    // Ensure .text property is used directly
    return JSON.parse(response.text || '{}');
  } catch (err) {
    throw err;
  }
};
