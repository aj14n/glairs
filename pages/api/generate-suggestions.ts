import { OpenAI } from 'openai';
import { NextApiRequest, NextApiResponse } from 'next';

// 配置常量
const OPENAI_CONFIG = {
    apiKey: "sk-kmmbxeortmzlNsst371c2e6a92C8489fBd0a722a601565Fd",
    //   apiKey: "sk-YOUR-KEY-HERE",
    baseURL: "https://aihubmix.com/v1"
};

const SYSTEM_PROMPT = `
你是一位专业的旅游纪念品设计专家。用户将提供某个旅游景点的背景信息，你需要根据这些信息来构思5个符合主题的纪念品设计方案。所有结果以JSON格式返回。

每个方案都应该遵循以下思考步骤：
第一步，从背景信息中提取一个具体的设计元素，填写elementExtraction。
第二步，根据设计元素联想可能的纪念品具体实现形式，旅游周边产品需要兼具实用性和纪念性、小巧便携、售价不能过于昂贵。填写productName。
第三步，分析方案与设计元素的关联，填写description。
第四步，将设计方案提炼为适合AI图像生成的英文提示词，包括产品的形态、颜色、材质、风格等细节。填写shapePrompt。注意，使用直白的、具体的、关于对象本身属性的描述，避免使用抽象描述。使用单词和短句描述，避免使用复杂长句型。

以下是一个对话案例参考：
USER: 
"""
黄山以其“五绝”著称于世，即奇松、怪石、云海、温泉和冬雪。奇松以其坚韧和形态各异而著名，怪石则因其形状奇特、惟妙惟肖而引人入胜。云海是黄山的一大特色，常年缭绕于山间，给人以梦幻般的感觉。温泉则为游客提供了放松身心的好去处，而冬雪则为黄山披上了一层银装素裹，呈现出别样的冬日风情。
"""
ASSISTANT: 
"""
{
    "suggestions": [
    {
      "elementExtraction": "云海",
      "productName": "黄山云海主题围巾 Huangshan Cloud Sea Scarf",
      "description": "将黄山云海的梦幻感融入到围巾的设计中，采用柔软丝绸或羊毛面料，以抽象画风印制云海纹理和山峰轮廓，配以渐变蓝白色调，象征清晨的山间雾气。",
      "shapePrompt": "modern product design, large soft long silk scarf, knotted tassels, abstract mountain silhouettes and misty cloud patterns, gradient white and light blue, elegant and lightweight design, simple background, indoor photography lighting, professional studio product photography"
    }
  ]
}
"""
`

// 提示词模板
const PROMPT_TEMPLATE = `作为一位旅游纪念品设计专家，请基于以下旅游地点描述，提供5个独特的纪念品设计建议:

地点描述:
{location_description}

请以JSON格式返回5个设计建议，确保返回格式严格符合以下JSON结构:
{
  "suggestions": [
    {
      "elementExtraction": "设计元素提取",
      "productName": "产品名称 Product Name",
      "description": "产品设计理念",
      "shapePrompt": "detailed prompts in English for AI image generation"
    }
  ]
}`;

// 添加接口定义
interface Suggestion {
    productName: string;
    description: string;
    shapePrompt: string;
}

interface ApiResponse {
    success: boolean;
    suggestions?: Suggestion[];
    error?: string;
    details?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: '仅支持POST请求 Only POST method is supported'
        });
    }

    try {
        const { locationDescription } = req.body;

        // 验证输入
        if (!locationDescription?.trim()) {
            return res.status(400).json({
                success: false,
                error: '地点描述不能为空 Location description cannot be empty'
            });
        }

        // 初始化OpenAI客户端
        const openai = new OpenAI({
            apiKey: OPENAI_CONFIG.apiKey,
            baseURL: OPENAI_CONFIG.baseURL
        });

        console.log('=== 开始生成建议 Starting Generation ===');
        console.log('输入描述 Input:', locationDescription);

        // 调用API
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: PROMPT_TEMPLATE.replace('{location_description}', locationDescription)
                }
            ],
            response_format: { type: "json_object" }
        });

        // 获取响应
        const rawResponse = completion.choices[0].message.content;
        if (!rawResponse) {
            throw new Error('API返回内容为空 Empty API response');
        }

        // 解析JSON
        const parsedResponse = JSON.parse(rawResponse);

        // 验证响应结构
        if (!parsedResponse.suggestions || !Array.isArray(parsedResponse.suggestions)) {
            throw new Error('API返回格式错误 Invalid API response format');
        }

        // 数据清洗和验证
        const validatedSuggestions = parsedResponse.suggestions.map((suggestion: Suggestion, index: number) => ({
            id: index + 1,
            productName: suggestion.productName || '未命名产品 Unnamed Product',
            description: suggestion.description || '暂无描述 No Description',
            shapePrompt: suggestion.shapePrompt || ''
        }));

        console.log('=== 生成完成 Generation Completed ===');
        console.log('处理后的建议 Processed Suggestions:', validatedSuggestions);

        // 返回成功响应
        return res.status(200).json({
            success: true,
            suggestions: validatedSuggestions
        });

    } catch (error) {
        console.error('=== 错误 Error ===', error);
        const errorMessage = error instanceof Error ? error.message : '未知错误 Unknown error';

        return res.status(500).json({
            success: false,
            error: `生成建议失败 Failed to generate suggestions: ${errorMessage}`,
            details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
        });
    }
} 