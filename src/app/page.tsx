'use client';

import React from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {SNSPlatform} from '@/services/sns';
import {generateSentenceFromKeywords} from '@/ai/flows/generate-sentence-from-keywords';
import {suggestContentIdeas} from '@/ai/flows/suggest-content-ideas';
import {toast} from '@/hooks/use-toast';

async function generateSentence(keywords: string, styleGuide: string) {
  try {
    const result = await generateSentenceFromKeywords({keywords, styleGuide});
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

export default function Home() {
  const [keywords, setKeywords] = React.useState('');
  const [styleGuide, setStyleGuide] = React.useState('');
  const [generatedSentence, setGeneratedSentence] = React.useState('');
  const [topic, setTopic] = React.useState('');
  const [contentIdeas, setContentIdeas] = React.useState<string[]>([]);

  const handleGenerateSentence = async () => {
    const sentence = await generateSentence(keywords, styleGuide);
    setGeneratedSentence(sentence);
  };

  const handleGenerateIdeas = async () => {
    const ideas = await generateIdeas(topic);
    setContentIdeas(ideas);
  };

  const handlePublishToSNS = async (platform: SNSPlatform) => {
    // Placeholder for SNS publishing logic
    toast({
      title: `Published to ${platform}`,
      description: 'Content has been published successfully.',
    });
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
          <CardTitle>SNS 연동</CardTitle>
          <CardDescription>생성된 콘텐츠를 SNS에 게시합니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <Button onClick={() => handlePublishToSNS('facebook')}>Facebook에 게시</Button>
          <Button onClick={() => handlePublishToSNS('twitter')}>Twitter에 게시</Button>
          <Button onClick={() => handlePublishToSNS('instagram')}>Instagram에 게시</Button>
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
