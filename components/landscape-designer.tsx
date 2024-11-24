'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Upload, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

// todo

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


interface ImageUploaderProps {
  image: string | null;
  setImage: (value: string | null) => void;
  label: string;
  size?: "small" | "large";
}

const ImageUploader = ({ image, setImage, label, size = "small" }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleImageUpload = async (file: File, setter: (value: string | null) => void) => {
    const validTypes = ['image/png', 'image/webp', 'image/jpeg']
    if (!validTypes.includes(file.type)) {
      alert('请上传PNG、WebP或JPG格式的图片')
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      alert('图片大小不能超过3MB')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (data.success) {
        setter(data.path)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('图片上传失败，请重试')
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
              <Button variant="ghost" size="sm" className="text-white mr-2" onClick={() => document.getElementById(`${label}Upload`)?.click()}>
                更换
              </Button>
              <Button variant="ghost" size="sm" className="text-white" onClick={() => setImage(null)}>
                删除
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Upload className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 text-center p-2">点击或拖拽图片到此处</p>
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
      <p className="text-xs text-gray-500 mt-1">请上传PNG、WebP或JPG格式的图片，大小不超过3MB</p>
    </div>
  )
}

// todo 
/* 
// add reference mode (for ipadapter)
type ReferenceMode = 'ease in-out' | 'composition' | 'style transfer';
 */

export function LandscapeDesignerComponent() {
  const [apiKey, setApiKey] = useState('')
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

  // todo
  /* 
  const [materialKeyword, setMaterialKeyword] = useState('')
  const [materialImage, setMaterialImage] = useState<string | null>(null)
  const [inspirationKeyword, setInspirationKeyword] = useState('')
  const [inspirationImage, setInspirationImage] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(true)
  const [referenceMode, setReferenceMode] = useState<ReferenceMode>('ease in-out')
  const [editImage, setEditImage] = useState<string | null>(null)
  const [promptText, setPromptText] = useState('')
  const [promptImage, setPromptImage] = useState<string | null>(null)
  const [promptImageStrength, setPromptImageStrength] = useState(1) 
  */

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
        sketchImage: sketchImage ? '/input/' + sketchImage.split('/').pop() : null,
        sketchStrength,
        shapeReference: generationMode === 'text2img' ? (shapeReference ? '/input/' + shapeReference.split('/').pop() : null) : null,
        materialReference: generationMode === 'text2img' ? (materialReference ? '/input/' + materialReference.split('/').pop() : null) : null,
        shapeStrength,
        materialStrength,
      };

      console.log('发送参数:', params);

      const response = await fetch('/api/comfyui', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      if (data.success) {
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

  // todo
  /* const handleEdit = async () => {
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
 */

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
              <CardTitle className="text-2xl">灵感生成</CardTitle>
              <CollapsibleTrigger>
                {isGenerateOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <Tabs defaultValue="text2img" onValueChange={(value) => setGenerationMode(value as 'text2img' | 'sketch2img')}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="text2img">文字生成图像</TabsTrigger>
                    <TabsTrigger value="sketch2img">手绘灵感发散</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text2img" className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-lg font-medium">
                        主体造型
                        <span className="text-red-500 ml-2">*必填</span>
                      </Label>
                      <div className="space-y-2">
                        <Textarea
                          placeholder="输入主体造型的提示词，例如：现代简约、自然有机、几何图形、古典优雅"
                          value={shapePrompt}
                          onChange={(e) => setShapePrompt(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <ImageUploader image={shapeReference} setImage={setShapeReference} label="主体参考图" />
                        {shapeReference && (
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <Label className="text-sm">主体参考强度</Label>
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
                            <p className="text-sm text-gray-500">值越高，参考图对生成图影响越大</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-lg font-medium">材质</Label>
                      <div className="space-y-2">
                        <Textarea
                          placeholder="输入材质关键词，例如：木材、石材、金属、玻璃、混凝土"
                          value={materialPrompt}
                          onChange={(e) => setMaterialPrompt(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <ImageUploader image={materialReference} setImage={setMaterialReference} label="材质参考图" />
                        {materialReference && (
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <Label className="text-sm">材质参考强度</Label>
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
                            <p className="text-sm text-gray-500">值越高，参考图对生成图影响越大</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-lg font-medium">环境设置（可选）</Label>
                      <div className="space-y-3">
                        <button
                          type="button"
                          className={`w-full text-left p-4 rounded-lg border transition-colors ${environmentType === 'custom'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          onClick={() => setEnvironmentType('custom')}
                        >
                          <div className="font-medium">自定义</div>
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
                          <div className="font-medium">大型结构</div>
                          <div className="text-sm text-gray-500">适用于大型景观构筑物、地标性建筑等</div>
                          <div className="text-xs text-gray-400 mt-1">添加提示词：outdoor, national geopark, architecture planning, structure design, surreal art style</div>
                        </button>

                        <button
                          type="button"
                          className={`w-full text-left p-4 rounded-lg border transition-colors ${environmentType === 'small'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          onClick={() => setEnvironmentType('small')}
                        >
                          <div className="font-medium">小型结构</div>
                          <div className="text-sm text-gray-500">适用于小品、街道家具等小型构筑物</div>
                          <div className="text-xs text-gray-400 mt-1">添加提示词：studio photography, simple background, surreal art style</div>
                        </button>
                      </div>

                      {/* 自定义输入框始终显示，因为默认就是自定义模式 */}
                      <div className="space-y-2">
                        <Textarea
                          placeholder="输入自定义的环境提示词..."
                          value={customEnvironment}
                          onChange={(e) => setCustomEnvironment(e.target.value)}
                          className="min-h-[100px]"
                          disabled={environmentType !== 'custom'} // 只在自定义模式下可编辑
                        />
                        <p className="text-xs text-gray-500">描述作品的环境氛围、光照条件等</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-lg font-medium">视角设置（可选）</Label>
                      <div className="space-y-3">
                        <button
                          type="button"
                          className={`w-full text-left p-4 rounded-lg border transition-colors ${viewType === 'custom'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          onClick={() => setViewType('custom')}
                        >
                          <div className="font-medium">自定义</div>
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
                          <div className="font-medium">航拍视角</div>
                          <div className="text-sm text-gray-500">从高处俯视的视角</div>
                          <div className="text-xs text-gray-400 mt-1">添加提示词：aerial view</div>
                        </button>
                      </div>

                      {/* 自定义输入框始终显示，因为默认就是自定义模式 */}
                      <div className="space-y-2">
                        <Textarea
                          placeholder="输入自定义的视角提示词..."
                          value={customView}
                          onChange={(e) => setCustomView(e.target.value)}
                          className="min-h-[100px]"
                          disabled={viewType !== 'custom'} // 只在自定义模式下可编辑
                        />
                        <p className="text-xs text-gray-500">描述观察视角，如：正视图、俯视图、仰视图等</p>
                      </div>
                    </div>
                    <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">总提示词预览</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(finalPrompt);
                          }}
                        >
                          复制
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <Textarea
                          value={finalPrompt}
                          onChange={(e) => setFinalPrompt(e.target.value)}
                          className="min-h-[100px] font-mono"
                          placeholder="请至少输入主体造型提示词"
                        />
                        <p className="text-xs text-gray-500">这是所有设置组合后的完整提示词，您可以直接编辑</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleGenerate}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!shapePrompt.trim() || isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        '图像生成'
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="sketch2img" className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-lg font-medium">
                        手绘图上传
                        <span className="text-red-500 ml-2">*必填</span>
                      </Label>
                      <ImageUploader 
                        image={sketchImage} 
                        setImage={setSketchImage} 
                        label="手绘图" 
                        size="large"
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
                    <div className="space-y-4">
                      <Label className="text-lg font-medium">
                        主体造型
                        <span className="text-red-500 ml-2">*必填</span>
                      </Label>
                      <Textarea
                        placeholder="输入主体造型的提示词，例如：现代简约、自然有机、几何图形、古典优雅"
                        value={shapePrompt}
                        onChange={(e) => setShapePrompt(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-lg font-medium">材质</Label>
                      <div className="space-y-2">
                        <Textarea
                          placeholder="输入材质关键词，例如：木材、石材、金属、玻璃、混凝土"
                          value={materialPrompt}
                          onChange={(e) => setMaterialPrompt(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-lg font-medium">环境设置（可选）</Label>
                      <div className="space-y-3">
                        <button
                          type="button"
                          className={`w-full text-left p-4 rounded-lg border transition-colors ${environmentType === 'custom'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          onClick={() => setEnvironmentType('custom')}
                        >
                          <div className="font-medium">自定义</div>
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
                          <div className="font-medium">大型结构</div>
                          <div className="text-sm text-gray-500">适用于大型景观构筑物、地标性建筑等</div>
                          <div className="text-xs text-gray-400 mt-1">添加提示词：outdoor, national geopark, architecture planning, structure design, surreal art style</div>
                        </button>

                        <button
                          type="button"
                          className={`w-full text-left p-4 rounded-lg border transition-colors ${environmentType === 'small'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          onClick={() => setEnvironmentType('small')}
                        >
                          <div className="font-medium">小型结构</div>
                          <div className="text-sm text-gray-500">适用于小品、街道家具等小型构筑物</div>
                          <div className="text-xs text-gray-400 mt-1">添加提示词：studio photography, simple background, surreal art style</div>
                        </button>
                      </div>

                      {/* 自定义输入框始终显示，因为默认就是自定义模式 */}
                      <div className="space-y-2">
                        <Textarea
                          placeholder="输入自定义的环境提示词..."
                          value={customEnvironment}
                          onChange={(e) => setCustomEnvironment(e.target.value)}
                          className="min-h-[100px]"
                          disabled={environmentType !== 'custom'} // 只在自定义模式下可编辑
                        />
                        <p className="text-xs text-gray-500">描述作品的环境氛围、光照条件等</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-lg font-medium">视角设置（可选）</Label>
                      <div className="space-y-3">
                        <button
                          type="button"
                          className={`w-full text-left p-4 rounded-lg border transition-colors ${viewType === 'custom'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          onClick={() => setViewType('custom')}
                        >
                          <div className="font-medium">自定义</div>
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
                          <div className="font-medium">航拍视角</div>
                          <div className="text-sm text-gray-500">从高处俯视的视角</div>
                          <div className="text-xs text-gray-400 mt-1">添加提示词：aerial view</div>
                        </button>
                      </div>

                      {/* 自定义输入框始终显示，因为默认就是自定义模式 */}
                      <div className="space-y-2">
                        <Textarea
                          placeholder="输入自定义的视角提示词..."
                          value={customView}
                          onChange={(e) => setCustomView(e.target.value)}
                          className="min-h-[100px]"
                          disabled={viewType !== 'custom'} // 只在自定义模式下可编辑
                        />
                        <p className="text-xs text-gray-500">描述观察视角，如：正视图、俯视图、仰视图等</p>
                      </div>
                    </div>
                    <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">总提示词预览</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(finalPrompt);
                          }}
                        >
                          复制
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <Textarea
                          value={finalPrompt}
                          onChange={(e) => setFinalPrompt(e.target.value)}
                          className="min-h-[100px] font-mono"
                          placeholder="请至少输入主体造型提示词"
                        />
                        <p className="text-xs text-gray-500">这是所有设置组合后的完整提示词，您可以直接编辑</p>
                      </div>
                    </div>
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
          </Card>
        </Collapsible>

        {/* todo */}
        {/* Image editing function */}

        {/* <Collapsible open={isEditOpen} onOpenChange={setIsEditOpen}>
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
        </Collapsible> */}
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
              <p className="text-gray-400 text-sm mt-2">如果等时间过长，请重试</p>
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
              <p className="text-gray-500">生成的图像将显示在里</p>
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