# SAP Fiori Components - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide shows you how to quickly use the Fiori components in your React/Next.js application.

---

## 📦 Installation

All components are already included in your project. No additional installation needed!

```typescript
// Import components
import {
  SemanticPage,
  ObjectPage,
  DynamicPage,
  FlexibleColumnLayout,
  ObjectStatus,
  ObjectNumber,
  ObjectIdentifier
} from '@/components/fiori';

// Import design tokens
import { fioriDesignTokens } from '@/lib/fiori-design-tokens';
```

---

## 🎯 Common Use Cases

### 1. Display Status (ObjectStatus)

```tsx
import { ObjectStatus } from '@/components/fiori';

// Simple status
<ObjectStatus text="Active" state="success" />

// With icon
<ObjectStatus text="Error" state="error" icon />

// Inverted (colored background)
<ObjectStatus text="Processing" state="information" inverted />
```

**States:** `success` | `error` | `warning` | `information` | `none`

---

### 2. Display Numbers (ObjectNumber)

```tsx
import { ObjectNumber } from '@/components/fiori';

// Currency
<ObjectNumber number={1234.56} format="currency" />
// Output: $1,234.56

// With unit
<ObjectNumber number={150} unit="Assets" emphasized />
// Output: 150 Assets (bold)

// With trend
<ObjectNumber number={85} unit="%" trend="up" />
// Output: 85% ↑

// With semantic color
<ObjectNumber number={500000} format="currency" state="success" />
// Output: $500,000 (green)
```

---

### 3. Clickable Object Link (ObjectIdentifier)

```tsx
import { ObjectIdentifier } from '@/components/fiori';

<ObjectIdentifier
  title="Asset #12345"
  text="Production Machine"
  titleActive
  onTitleClick={() => router.push('/asset/12345')}
/>
```

---

### 4. Create a List Page (SemanticPage)

```tsx
import { SemanticPage, ObjectNumber } from '@/components/fiori';

export default function MyListPage() {
  return (
    <SemanticPage
      titleHeading={<h1>My Items</h1>}

      // KPIs in header
      headerContent={
        <>
          <ObjectNumber number={150} unit="Items" emphasized />
          <ObjectNumber number={50000} format="currency" />
        </>
      }

      // Actions
      positiveAction={{
        text: "Create",
        onClick: () => handleCreate()
      }}

      negativeAction={{
        text: "Delete",
        onClick: () => handleDelete(),
        enabled: hasSelection
      }}
    >
      {/* Your content here */}
      <Table data={items} />
    </SemanticPage>
  );
}
```

---

### 5. Create a Detail Page (ObjectPage)

```tsx
import { ObjectPage, ObjectNumber } from '@/components/fiori';

export default function MyDetailPage() {
  return (
    <ObjectPage
      heading={<h1>Item Detail</h1>}

      headerContent={
        <ObjectNumber number={5000} format="currency" emphasized />
      }

      sections={[
        {
          id: 'general',
          title: 'General Information',
          content: <GeneralInfo />
        },
        {
          id: 'details',
          title: 'Details',
          content: <DetailedInfo />
        }
      ]}

      onClose={() => router.back()}
    />
  );
}
```

---

### 6. Create Master-Detail (FlexibleColumnLayout)

```tsx
import { FlexibleColumnLayout } from '@/components/fiori';
import { useState } from 'react';

export default function MasterDetailPage() {
  const [layout, setLayout] = useState('TwoColumnsMidExpanded');
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <FlexibleColumnLayout
      beginColumnPages={
        <ItemList onItemClick={(item) => {
          setSelectedItem(item);
          setLayout('TwoColumnsMidExpanded');
        }} />
      }

      midColumnPages={
        selectedItem && <ItemDetail item={selectedItem} />
      }

      layout={layout}
      onLayoutChange={setLayout}
    />
  );
}
```

---

## 🎨 Using Design Tokens

```typescript
import { fioriDesignTokens } from '@/lib/fiori-design-tokens';

// Colors
const primaryColor = fioriDesignTokens.colors.sapBrand.primary;
const successColor = fioriDesignTokens.colors.semantic.positive;

// Typography
const fontSize = fioriDesignTokens.typography.fontSize.large;
const fontFamily = fioriDesignTokens.typography.fontFamily.primary;

// Spacing
const spacing = fioriDesignTokens.spacing.medium;

// Use in styles
<div style={{
  color: fioriDesignTokens.colors.sapBrand.primary,
  fontSize: fioriDesignTokens.typography.fontSize.large,
  padding: fioriDesignTokens.spacing.medium
}}>
  SAP Fiori Styled Content
</div>
```

---

## 📊 Common Patterns

### Table with Status Column

```tsx
import { ObjectStatus } from '@/components/fiori';

<table>
  <tbody>
    {items.map(item => (
      <tr key={item.id}>
        <td>{item.name}</td>
        <td>
          <ObjectStatus
            text={item.status}
            state={getStatusState(item.status)}
            icon
          />
        </td>
      </tr>
    ))}
  </tbody>
</table>

// Helper function
function getStatusState(status) {
  switch(status) {
    case 'Active': return 'success';
    case 'Error': return 'error';
    case 'Warning': return 'warning';
    default: return 'information';
  }
}
```

### Table with Number Column

```tsx
import { ObjectNumber } from '@/components/fiori';

<table>
  <tbody>
    {items.map(item => (
      <tr key={item.id}>
        <td>{item.name}</td>
        <td>
          <ObjectNumber
            number={item.value}
            format="currency"
            textAlign="end"
          />
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### Clickable Item in List

```tsx
import { ObjectIdentifier } from '@/components/fiori';

<div className="item-list">
  {items.map(item => (
    <div key={item.id} className="item">
      <ObjectIdentifier
        title={item.id}
        text={item.description}
        titleActive
        onTitleClick={() => navigate(`/items/${item.id}`)}
      />
    </div>
  ))}
</div>
```

---

## 🎯 Quick Reference

| Component | Use For | Key Props |
|-----------|---------|-----------|
| **ObjectStatus** | Status indicators | `text`, `state`, `icon` |
| **ObjectNumber** | Numeric values | `number`, `format`, `state` |
| **ObjectIdentifier** | Object titles/links | `title`, `text`, `titleActive` |
| **SemanticPage** | List pages | `titleHeading`, `headerContent`, `positiveAction` |
| **ObjectPage** | Detail pages | `heading`, `sections`, `onClose` |
| **DynamicPage** | Flexible pages | `title`, `header`, `content` |
| **FlexibleColumnLayout** | Master-detail | `beginColumnPages`, `midColumnPages`, `layout` |

---

## 🔗 View Live Examples

```bash
npm run dev
```

Then visit:

1. **Asset List (SemanticPage):** http://localhost:3000/assets
2. **Asset Detail (ObjectPage):** http://localhost:3000/assets/100001
3. **Master-Detail (FCL):** http://localhost:3000/assets-fcl

---

## 💡 Tips

1. **Always use semantic states** - Don't hardcode colors, use `state` prop
2. **Use emphasized for important numbers** - Makes them stand out
3. **Keep ABAP field names** - Don't convert to camelCase
4. **Test responsiveness** - All components work on mobile
5. **Use appropriate layout** - SemanticPage for lists, ObjectPage for details

---

## ❓ Need More Help?

See the full guide: [FIORI_IMPLEMENTATION_GUIDE.md](./FIORI_IMPLEMENTATION_GUIDE.md)

---

**Happy Coding! 🎉**
