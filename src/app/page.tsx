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
import { AlignJustify, Image as ImageIcon, Sparkles, Lightbulb, PenSquare, BarChart3, ArrowRight, Keyboard, Send, X, Check } from 'lucide-react'

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

export default function HomePage() {
   const router = useRouter()
   const [accessCode, setAccessCode] = useState('')
   const [isModalOpen, setIsModalOpen] = useState(false)
   const [isValidating, setIsValidating] = useState(false)
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

   // 유효한 액세스 코드 - 실제로는 환경 변수나 서버에서 관리해야 합니다
   const VALID_ACCESS_CODE = 'POSTPILOT2025'

   // 클라이언트 사이드에서만 모달 초기화
   useEffect(() => {
      Modal.setAppElement('body')
   }, [])

   const handleAccessCodeSubmit = () => {
      setIsValidating(true)

      // 액세스 코드 검증 (실제 서비스에서는 서버 API 호출로 구현)
      setTimeout(() => {
         if (accessCode === VALID_ACCESS_CODE) {
            // 세션에 액세스 코드 저장
            sessionStorage.setItem('postpilot_access', 'true')
            toast({
               title: '액세스 코드 확인 성공',
               description: '대시보드로 이동합니다.',
               variant: 'default',
            })
            router.push('/dashboard')
         } else {
            toast({
               title: '액세스 코드 오류',
               description: '올바른 액세스 코드를 입력해주세요.',
               variant: 'destructive',
            })
         }
         setIsValidating(false)
      }, 1500)
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

   return (
      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white text-foreground">
         {/* 네비게이션 바 */}
         <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-amber-100">
            <div className="container-custom flex justify-between items-center py-4">
               <div className="flex items-center">
                  <h1 className="text-2xl font-bold flex items-center">
                     <img src="/logo.png" alt="PostPilot Logo" className="w-8 h-8 mr-1" />
                     <span className="text-gradient">Post</span>
                     <span className="text-orange-500">Pilot</span>
                  </h1>
               </div>
               <Button className="button-glow" size="sm" onClick={() => setIsModalOpen(true)}>
                  시작하기 <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
            </div>
         </nav>

         {/* 히어로 섹션 */}
         <section className="pt-32 pb-20 relative overflow-hidden">
            <div className="absolute top-[-50px] right-[10%] h-[300px] w-[300px] rounded-full bg-gradient-to-r from-amber-200 to-amber-300 opacity-20 blur-3xl animate-float" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-[-100px] left-[15%] h-[250px] w-[250px] rounded-full bg-gradient-to-r from-orange-200 to-orange-300 opacity-20 blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>

            <div className="container-custom relative z-10">
               <div className="flex flex-col items-center text-center">
                  <div className="inline-block mb-4 px-4 py-1 bg-amber-100 rounded-full text-amber-800 text-sm font-medium animate-fade-in">AI 기반 소셜 미디어 콘텐츠 생성 도구</div>
                  <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
                     소셜 미디어 콘텐츠
                     <br />
                     <span className="text-gradient">더 쉽고 빠르게</span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                     PostPilot은 AI 기술을 활용하여 키워드 기반 문장 생성, 이미지 분석, 콘텐츠 아이디어 발굴 등 다양한 기능을 제공하는 소셜 미디어 콘텐츠 생성 도구입니다.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
                     <Button className="button-glow bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg" size="lg" onClick={() => setIsModalOpen(true)}>
                        <Sparkles className="mr-2 h-5 w-5" /> 지금 시작하기
                     </Button>
                  </div>
               </div>
            </div>
         </section>

         {/* 기능 소개 섹션 */}
         <section className="py-20 bg-white">
            <div className="container-custom">
               <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold mb-4">주요 기능</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">PostPilot의 강력한 기능들을 통해 소셜 미디어 콘텐츠 제작 과정을 효율적으로 개선해보세요.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* 기능 카드 1 */}
                  <div className="feature-card">
                     <div className="feature-icon bg-amber-100">
                        <Sparkles className="h-6 w-6 text-amber-500" />
                     </div>
                     <div className="card-content">
                        <h3 className="text-xl font-bold mb-2">키워드 기반 문장 생성</h3>
                        <p className="text-foreground/70 text-sm">키워드를 입력하면 자연스러운 문장을 생성해 드립니다. 스타일 가이드를 추가하여 원하는 톤의 문장을 만들 수 있습니다.</p>
                     </div>
                  </div>

                  {/* 기능 카드 2 */}
                  <div className="feature-card">
                     <div className="feature-icon bg-orange-100">
                        <Lightbulb className="h-6 w-6 text-orange-500" />
                     </div>
                     <div className="card-content">
                        <h3 className="text-xl font-bold mb-2">콘텐츠 아이디어 발굴</h3>
                        <p className="text-foreground/70 text-sm">주제를 입력하면 관련된 다양한 콘텐츠 아이디어를 제안해 드립니다. 소셜 미디어 콘텐츠 계획에 도움을 줍니다.</p>
                     </div>
                  </div>

                  {/* 기능 카드 3 */}
                  <div className="feature-card">
                     <div className="feature-icon bg-amber-100">
                        <PenSquare className="h-6 w-6 text-amber-500" />
                     </div>
                     <div className="card-content">
                        <h3 className="text-xl font-bold mb-2">스마트 에디터</h3>
                        <p className="text-foreground/70 text-sm">글을 작성하는 동안 자동 완성 기능을 통해 더 효율적으로 콘텐츠를 만들 수 있습니다. 스타일 분석 기능을 통해 일관된 톤을 유지하세요.</p>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* 호출 섹션 */}
         <section className="py-20 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="container-custom">
               <div className="quick-action-section relative py-12 px-6 rounded-2xl glass-effect noise-bg text-center overflow-hidden">
                  <div className="absolute top-[-30px] right-[10%] h-[100px] w-[100px] rounded-full bg-amber-300 opacity-20 animate-float" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute bottom-[-20px] left-[20%] h-[80px] w-[80px] rounded-full bg-orange-300 opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>

                  <h2 className="text-2xl font-bold mb-4 relative z-10">지금 바로 시작하세요</h2>
                  <p className="text-foreground/80 mb-6 max-w-xl mx-auto relative z-10">액세스 코드를 입력하여 PostPilot의 모든 기능을 이용해보세요.</p>

                  <div className="flex justify-center relative z-10">
                     <Button className="button-glow quick-action-button" size="lg" onClick={() => setIsModalOpen(true)}>
                        <Sparkles className="mr-2 h-5 w-5" /> 시작하기
                     </Button>
                  </div>
               </div>
            </div>
         </section>

         {/* 푸터 */}
         <footer className="bg-white py-12 border-t border-amber-100">
            <div className="container-custom">
               <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="mb-6 md:mb-0">
                     <h3 className="text-2xl font-bold text-gradient mb-3">PostPilot</h3>
                     <p className="text-foreground/70">AI 기반 소셜 미디어 콘텐츠 생성 도구</p>
                  </div>
                  <div className="text-sm text-foreground/70">© 2025 PostPilot. All rights reserved.</div>
               </div>
            </div>
         </footer>

         {/* 액세스 코드 모달 */}
         <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} className="modal" overlayClassName="modal-overlay">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-gradient">서비스 액세스</h2>
               <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                  <X className="h-5 w-5" />
               </Button>
            </div>
            <div className="space-y-4 mb-6">
               <div>
                  <Label htmlFor="accessCode">액세스 코드</Label>
                  <Input id="accessCode" placeholder="액세스 코드를 입력하세요" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-2">PostPilot 서비스를 이용하기 위해 액세스 코드가 필요합니다.</p>
               </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white" onClick={handleAccessCodeSubmit} disabled={isValidating || !accessCode.trim()}>
               {isValidating ? (
                  <>
                     <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                     </div>
                     <span className="ml-2">확인 중...</span>
                  </>
               ) : (
                  <>
                     <Check className="mr-2 h-4 w-4" />
                     확인하기
                  </>
               )}
            </Button>
         </Modal>
      </main>
   )
}
