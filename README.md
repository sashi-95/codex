# NextGen Analytics Portal with Zendesk Knowledge Base Builder

A modern, production-ready dashboard and analytics platform built with Next.js 14, featuring integrated Zendesk Knowledge Base management with AI-powered content creation.

## Features

### Analytics Dashboard
- **Executive Dashboard**: Real-time KPIs, revenue trends, and AI-powered insights
- **Finance Dashboard**: Revenue tracking, P&L statements, AR/AP aging analysis
- **Sales Dashboard**: Sales pipeline, regional performance, and deal tracking
- **AI Insights Center**: AI-generated business insights and recommendations
- **Auto Reporting Studio**: Automated report generation in multiple formats

### Zendesk Knowledge Base Builder
- **Article Management**: Create, read, update, and delete knowledge base articles
- **AI Content Enhancement**: Improve, expand, summarize, or format articles
- **AI Article Generation**: Generate complete articles from topics
- **Bulk Operations**: Import multiple articles at once
- **Category & Section Browsing**: Navigate your knowledge base structure
- **Search & Filtering**: Find articles by query, section, or category

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom glassmorphism design system
- **Charts**: Recharts
- **Animations**: Framer Motion
- **State Management**: Zustand
- **AI Integration**: OpenAI GPT-4 or Anthropic Claude

## Getting Started

### Prerequisites

- Node.js >= 18.17.0
- npm or yarn
- Zendesk account with API access
- OpenAI or Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd codex
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```bash
# Zendesk Configuration
ZENDESK_SUBDOMAIN=your-subdomain
ZENDESK_EMAIL=your-email@example.com
ZENDESK_API_TOKEN=your-api-token

# AI Service (choose one)
OPENAI_API_KEY=sk-your-openai-key
# OR
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
```

4. Test connections:
```bash
# Start development server
npm run dev

# In another terminal, test API connections
curl http://localhost:3000/api/zendesk/test
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Dashboard Features

Navigate through the various dashboards using the sidebar:
- `/` - Executive Dashboard
- `/finance` - Finance Dashboard
- `/sales` - Sales Dashboard
- `/insights` - AI Insights Center
- `/reports` - Auto Reporting Studio

### Zendesk API

#### Create an Article
```typescript
const response = await fetch('/api/zendesk/articles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Getting Started',
    content: '<p>Welcome to our product!</p>',
    section_id: 789012,
    draft: true,
    use_ai_enhancement: true, // Optional: enhance with AI
  }),
});
```

#### Generate Article with AI
```typescript
const response = await fetch('/api/zendesk/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'How to reset your password',
    target_audience: 'general',
    tone: 'friendly',
  }),
});
```

#### Enhance Existing Content
```typescript
const response = await fetch('/api/zendesk/ai/enhance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: '<p>Your article content...</p>',
    enhancement_type: 'improve', // or 'expand', 'summarize', 'format'
  }),
});
```

See [ZENDESK_API_DOCUMENTATION.md](./ZENDESK_API_DOCUMENTATION.md) for complete API reference.

## Project Structure

```
/home/user/codex/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   └── zendesk/      # Zendesk API integration
│   │   ├── finance/          # Finance dashboard
│   │   ├── sales/            # Sales dashboard
│   │   └── insights/         # AI Insights Center
│   ├── components/            # React components
│   │   ├── ui/               # UI primitives
│   │   ├── charts/           # Chart components
│   │   └── layout/           # Layout components
│   ├── lib/                   # Utilities and clients
│   │   ├── zendesk-client.ts # Zendesk API client
│   │   └── ai-content-enhancer.ts # AI content enhancement
│   └── types/                 # TypeScript definitions
│       ├── dashboard.ts      # Dashboard types
│       └── zendesk.ts        # Zendesk types
├── ZENDESK_API_DOCUMENTATION.md # API documentation
├── DESIGN_SPECIFICATION.md   # UI/UX design guide
├── IMPLEMENTATION_GUIDE.md   # Backend integration guide
└── COMPONENT_LIBRARY.md      # Component reference
```

## API Routes

### Zendesk Knowledge Base

- `GET /api/zendesk/test` - Test connections
- `GET /api/zendesk/categories` - List categories
- `GET /api/zendesk/sections` - List sections
- `GET /api/zendesk/articles` - List/search articles
- `POST /api/zendesk/articles` - Create article
- `GET /api/zendesk/articles/[id]` - Get article
- `PUT /api/zendesk/articles/[id]` - Update article
- `DELETE /api/zendesk/articles/[id]` - Delete article
- `POST /api/zendesk/articles/bulk` - Bulk create
- `POST /api/zendesk/ai/enhance` - Enhance content
- `POST /api/zendesk/ai/generate` - Generate article

## Development

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Production build
npm run build

# Start production server
npm run start
```

## Environment Variables

See `.env.example` for all available configuration options:

- **Required for Zendesk**: `ZENDESK_SUBDOMAIN`, `ZENDESK_EMAIL`, `ZENDESK_API_TOKEN`
- **Required for AI**: `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- **Optional**: Dashboard data source configuration

## Documentation

- [Zendesk API Documentation](./ZENDESK_API_DOCUMENTATION.md) - Complete API reference
- [Design Specification](./DESIGN_SPECIFICATION.md) - UI/UX design guidelines
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - Backend integration guide
- [Component Library](./COMPONENT_LIBRARY.md) - Component documentation

## Features in Detail

### AI Content Enhancement

The AI enhancement system supports four modes:

1. **Improve**: Makes content clearer and more concise
2. **Expand**: Adds more details and examples
3. **Summarize**: Condenses content to key points
4. **Format**: Improves structure with headings and lists

### Bulk Operations

Import multiple articles at once with optional AI enhancement:

```typescript
await fetch('/api/zendesk/articles/bulk', {
  method: 'POST',
  body: JSON.stringify({
    articles: [...],
    default_section_id: 789012,
    publish_immediately: false,
  }),
});
```

### Error Handling

All API responses follow a consistent format:

```typescript
{
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}
```

## Best Practices

1. **Test connections first**: Always run `/api/zendesk/test` before operations
2. **Use drafts**: Create articles as drafts, review, then publish
3. **Rate limits**: Be mindful of Zendesk API rate limits (700 req/min)
4. **AI costs**: Use AI enhancement strategically to optimize costs
5. **Error handling**: Always check the `success` field in responses

## Troubleshooting

### Connection Issues

If `/api/zendesk/test` fails:

1. Verify credentials in `.env`
2. Check Zendesk subdomain format (without `.zendesk.com`)
3. Ensure API token is active in Zendesk Admin Center
4. Verify AI API key is valid

### AI Enhancement Not Working

1. Check that either `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set
2. Verify API key has sufficient credits/quota
3. Check console for detailed error messages

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Your License Here]

## Support

For issues or questions:
- Check the [API Documentation](./ZENDESK_API_DOCUMENTATION.md)
- Review [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- Create an issue in the repository
