# Next-Gen Dashboard & SAP Fiori Components

A modern Next.js dashboard application featuring both **AI-powered analytics** and **SAP Fiori design patterns** for enterprise applications.

---

## 🎯 What's Inside

This project contains two powerful design systems:

### 1. **Next-Gen Dashboard** (Original)
- AI-powered insights and analytics
- Glassmorphism design
- Dark mode by default
- Real-time data visualization
- Multiple domain dashboards (Sales, Finance, HR, etc.)

### 2. **SAP Fiori Components** (New ✨)
- Complete Fiori design system for React/Next.js
- SAP Horizon theme
- Fiori layout patterns (SemanticPage, ObjectPage, DynamicPage, FCL)
- Fiori visual vocabulary (ObjectStatus, ObjectNumber, ObjectIdentifier)
- Fixed Asset Management example
- **Maintains ABAP field names** (anln1, bukrs, txt50, etc.)

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

---

## 📱 Live Demos

### Original Dashboard Pages
- **Home Dashboard:** http://localhost:3000
- **Sales Dashboard:** http://localhost:3000/sales
- **Finance Dashboard:** http://localhost:3000/finance
- **Procurement:** http://localhost:3000/procurement
- **Inventory:** http://localhost:3000/inventory
- **HR:** http://localhost:3000/hr

### SAP Fiori Examples
- **Asset List (SemanticPage):** http://localhost:3000/assets
- **Asset Detail (ObjectPage):** http://localhost:3000/assets/100001
- **Master-Detail (FCL):** http://localhost:3000/assets-fcl

---

## 🎨 SAP Fiori Components

### Available Components

| Component | Description | Use Case |
|-----------|-------------|----------|
| **ObjectStatus** | Semantic status display | Show status with color coding |
| **ObjectNumber** | Formatted numbers | Display currency, percentages, metrics |
| **ObjectIdentifier** | Object links | Clickable titles and descriptions |
| **SemanticPage** | List page layout | List reports, overview pages |
| **ObjectPage** | Detail page layout | Object detail views |
| **DynamicPage** | Flexible layout | Dashboards with dynamic header |
| **FlexibleColumnLayout** | Master-detail pattern | Multi-column layouts |

### Quick Example

```tsx
import { SemanticPage, ObjectStatus, ObjectNumber } from '@/components/fiori';

export default function MyPage() {
  return (
    <SemanticPage
      titleHeading={<h1>My Items</h1>}
      headerContent={
        <ObjectNumber number={150} unit="Items" emphasized />
      }
      positiveAction={{
        text: "Create",
        onClick: handleCreate
      }}
    >
      <ObjectStatus text="Active" state="success" icon />
      <ObjectNumber number={1234.56} format="currency" />
    </SemanticPage>
  );
}
```

See [FIORI_QUICK_START.md](./FIORI_QUICK_START.md) for more examples.

---

## 📚 Documentation

### Fiori Implementation
- **[Quick Start Guide](./FIORI_QUICK_START.md)** - Get started in 5 minutes
- **[Implementation Guide](./FIORI_IMPLEMENTATION_GUIDE.md)** - Complete reference

### Original Dashboard
- **[Design Specification](./DESIGN_SPECIFICATION.md)** - Design system details
- **[Implementation Guide](./IMPLEMENTATION_GUIDE.md)** - Development guide
- **[Component Library](./COMPONENT_LIBRARY.md)** - Component reference

---

## 🗂 Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── page.tsx               # Home dashboard
│   ├── sales/                 # Sales dashboard
│   ├── finance/               # Finance dashboard
│   ├── assets/                # Fiori asset list
│   │   └── [id]/             # Fiori asset detail
│   └── assets-fcl/            # Fiori FCL example
│
├── components/
│   ├── fiori/                 # SAP Fiori components ✨
│   │   ├── ObjectStatus.tsx
│   │   ├── ObjectNumber.tsx
│   │   ├── ObjectIdentifier.tsx
│   │   ├── SemanticPage.tsx
│   │   ├── ObjectPage.tsx
│   │   ├── DynamicPage.tsx
│   │   └── FlexibleColumnLayout.tsx
│   │
│   ├── layout/                # Dashboard layouts
│   ├── ui/                    # UI components
│   ├── charts/                # Chart components
│   └── ai/                    # AI components
│
├── lib/
│   ├── fiori-design-tokens.ts # Fiori design system ✨
│   ├── design-tokens.ts       # Dashboard design system
│   └── utils.ts               # Utilities
│
└── data/
    └── mockAssetData.ts       # SAP asset mock data ✨
```

---

## 🎨 Design Systems

### SAP Fiori (New)
- **Primary Color:** #0070F2 (SAP Blue - Horizon)
- **Success:** #2B7D2B
- **Warning:** #E76500
- **Error:** #BB0000
- **Font:** SAP Font '72'

### Dashboard (Original)
- **Primary:** #4A96FF
- **Secondary:** #00D1B2
- **Background:** #0D0E12 (Dark)
- **Font:** Inter

---

## 🔧 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React
- **State:** Zustand
- **Data Fetching:** SWR

---

## 📦 Key Features

### Dashboard Features
✅ AI-powered insights
✅ Real-time data visualization
✅ Glassmorphism UI
✅ Dark mode
✅ Responsive design
✅ Multiple domain dashboards

### Fiori Features (New)
✅ Complete Fiori design system
✅ SAP Horizon theme
✅ 7 core components
✅ TypeScript support
✅ ABAP field name preservation
✅ Production-ready
✅ Responsive layouts

---

## 🎯 Use Cases

### When to Use Dashboard Components
- Analytics dashboards
- Business intelligence
- Real-time monitoring
- Data visualization
- Executive summaries

### When to Use Fiori Components
- Enterprise applications
- SAP integration projects
- List-detail workflows
- Master data management
- Transaction processing

---

## 🔗 Integration Example

You can mix both design systems:

```tsx
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SemanticPage, ObjectNumber } from '@/components/fiori';

export default function HybridPage() {
  return (
    <div>
      {/* Dashboard header */}
      <DashboardHeader title="Financial Overview" />

      {/* Fiori content */}
      <SemanticPage
        titleHeading={<h1>Transactions</h1>}
        headerContent={
          <ObjectNumber number={50000} format="currency" />
        }
      >
        {/* Your content */}
      </SemanticPage>
    </div>
  );
}
```

---

## 🧪 Example Data

The Fiori examples use authentic SAP data structures:

```typescript
interface FixedAsset {
  bukrs: string;  // Company Code
  anln1: string;  // Asset Number
  txt50: string;  // Description
  anlkl: string;  // Asset Class
  kostl: string;  // Cost Center
  knsal: number;  // Book Value
  kansw: number;  // Depreciation
  // ... more ABAP fields
}
```

**All ABAP field names preserved!**

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Docker
```bash
docker build -t dashboard .
docker run -p 3000:3000 dashboard
```

### Traditional Hosting
```bash
npm run build
npm start
```

---

## 📝 License

MIT License - feel free to use in your projects!

---

## 🤝 Contributing

Contributions are welcome! Please read the documentation before submitting PRs.

---

## 📞 Support

- **Fiori Questions:** See [FIORI_IMPLEMENTATION_GUIDE.md](./FIORI_IMPLEMENTATION_GUIDE.md)
- **Dashboard Questions:** See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
- **Issues:** Open a GitHub issue

---

## 🎉 What's New

### v2.0 - SAP Fiori Integration
- ✨ Added complete Fiori component library
- ✨ Implemented SemanticPage, ObjectPage, DynamicPage, FCL
- ✨ Added ObjectStatus, ObjectNumber, ObjectIdentifier
- ✨ Created Fixed Asset Management examples
- ✨ Added Fiori design tokens (SAP Horizon theme)

### v1.0 - Initial Release
- 🎨 Next-gen dashboard with AI insights
- 📊 Multiple domain dashboards
- 🌙 Dark mode glassmorphism design
- 📱 Fully responsive

---

**Built with ❤️ for modern enterprise applications**
