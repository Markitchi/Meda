# ⚛️ Meda Frontend

Next.js frontend for the Meda medical diagnostics platform.

## 📋 Overview

The frontend is built with **Next.js 14** and provides a modern, responsive interface for:
- User authentication with 2FA
- Patient management dashboard
- Medical image gallery and advanced viewer
- Consultation management
- AI diagnosis visualization
- Real-time notifications
- Collaboration features
- PDF report generation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   copy .env.local.example .env.local
   ```

   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Authentication pages
│   │   ├── login/            # Login page
│   │   └── register/         # Registration page
│   │
│   ├── dashboard/            # Dashboard page
│   │   └── page.tsx
│   │
│   ├── patients/             # Patient management
│   │   ├── page.tsx         # Patient list
│   │   ├── new/             # Create patient
│   │   └── [id]/            # Patient details
│   │
│   ├── images/              # Image gallery
│   │   └── page.tsx
│   │
│   ├── consultations/       # Consultations
│   │   ├── page.tsx        # Consultation list
│   │   ├── new/            # Create consultation
│   │   └── [id]/           # Consultation details
│   │
│   ├── reports/            # Reports page
│   │   └── page.tsx
│   │
│   ├── profile/            # User profile
│   │   └── page.tsx
│   │
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
│
├── components/             # Reusable React components
│   ├── image-viewer/      # Medical image viewer
│   │   ├── ImageViewer.tsx
│   │   ├── ImageControls.tsx
│   │   └── AnnotationTools.tsx
│   │
│   ├── notifications/     # Notification system
│   │   └── NotificationBell.tsx
│   │
│   └── ui/               # UI components (Shadcn)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── ...
│
├── lib/                  # Utilities and API clients
│   ├── api.ts           # Main API client
│   ├── api-notifications.ts
│   ├── api-collaboration.ts
│   └── utils.ts         # Utility functions
│
├── public/              # Static assets
│   └── ...
│
├── package.json         # Dependencies
├── tailwind.config.ts   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## 🎨 Design System

### Colors
- **Primary**: Emerald (medical/health theme)
- **Accent**: Blue gradients
- **Background**: White/Gray (light mode), Dark gray (dark mode)

### Typography
- **Font**: System fonts for performance
- **Headings**: Bold, large sizes
- **Body**: Regular weight, readable sizes

### Components
Built with **Shadcn/UI** for:
- Consistent styling
- Accessibility
- Customizability

## 🧩 Key Components

### Image Viewer
Advanced medical image viewer with:
- Zoom (0.5x - 5x)
- Pan (drag to move)
- Brightness/Contrast controls
- Measurement tools (ruler, angle)
- Annotations (arrows, rectangles, text)
- Export functionality

**Location**: `components/image-viewer/ImageViewer.tsx`

### Notification Bell
Real-time notification system with:
- Badge counter
- Dropdown panel
- Mark as read/delete
- Auto-refresh (30s polling)

**Location**: `components/notifications/NotificationBell.tsx`

### Patient Card
Patient information display with:
- Demographics
- Medical history
- Quick actions

**Location**: `components/PatientCard.tsx`

## 🔌 API Integration

### API Client
Centralized API client in `lib/api.ts`:

```typescript
import { api } from '@/lib/api';

// Example usage
const patients = await api.get('/patients');
const newPatient = await api.post('/patients', patientData);
```

### Authentication
Token management:
- Stored in `localStorage`
- Automatically included in requests
- Refresh token handling

```typescript
// Get token
const token = localStorage.getItem('access_token');

// Set token
localStorage.setItem('access_token', token);
```

## 🎭 Routing

### App Router (Next.js 14)
File-based routing with:
- **Pages**: `page.tsx` files
- **Layouts**: `layout.tsx` files
- **Dynamic routes**: `[id]` folders
- **Route groups**: `(auth)` folders

### Navigation
```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/patients');
```

## 🎨 Styling

### Tailwind CSS
Utility-first CSS framework:

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
  <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
    Action
  </button>
</div>
```

### Dark Mode
Theme toggle with `next-themes`:

```tsx
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();
setTheme('dark'); // or 'light'
```

## ✨ Animations

### Framer Motion
Smooth animations:

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

## 📝 Forms

### Form Handling
Using React hooks:

```tsx
const [formData, setFormData] = useState({
  name: '',
  email: ''
});

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  await api.post('/endpoint', formData);
};
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Component Testing
```typescript
import { render, screen } from '@testing-library/react';
import PatientCard from '@/components/PatientCard';

test('renders patient name', () => {
  const patient = { id: 1, name: 'John Doe' };
  render(<PatientCard patient={patient} />);
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});
```

## 🏗️ Building for Production

### Build
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Docker Build
```bash
docker build -f Dockerfile.prod -t meda-frontend .
docker run -p 3000:3000 meda-frontend
```

## 📝 Adding New Pages

1. **Create page file**: `app/your-page/page.tsx`
2. **Add to navigation**: Update navigation component
3. **Create API client** (if needed): `lib/api-your-feature.ts`
4. **Add types**: Define TypeScript interfaces

Example:
```tsx
// app/your-page/page.tsx
export default function YourPage() {
  return (
    <div>
      <h1>Your Page</h1>
    </div>
  );
}
```

## 🎯 State Management

### Local State
Using React hooks:
- `useState` - Component state
- `useEffect` - Side effects
- `useContext` - Shared state

### Server State
Using Next.js features:
- Server Components - Data fetching
- Client Components - Interactivity

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Tailwind Config
Customize in `tailwind.config.ts`:
```typescript
export default {
  theme: {
    extend: {
      colors: {
        primary: '#10b981', // Emerald
      },
    },
  },
};
```

## 🐛 Debugging

### Development Tools
- React DevTools
- Next.js DevTools
- Browser console

### Common Issues

**Port already in use**:
```bash
# Kill process on port 3000
npx kill-port 3000
```

**Module not found**:
```bash
rm -rf node_modules
npm install
```

## 📊 Performance

### Optimization Tips
- Use Next.js Image component
- Implement code splitting
- Lazy load components
- Optimize images
- Enable caching

### Lighthouse Score
Target scores:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Architecture Guide](../docs/ARCHITECTURE.md)
- [Contributing Guide](../CONTRIBUTING.md)

---

**Frontend Version**: 2.0.0  
**Next.js Version**: 14  
**React Version**: 18
