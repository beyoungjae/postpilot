'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea' //Corrected import
import { generateSentenceFromKeywords } from '@/ai/flows/generate-sentence-from-keywords'
import { suggestContentIdeas } from '@/ai/flows/suggest-content-ideas'
import { toast } from '@/hooks/use-toast'
import { generateSentencesFromImage } from '@/ai/flows/generate-sentences-from-image'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { analyzeStyleFromUrl } from '@/ai/flows/analyze-style-from-url'
import Modal from 'react-modal' // Import Modal
import { AlignJustify, Image as ImageIcon, Sparkles, Lightbulb, PenSquare, BarChart3, ArrowRight, Keyboard, Send, X, LogOut } from 'lucide-react'

// 모달 설정은 useEffect 내에서 처리

async function generateSentence(keywords: string, styleGuide: string, samplePostUrl: string) {
   try {
      const result = await generateSentenceFromKeywords({ keywords, styleGuide, samplePostUrl })
      return result.sentence
   } catch (e: any) {
      toast({
         title: '문장 생성 오류',
         description: e.message,
         variant: 'destructive',
      })
      return ''
   }
}

async function generateIdeas(topic: string) {
   try {
      const result = await suggestContentIdeas({ topic })
      return result.ideas
   } catch (e: any) {
      toast({
         title: '아이디어 생성 오류',
         description: e.message,
         variant: 'destructive',
      })
      return []
   }
}

async function generateImageSentences(imageUrl: string) {
   try {
      const result = await generateSentencesFromImage({ imageUrl })
      return result.sentences
   } catch (e: any) {
      toast({
         title: '이미지 문장 생성 오류',
         description: e.message,
         variant: 'destructive',
      })
      return []
   }
}

async function analyzeURL(url: string) {
   try {
      const result = await analyzeStyleFromUrl({ url })
      return result.styleGuide
   } catch (e: any) {
      toast({
         title: 'URL 분석 오류',
         description: e.message,
         variant: 'destructive',
      })
      return ''
   }
}

export default function Dashboard() {
   const router = useRouter()
   const [isAccessVerified, setIsAccessVerified] = useState(false)
   const [keywords, setKeywords] = React.useState('')
   const [styleGuide, setStyleGuide] = React.useState('')
   const [samplePostUrl, setSamplePostUrl] = React.useState('')
   const [generatedSentence, setGeneratedSentence] = React.useState('')
   const [topic, setTopic] = React.useState('')
   const [contentIdeas, setContentIdeas] = React.useState<string[]>([])
   const [imageUrl, setImageUrl] = React.useState('')
   const [imageSentences, setImageSentences] = React.useState<string[]>([])

   const [editorContent, setEditorContent] = useState('')
   const [urlForStyle, setUrlForStyle] = useState('')
   const [isStyleInferenceEnabled, setIsStyleInferenceEnabled] = useState(false)
   const [analyzedStyleGuide, setAnalyzedStyleGuide] = useState('')
   const [suggestedSentence, setSuggestedSentence] = useState('')

   // 모달 상태
   const [isSentenceModalOpen, setIsSentenceModalOpen] = useState(false)
   const [isEditorModalOpen, setIsEditorModalOpen] = useState(false)
   const [isImageModalOpen, setIsImageModalOpen] = useState(false)
   const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false)
   const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)

   // 로딩 상태
   const [isGeneratingSentence, setIsGeneratingSentence] = useState(false)
   const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false)
   const [isGeneratingImageSentences, setIsGeneratingImageSentences] = useState(false)
   const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false)

   // 접근 권한 확인 및 모달 초기화
   useEffect(() => {
      // Next.js 13+에서는 body 요소를 사용
      Modal.setAppElement('body')

      // 세션 스토리지에서 액세스 여부 확인
      const hasAccess = sessionStorage.getItem('postpilot_access')
      if (hasAccess === 'true') {
         setIsAccessVerified(true)
      } else {
         // 접근 권한이 없으면 메인 페이지로 리다이렉트
         router.push('/')
      }
   }, [router])

   // 로그아웃 처리
   const handleLogout = () => {
      // 세션 스토리지에서 액세스 정보 제거
      sessionStorage.removeItem('postpilot_access')
      toast({
         title: '로그아웃 되었습니다',
         description: '메인 화면으로 이동합니다.',
         variant: 'default',
      })
      router.push('/')
   }

   const handleGenerateSentence = async () => {
      if (!keywords.trim()) {
         toast({
            title: '키워드를 입력해주세요',
            variant: 'destructive',
         })
         return
      }

      setIsGeneratingSentence(true)
      try {
         const sentence = await generateSentence(keywords, styleGuide, samplePostUrl)
         setGeneratedSentence(sentence)
         if (sentence) {
            toast({
               title: '문장이 생성되었습니다',
               variant: 'default',
            })
         }
      } catch (error) {
         console.error('Error generating sentence:', error)
      } finally {
         setIsGeneratingSentence(false)
      }
   }

   const handleGenerateIdeas = async () => {
      if (!topic.trim()) {
         toast({
            title: '주제를 입력해주세요',
            variant: 'destructive',
         })
         return
      }

      setIsGeneratingIdeas(true)
      try {
         const ideas = await generateIdeas(topic)
         setContentIdeas(ideas)
         if (ideas.length > 0) {
            toast({
               title: `${ideas.length}개의 아이디어가 생성되었습니다`,
               variant: 'default',
            })
         }
      } catch (error) {
         console.error('Error generating ideas:', error)
      } finally {
         setIsGeneratingIdeas(false)
      }
   }

   const handleGenerateImageSentences = async () => {
      if (!imageUrl) {
         toast({
            title: '이미지를 업로드해주세요',
            variant: 'destructive',
         })
         return
      }

      setIsGeneratingImageSentences(true)
      try {
         const sentences = await generateImageSentences(imageUrl)
         setImageSentences(sentences)
         if (sentences.length > 0) {
            toast({
               title: `${sentences.length}개의 문장이 생성되었습니다`,
               variant: 'default',
            })
         }
      } catch (error) {
         console.error('Error generating sentences from image:', error)
      } finally {
         setIsGeneratingImageSentences(false)
      }
   }

   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
         const reader = new FileReader()
         reader.onloadend = () => {
            setImageUrl(reader.result as string)
            toast({
               title: '이미지가 업로드되었습니다',
               variant: 'default',
            })
         }
         reader.readAsDataURL(file)
      }
   }

   useEffect(() => {
      async function fetchStyleGuide() {
         if (isStyleInferenceEnabled && urlForStyle) {
            setIsAnalyzingUrl(true)
            try {
               const styleGuide = await analyzeURL(urlForStyle)
               setAnalyzedStyleGuide(styleGuide)
               if (styleGuide) {
                  toast({
                     title: 'URL 스타일 분석 완료',
                     variant: 'default',
                  })
               }
            } catch (error) {
               console.error('Error analyzing URL:', error)
            } finally {
               setIsAnalyzingUrl(false)
            }
         } else {
            setAnalyzedStyleGuide('')
         }
      }

      fetchStyleGuide()
   }, [isStyleInferenceEnabled, urlForStyle])

   const handleEditorContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEditorContent(e.target.value)
   }

   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
         e.preventDefault()
         if (suggestedSentence) {
            setEditorContent((prev) => prev + suggestedSentence)
            setSuggestedSentence('')
            toast({
               title: '문장이 추가되었습니다',
               variant: 'default',
            })
         }
      }
   }

   // 제안된 문장을 에디터에 적용하는 함수
   const applyGeneratedSentence = () => {
      if (suggestedSentence) {
         setEditorContent((prev) => prev + suggestedSentence)
         setSuggestedSentence('')
         toast({
            title: '문장이 추가되었습니다',
            variant: 'default',
         })
      } else {
         toast({
            title: '적용할 문장이 없습니다',
            description: '먼저 자동 완성을 실행해주세요',
            variant: 'destructive',
         })
      }
   }

   const fetchSentence = async () => {
      if (!editorContent.trim()) {
         toast({
            title: '먼저 에디터에 내용을 입력해주세요',
            variant: 'destructive',
         })
         return
      }

      const keywords = editorContent.split(' ').slice(-3).join(' ')
      setIsGeneratingSentence(true)
      try {
         const sentence = await generateSentence(keywords, analyzedStyleGuide, '')
         if (sentence) {
            setSuggestedSentence(sentence)
            toast({
               title: '자동 완성 제안이 생성되었습니다',
               description: 'Tab 키를 눌러 추가할 수 있습니다',
               variant: 'default',
            })
         }
      } catch (error) {
         console.error('Error fetching sentence:', error)
      } finally {
         setIsGeneratingSentence(false)
      }
   }

   // 접근 권한이 없는 경우 로딩 표시
   if (!isAccessVerified) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="loading-dots">
               <span></span>
               <span></span>
               <span></span>
            </div>
            <span className="ml-2">인증 확인 중...</span>
         </div>
      )
   }

   return (
      <main className="min-h-screen bg-background text-foreground">
         {/* 헤더 */}
         <header className="w-full bg-gradient-to-r from-amber-400 to-orange-500 py-12 clip-path-slant relative overflow-hidden noise-bg">
            {/* 배경 도형 - 데코레이션 요소 */}
            <div className="absolute top-[-50px] right-[-50px] h-[200px] w-[200px] rounded-full bg-yellow-300 opacity-20 animate-float" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-[-30px] left-[10%] h-[100px] w-[100px] rounded-full bg-amber-300 opacity-20 animate-float" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute top-[20%] left-[20%] h-[80px] w-[80px] rounded-full bg-orange-400 opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>

            <div className="container-custom relative z-10">
               <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white">
                     <span className="relative">
                        Post<span className="text-amber-200">Pilot</span>
                        <span className="absolute -bottom-2 left-0 w-full h-1 bg-white/30 rounded"></span>
                     </span>
                  </h1>
               </div>
               <div className="flex flex-col items-center justify-center">
                  <p className="text-lg md:text-xl text-white text-center opacity-90 max-w-2xl mx-auto mb-8 animate-slide-up">AI 기반 소셜 미디어 콘텐츠 생성 도구</p>

                  <div className="flex flex-wrap gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
                     <Button className="button-glow" size="lg" onClick={() => setIsSentenceModalOpen(true)}>
                        <Sparkles className="mr-2 h-5 w-5" /> 키워드로 문장 생성하기
                     </Button>
                     <Button variant="outline" className="button-outline" size="lg" onClick={() => setIsIdeaModalOpen(true)}>
                        <Lightbulb className="mr-2 h-5 w-5" /> 콘텐츠 아이디어 발굴
                     </Button>
                  </div>
               </div>
            </div>
         </header>

         {/* 메인 콘텐츠 */}
         <div className="container-custom py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
               {/* 소개 섹션 */}
               <div className="feature-card animate-slide-in-left">
                  <h2 className="text-2xl font-bold mb-4 text-gradient">환영합니다!</h2>
                  <p className="text-foreground/80 mb-4">PostPilot은 AI를 활용하여 SNS 콘텐츠 작성을 도와주는 도구입니다. 키워드 기반 문장 생성, 이미지 분석, 콘텐츠 아이디어 제안 등 다양한 기능을 제공합니다.</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                     <span className="custom-badge badge-primary">키워드 문장 생성</span>
                     <span className="custom-badge badge-secondary">이미지 분석</span>
                     <span className="custom-badge badge-primary">아이디어 발굴</span>
                     <span className="custom-badge badge-secondary">스타일 분석</span>
                  </div>
               </div>

               {/* 시작하기 섹션 */}
               <div className="feature-card animate-slide-in-right">
                  <h2 className="text-2xl font-bold mb-4 text-gradient">시작하기</h2>
                  <p className="text-foreground/80 mb-4">아래 버튼을 클릭하여 원하는 기능을 사용해보세요. 각 기능은 AI를 사용하여 다양한 형태의 콘텐츠 생성을 도와줍니다.</p>
                  <div className="flex flex-col gap-2 mt-4">
                     <Button variant="outline" className="justify-start card-hover button-hover-slide" onClick={() => setIsSentenceModalOpen(true)}>
                        <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                        키워드로 문장 생성하기
                     </Button>
                     <Button variant="outline" className="justify-start card-hover button-hover-slide" onClick={() => setIsEditorModalOpen(true)}>
                        <PenSquare className="mr-2 h-4 w-4 text-orange-500" />
                        스마트 에디터 사용하기
                     </Button>
                  </div>
               </div>
            </div>

            {/* 주요 기능 카드 */}
            <h2 className="text-2xl font-bold text-center mb-8 text-gradient">주요 기능</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
               {/* 키워드 기반 문장 생성 카드 */}
               <div className="feature-card animate-slide-up card-hover cursor-pointer" onClick={() => setIsSentenceModalOpen(true)} style={{ animationDelay: '0.2s' }}>
                  <div className="feature-icon bg-amber-100">
                     <Sparkles className="h-6 w-6 text-amber-500" />
                  </div>
                  <div className="card-content">
                     <h3 className="text-xl font-bold mb-2">키워드 기반 문장 생성</h3>
                     <p className="text-foreground/70 text-sm mb-4">키워드를 입력하면 자연스러운 문장을 생성해 드립니다. 스타일 가이드를 추가하여 원하는 톤의 문장을 만들 수 있습니다.</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full group mt-auto" onClick={() => setIsSentenceModalOpen(true)}>
                     시작하기 <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
               </div>

               {/* 이미지 분석 카드 */}
               <div className="feature-card animate-slide-up card-hover cursor-pointer" onClick={() => setIsImageModalOpen(true)} style={{ animationDelay: '0.3s' }}>
                  <div className="feature-icon bg-orange-100">
                     <ImageIcon className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="card-content">
                     <h3 className="text-xl font-bold mb-2">이미지 분석</h3>
                     <p className="text-foreground/70 text-sm mb-4">이미지를 업로드하면 AI가 분석하여 이미지에 적합한 캡션 문장을 제안해 드립니다.</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full group mt-auto" onClick={() => setIsImageModalOpen(true)}>
                     시작하기 <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
               </div>

               {/* 콘텐츠 아이디어 카드 */}
               <div className="feature-card animate-slide-up card-hover cursor-pointer" onClick={() => setIsIdeaModalOpen(true)} style={{ animationDelay: '0.4s' }}>
                  <div className="feature-icon bg-amber-100">
                     <Lightbulb className="h-6 w-6 text-amber-500" />
                  </div>
                  <div className="card-content">
                     <h3 className="text-xl font-bold mb-2">콘텐츠 아이디어 발굴</h3>
                     <p className="text-foreground/70 text-sm mb-4">주제를 입력하면 관련된 다양한 콘텐츠 아이디어를 제안해 드립니다.</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full group mt-auto" onClick={() => setIsIdeaModalOpen(true)}>
                     시작하기 <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
               </div>
            </div>

            {/* 퀵 액션 버튼 */}
            <div className="quick-action-section relative py-12 px-6 mb-12 rounded-2xl glass-effect noise-bg text-center overflow-hidden">
               <div className="absolute top-[-30px] right-[10%] h-[100px] w-[100px] rounded-full bg-amber-300 opacity-20 animate-float" style={{ animationDelay: '0.5s' }}></div>
               <div className="absolute bottom-[-20px] left-[20%] h-[80px] w-[80px] rounded-full bg-orange-300 opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>

               <h2 className="text-2xl font-bold mb-4 relative z-10">지금 바로 시작하세요</h2>
               <p className="text-foreground/80 mb-6 max-w-xl mx-auto relative z-10">PostPilot의 AI 기반 도구로 소셜 미디어 콘텐츠 생성을 더 효율적으로 만들어보세요.</p>

               <div className="flex flex-wrap gap-4 justify-center relative z-10">
                  <Button className="button-glow quick-action-button" size="lg" onClick={() => setIsSentenceModalOpen(true)}>
                     <Sparkles className="mr-2 h-5 w-5" /> 키워드로 문장 생성하기
                  </Button>
                  <Button className="button-glow quick-action-button" size="lg" onClick={() => setIsEditorModalOpen(true)}>
                     <PenSquare className="mr-2 h-5 w-5" /> 스마트 에디터 사용하기
                  </Button>
               </div>
            </div>
         </div>

         {/* 모달 창 */}
         {/* 키워드 기반 문장 생성 모달 */}
         <Modal isOpen={isSentenceModalOpen} onRequestClose={() => setIsSentenceModalOpen(false)} className="modal" overlayClassName="modal-overlay">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-gradient">키워드로 문장 생성하기</h2>
               <Button variant="ghost" size="icon" onClick={() => setIsSentenceModalOpen(false)}>
                  <X className="h-5 w-5" />
               </Button>
            </div>
            <div className="space-y-4 mb-6">
               <div>
                  <Label htmlFor="keywords">키워드</Label>
                  <Input id="keywords" placeholder="문장에 포함할 키워드를 입력하세요 (쉼표로 구분)" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
               </div>
               <div>
                  <Label htmlFor="styleGuide">스타일 가이드 (선택사항)</Label>
                  <Textarea id="styleGuide" placeholder="원하는 문장 스타일을 설명하세요 (예: 친근한, 전문적인, 유머러스한)" value={styleGuide} onChange={(e) => setStyleGuide(e.target.value)} />
               </div>
               <div>
                  <Label htmlFor="sampleUrl">참고 URL (선택사항)</Label>
                  <Input id="sampleUrl" placeholder="스타일 참고용 URL을 입력하세요" value={samplePostUrl} onChange={(e) => setSamplePostUrl(e.target.value)} />
               </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white" onClick={handleGenerateSentence} disabled={isGeneratingSentence}>
               {isGeneratingSentence ? (
                  <>
                     <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                     </div>
                     <span className="ml-2">생성 중...</span>
                  </>
               ) : (
                  <>
                     <Sparkles className="mr-2 h-4 w-4" />
                     문장 생성하기
                  </>
               )}
            </Button>
            {generatedSentence && (
               <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <h3 className="font-medium mb-2 text-amber-800">생성된 문장:</h3>
                  <p className="text-foreground">{generatedSentence}</p>
               </div>
            )}
         </Modal>

         {/* 에디터 모달 */}
         <Modal isOpen={isEditorModalOpen} onRequestClose={() => setIsEditorModalOpen(false)} className="modal" overlayClassName="modal-overlay">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-gradient">스마트 에디터</h2>
               <Button variant="ghost" size="icon" onClick={() => setIsEditorModalOpen(false)}>
                  <X className="h-5 w-5" />
               </Button>
            </div>
            <div className="space-y-4 mb-6">
               <div className="flex items-center space-x-2 mb-4">
                  <Switch id="styleInference" checked={isStyleInferenceEnabled} onCheckedChange={setIsStyleInferenceEnabled} />
                  <Label htmlFor="styleInference">스타일 감지 활성화</Label>
               </div>
               {isStyleInferenceEnabled && (
                  <div>
                     <Label htmlFor="urlForStyle">참고 URL</Label>
                     <Input id="urlForStyle" placeholder="스타일 참고용 URL을 입력하세요" value={urlForStyle} onChange={(e) => setUrlForStyle(e.target.value)} />
                  </div>
               )}
               <div>
                  <Label htmlFor="editorContent">에디터</Label>
                  <Textarea id="editorContent" placeholder="내용을 입력하세요..." value={editorContent} onChange={handleEditorContentChange} onKeyDown={handleKeyDown} className="min-h-[200px]" />
               </div>
            </div>
            <div className="flex justify-between">
               <Button variant="outline" onClick={fetchSentence} disabled={isGeneratingSentence} className="flex-1 mr-2">
                  <Keyboard className="mr-2 h-4 w-4" />
                  자동 완성
               </Button>
               <Button className="flex-1 ml-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white" disabled={isGeneratingSentence || !suggestedSentence} onClick={applyGeneratedSentence}>
                  <Send className="mr-2 h-4 w-4" />
                  적용하기
               </Button>
            </div>
            {suggestedSentence && (
               <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <h3 className="font-medium mb-2 text-amber-800">자동 완성 제안:</h3>
                  <p className="text-foreground">{suggestedSentence}</p>
                  <p className="text-xs text-muted-foreground mt-2">Tab 키를 누르거나 적용하기 버튼을 클릭하여 제안 문장을 추가하세요</p>
               </div>
            )}
         </Modal>

         {/* 이미지 모달 */}
         <Modal isOpen={isImageModalOpen} onRequestClose={() => setIsImageModalOpen(false)} className="modal" overlayClassName="modal-overlay">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-gradient">이미지 분석</h2>
               <Button variant="ghost" size="icon" onClick={() => setIsImageModalOpen(false)}>
                  <X className="h-5 w-5" />
               </Button>
            </div>
            <div className="space-y-4 mb-6">
               <div>
                  <Label htmlFor="imageUpload">이미지 업로드</Label>
                  <Input id="imageUpload" type="file" accept="image/*" onChange={handleImageUpload} className="mt-1" />
               </div>
               {imageUrl && (
                  <div className="mt-4">
                     <img src={imageUrl} alt="Uploaded" className="w-full max-h-[200px] object-contain rounded-md" />
                  </div>
               )}
            </div>
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white" onClick={handleGenerateImageSentences} disabled={isGeneratingImageSentences || !imageUrl}>
               {isGeneratingImageSentences ? (
                  <>
                     <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                     </div>
                     <span className="ml-2">분석 중...</span>
                  </>
               ) : (
                  <>
                     <ImageIcon className="mr-2 h-4 w-4" />
                     이미지 분석하기
                  </>
               )}
            </Button>
            {imageSentences.length > 0 && (
               <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <h3 className="font-medium mb-2 text-amber-800">생성된 문장:</h3>
                  <ul className="space-y-2">
                     {imageSentences.map((sentence, idx) => (
                        <li key={idx} className="text-foreground">
                           {sentence}
                        </li>
                     ))}
                  </ul>
               </div>
            )}
         </Modal>

         {/* 아이디어 모달 */}
         <Modal isOpen={isIdeaModalOpen} onRequestClose={() => setIsIdeaModalOpen(false)} className="modal" overlayClassName="modal-overlay">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-gradient">콘텐츠 아이디어 발굴</h2>
               <Button variant="ghost" size="icon" onClick={() => setIsIdeaModalOpen(false)}>
                  <X className="h-5 w-5" />
               </Button>
            </div>
            <div className="space-y-4 mb-6">
               <div>
                  <Label htmlFor="topic">주제</Label>
                  <Input id="topic" placeholder="아이디어를 생성할 주제를 입력하세요" value={topic} onChange={(e) => setTopic(e.target.value)} />
               </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white" onClick={handleGenerateIdeas} disabled={isGeneratingIdeas}>
               {isGeneratingIdeas ? (
                  <>
                     <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                     </div>
                     <span className="ml-2">생성 중...</span>
                  </>
               ) : (
                  <>
                     <Lightbulb className="mr-2 h-4 w-4" />
                     아이디어 생성하기
                  </>
               )}
            </Button>
            {contentIdeas.length > 0 && (
               <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <h3 className="font-medium mb-2 text-amber-800">생성된 아이디어:</h3>
                  <ul className="space-y-2">
                     {contentIdeas.map((idea, idx) => (
                        <li key={idx} className="text-foreground">
                           {idea}
                        </li>
                     ))}
                  </ul>
               </div>
            )}
         </Modal>

         {/* 푸터 */}
         <footer className="w-full bg-gradient-to-r from-amber-50 to-orange-50 py-8 border-t border-amber-100">
            <div className="container-custom">
               <div className="flex flex-col md:flex-row justify-between items-center">
                  <div>
                     <h3 className="text-xl font-bold text-gradient mb-2">PostPilot</h3>
                     <p className="text-foreground/70 text-sm">AI 기반 소셜 미디어 콘텐츠 생성 도구</p>
                  </div>
                  <div className="text-sm text-foreground/70 mt-4 md:mt-0">© 2025 PostPilot. All rights reserved.</div>
               </div>
            </div>
         </footer>
      </main>
   )
}
