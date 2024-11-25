'use client'

import { useState, useEffect, memo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Upload, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ImageUploaderProps {
  image: string | null;
  setImage: (value: string | null) => void;
  label: string;
  size?: "small" | "large";
  sshConfig: {
    port: string;
    user: string;
    host: string;
  } | null;
  sshPassword: string;
}

const ImageUploader =
  //  ({ image, setImage, label, size = "small" }
  ({
    image,
    setImage,
    label,
    size = "small",
    sshConfig,
    sshPassword
  }
    : ImageUploaderProps) => {
    const [isDragging, setIsDragging] = useState(false)

    const handleImageUpload = async (file: File, setter: (value: string | null) => void) => {
      console.log('开始上传 Start Upload:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      })

      const formData = new FormData()
      formData.append('file', file)

      // 添加SSH配置到formData
      if (sshConfig && sshPassword) {
        console.log('添加SSH配置 Add SSH Config:', {
          ...sshConfig,
          password: '***' // 密码脱敏显示
        })
        formData.append('sshConfig', JSON.stringify({
          ...sshConfig,
          password: sshPassword
        }))
      } else {
        console.log('警告: 未设置SSH配置 Warning: No SSH Config Set')
      }

      try {
        console.log('发送上传请求到服务器 Send Upload Request to Server')
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        const data = await response.json()
        console.log('服务器响应 Server Response:', data)

        if (data.success) {
          console.log('文件上传成功 File Upload Success:', data.path)
          setter(data.path)
        } else {
          throw new Error(data.error)
        }
      } catch (error) {
        console.error('上传失败 Upload Failed:', error)
        alert('图片上传失败，请重试 Upload Failed, Please Try Again')
      }
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
    }

    const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        await handleImageUpload(file, setImage)
      }
    }

    return (
      <div className="mt-2">
        <Label className="text-sm mb-2">{label}</Label>
        <div
          className={`${size === "small" ? "w-32 h-32" : "w-full h-64"} 
          border-2 ${isDragging ? 'border-blue-500' : 'border-dashed border-gray-300'} 
          rounded-lg flex items-center justify-center cursor-pointer overflow-hidden relative group
          transition-colors duration-200`}
          onClick={() => !image && document.getElementById(`${label}Upload`)?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {image ? (
            <>
              <img src={image} alt={`${label} reference`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="text-white mr-1" onClick={() => document.getElementById(`${label}Upload`)?.click()}>
                  更换 <br />Replace
                </Button>
                <Button variant="ghost" size="sm" className="text-white" onClick={() => setImage(null)}>
                  删除 <br />Delete
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Upload className="text-gray-400 mb-1" />
              <p className="text-sm text-gray-500 text-center p-1">点击或拖拽上传 <br /> Click or Drag Upload</p>
            </div>
          )}
        </div>
        <input
          id={`${label}Upload`}
          type="file"
          hidden
          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], setImage)}
          accept=".png,.jpg,.jpeg,.webp"
        />
        <p className="text-xs text-gray-500 mt-1">PNG、WebP或JPG格式，最大3MB</p>
        <p className="text-xs text-gray-500 mt-1">PNG, WebP, or JPG Format, Max Size 3MB</p>
      </div>
    )
  }

// 1. 首先，将这些公共组件移到组件外部，并使用 memo 包装
const CommonInputFields_Shape = memo(({ 
  shapePrompt, 
  setShapePrompt 
}: {
  shapePrompt: string;
  setShapePrompt: (value: string) => void;
}) => (
  <div className="space-y-4">
    <Label className="text-lg font-medium">
      造型 Shape
      <span className="text-red-500 ml-2">*必填 Mandatory</span>
    </Label>
    <div className="space-y-2">
      <Textarea
        placeholder="用英文输入主体造型的提示词，例如：mobius ring sculpture, intertwined circles"
        value={shapePrompt}
        onChange={(e) => setShapePrompt(e.target.value)}
        className="min-h-[100px]"
      />
      <p className="text-xs text-gray-500">用英文描述主体元素的造型特点、细节、旁属元素等
        <br />
        Describe shape characteristics, details, and related elements IN ENGLISH</p>
    </div>
  </div>
));

const CommonInputFields_Material = memo(({ 
  materialPrompt, 
  setMaterialPrompt 
}: {
  materialPrompt: string;
  setMaterialPrompt: (value: string) => void;
}) => (
  <div className="space-y-4">
    <Label className="text-lg font-medium">材质 Material</Label>
    <div className="space-y-2">
      <Textarea
        placeholder="用英文输入材质关键词，例如：iron material"
        value={materialPrompt}
        onChange={(e) => setMaterialPrompt(e.target.value)}
        className="min-h-[100px]"
      />
      <p className="text-xs text-gray-500">用英文描述主体元素所使用的材料、颜色等
        <br />
        Describe materials, colors used in main elements IN ENGLISH
      </p>
    </div>
  </div>
));

export function LandscapeDesignerComponent() {
  // 从localStorage初始化SSH配置 
  // Initialize SSH Config from LocalStorage
  const [sshCommand, setSshCommand] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('sshCommand') || '' : ''
  )
  const [sshPassword, setSshPassword] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('sshPassword') || '' : ''
  )
  const [sshConfig, setSshConfig] = useState<{
    port: string;
    user: string;
    host: string;
  } | null>(null)
  const [generatedImage, setGeneratedImage] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [isGenerateOpen, setIsGenerateOpen] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [shapePrompt, setShapePrompt] = useState('')
  const [shapeReference, setShapeReference] = useState<string | null>(null)
  const [shapeStrength, setShapeStrength] = useState(0.5)
  const [materialPrompt, setMaterialPrompt] = useState('')
  const [materialReference, setMaterialReference] = useState<string | null>(null)
  const [materialStrength, setMaterialStrength] = useState(0.5)
  const [environmentType, setEnvironmentType] = useState<'large' | 'small' | 'custom'>('custom')
  const [customEnvironment, setCustomEnvironment] = useState('')
  const [finalPrompt, setFinalPrompt] = useState('')
  const [viewType, setViewType] = useState<'custom' | 'aerial'>('custom')
  const [customView, setCustomView] = useState('')
  const [generationMode, setGenerationMode] = useState<'text2img' | 'sketch2img'>('text2img')
  const [sketchImage, setSketchImage] = useState<string | null>(null)
  const [sketchStrength, setSketchStrength] = useState(0.5)

  const getEnvironmentPrompt = () => {
    switch (environmentType) {
      case 'large':
        return 'outdoor, national geopark, architecture planning, structure design, surreal art style'
      case 'small':
        return 'studio photography, simple background, surreal art style'
      case 'custom':
        return customEnvironment
      default:
        return ''
    }
  }

  const getViewPrompt = () => {
    switch (viewType) {
      case 'aerial':
        return 'aerial view'
      case 'custom':
        return customView
      default:
        return ''
    }
  }

  const getCombinedPrompt = () => {
    const parts = [
      shapePrompt.trim() ? `${shapePrompt.trim()},` : '',
      materialPrompt.trim() ? `${materialPrompt.trim()},` : '',
      getEnvironmentPrompt().trim() ? `${getEnvironmentPrompt().trim()},` : '',
      getViewPrompt().trim() ? `${getViewPrompt().trim()},` : ''
    ].filter(Boolean);

    return parts.join(' ');
  }

  useEffect(() => {
    setFinalPrompt(getCombinedPrompt());
  }, [shapePrompt, materialPrompt, environmentType, customEnvironment, viewType, customView]);

  const handleGenerate = async () => {
    if (!shapePrompt.trim()) return
    setIsGenerating(true)
    try {
        const params = {
            promptText: finalPrompt,
            mode: generationMode,
            sketchImage: sketchImage,
            sketchStrength,
            shapeReference: generationMode === 'text2img' ? shapeReference : null,
            materialReference: generationMode === 'text2img' ? materialReference : null,
            shapeStrength,
            materialStrength,
        };

        console.log('发送参数:', params);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        
        // 如果存在SSH配置，添加到请求头
        if (sshConfig) {
            headers['ssh-config'] = 'true';
        }

        const response = await fetch('/api/comfyui', {
            method: 'POST',
            headers,
            body: JSON.stringify(params),
        });

        const data = await response.json();
        if (data.success) {
            if (data.workflow) {
                console.log('Workflow:', JSON.stringify(data.workflow, null, 2));
            }

            console.log('生成成功 Generation Success:', {
                imagePath: data.imagePath,
            });

            setGeneratedImage(data.imagePath);
            setHistory(prev => {
                const newHistory = [data.imagePath, ...prev];
                return newHistory.slice(0, 48);
            });
        } else {
            console.error('生成失败 Generation Failed:', data.error);
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('生成过程出错 Generation Error:', error);
        alert('生成失败，请重试\nGeneration Failed, Please Try Again');
    } finally {
        setIsGenerating(false);
    }
  }

  const openImageInNewWindow = (imageSrc: string) => {
    if (imageSrc) {
      window.open(imageSrc, '_blank', 'width=800,height=600')
    }
  }

  const parseSSHCommand = (command: string) => {
    // 移除多余的空格并分割命令
    const parts = command.trim().split(/\s+/)
    
    let host = '', port = '', user = ''
    
    // 遍历所有部分来查找相关信息
    for (let i = 0; i < parts.length; i++) {
      const current = parts[i]
      
      // 检查用户@主机格式
      if (current.includes('@')) {
        const [username, hostname] = current.split('@')
        user = username
        host = hostname
        continue
      }
      
      // 检查端口参数
      if (current === '-p' && i + 1 < parts.length) {
        port = parts[i + 1]
        i++ // 跳过下一个参数
        continue
      }
    }
    
    // 验证是否获取到所有必要信息
    if (host && port && user) {
      const config = {
        port,
        user,
        host
      }
      console.log('解析SSH配置:', config)
      setSshConfig(config)
      return true
    }
    
    console.log('SSH命令解析失败')
    setSshConfig(null)
    return false
  }

  // 使用useEffect保存到localStorage
  // Save to LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sshCommand', sshCommand)
      if (sshCommand) {
        parseSSHCommand(sshCommand)
      }
    }
  }, [sshCommand])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sshPassword', sshPassword)
    }
  }, [sshPassword])

  // 在组件加载时解析已保存的SSH命令
  useEffect(() => {
    if (sshCommand) {
      parseSSHCommand(sshCommand)
    }
  }, [])

  // 提取共用的环境和视角设置
  const CommonSettings = () => (
    <>
      <div className="space-y-4">
        <Label className="text-lg font-medium">环境 Environment</Label>
        <div className="space-y-3">
          <button
            type="button"
            className={`w-full text-left p-4 rounded-lg border transition-colors ${environmentType === 'custom'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            onClick={() => setEnvironmentType('custom')}
          >
            <div className="font-medium">自定义 Custom</div>
            <div className="text-sm text-gray-500">自定义环境相关的提示词</div>
          </button>

          <button
            type="button"
            className={`w-full text-left p-4 rounded-lg border transition-colors ${environmentType === 'large'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            onClick={() => setEnvironmentType('large')}
          >
            <div className="font-medium">大型结构 Large Structure</div>
            <div className="text-sm text-gray-500">适用于大型景观构成、建筑等
              <br />
              Suitable for large scale landscapes and architecture
            </div>
            <div className="text-xs text-gray-400 mt-1">添加预设提示词：outdoor, national geopark, architecture planning, structure design, surreal art style</div>
          </button>

          <button
            type="button"
            className={`w-full text-left p-4 rounded-lg border transition-colors ${environmentType === 'small'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            onClick={() => setEnvironmentType('small')}
          >
            <div className="font-medium">小型结构 Small Structure</div>
            <div className="text-sm text-gray-500">适用于小品、地标、石碑等小型构筑物
              <br />
              Suitable for small installations, landmarks, and monuments
            </div>
            <div className="text-xs text-gray-400 mt-1">添加预设提示词：studio photography, simple background, surreal art style</div>
          </button>
        </div>

        {/* 自定义输入框始终显示，因为默认就是自定义模式 
                          Custom input box always shown as it's the default mode */}
        <div className="space-y-2">
          <Textarea
            placeholder="用英文输入自定义的环境提示词..."
            value={customEnvironment}
            onChange={(e) => setCustomEnvironment(e.target.value)}
            className="min-h-[100px]"
            disabled={environmentType !== 'custom'} // 只在自定义模式下可编辑
          />
          <p className="text-xs text-gray-500">用英文描述图像的背景、绿化、光照、艺术流派等
            <br />
            Describe background, vegetation, lighting, and art style IN ENGLISH
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-lg font-medium">视角 View</Label>
        <div className="space-y-3">
          <button
            type="button"
            className={`w-full text-left p-4 rounded-lg border transition-colors ${viewType === 'custom'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            onClick={() => setViewType('custom')}
          >
            <div className="font-medium">自定义 Custom</div>
            <div className="text-sm text-gray-500">自定义视角相关的提示词</div>
          </button>

          <button
            type="button"
            className={`w-full text-left p-4 rounded-lg border transition-colors ${viewType === 'aerial'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            onClick={() => setViewType('aerial')}
          >
            <div className="font-medium">航拍视角 Aerial View</div>
            <div className="text-sm text-gray-500">从高处俯视的视角
              <br />
              View from above
            </div>
            <div className="text-xs text-gray-400 mt-1">添加预设提示词：aerial view</div>
          </button>
        </div>

        {/* 自定义输入框始终显示，因为默认就是自定义模式 
                          Custom input box always shown as it's the default mode */}
        <div className="space-y-2">
          <Textarea
            placeholder="用英文输入自定义的视角提示词..."
            value={customView}
            onChange={(e) => setCustomView(e.target.value)}
            className="min-h-[100px]"
            disabled={viewType !== 'custom'} // 只在自定义模式下可编辑
          />
        </div>
      </div>
    </>
  )

  // 提取共用的提示词预览
  const PromptPreview = () => (
    <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">提示词预览 Prompt Preview</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(finalPrompt);
          }}
        >
          复制 Copy
        </Button>
      </div>
      <div className="space-y-1">
        <Textarea
          value={finalPrompt}
          onChange={(e) => setFinalPrompt(e.target.value)}
          className="min-h-[100px] font-mono"
          placeholder={"请至少输入主体造型提示词\nPlease enter at least the shape prompt"}
          style={{ whiteSpace: "pre-wrap" }}
        />
        <p className="text-xs text-gray-500">这是所有设置组合后的完整提示词，您可以直接编辑
          <br />
          This is the final combined prompt from all settings, you can edit it here
        </p>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 overflow-hidden">
      <div className="w-1/2 p-8 overflow-y-auto">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">GLAIRS</h1>
        <h2 className="text-2xl font-bold mb-8 text-gray-400">Generative Landscape AI Inspiring and Rendering System</h2>

        <Collapsible open={isGenerateOpen} onOpenChange={setIsGenerateOpen} className="mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">获得灵感</CardTitle>
              <CollapsibleTrigger>
                {isGenerateOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <Tabs defaultValue="text2img" onValueChange={(value) => setGenerationMode(value as 'text2img' | 'sketch2img')}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="text2img">图像生成 Text to Image</TabsTrigger>
                    <TabsTrigger value="sketch2img">手绘发散 Sketch Inspiration</TabsTrigger>
                  </TabsList>

                  <TabsContent value="text2img" className="space-y-6">
                    {/* 主体参考图和材质参考图（仅在text2img模式下显示） */}
                    <div className="space-y-6">
                      <CommonInputFields_Shape 
                        shapePrompt={shapePrompt}
                        setShapePrompt={setShapePrompt}
                      />
                      {/* text2img特有的参考图上传部分 */}
                      <div className="space-y-4">
                        <ImageUploader image={shapeReference} setImage={setShapeReference} label="造型参考" sshConfig={sshConfig} sshPassword={sshPassword} />
                        {shapeReference && (
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <Label className="text-sm">造型参考强度 Reference Strength</Label>
                              <span className="text-sm font-medium">{shapeStrength.toFixed(1)}</span>
                            </div>
                            <Slider
                              value={[shapeStrength]}
                              onValueChange={([value]) => setShapeStrength(value)}
                              max={1}
                              min={0}
                              step={0.1}
                              className="mb-2"
                            />
                            <p className="text-sm text-gray-500">值越高，参考图对生成图影响越大
                              <br />
                              Higher value, stronger influence
                            </p>
                          </div>
                        )}
                      </div>
                      <CommonInputFields_Material
                        materialPrompt={materialPrompt}
                        setMaterialPrompt={setMaterialPrompt}
                      />
                      <div className="space-y-4">
                        <ImageUploader image={materialReference} setImage={setMaterialReference} label="材质参考" sshConfig={sshConfig} sshPassword={sshPassword} />
                        {materialReference && (
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <Label className="text-sm">材质参考强度 Reference Strength</Label>
                              <span className="text-sm font-medium">{materialStrength.toFixed(1)}</span>
                            </div>
                            <Slider
                              value={[materialStrength]}
                              onValueChange={([value]) => setMaterialStrength(value)}
                              max={1}
                              min={0}
                              step={0.1}
                              className="mb-2"
                            />
                            <p className="text-sm text-gray-500">值越高，参考图对生成图影响越大
                              <br />
                              Higher value, stronger influence
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <CommonSettings />
                    <PromptPreview />
                    <Button
                      onClick={handleGenerate}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!shapePrompt.trim() || isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          生成中... Generating...
                        </>
                      ) : (
                        '图像生成 Generate'
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="sketch2img" className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-lg font-medium">
                        手绘图上传
                        <span className="text-red-500 ml-2">*必填 M</span>
                      </Label>
                      <ImageUploader
                        image={sketchImage}
                        setImage={setSketchImage}
                        label="手绘图"
                        size="large"
                        sshConfig={sshConfig}
                        sshPassword={sshPassword}
                      />
                      {sketchImage && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-sm">手绘图还原强度</Label>
                            <span className="text-sm font-medium">{sketchStrength.toFixed(1)}</span>
                          </div>
                          <Slider
                            value={[sketchStrength]}
                            onValueChange={([value]) => setSketchStrength(value)}
                            max={1}
                            min={0}
                            step={0.1}
                            className="mb-2"
                          />
                          <p className="text-sm text-gray-500">值越高，生成的图像越接近手绘图的结构</p>
                        </div>
                      )}
                    </div>
                    <CommonInputFields_Shape 
                      shapePrompt={shapePrompt}
                      setShapePrompt={setShapePrompt}
                    />
                    <CommonInputFields_Material
                      materialPrompt={materialPrompt}
                      setMaterialPrompt={setMaterialPrompt}
                    />
                    <CommonSettings />
                    <PromptPreview />

                    <Button
                      onClick={handleGenerate}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!sketchImage || !shapePrompt.trim() || isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        '灵感发散'
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </CollapsibleContent>
          </Card >
        </Collapsible >
      </div >

      {/* 右侧：控制面板 */}
      < div className="w-1/2 p-8 space-y-8 bg-white overflow-y-auto" >
        <div className="space-y-4">
          <Input
            placeholder="输入SSH命令 INPUT SSH COMMAND"
            value={sshCommand}
            onChange={(e) => {
              setSshCommand(e.target.value)
              parseSSHCommand(e.target.value)
            }}
            className="border-gray-300"
          />
          <Input
            type="password"
            placeholder="输入SSH密码 INPUT SSH PASSWORD"
            value={sshPassword}
            onChange={(e) => setSshPassword(e.target.value)}
            className="border-gray-300"
          />
        </div>
        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-4 text-gray-900">生成结果 Generated Image</h3>
          {isGenerating || isEditing ? (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-500 mt-4">生成中... GENERATING...</p>
              <p className="text-gray-400 text-sm mt-2">如果等时间过长，请刷新 Refresh if waiting too long</p>
            </div>
          ) : generatedImage ? (
            <img
              src={generatedImage}
              alt="Generated landscape"
              className="w-full h-auto rounded-lg shadow-lg cursor-pointer"
              onClick={() => openImageInNewWindow(generatedImage)}
            />
          ) : (
            <div
              className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer"
              onClick={() => openImageInNewWindow('/placeholder.png')}
            >
              <p className="text-gray-500">生成的图像将显示在里 Generated image will be displayed here</p>
            </div>
          )}
        </div>
        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-4 text-gray-900">历史生成 History</h3>
          {history.length > 0 ? (
            <div className="grid grid-cols-4 gap-4">
              {history.slice(0, 48).map((imagePath, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer"
                  onClick={() => openImageInNewWindow(imagePath)}
                >
                  <img src={imagePath} alt={`History ${index}`} className="w-full h-full object-cover rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">还没有进行过生成 No generation yet</p>
            </div>
          )}
        </div>
      </div >
    </div >
  )
}