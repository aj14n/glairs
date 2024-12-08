'use client'

import { useState, useEffect, memo, createContext, useContext } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Upload, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OptionSelector } from "@/components/ui/option-selector"

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

// 添加新的类型定义
type DesignSuggestion = {
  id: number;
  productName: string;
  description: string;
  shapePrompt: string;
}

// 模拟的设计建议数据
// const MOCK_SUGGESTIONS: DesignSuggestion[] = [
//   {
//     id: 1,
//     productName: "山水剪影T恤 Mountain Silhouette T-Shirt",
//     description: "将黄山标志性的松树怪石剪影印在T恤上，体现出黄山的神秘与壮美",
//     shapePrompt: "minimalist t-shirt design featuring silhouettes of huangshan pine trees and unique rock formations, zen style artwork, clean lines, modern fashion illustration",
//   },
//   {
//     id: 2,
//     productName: "云海杯垫 Sea of Clouds Coaster",
//     description: "以黄山云海为灵感的圆形杯垫，采用层次分明的云雾效果",
//     shapePrompt: "circular coaster design with layered clouds pattern, ethereal mist effect, abstract mountain peaks emerging from clouds, zen aesthetic",
//   },
//   {
//     id: 3,
//     productName: "迎客松徽章 Welcome Pine Badge",
//     description: "将黄山最著名的迎客松图案制作成精致的金属徽章",
//     shapePrompt: "elegant metal pin badge design featuring the iconic welcoming pine tree of huangshan, detailed botanical illustration, metallic finish",
//   }
// ];

// 修改后的LocationInputAndSuggestions组件
const LocationInputAndSuggestions = memo(({ 
  onSelectSuggestion,
  currentShapePrompt,
  onClearSelection
}: {
  onSelectSuggestion: (suggestion: DesignSuggestion | null) => void;
  currentShapePrompt: string;
  onClearSelection: () => void;
}) => {
  const [locationDescription, setLocationDescription] = useState('');
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const { suggestions, setSuggestions } = useContext(SuggestionsContext);

  const handleGenerateSuggestions = async () => {
    if (!locationDescription.trim()) return;
    
    setIsGeneratingSuggestions(true);
    try {
      const response = await fetch('/api/generate-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locationDescription }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.suggestions);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('获取建议失败:', error);
      alert('获取建议失败，请重试\nFailed to get suggestions, please try again');
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 旅游地点描述输入 */}
      <div className="space-y-4">
        <Label className="text-lg font-medium">
          旅游地点描述 Location Description
          <span className="text-red-500 ml-2">*必填 Mandatory</span>
        </Label>
        <div className="space-y-2">
          <Textarea
            placeholder="请描述这个旅游地点的特色，如：黄山是中国著名的山岳景区，以奇松、怪石、云海闻名..."
            value={locationDescription}
            onChange={(e) => setLocationDescription(e.target.value)}
            className="min-h-[100px]"
          />
          <p className="text-xs text-gray-500">
            描述越详细，生成的设计建议越贴切
            <br />
            More detailed description leads to better design suggestions
          </p>
        </div>
        <Button
          onClick={handleGenerateSuggestions}
          disabled={!locationDescription.trim() || isGeneratingSuggestions}
          className="w-full"
        >
          {isGeneratingSuggestions ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              生成设计建议中... Generating suggestions...
            </>
          ) : (
            '获取设计建议 Get Design Suggestions'
          )}
        </Button>
      </div>

      {/* 设计建议展示 */}
      {suggestions.length > 0 && (
        <OptionSelector
          label="设计建议 Design Suggestions"
          options={suggestions.map(suggestion => ({
            id: suggestion.id.toString(),
            title: suggestion.productName,
            description: suggestion.description,
            value: suggestion.shapePrompt
          }))}
          value={suggestions.find(s => s.shapePrompt === currentShapePrompt)?.id.toString() || null}
          onChange={(id) => {
            if (!id) {
              onClearSelection();
              return;
            }
            const suggestion = suggestions.find(s => s.id.toString() === id);
            if (suggestion) {
              onSelectSuggestion(suggestion);
            }
          }}
        />
      )}
    </div>
  );
});

// 添加Context
const SuggestionsContext = createContext<{
  suggestions: DesignSuggestion[];
  setSuggestions: (suggestions: DesignSuggestion[]) => void;
}>({
  suggestions: [],
  setSuggestions: () => {}
});

// 修改提示词预览组件
const PromptPreview = memo(({ 
  finalPrompt, 
  setFinalPrompt,
  setShapePrompt,
  setMaterialPrompt
}: { 
  finalPrompt: string; 
  setFinalPrompt: (value: string) => void;
  setShapePrompt: (value: string) => void;
  setMaterialPrompt: (value: string) => void;
}) => (
  <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
    <div className="flex items-center justify-between">
      <Label className="text-base font-medium">提示词预览 Prompt Preview</Label>
      <div className="space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFinalPrompt('');
            setShapePrompt('');
            setMaterialPrompt('');
          }}
        >
          清空 Clear
        </Button>
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
));

// 修改环境类型定义
type EnvironmentType = 'large' | 'small';
type ViewType = 'aerial' | 'front';

// 提取到组件外部的常量
const environmentOptions = [
  {
    id: 'large',
    title: '大型结构 Large Structure',
    description: '适用于大型景观构成、建筑等\nSuitable for large scale landscapes and architecture',
    value: 'outdoor, national geopark, architecture planning, structure design, surreal art style',
    additionalInfo: '添加预设提示词：outdoor, national geopark, architecture planning, structure design, surreal art style'
  },
  {
    id: 'small',
    title: '小型结构 Small Structure',
    description: '适用于小品、地标石碑等小型构筑物\nSuitable for small installations, landmarks, and monuments',
    value: 'studio photography, simple background, surreal art style',
    additionalInfo: '添加预设提示词：studio photography, simple background, surreal art style'
  }
];

const viewOptions = [
  {
    id: 'aerial',
    title: '航拍视角 Aerial View',
    description: '从高处俯视的视角\nView from above',
    value: 'aerial view',
    additionalInfo: '添加预设提示词：aerial view'
  },
  {
    id: 'front',
    title: '正面视角 Front View',
    description: '从正面观察的视角\nView from front',
    value: 'front view',
    additionalInfo: '添加预设提示词：front view'
  }
];

const CommonSettings = ({ 
  environmentType, 
  setEnvironmentType,
  viewType,
  setViewType 
}: {
  environmentType: EnvironmentType | null;
  setEnvironmentType: (value: EnvironmentType | null) => void;
  viewType: ViewType | null;
  setViewType: (value: ViewType | null) => void;
}) => {
  return (
    <>
      <OptionSelector<EnvironmentType>
        label="环境 Environment"
        options={environmentOptions}
        value={environmentType}
        onChange={setEnvironmentType}
      />

      <OptionSelector<ViewType>
        label="视角 View"
        options={viewOptions}
        value={viewType}
        onChange={setViewType}
      />
    </>
  );
};

// 定义生成模式类型
type GenerationMode = 'text2img' | 'sketch2img' | 'souvenir';

const GenerateButton = memo(({ 
  onClick,
  isGenerating,
  disabled = false,
  mode,  // 新增 mode 参数
}: { 
  onClick: (mode: GenerationMode) => void;
  isGenerating: boolean;
  disabled: boolean;
  mode: GenerationMode;
}) => {
  return (
    <Button
      onClick={() => onClick(mode)}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      disabled={disabled || isGenerating}
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
  );
});

// 添加预设周边选项常量
const souvenirPresets = [
  {
    id: 'badge',
    title: '纪念徽章 Badge',
    description: '将景点元素制作成精致的纪念章\nCreate delicate badges with scenic elements',
    value: 'lapel pin, badge design, metal accessory, detailed emblem, miniature collectible item, professional product photography, indoor studio light, simple background, close up, product sharp focus'
  },
  {
    id: 'hat',
    title: '帽子 Hat',
    description: '将景点元素融入帽子设计\nIncorporate scenic elements into hat design',
    value: 'fashion baseball cap, embroidered pattern, casual headwear, adjustable snapback, lifestyle product photography, indoor studio light, simple background, close up, product sharp focus'
  },
  {
    id: 'teacup',
    title: '茶杯 Teacup',
    description: '将景点元素装饰在茶杯表面\nDecorate teacup surface with scenic elements',
    value: 'teacup, decorative craft pattern, drinkware, studio product photography,  indoor studio light, simple background, close up, product sharp focus'
  },
  {
    id: 'bag',
    title: '手提袋 Tote Bag',
    description: '将景点元素融入环保手提袋设计\nIncorporate scenic elements into eco-friendly tote bag design',
    value: 'canvas tote bag, fabric shopping bag, screen printed pattern, reusable eco bag, casual fashion accessory, durable material, lifestyle product photography, indoor studio light, simple background, sharp focus'
  }
];

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
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [shapePrompt, setShapePrompt] = useState('')
  const [shapeReference, setShapeReference] = useState<string | null>(null)
  const [shapeStrength, setShapeStrength] = useState(0.5)
  const [materialPrompt, setMaterialPrompt] = useState('')
  const [materialReference, setMaterialReference] = useState<string | null>(null)
  const [materialStrength, setMaterialStrength] = useState(0.5)
  const [environmentType, setEnvironmentType] = useState<EnvironmentType | null>(null);
  const [viewType, setViewType] = useState<ViewType | null>(null);
  const [finalPrompt, setFinalPrompt] = useState('')
  const [sketchImage, setSketchImage] = useState<string | null>(null)
  const [sketchStrength, setSketchStrength] = useState(0.5)
  const [isSouvenirOpen, setIsSouvenirOpen] = useState(false)
  const [souvenirType, setSouvenirType] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<DesignSuggestion[]>([]);

  const getEnvironmentPrompt = () => {
    if (!environmentType) return '';
    const selectedOption = environmentOptions.find(opt => opt.id === environmentType);
    return selectedOption?.value || '';
  };

  const getViewPrompt = () => {
    if (!viewType) return '';
    const selectedOption = viewOptions.find(opt => opt.id === viewType);
    return selectedOption?.value || '';
  };

  const getSouvenirPrompt = () => {
    if (!souvenirType) return '';
    const selectedOption = souvenirPresets.find(opt => opt.id === souvenirType);
    return selectedOption?.value || '';
  };

  const getCombinedPrompt = () => {
    const parts = [
      shapePrompt.trim() ? `${shapePrompt.trim()},` : '',
      materialPrompt.trim() ? `${materialPrompt.trim()},` : '',
      getEnvironmentPrompt().trim() ? `${getEnvironmentPrompt().trim()},` : '',
      getViewPrompt().trim() ? `${getViewPrompt().trim()},` : '',
      getSouvenirPrompt().trim() ? `${getSouvenirPrompt().trim()},` : ''
    ].filter(Boolean);

    return parts.join(' ');
  };

  useEffect(() => {
    setFinalPrompt(getCombinedPrompt());
  }, [shapePrompt, materialPrompt, environmentType, viewType, souvenirType]);

  const handleGenerate = async (mode: GenerationMode) => {
    if (!shapePrompt.trim()) return
    setIsGenerating(true)
    try {
        const params = {
            promptText: finalPrompt,
            mode,
            sketchImage: mode === 'sketch2img' ? sketchImage : null,
            sketchStrength: mode === 'sketch2img' ? sketchStrength : null,
            shapeReference: mode === 'text2img' ? shapeReference : null,
            materialReference: mode === 'text2img' ? materialReference : null,
            shapeStrength: mode === 'text2img' ? shapeStrength : null,
            materialStrength: mode === 'text2img' ? materialStrength : null,
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

  // 使用useEffect存到localStorage
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

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 overflow-hidden">
      <div className="w-1/2 p-8 overflow-y-auto">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">GLAIRS</h1>
        <h2 className="text-2xl font-bold mb-8 text-gray-400">Generative Landscape AI Inspiring and Rendering System</h2>

        <Collapsible open={isGenerateOpen} onOpenChange={setIsGenerateOpen} className="mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">景观设计</CardTitle>
              <CollapsibleTrigger>
                {isGenerateOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <Tabs defaultValue="text2img">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="text2img">图像生成 Text to Image</TabsTrigger>
                    <TabsTrigger value="sketch2img">手绘发散 Sketch Inspiration</TabsTrigger>
                  </TabsList>

                  <TabsContent value="text2img" className="space-y-6">
                    {/* 体参考图和材质参考图（在text2img模式下显示） */}
                    <div className="space-y-6">
                      <CommonInputFields_Shape 
                        shapePrompt={shapePrompt}
                        setShapePrompt={setShapePrompt}
                      />
                      {/* text2img特的参考图上传部分 */}
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
                    <CommonSettings 
                      environmentType={environmentType}
                      setEnvironmentType={setEnvironmentType}
                      viewType={viewType}
                      setViewType={setViewType}
                    />
                    <PromptPreview 
                      finalPrompt={finalPrompt}
                      setFinalPrompt={setFinalPrompt}
                      setShapePrompt={setShapePrompt}
                      setMaterialPrompt={setMaterialPrompt}
                    />
                    <GenerateButton
                      onClick={handleGenerate}
                      isGenerating={isGenerating}
                      disabled={!shapePrompt.trim()}
                      mode="text2img"
                    />
                  </TabsContent>

                  <TabsContent value="sketch2img" className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-lg font-medium">
                        手绘图上传
                        <span className="text-red-500 ml-2">*必填 Mandatory</span>
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
                    <CommonSettings 
                      environmentType={environmentType}
                      setEnvironmentType={setEnvironmentType}
                      viewType={viewType}
                      setViewType={setViewType}
                    />
                    <PromptPreview 
                      finalPrompt={finalPrompt}
                      setFinalPrompt={setFinalPrompt}
                      setShapePrompt={setShapePrompt}
                      setMaterialPrompt={setMaterialPrompt}
                    />

                    <GenerateButton
                      onClick={handleGenerate}
                      isGenerating={isGenerating}
                      disabled={!sketchImage || !shapePrompt.trim()}
                      mode="sketch2img"
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </CollapsibleContent>
          </Card >
        </Collapsible >

        {/* 新增周边设计模块 */}
        <Collapsible open={isSouvenirOpen} onOpenChange={setIsSouvenirOpen} className="mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">周边设计</CardTitle>
              <CollapsibleTrigger>
                {isSouvenirOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <Tabs defaultValue="presets">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="presets">预设周边 Presets</TabsTrigger>
                    <TabsTrigger value="ai">AI建议 AI Suggestions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="presets" className="space-y-6">
                    {/* 预设周边内容 */}
                    <CommonInputFields_Shape 
                      shapePrompt={shapePrompt}
                      setShapePrompt={setShapePrompt}
                    />
                    
                    <OptionSelector
                      label="周边类型 Souvenir Type"
                      options={souvenirPresets}
                      value={souvenirType}
                      onChange={setSouvenirType}
                    />

                    <PromptPreview 
                      finalPrompt={finalPrompt}
                      setFinalPrompt={setFinalPrompt}
                      setShapePrompt={setShapePrompt}
                      setMaterialPrompt={setMaterialPrompt}
                    />

                    <GenerateButton
                      onClick={handleGenerate}
                      isGenerating={isGenerating}
                      disabled={!shapePrompt.trim()}
                      mode="souvenir"
                    />
                  </TabsContent>

                  <TabsContent value="ai" className="space-y-6">
                    <SuggestionsContext.Provider value={{ suggestions, setSuggestions }}>
                      <LocationInputAndSuggestions 
                        onSelectSuggestion={(suggestion) => {
                          setShapePrompt(suggestion ? suggestion.shapePrompt : '');
                        }}
                        currentShapePrompt={shapePrompt}
                        onClearSelection={() => {
                          setShapePrompt('');
                        }}
                      />
                    </SuggestionsContext.Provider>

                    <PromptPreview 
                      finalPrompt={finalPrompt}
                      setFinalPrompt={setFinalPrompt}
                      setShapePrompt={setShapePrompt}
                      setMaterialPrompt={setMaterialPrompt}
                    />

                    <GenerateButton
                      onClick={handleGenerate}
                      isGenerating={isGenerating}
                      disabled={!shapePrompt.trim()}
                      mode="souvenir"
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
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