import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const SERVER_ADDRESS = "127.0.0.1:8188";

export async function POST(req: Request) {
    try {
        const { promptText, hasReferenceImage, promptImageStrength, referenceMode } = await req.json();

        // 根据是否有参考图选择工作流文件
        const workflowPath = path.join(
            process.cwd(),
            'comfyui-workflow',
            hasReferenceImage ? 'image-reference-api.json' : 'basic-t2i-api.json'
        );

        const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

        // 修改workflow中的提示词
        workflow["6"]["inputs"]["text"] = promptText;

        // 如果有参考图，更新参考图路径和参考强度
        if (hasReferenceImage) {
            // 获取最新的参考图文件
            const inputDir = path.join(process.cwd(), 'public', 'input');
            const files = fs.readdirSync(inputDir);
            const latestFile = files
                .filter(file => file.startsWith('reference_'))
                .sort()
                .reverse()[0];

            if (latestFile) {
                // 记录完整的本地备份路径
                const fullBackupPath = path.join(inputDir, latestFile);
                console.log('本地备份图片路径:', fullBackupPath);

                // 更新工作流中的图片路径
                // TODO: 如果这里是远程服务器，还需要添加保存到云端，记录云端路径
                workflow["13"]["inputs"]["image"] = fullBackupPath;

                // 记录发送给ComfyUI的文件名
                console.log('发送给ComfyUI的文件名:', fullBackupPath);

                // 更新工作流中的参考强度和类型
                workflow["12"]["inputs"]["weight"] = promptImageStrength || 1;
                workflow["12"]["inputs"]["weight_type"] = referenceMode || "ease in-out";
            }
        }

        // 生成随机种子
        workflow["3"]["inputs"]["seed"] = Math.floor(Math.random() * 1000000);

        // 添加日志输出最终的 workflow
        console.log('发送给ComfyUI的完整workflow:', JSON.stringify(workflow, null, 2));

        // 创建WebSocket连接
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
            workflow: workflow  // 添加 workflow 到返回数据中
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