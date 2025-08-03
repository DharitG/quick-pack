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
  XCircle
} from "lucide-react";

export default function QuickPackApp() {
  const [outputTab, setOutputTab] = useState("outline");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pageLimit, setPageLimit] = useState("25");
  const [generatedContent, setGeneratedContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [youtubeInput, setYoutubeInput] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedContent("");

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('pageLimit', pageLimit);

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data.content);
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
          <p className="font-berk text-slate-400 text-lg">Transform any content into high-yield learning materials</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
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

            <Card className="bg-card border-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-100">Generation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
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
                      value="outline" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Outline
                    </TabsTrigger>
                    <TabsTrigger 
                      value="graph" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Graph
                    </TabsTrigger>
                    <TabsTrigger 
                      value="qa" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Q&A
                    </TabsTrigger>
                    <TabsTrigger 
                      value="residue" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Residue
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="outline" className="mt-4">
                    <div className="bg-secondary rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                      <div className="text-center">
                        <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">High-yield outline will appear here</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="graph" className="mt-4">
                    <div className="bg-secondary rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                      <div className="text-center">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Concept graph will appear here</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="qa" className="mt-4">
                    <div className="bg-secondary rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                      <div className="text-center">
                        <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Socratic Q&A will appear here</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="residue" className="mt-4">
                    <div className="bg-secondary rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                      <div className="text-center">
                        <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Residue detection will appear here</p>
                      </div>
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
              <CardHeader>
                <CardTitle className="text-slate-100">Generated Coursepack</CardTitle>
              </CardHeader>
              <CardContent>
                <MarkdownPreview 
                  source={generatedContent}
                  style={{ backgroundColor: 'transparent', color: '#e2e8f0' }}
                  wrapperElement={{ "data-color-mode": "dark" }}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
