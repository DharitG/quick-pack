# Quick Pack 

**Transform any content into high-yield learning materials**

##  Special Thanks to all AI tools and Vibe coding startups for bringing this incredible power of creation to everyone. 

Quick Pack is an AI-powered educational platform that instantly converts PDFs, documents, and text into comprehensive coursepacks and interactive study materials. Powered by Cerebras AI for ultra-fast generation.

![Quick Pack Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-06B6D4)

## ✨ Features

### 📚 **Comprehensive Coursepack Generation**
- **10, 25, or 50-page educational documents** with rich markdown/LaTeX formatting
- **Mathematical equations** rendered with KaTeX
- **PDF export functionality** for offline study
- **Dark mode optimized** with beautiful typography

### 🎯 **Interactive Study Materials**
- **Flashcards**: Interactive Q&A cards with flip animations and navigation
- **MCQ Quiz**: Multiple choice questions with scoring and feedback
- **Key Points**: Concise bullet-point summaries
- **Definitions**: Quick-reference glossary of important terms

### ⚡ **Blazing Fast Performance**
- **Powered by Cerebras AI** (Qwen-3-235B model)
- **Generate 50+ pages in <15 seconds**
- **Ultra-fast reasoning at 2000+ tokens/sec**
- **Parallel processing** for study materials generation

### 🔧 **Advanced Features**
- **Multiple file format support** (PDF, TXT, DOC)
- **Rate limiting & retry logic** for reliable API calls
- **Progressive error handling** with graceful fallbacks
- **Responsive design** for all device sizes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Cerebras API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/augstai/quick-pack.git
   cd quick-pack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your Cerebras API key
   CEREBRAS_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📖 Usage

### Basic Workflow

1. **Upload Content**
   - Drag & drop PDF files or text documents
   - Select output length (10, 25, or 50 pages)

2. **Generate Materials**
   - Click "Generate Coursepack" 
   - AI creates comprehensive coursepack + study materials

3. **Study & Export**
   - Review generated coursepack
   - Use interactive flashcards and quizzes
   - Export to PDF for offline access

### Study Materials

#### 📇 **Flashcards**
- Navigate with Previous/Next buttons
- Click cards to flip between questions and answers  
- Progress tracking with visual indicators

#### 📝 **MCQ Quiz**
- Answer multiple choice questions
- Submit for instant scoring
- Review correct/incorrect answers with color coding
- Retry functionality to improve scores

#### 📋 **Key Points & Definitions**
- Quick-reference summaries
- Concise definitions for important terms
- Perfect for last-minute review

## 🏗️ Technology Stack

### Frontend
- **Next.js 15.4.5** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Tailwind CSS 4.0** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful iconography

### AI & Processing
- **Cerebras AI** - Ultra-fast inference with Qwen-3-235B
- **PDF-Parse** - PDF text extraction
- **React Markdown** - Markdown rendering with LaTeX support
- **KaTeX** - Mathematical notation rendering

### Export & Utilities
- **html2pdf.js** - Client-side PDF generation
- **remark-math & rehype-katex** - Math processing pipeline

## 🎨 Design Philosophy

### User Experience
- **Speed First**: Generate materials in seconds, not minutes
- **Interactive Learning**: Move beyond static content to engaging study tools
- **Professional Quality**: Publication-ready formatting and typography
- **Accessibility**: WCAG compliant with keyboard navigation

### Technical Approach
- **Client-Side Processing**: Fast, private PDF export without server roundtrips
- **Graceful Degradation**: Robust error handling with meaningful fallbacks
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Performance Optimized**: Lazy loading, code splitting, and efficient rendering

## 📁 Project Structure

```
quick-pack/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/          # Main coursepack generation
│   │   │   └── generate-learning/ # Study materials generation
│   │   ├── globals.css            # Global styles + KaTeX theming
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Main application component
│   ├── components/
│   │   └── ui/                    # Reusable UI components
│   └── lib/
│       └── utils.ts               # Utility functions
├── public/                        # Static assets
└── package.json
```

## ⚙️ Configuration

### Environment Variables
```bash
CEREBRAS_API_KEY=your_cerebras_api_key
```

### Customization Options

#### Page Limits
Modify available page options in `page.tsx`:
```typescript
<SelectItem value="10">10 pages</SelectItem>
<SelectItem value="25">25 pages</SelectItem>
<SelectItem value="50">50 pages</SelectItem>
```

#### AI Model Configuration
Update model in `generate/route.ts` and `generate-learning/route.ts`:
```typescript
model: "qwen-3-235b-a22b-instruct-2507"
```

#### Styling
- **Colors**: Modify Tailwind config in `tailwind.config.ts`
- **Fonts**: Update font imports in `globals.css`
- **KaTeX Themes**: Customize math rendering in `globals.css`

## 🔧 API Reference

### POST `/api/generate`
Generate comprehensive educational coursepack

**Body**: FormData
- `files`: File[] - Documents to process
- `pageLimit`: string - Target page count ("10", "25", "50")

**Response**: 
```json
{
  "content": "Generated coursepack in markdown format"
}
```

### POST `/api/generate-learning`
Generate interactive study materials

**Body**: FormData (same as above)

**Response**:
```json
{
  "flashcards": "Q&A pairs for flashcard study",
  "mcq": "Multiple choice questions with answers", 
  "summary": "Key takeaways in bullet points",
  "definitions": "Important terms and definitions"
}
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind for styling consistency
- Add proper error handling for new features
- Test with various file types and sizes
- Maintain accessibility standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Cerebras AI** for providing ultra-fast inference capabilities
- **Vercel** for Next.js 
- **Radix UI** for accessible component primitives
- **KaTeX** team for beautiful mathematical rendering



---

**Vibe Coded with ❤️ for learners everywhere**

*Transform your study materials in seconds, master your subjects in minutes.*