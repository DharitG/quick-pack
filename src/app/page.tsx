"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import MarkdownPreview from '@uiw/react-markdown-preview';
import '@uiw/react-markdown-preview/markdown.css';
import 'katex/dist/katex.min.css';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { 
  FileText, 
  Link, 
  FileImage, 
  Youtube, 
  Sparkles, 
  Brain, 
  Lightbulb, 
  Calculator, 
  BookOpen, 
  HelpCircle, 
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Play
} from "lucide-react";

export default function QuickPackApp() {
  const [outputTab, setOutputTab] = useState("flashcards");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pageLimit, setPageLimit] = useState("25");
  const [generatedContent, setGeneratedContent] = useState("");
  const [learningMaterials, setLearningMaterials] = useState({
    flashcards: "",
    mcq: "", 
    summary: "",
    definitions: ""
  });
  const [files, setFiles] = useState<File[]>([]);
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [youtubeInput, setYoutubeInput] = useState("");
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [currentMCQ, setCurrentMCQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  const [showMCQResults, setShowMCQResults] = useState(false);

  // Parse flashcards from generated content
  const parseFlashcards = (content: string) => {
    if (!content) return [];
    const cards = content.split('---').map(card => {
      const lines = card.trim().split('\n');
      const qLine = lines.find(line => line.startsWith('**Q:**'));
      const aLine = lines.find(line => line.startsWith('**A:**'));
      
      if (qLine && aLine) {
        return {
          question: qLine.replace('**Q:**', '').trim(),
          answer: aLine.replace('**A:**', '').trim()
        };
      }
      return null;
    }).filter(Boolean);
    return cards;
  };

  // Parse MCQ from generated content
  const parseMCQ = (content: string) => {
    if (!content) return [];
    const questions = [];
    const questionBlocks = content.split(/\*\*\d+\./).slice(1);
    
    questionBlocks.forEach((block, index) => {
      const lines = block.split('\n').filter(line => line.trim());
      if (lines.length >= 5) {
        const question = lines[0].replace(/\?\*\*$/, '').trim();
        const options = lines.slice(1, 5).map(line => line.trim());
        const answerLine = lines.find(line => line.startsWith('*Answer:'));
        const correctAnswer = answerLine ? answerLine.replace('*Answer:', '').replace('*', '').trim() : 'A';
        
        questions.push({
          id: index,
          question,
          options,
          correctAnswer
        });
      }
    });
    return questions;
  };

  const flashcards = parseFlashcards(learningMaterials.flashcards);
  const mcqQuestions = parseMCQ(learningMaterials.mcq);

  const nextFlashcard = () => {
    setCurrentFlashcard((prev) => (prev + 1) % flashcards.length);
    setShowFlashcardAnswer(false);
  };

  const prevFlashcard = () => {
    setCurrentFlashcard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setShowFlashcardAnswer(false);
  };

  const handleMCQAnswer = (questionId: number, answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const submitMCQQuiz = () => {
    setShowMCQResults(true);
  };

  const resetMCQQuiz = () => {
    setSelectedAnswers({});
    setShowMCQResults(false);
    setCurrentMCQ(0);
  };

  const handlePDFDownload = async () => {
    // Dynamic import to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;
    
    const element = document.getElementById('coursepack-content');
    if (!element) return;

    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: 'Quick-Pack-Coursepack.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait' 
      }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedContent("");
    setLearningMaterials({ flashcards: "", mcq: "", summary: "", definitions: "" });

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('pageLimit', pageLimit);

      // Generate main coursepack
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data.content);

      // Generate learning materials
      const learningResponse = await fetch('/api/generate-learning', {
        method: 'POST',
        body: formData,
      });

      if (learningResponse.ok) {
        const learningData = await learningResponse.json();
        setLearningMaterials(learningData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">


      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 
            className="text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-silver bg-clip-text text-transparent leading-tight"
            style={{fontFamily: 'var(--font-instru)', lineHeight: '1.2'}}
          >
            Quick Pack
          </h1>
          <p className="font-berk text-slate-400 text-lg mb-4">Transform any content into high-yield learning materials</p>
          <div className="flex items-center justify-center gap-6 text-sm font-berk text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Powered by Cerebras AI</span>
            </div>
            <div className="w-px h-4 bg-slate-600"></div>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Generate 50+ pages in &lt;15 seconds
            </span>
            <div className="w-px h-4 bg-slate-600"></div>
            <span className="flex items-center gap-1">
              <Brain className="w-3 h-3" />
              Ultra-fast reasoning at 2000+ tokens/sec
            </span>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 lg:items-start">
          {/* Input Section */}
          <div className="space-y-6 flex flex-col h-full">
            <Card className="bg-card border-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-100">Content Input</CardTitle>
                <CardDescription className="font-berk text-slate-400">
                  Upload your files here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <FileImage className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Drag & drop files here, or click to select files</p>
                    <Input
                      type="file"
                      multiple
                      className="hidden"
                      id="file-upload"
                      onChange={handleFileChange}
                    />
                    <div className="mt-4">
                      {files.map((file, i) => (
                        <div key={i} className="text-sm text-muted-foreground">
                          {file.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </label>
              </CardContent>
            </Card>

            <Card className="bg-card border-border backdrop-blur-sm flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="text-slate-100">Generation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Output Length</label>
                  <Select value={pageLimit} onValueChange={setPageLimit}>
                    <SelectTrigger className="bg-secondary border-border text-foreground">
                      <SelectValue placeholder="Select output length" />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary border-border">
                      <SelectItem value="10">10 pages</SelectItem>
                      <SelectItem value="25">25 pages</SelectItem>
                      <SelectItem value="50">50 pages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-auto"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Coursepack
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <Card className="bg-card border-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-100">Learning Materials</CardTitle>
                <CardDescription className="font-berk text-slate-400">
                  Your generated educational content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={outputTab} onValueChange={setOutputTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-secondary">
                    <TabsTrigger 
                      value="flashcards" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Flashcards
                    </TabsTrigger>
                    <TabsTrigger 
                      value="mcq" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      MCQ Quiz
                    </TabsTrigger>
                    <TabsTrigger 
                      value="summary" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Key Points
                    </TabsTrigger>
                    <TabsTrigger 
                      value="definitions" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Definitions
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="flashcards" className="mt-4">
                    <div className="bg-secondary rounded-lg p-4 min-h-[400px] flex flex-col">
                      {flashcards.length > 0 ? (
                        <div className="flex-1 flex flex-col">
                          {/* Flashcard Counter */}
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-muted-foreground">
                              Card {currentFlashcard + 1} of {flashcards.length}
                            </span>
                            <Button
                              onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
                              size="sm"
                              variant="outline"
                              className="border-border text-foreground hover:bg-primary hover:text-primary-foreground"
                            >
                              {showFlashcardAnswer ? 'Show Question' : 'Show Answer'}
                            </Button>
                          </div>

                          {/* Flashcard */}
                          <div className="flex-1 flex flex-col justify-center">
                            <div 
                              className="bg-card border border-border rounded-lg p-6 text-center min-h-[200px] flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
                            >
                              <div>
                                <div className="text-xs text-muted-foreground mb-2">
                                  {showFlashcardAnswer ? 'ANSWER' : 'QUESTION'}
                                </div>
                                <p className="text-lg text-foreground">
                                  {showFlashcardAnswer 
                                    ? flashcards[currentFlashcard]?.answer 
                                    : flashcards[currentFlashcard]?.question
                                  }
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Navigation */}
                          <div className="flex justify-between items-center mt-4">
                            <Button
                              onClick={prevFlashcard}
                              size="sm"
                              variant="outline"
                              disabled={flashcards.length <= 1}
                              className="border-border text-foreground hover:bg-secondary"
                            >
                              <ChevronLeft className="w-4 h-4 mr-1" />
                              Previous
                            </Button>
                            
                            <div className="flex gap-1">
                              {flashcards.slice(0, 5).map((_, index) => (
                                <div
                                  key={index}
                                  className={`w-2 h-2 rounded-full ${
                                    index === currentFlashcard ? 'bg-primary' : 'bg-muted'
                                  }`}
                                />
                              ))}
                              {flashcards.length > 5 && <span className="text-muted-foreground">...</span>}
                            </div>

                            <Button
                              onClick={nextFlashcard}
                              size="sm"
                              variant="outline"
                              disabled={flashcards.length <= 1}
                              className="border-border text-foreground hover:bg-secondary"
                            >
                              Next
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">Interactive flashcards will appear here</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="mcq" className="mt-4">
                    <div className="bg-secondary rounded-lg p-4 min-h-[400px] flex flex-col">
                      {mcqQuestions.length > 0 ? (
                        <div className="flex-1 flex flex-col">
                          {/* Quiz Header */}
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-muted-foreground">
                              {Object.keys(selectedAnswers).length} of {mcqQuestions.length} answered
                            </span>
                            <div className="flex gap-2">
                              {!showMCQResults && (
                                <Button
                                  onClick={submitMCQQuiz}
                                  size="sm"
                                  disabled={Object.keys(selectedAnswers).length !== mcqQuestions.length}
                                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                  <Play className="w-4 h-4 mr-1" />
                                  Submit Quiz
                                </Button>
                              )}
                              {showMCQResults && (
                                <Button
                                  onClick={resetMCQQuiz}
                                  size="sm"
                                  variant="outline"
                                  className="border-border text-foreground hover:bg-secondary"
                                >
                                  <RotateCcw className="w-4 h-4 mr-1" />
                                  Retry
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Score Display */}
                          {showMCQResults && (
                            <div className="mb-4 p-3 bg-card border border-border rounded-lg">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-foreground">
                                  {Math.round((Object.entries(selectedAnswers).filter(([id, answer]) => 
                                    mcqQuestions[parseInt(id)]?.correctAnswer === answer
                                  ).length / mcqQuestions.length) * 100)}%
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {Object.entries(selectedAnswers).filter(([id, answer]) => 
                                    mcqQuestions[parseInt(id)]?.correctAnswer === answer
                                  ).length} out of {mcqQuestions.length} correct
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Questions */}
                          <div className="flex-1 overflow-auto space-y-4">
                            {mcqQuestions.map((question, index) => {
                              const userAnswer = selectedAnswers[index];
                              const isCorrect = showMCQResults && userAnswer === question.correctAnswer;
                              const isWrong = showMCQResults && userAnswer && userAnswer !== question.correctAnswer;

                              return (
                                <div key={index} className="bg-card border border-border rounded-lg p-4">
                                  <div className="flex items-start gap-2 mb-3">
                                    <span className="text-sm font-medium text-muted-foreground">
                                      {index + 1}.
                                    </span>
                                    <h3 className="text-foreground font-medium">
                                      {question.question}
                                    </h3>
                                    {showMCQResults && (
                                      <div className="ml-auto">
                                        {isCorrect ? (
                                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : isWrong ? (
                                          <XCircle className="w-5 h-5 text-red-500" />
                                        ) : null}
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    {question.options.map((option, optIndex) => {
                                      const optionLetter = String.fromCharCode(65 + optIndex); // A, B, C, D
                                      const isSelected = userAnswer === optionLetter;
                                      const isCorrectOption = showMCQResults && question.correctAnswer === optionLetter;

                                      return (
                                        <label
                                          key={optIndex}
                                          className={`flex items-center gap-3 p-2 rounded border cursor-pointer transition-colors ${
                                            isSelected && !showMCQResults
                                              ? 'border-primary bg-primary/10'
                                              : isCorrectOption && showMCQResults
                                              ? 'border-green-500 bg-green-500/10 text-green-500'
                                              : isSelected && isWrong
                                              ? 'border-red-500 bg-red-500/10 text-red-500'
                                              : 'border-border hover:border-muted-foreground'
                                          }`}
                                        >
                                          <input
                                            type="radio"
                                            name={`question-${index}`}
                                            value={optionLetter}
                                            checked={isSelected}
                                            onChange={(e) => handleMCQAnswer(index, e.target.value)}
                                            disabled={showMCQResults}
                                            className="sr-only"
                                          />
                                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                            isSelected ? 'border-current' : 'border-muted-foreground'
                                          }`}>
                                            {isSelected && <div className="w-2 h-2 rounded-full bg-current" />}
                                          </div>
                                          <span className="text-sm">
                                            {optionLetter}) {option.replace(/^[A-D]\)\s*/, '')}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">Multiple choice quiz will appear here</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="summary" className="mt-4">
                    <div className="bg-secondary rounded-lg p-4 min-h-[400px] flex flex-col">
                      {learningMaterials.summary ? (
                        <div className="flex-1 overflow-auto">
                          <MarkdownPreview 
                            source={learningMaterials.summary}
                            data-color-mode="dark"
                            style={{ 
                              backgroundColor: 'transparent', 
                              color: '#e2e8f0',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">Key takeaways will appear here</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="definitions" className="mt-4">
                    <div className="bg-secondary rounded-lg p-4 min-h-[400px] flex flex-col">
                      {learningMaterials.definitions ? (
                        <div className="flex-1 overflow-auto">
                          <MarkdownPreview 
                            source={learningMaterials.definitions}
                            data-color-mode="dark"
                            style={{ 
                              backgroundColor: 'transparent', 
                              color: '#e2e8f0',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">Key terms & definitions will appear here</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {generatedContent && (
          <div className="mt-8">
            <Card className="bg-card border-border backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-slate-100">Generated Coursepack</CardTitle>
                <Button
                  onClick={handlePDFDownload}
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground hover:bg-secondary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </CardHeader>
              <CardContent>
                <div id="coursepack-content">
                  <MarkdownPreview 
                    source={generatedContent}
                    data-color-mode="dark"
                    rehypePlugins={[[rehypeKatex, { 
                      throwOnError: false, 
                      errorColor: '#ff6b6b',
                      strict: false 
                    }]]}
                    remarkPlugins={[remarkMath]}
                    wrapperElement={{
                      'data-color-mode': 'dark'
                    }}
                    style={{ 
                      backgroundColor: 'transparent', 
                      color: '#e2e8f0',
                      padding: '20px',
                      lineHeight: '1.6',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
