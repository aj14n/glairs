'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Upload, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

interface ImageUploaderProps {
  image: string | null;
  setImage: (value: string | null) => void;
  label: string;
  size?: "small" | "large";
}

const ImageUploader = ({ image, setImage, label, size = "small" }: ImageUploaderProps) => {
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, setter: (value: string | null) => void) => {
    if (!event.target.files) return
    const file = event.target.files[0]
    if (file) {
      const validTypes = ['image/png', 'image/webp', 'image/jpeg']
      if (!validTypes.includes(file.type)) {
        alert('请上传PNG、WebP或JPG格式的图片')
        return
      }
      
      if (file.size > 3 * 1024 * 1024) {
        alert('图片大小不能超过3MB')
        return
      }

      // 创建 FormData 对象上传文件
      const formData = new FormData()
      formData.append('file', file)

      try {
        // 上传文件到服务器
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        const data = await response.json()
        
        if (data.success) {
          // 读取文件用于预览
          const reader = new FileReader()
          reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
              setter(e.target.result)
            }
          }
          reader.readAsDataURL(file)
        } else {
          throw new Error(data.error)
        }
      } catch (error) {
        console.error('Upload failed:', error)
        alert('图片上传失败，请重试')
      }
    }
  }

  return (
    <div className="mt-2">
      <Label className="text-sm mb-2">{label}</Label>
      <div 
        className={`${size === "small" ? "w-32 h-32" : "w-full h-64"} border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden relative group`}
        onClick={() => !image && document.getElementById(`${label}Upload`)?.click()}
      >
        {image ? (
          <>
            <img src={image} alt={`${label} reference`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="text-white mr-2" onClick={() => document.getElementById(`${label}Upload`)?.click()}>
                更换
              </Button>
              <Button variant="ghost" size="sm" className="text-white" onClick={() => setImage(null)}>
                删除
              </Button>
            </div>
          </>
        ) : (
          <Upload className="text-gray-400" />
        )}
      </div>
      <input
        id={`${label}Upload`}
        type="file"
        hidden
        onChange={(e) => handleImageUpload(e, setImage)}
      />
      <p className="text-xs text-gray-500 mt-1">请上传PNG、WebP或JPG格式的图片，大小不超过3MB</p>
    </div>
  )
}

// 添加参考模式类型定义
type ReferenceMode = 'ease in-out' | 'composition' | 'style transfer';

export function LandscapeDesignerComponent() {
  const [apiKey, setApiKey] = useState('')
  const [promptText, setPromptText] = useState('')
  const [promptImage, setPromptImage] = useState<string | null>(null)
  const [promptImageStrength, setPromptImageStrength] = useState(1)
  const [generatedImage, setGeneratedImage] = useState('')
  const [editImage, setEditImage] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [materialKeyword, setMaterialKeyword] = useState('')
  const [materialImage, setMaterialImage] = useState<string | null>(null)
  const [inspirationKeyword, setInspirationKeyword] = useState('')
  const [inspirationImage, setInspirationImage] = useState<string | null>(null)
  const [isGenerateOpen, setIsGenerateOpen] = useState(true)
  const [isEditOpen, setIsEditOpen] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [referenceMode, setReferenceMode] = useState<ReferenceMode>('ease in-out')

  const handleGenerate = async () => {
    if (!promptText.trim()) return
    setIsGenerating(true)
    try {
      console.log('发送参数:', {
        promptText,
        hasReferenceImage: !!promptImage,
        promptImageStrength,
        referenceMode,
      });

      const response = await fetch('/api/comfyui', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptText,
          hasReferenceImage: !!promptImage,
          promptImageStrength,
          referenceMode,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        // 添加 workflow 日志输出
        if (data.workflow) {
          console.log('完整 Workflow 配置:', JSON.stringify(data.workflow, null, 2));
        }
        
        console.log('生成成功:', {
          imagePath: data.imagePath,
        });
        
        setGeneratedImage(data.imagePath);
        setHistory(prev => {
          const newHistory = [data.imagePath, ...prev];
          return newHistory.slice(0, 48);
        });
      } else {
        console.error('生成失败:', data.error);
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('生成过程出错:', error);
      alert('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  }

  const handleEdit = async () => {
    if (!editImage) return
    setIsEditing(true)
    try {
      // TODO: Implement ComfyUI API call for image editing here
      console.log("Editing image with parameters:", { materialKeyword, inspirationKeyword })
      await new Promise(resolve => setTimeout(resolve, 3000)) // Simulating API call
      const editedImage = '/placeholder.png'
      setGeneratedImage(editedImage)
      setHistory(prev => {
        const newHistory = [editedImage, ...prev];
        return newHistory.slice(0, 48);
      });
    } catch (error) {
      console.error('Editing failed:', error)
      // TODO: Implement error handling
    } finally {
      setIsEditing(false)
    }
  }

  const openImageInNewWindow = (imageSrc: string) => {
    if (imageSrc) {
      window.open(imageSrc, '_blank', 'width=800,height=600')
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 overflow-hidden">
      {/* 左侧：效果图生成和效果图编辑 */}
      <div className="w-1/2 p-8 overflow-y-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">AI景观设计师</h1>
        
        {/* 效果生成部分 */}
        <Collapsible open={isGenerateOpen} onOpenChange={setIsGenerateOpen} className="mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">效果生成</CardTitle>
              <CollapsibleTrigger>
                {isGenerateOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-lg mb-2">提示词</Label>
                  <Textarea 
                    placeholder="输入完整的提示词..."
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>
                <ImageUploader image={promptImage} setImage={setPromptImage} label="提示词参考图" />
                <div>
                  <Label className="text-sm mb-2">参考强度</Label>
                  <span className="text-sm font-medium">{promptImageStrength.toFixed(1)}</span>
                  <Slider 
                    value={[promptImageStrength]} 
                    onValueChange={([value]) => setPromptImageStrength(value)} 
                    max={2} 
                    min={0}
                    step={0.1} 
                    className="mb-2"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">值越高，参考图对生成图影响越大</p>
                  </div>
                  
                  {/* 添加参考模式选择 */}
                  <div className="mt-4">
                    <Label className="text-sm mb-2">参考模式</Label>
                    <Select value={referenceMode} onValueChange={(value: ReferenceMode) => setReferenceMode(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择参考模式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ease in-out">默认</SelectItem>
                        <SelectItem value="composition">参考主体</SelectItem>
                        <SelectItem value="style transfer">参考风格</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      {referenceMode === 'ease in-out' && '默认模式：平衡参考图的整体影响'}
                      {referenceMode === 'composition' && '参考主体：更强调参考图的主体的造型'}
                      {referenceMode === 'style transfer' && '参考风格：更强调参考图的风格'}
                    </p>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button 
                          onClick={handleGenerate} 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={!promptText.trim() || isGenerating}
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              生成中...
                            </>
                          ) : (
                            '生成'
                          )}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{!promptText.trim() ? "提示词不能为空" : "点击生成效果图"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* 效果图编辑部分 */}
        <Collapsible open={isEditOpen} onOpenChange={setIsEditOpen}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">效果图编辑</CardTitle>
              <CollapsibleTrigger>
                {isEditOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div className="mb-4">
                  <Label className="text-lg mb-2">上传效果图</Label>
                  <ImageUploader image={editImage} setImage={setEditImage} label="编辑效果图" size="large" />
                </div>
                <Tabs defaultValue="subject" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-5 bg-gray-200 rounded-lg p-1">
                    <TabsTrigger value="subject" className="data-[state=active]:bg-white">主体</TabsTrigger>
                    <TabsTrigger value="paving" className="data-[state=active]:bg-white">铺装</TabsTrigger>
                    <TabsTrigger value="plants" className="data-[state=active]:bg-white">植物</TabsTrigger>
                    <TabsTrigger value="water" className="data-[state=active]:bg-white">水景</TabsTrigger>
                    <TabsTrigger value="lighting" className="data-[state=active]:bg-white">光照</TabsTrigger>
                  </TabsList>
                  <TabsContent value="subject">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-lg mb-2">材质</Label>
                        <Input 
                          placeholder="输入材质关键词" 
                          value={materialKeyword}
                          onChange={(e) => setMaterialKeyword(e.target.value)}
                        />
                        <p className="text-sm text-gray-500 mt-1">示例：木材、石材、金属、玻璃、混凝土</p>
                        <ImageUploader image={materialImage} setImage={setMaterialImage} label="材质参考图" />
                      </div>
                      <div>
                        <Label className="text-lg mb-2">表面处理</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="选择表面处理" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="polished">抛光</SelectItem>
                            <SelectItem value="rough">粗糙</SelectItem>
                            <SelectItem value="textured">纹理</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-lg mb-2">照明强度</Label>
                        <Slider defaultValue={[50]} max={100} step={1} />
                      </div>
                      <div>
                        <Label className="text-lg mb-2">色彩饱和度</Label>
                        <Slider defaultValue={[50]} max={100} step={1} />
                      </div>
                      <div>
                        <Label className="text-lg mb-2">造型灵感</Label>
                        <Input 
                          placeholder="输入造型灵感关键词" 
                          value={inspirationKeyword}
                          onChange={(e) => setInspirationKeyword(e.target.value)}
                        />
                        <p className="text-sm text-gray-500 mt-1">示例：现代简约、自然有机、几何图形、古典优雅</p>
                        <ImageUploader image={inspirationImage} setImage={setInspirationImage} label="灵感参考图" />
                      </div>
                    </div>
                  </TabsContent>
                  {/* 其他标签页的内容类似，这里省略 */}
                </Tabs>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button 
                          onClick={handleEdit} 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={!editImage || isEditing}
                        >
                          {isEditing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              编辑中...
                            </>
                          ) : (
                            '应用编辑'
                          )}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{!editImage ? "请上传需要编辑的效果图" : "点击应用编辑"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* 右侧：控制面板 */}
      <div className="w-1/2 p-8 space-y-8 bg-white overflow-y-auto">
        <Input
          placeholder="输入您的API密钥"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="border-gray-300"
        />
        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-4 text-gray-900">生成结果</h3>
          {isGenerating || isEditing ? (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-500 mt-4">生成中...</p>
              <p className="text-gray-400 text-sm mt-2">如果等待时间过长，请重试</p>
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
              <p className="text-gray-500">生成的图像将显示在这里</p>
            </div>
          )}
        </div>
        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-4 text-gray-900">历史生成</h3>
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
              <p className="text-gray-500">还没有进行过生成</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}