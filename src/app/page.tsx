'use client';

import React, {useState, useRef, useEffect} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {generateSentenceFromKeywords} from '@/ai/flows/generate-sentence-from-keywords';
import {suggestContentIdeas} from '@/ai/flows/suggest-content-ideas';
import {toast} from '@/hooks/use-toast';
import {generateSentencesFromImage} from '@/ai/flows/generate-sentences-from-image';
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";

async function generateSentence(keywords: string, styleGuide: string, samplePostUrl: string) {
  try {
    const result = await generateSentenceFromKeywords({keywords, styleGuide, samplePostUrl});
    return result.sentence;
  } catch (e: any) {
    toast({
      title: 'Error generating sentence',
      description: e.message,
      variant: 'destructive',
    });
    return '';
  }
}

async function generateIdeas(topic: string) {
  try {
    const result = await suggestContentIdeas({topic});
    return result.ideas;
  } catch (e: any) {
    toast({
      title: 'Error generating content ideas',
      description: e.message,
      variant: 'destructive',
    });
    return [];
  }
}

async function generateImageSentences(imageUrl: string) {
  try {
    const result = await generateSentencesFromImage({imageUrl});
    return result.sentences;
  } catch (e: any) {
    toast({
      title: 'Error generating sentences from image',
      description: e.message,
      variant: 'destructive',
    });
    return [];
  }
}

export default function Home() {
  const [keywords, setKeywords] = React.useState('');
  const [styleGuide, setStyleGuide] = React.useState('');
  const [samplePostUrl, setSamplePostUrl] = React.useState('');
  const [generatedSentence, setGeneratedSentence] = React.useState('');
  const [topic, setTopic] = React.useState('');
  const [contentIdeas, setContentIdeas] = React.useState<string[]>([]);
  const [imageUrl, setImageUrl] = React.useState('');
  const [imageSentences, setImageSentences] = React.useState<string[]>([]);

  const [editorContent, setEditorContent] = useState('');
    const [urlForStyle, setUrlForStyle] = useState('');
    const [isStyleInferenceEnabled, setIsStyleInferenceEnabled] = useState(false);

  const handleGenerateSentence = async () => {
    const sentence = await generateSentence(keywords, styleGuide, samplePostUrl);
    setGeneratedSentence(sentence);
  };

  const handleGenerateIdeas = async () => {
    const ideas = await generateIdeas(topic);
    setContentIdeas(ideas);
  };

  const handleGenerateImageSentences = async () => {
    const sentences = await generateImageSentences(imageUrl);
    setImageSentences(sentences);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">PostPilot - AI Content Creation Tool</h1>

      <Card>
        <CardHeader>
          <CardTitle>키워드 기반 문장 생성</CardTitle>
          <CardDescription>주어진 키워드를 사용하여 문장을 생성합니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Input
            type="text"
            placeholder="키워드를 입력하세요"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
          <Textarea
            placeholder="글쓰기 스타일 가이드 (선택 사항)"
            value={styleGuide}
            onChange={(e) => setStyleGuide(e.target.value)}
          />
          <Input
            type="text"
            placeholder="스타일 참조 URL (선택 사항)"
            value={samplePostUrl}
            onChange={(e) => setSamplePostUrl(e.target.value)}
          />
          <Button onClick={handleGenerateSentence}>문장 생성</Button>
          {generatedSentence && (
            <div className="border rounded-md p-2 mt-2">
              <strong>생성된 문장:</strong>
              <p>{generatedSentence}</p>
            </div>
          )}
        </CardContent>
      </Card>

            <Card>
                <CardHeader>
                    <CardTitle>글쓰기 에디터</CardTitle>
                    <CardDescription>URL 분석 스타일 참조로 글쓰기 보조(자동 완성)를 사용해 보세요.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <Textarea
                        placeholder="여기에 글을 작성하세요..."
                        value={editorContent}
                        onChange={(e) => setEditorContent(e.target.value)}
                    />
                    <Input
                        type="url"
                        placeholder="스타일 참조 URL"
                        value={urlForStyle}
                        onChange={(e) => setUrlForStyle(e.target.value)}
                    />
                    <div className="flex items-center justify-between">
                        <Label htmlFor="style-inference">스타일 분석 기반 자동 완성</Label>
                        <Switch
                            id="style-inference"
                            checked={isStyleInferenceEnabled}
                            onCheckedChange={setIsStyleInferenceEnabled}
                        />
                    </div>
                    {isStyleInferenceEnabled && (
                        <div>
                            <p>현재 {urlForStyle} 스타일을 분석하여 문장 자동 완성을 제공합니다.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

      <Card>
        <CardHeader>
          <CardTitle>이미지 기반 문장 추천</CardTitle>
          <CardDescription>이미지에 맞는 문장을 추천합니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
          {imageUrl && (
            <img src={imageUrl} alt="Uploaded" className="max-h-48 rounded-md" />
          )}
          <Button onClick={handleGenerateImageSentences} disabled={!imageUrl}>
            문장 추천 받기
          </Button>
          {imageSentences.length > 0 && (
            <div className="mt-2">
              <strong>추천 문장:</strong>
              <ul>
                {imageSentences.map((sentence, index) => (
                  <li key={index} className="list-disc ml-4">
                    {sentence}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>아이디어 제안</CardTitle>
          <CardDescription>콘텐츠 주제에 맞는 아이디어를 생성합니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Input
            type="text"
            placeholder="콘텐츠 주제를 입력하세요"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Button onClick={handleGenerateIdeas}>아이디어 생성</Button>
          {contentIdeas.length > 0 && (
            <div className="mt-2">
              <strong>생성된 아이디어:</strong>
              <ul>
                {contentIdeas.map((idea, index) => (
                  <li key={index} className="list-disc ml-4">
                    {idea}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>성과 측정</CardTitle>
          <CardDescription>콘텐츠 성과를 측정합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>간단한 통계 기능은 추후 업데이트 예정입니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
