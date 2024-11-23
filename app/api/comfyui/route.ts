import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const SERVER_ADDRESS = "127.0.0.1:8188";

export async function POST(req: Request) {
    try {
        const { 
            promptText, 
            shapeReference, 
            materialReference, 
            shapeStrength, 
            materialStrength 
        } = await req.json();

        // 根据参考图情况选择工作流文件
        let workflowPath;
        if (shapeReference && materialReference) {
            // 情况b：同时使用两张参考图
            workflowPath = path.join(
                process.cwd(),
                'comfyui-workflow',
                'image-reference-both-api-1123.json'
            );
        } else if (shapeReference || materialReference) {
            // 情况a：使用单张参考图
            workflowPath = path.join(
                process.cwd(),
                'comfyui-workflow',
                'image-reference-api-1123.json'
            );
        } else {
            // 情况c：基础文生图
            workflowPath = path.join(
                process.cwd(),
                'comfyui-workflow',
                'basic-t2i-api-1123.json'
            );
        }

        const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

        // 更新提示词
        workflow["6"]["inputs"]["text"] = promptText;

        // 处理参考图相关设置
        if (shapeReference && materialReference) {
            // 情况b：设置两张参考图
            workflow["13"]["inputs"]["image"] = path.join(process.cwd(), 'public', shapeReference);
            workflow["19"]["inputs"]["image"] = path.join(process.cwd(), 'public', materialReference);
            workflow["18"]["inputs"]["weight_style"] = materialStrength || 0.5;
            workflow["18"]["inputs"]["weight_composition"] = shapeStrength || 0.5;
        } else if (shapeReference || materialReference) {
            // 情况a：设置单张参考图
            const reference = shapeReference || materialReference;
            workflow["13"]["inputs"]["image"] = path.join(process.cwd(), 'public', reference);
            workflow["22"]["inputs"]["weight"] = shapeReference ? shapeStrength : materialStrength || 0.5;
            workflow["22"]["inputs"]["weight_type"] = shapeReference ? "composition" : "style transfer";
        }

        // 生成随机种子
        workflow["3"]["inputs"]["seed"] = Math.floor(Math.random() * 1000000);

        // 添加日志输出
        console.log('发送给ComfyUI的完整workflow:', JSON.stringify(workflow, null, 2));

        // WebSocket 连接和处理部分保持不变
        const clientId = crypto.randomUUID();
        const ws = new WebSocket(`ws://${SERVER_ADDRESS}/ws?clientId=${clientId}`);

        const result = await new Promise((resolve, reject) => {
            ws.on('open', async () => {
                try {
                    // 发送生成请求
                    const response = await fetch(`http://${SERVER_ADDRESS}/prompt`, {
                        method: 'POST',
                        body: JSON.stringify({
                            prompt: workflow,
                            client_id: clientId
                        })
                    });
                    const { prompt_id } = await response.json();

                    // 监听WebSocket消息
                    ws.on('message', async (data) => {
                        const message = JSON.parse(data.toString());
                        if (message.type === 'executing' && message.data.node === null) {
                            // 获取生成结果
                            const historyResponse = await fetch(`http://${SERVER_ADDRESS}/history/${prompt_id}`);
                            const history = await historyResponse.json();

                            // 获取并保存图片
                            const outputs = history[prompt_id].outputs;
                            for (const nodeId in outputs) {
                                if (outputs[nodeId].images) {
                                    for (const image of outputs[nodeId].images) {
                                        const imageResponse = await fetch(`http://${SERVER_ADDRESS}/view?filename=${image.filename}&subfolder=${image.subfolder}&type=${image.type}`);
                                        const imageBuffer = await imageResponse.arrayBuffer();

                                        // 保存图片到本地
                                        const timestamp = Date.now();
                                        const outputPath = path.join(process.cwd(), 'public', 'output', `generated_${timestamp}.png`);
                                        fs.writeFileSync(outputPath, Buffer.from(imageBuffer));

                                        resolve(`/output/generated_${timestamp}.png`);
                                    }
                                }
                            }
                            ws.close();
                        }
                    });
                } catch (error) {
                    reject(error);
                }
            });
        });

        return NextResponse.json({ 
            success: true, 
            imagePath: result,
            workflow: workflow
        });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            },
            { status: 500 }
        );
    }
} 