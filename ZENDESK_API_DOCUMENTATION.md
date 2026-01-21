# Zendesk Knowledge Base Builder API Documentation

## Overview

The Zendesk Knowledge Base Builder provides a comprehensive API layer for managing Zendesk knowledge base articles with AI-powered content enhancement capabilities.

## Features

- ✅ **Article Management**: Create, read, update, and delete knowledge base articles
- ✅ **AI Content Enhancement**: Improve, expand, summarize, or format articles using AI
- ✅ **AI Article Generation**: Generate complete articles from topics
- ✅ **Bulk Operations**: Create multiple articles at once
- ✅ **Category & Section Browsing**: Navigate your knowledge base structure
- ✅ **Search & Filter**: Find articles by query, section, or category
- ✅ **Connection Testing**: Verify Zendesk and AI service connectivity

## Authentication

All API routes are internal Next.js API routes. External authentication should be implemented at the application level.

## Environment Setup

Required environment variables (see `.env.example`):

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

## API Endpoints

### Connection Testing

#### Test Connections
```http
GET /api/zendesk/test
```

Tests connectivity to Zendesk and AI services.

**Response:**
```json
{
  "success": true,
  "data": {
    "zendesk": {
      "success": true,
      "message": "Successfully connected to Zendesk",
      "error": null
    },
    "ai": {
      "success": true,
      "message": "Successfully connected to OPENAI",
      "provider": "openai",
      "error": null
    }
  }
}
```

---

### Categories

#### List Categories
```http
GET /api/zendesk/categories?locale=en-us
```

**Query Parameters:**
- `locale` (optional): Locale code (default: `en-us`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123456,
      "name": "Getting Started",
      "description": "Articles for new users",
      "locale": "en-us",
      "position": 1
    }
  ]
}
```

---

### Sections

#### List Sections in a Category
```http
GET /api/zendesk/sections?category_id=123456&locale=en-us
```

**Query Parameters:**
- `category_id` (required): Category ID
- `locale` (optional): Locale code (default: `en-us`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 789012,
      "name": "Installation",
      "description": "How to install our product",
      "locale": "en-us",
      "category_id": 123456,
      "position": 1
    }
  ]
}
```

---

### Articles

#### List Articles in a Section
```http
GET /api/zendesk/articles?section_id=789012&page=1&per_page=30&locale=en-us
```

**Query Parameters:**
- `section_id` (required): Section ID
- `page` (optional): Page number (default: `1`)
- `per_page` (optional): Results per page (default: `30`)
- `locale` (optional): Locale code (default: `en-us`)

**Response:**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": 345678,
        "title": "How to Install",
        "body": "<p>Installation instructions...</p>",
        "locale": "en-us",
        "section_id": 789012,
        "draft": false,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "page": 1,
    "per_page": 30
  }
}
```

#### Search Articles
```http
GET /api/zendesk/articles?query=installation&page=1&per_page=30&locale=en-us
```

**Query Parameters:**
- `query` (required): Search query
- `page` (optional): Page number (default: `1`)
- `per_page` (optional): Results per page (default: `30`)
- `locale` (optional): Locale code (default: `en-us`)

**Response:**
```json
{
  "success": true,
  "data": {
    "articles": [...],
    "total_count": 42,
    "page": 1,
    "per_page": 30,
    "has_more": true
  }
}
```

#### Get a Specific Article
```http
GET /api/zendesk/articles/345678?locale=en-us
```

**URL Parameters:**
- `id`: Article ID

**Query Parameters:**
- `locale` (optional): Locale code (default: `en-us`)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 345678,
    "title": "How to Install",
    "body": "<p>Installation instructions...</p>",
    "locale": "en-us",
    "section_id": 789012,
    "draft": false
  }
}
```

#### Create an Article
```http
POST /api/zendesk/articles
Content-Type: application/json

{
  "title": "New Article Title",
  "content": "<p>Article content...</p>",
  "section_id": 789012,
  "locale": "en-us",
  "draft": true,
  "label_names": ["tag1", "tag2"],
  "use_ai_enhancement": true
}
```

**Request Body:**
- `title` (required): Article title
- `content` (required): Article HTML content
- `section_id` (required): Target section ID
- `locale` (optional): Locale code (default: `en-us`)
- `draft` (optional): Whether article is a draft (default: `true`)
- `label_names` (optional): Array of tags
- `use_ai_enhancement` (optional): Apply AI enhancement (default: `false`)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 345679,
    "title": "New Article Title",
    "body": "<p>Enhanced article content...</p>",
    "section_id": 789012,
    "draft": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Update an Article
```http
PUT /api/zendesk/articles/345678?locale=en-us
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "<p>Updated content...</p>",
  "draft": false,
  "use_ai_enhancement": false
}
```

**URL Parameters:**
- `id`: Article ID

**Query Parameters:**
- `locale` (optional): Locale code (default: `en-us`)

**Request Body (all optional):**
- `title`: New article title
- `content`: New article content
- `section_id`: Move to different section
- `draft`: Change draft status
- `label_names`: Update tags
- `use_ai_enhancement`: Apply AI enhancement to content

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 345678,
    "title": "Updated Title",
    "body": "<p>Updated content...</p>",
    "draft": false,
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

#### Delete an Article
```http
DELETE /api/zendesk/articles/345678
```

**URL Parameters:**
- `id`: Article ID

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Article deleted successfully"
  }
}
```

#### Bulk Create Articles
```http
POST /api/zendesk/articles/bulk
Content-Type: application/json

{
  "articles": [
    {
      "title": "Article 1",
      "content": "<p>Content 1</p>",
      "section_id": 789012,
      "use_ai_enhancement": true
    },
    {
      "title": "Article 2",
      "content": "<p>Content 2</p>",
      "section_id": 789012
    }
  ],
  "default_section_id": 789012,
  "publish_immediately": false
}
```

**Request Body:**
- `articles` (required): Array of article objects
- `default_section_id` (optional): Default section for articles without section_id
- `publish_immediately` (optional): Publish all articles (default: `false`)

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "results": [
      {
        "success": true,
        "article": { "id": 345680, "title": "Article 1" }
      },
      {
        "success": true,
        "article": { "id": 345681, "title": "Article 2" }
      }
    ]
  }
}
```

---

### AI Enhancement

#### Enhance Content
```http
POST /api/zendesk/ai/enhance
Content-Type: application/json

{
  "content": "<p>Original article content...</p>",
  "enhancement_type": "improve",
  "target_audience": "general",
  "tone": "professional"
}
```

**Request Body:**
- `content` (required): Content to enhance
- `enhancement_type` (required): One of: `improve`, `expand`, `summarize`, `format`
- `target_audience` (optional): `technical`, `general`, or `beginner`
- `tone` (optional): `professional`, `friendly`, or `formal`

**Enhancement Types:**
- `improve`: Make content clearer and more concise
- `expand`: Add more details and examples
- `summarize`: Condense to key points
- `format`: Improve structure and formatting

**Response:**
```json
{
  "success": true,
  "data": {
    "original_content": "<p>Original article content...</p>",
    "enhanced_content": "<h2>Enhanced Article</h2><p>Improved and formatted content...</p>",
    "suggestions": [
      "Content has been significantly expanded with more details",
      "Headings added for better structure"
    ],
    "word_count_change": 150
  }
}
```

#### Generate Article from Topic
```http
POST /api/zendesk/ai/generate
Content-Type: application/json

{
  "topic": "How to reset your password",
  "target_audience": "general",
  "tone": "friendly",
  "sections": ["Introduction", "Step-by-Step Guide", "Troubleshooting"]
}
```

**Request Body:**
- `topic` (required): Article topic or title
- `target_audience` (optional): Target audience type
- `tone` (optional): Desired tone
- `sections` (optional): Array of section names to include

**Response:**
```json
{
  "success": true,
  "data": {
    "topic": "How to reset your password",
    "content": "<h1>How to Reset Your Password</h1><h2>Introduction</h2><p>...</p>",
    "word_count": 450
  }
}
```

---

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `500`: Internal Server Error
- `503`: Service Unavailable (connection test failed)

---

## Usage Examples

### Example 1: Create an Article with AI Enhancement

```typescript
const response = await fetch('/api/zendesk/articles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Getting Started with Our API',
    content: 'This guide shows you how to use our API.',
    section_id: 789012,
    draft: true,
    use_ai_enhancement: true,
  }),
});

const result = await response.json();
console.log('Created article:', result.data);
```

### Example 2: Generate and Publish an Article

```typescript
// Step 1: Generate content using AI
const generateResponse = await fetch('/api/zendesk/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'Troubleshooting Common Errors',
    target_audience: 'general',
    tone: 'professional',
    sections: ['Introduction', 'Common Errors', 'Solutions', 'Prevention'],
  }),
});

const { data: generated } = await generateResponse.json();

// Step 2: Create article in Zendesk
const createResponse = await fetch('/api/zendesk/articles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: generated.topic,
    content: generated.content,
    section_id: 789012,
    draft: false, // Publish immediately
  }),
});

const { data: article } = await createResponse.json();
console.log('Published article:', article.html_url);
```

### Example 3: Bulk Import with AI Enhancement

```typescript
const articles = [
  {
    title: 'Account Setup',
    content: 'Basic account setup instructions...',
    use_ai_enhancement: true,
  },
  {
    title: 'Profile Management',
    content: 'How to manage your profile...',
    use_ai_enhancement: true,
  },
  {
    title: 'Security Settings',
    content: 'Configure your security settings...',
    use_ai_enhancement: true,
  },
];

const response = await fetch('/api/zendesk/articles/bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    articles,
    default_section_id: 789012,
    publish_immediately: false,
  }),
});

const { data: results } = await response.json();
console.log(`Created ${results.successful} of ${results.total} articles`);
```

### Example 4: Search and Update Article

```typescript
// Search for article
const searchResponse = await fetch(
  '/api/zendesk/articles?query=installation&locale=en-us'
);
const { data: searchResults } = await searchResponse.json();
const article = searchResults.articles[0];

// Enhance the content
const enhanceResponse = await fetch('/api/zendesk/ai/enhance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: article.body,
    enhancement_type: 'improve',
    target_audience: 'beginner',
    tone: 'friendly',
  }),
});

const { data: enhanced } = await enhanceResponse.json();

// Update the article with enhanced content
const updateResponse = await fetch(`/api/zendesk/articles/${article.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: enhanced.enhanced_content,
  }),
});

const { data: updated } = await updateResponse.json();
console.log('Updated article:', updated.html_url);
```

---

## Type Definitions

All TypeScript types are available in `/src/types/zendesk.ts`:

- `ZendeskArticle`: Article object
- `ZendeskSection`: Section object
- `ZendeskCategory`: Category object
- `ArticleCreateRequest`: Create article payload
- `ArticleUpdateRequest`: Update article payload
- `AIEnhancementRequest`: AI enhancement payload
- `AIEnhancementResponse`: AI enhancement result
- `BulkArticleImport`: Bulk import payload
- `ZendeskAPIResponse<T>`: Standard API response wrapper

---

## Rate Limits

Zendesk API rate limits apply:
- **Standard**: 700 requests per minute per account
- **Professional/Enterprise**: 700-2500 requests per minute

AI provider rate limits also apply based on your plan.

---

## Best Practices

1. **Use Draft Mode**: Create articles as drafts first, review, then publish
2. **Test Connections**: Always run `/api/zendesk/test` before bulk operations
3. **AI Enhancement**: Use sparingly for cost optimization
4. **Bulk Operations**: For large imports, use `/api/zendesk/articles/bulk`
5. **Error Handling**: Always check `success` field in responses
6. **Localization**: Specify locale consistently across operations

---

## Support

For issues or questions:
- Review this documentation
- Check `.env.example` for configuration
- Verify Zendesk API credentials in Zendesk Admin Center
- Test connections using `/api/zendesk/test`

---

## Version

**API Version**: 1.0.0
**Last Updated**: 2024-01-15
**Zendesk API**: v2 Help Center API
