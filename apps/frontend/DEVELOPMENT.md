# Frontend Development Guide

Guide for developing and contributing to the Dataspace Frontend.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Server runs on `http://localhost:5173`

### 3. Backend Services

Ensure backend services are running:
```bash
# In another terminal, from project root
cd ../..
npm run dev:up
npm run dev --workspace=services/cts/idp
npm run dev --workspace=services/cts/broker
# etc.
```

## Development Workflow

### Creating a New Page

1. Create file in `src/pages/NewPage.tsx`:
```typescript
import { Card, CardHeader, CardBody } from '@components/Card';
import { Button } from '@components/Button';
import { MainLayout } from '@layouts/MainLayout';

export const NewPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">New Page</h1>
        <Card>
          <CardHeader title="Section" />
          <CardBody>Content here</CardBody>
        </Card>
      </div>
    </MainLayout>
  );
};
```

2. Add route in `src/App.tsx`:
```typescript
import { NewPage } from '@/pages/NewPage';

<Route path="/new-page" element={<NewPage />} />
```

3. Add navigation link in `src/components/Navigation.tsx`:
```typescript
{ path: '/new-page', label: 'New Page', icon: IconComponent }
```

### Creating a New Component

1. Create file in `src/components/NewComponent.tsx`:
```typescript
interface NewComponentProps {
  title: string;
  // other props
}

export const NewComponent = ({ title }: NewComponentProps) => {
  return (
    <div>
      {title}
    </div>
  );
};
```

2. Export from `src/components/index.ts`:
```typescript
export { NewComponent } from './NewComponent';
```

3. Use in pages:
```typescript
import { NewComponent } from '@components/NewComponent';

<NewComponent title="Example" />
```

### Using State Management

#### Global State (Zustand)

```typescript
import { useDataStore } from '@stores/data-store';

export const MyComponent = () => {
  const { participants, addParticipant } = useDataStore();

  const handleAdd = () => {
    addParticipant(newParticipant);
  };

  return (
    // component JSX
  );
};
```

#### Notifications

```typescript
import { useNotificationStore } from '@stores/notification-store';

export const MyComponent = () => {
  const { addNotification } = useNotificationStore();

  const handleSuccess = () => {
    addNotification({
      type: 'success',
      title: 'Success',
      message: 'Operation completed',
    });
  };

  return (
    // component JSX
  );
};
```

### API Integration

#### Using Predefined Clients

```typescript
import { brokerClient, policyClient } from '@utils/api-client';

export const MyComponent = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await brokerClient.get('/participants');
        setData(data);
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load data',
        });
      }
    };

    fetchData();
  }, []);
};
```

#### Creating a Custom API Service

Create `src/services/participant-service.ts`:
```typescript
import { brokerClient } from '@utils/api-client';
import { Participant } from '@types/index';

export const participantService = {
  async getAll(): Promise<Participant[]> {
    return brokerClient.get('/participants');
  },

  async getById(id: string): Promise<Participant> {
    return brokerClient.get(`/participants/${id}`);
  },

  async create(participant: Participant): Promise<Participant> {
    return brokerClient.post('/participants', participant);
  },

  async update(id: string, participant: Partial<Participant>): Promise<Participant> {
    return brokerClient.put(`/participants/${id}`, participant);
  },

  async delete(id: string): Promise<void> {
    return brokerClient.delete(`/participants/${id}`);
  },
};
```

Usage:
```typescript
import { participantService } from '@services/participant-service';

const participants = await participantService.getAll();
```

## Styling Guide

### Tailwind CSS Classes

#### Spacing
```html
<!-- Padding: p-1 to p-12, px-*, py-* -->
<div className="p-4">Content</div>

<!-- Margin: m-1 to m-12, mx-*, my-* -->
<div className="m-2">Content</div>

<!-- Gap: gap-1 to gap-12 -->
<div className="flex gap-4">Items</div>
```

#### Colors
```html
<!-- Use color variables from tailwind.config.js -->
<div className="bg-primary-600 text-white">Primary</div>
<div className="bg-secondary-600 text-white">Secondary</div>
<div className="bg-success text-white">Success</div>
<div className="bg-error text-white">Error</div>
```

#### Layout
```html
<!-- Flexbox -->
<div className="flex items-center justify-between gap-4">Items</div>

<!-- Grid -->
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">Items</div>

<!-- Responsive -->
<div className="hidden md:block lg:hidden">Responsive</div>
```

### Component Styling

Always use component props for styling when possible:

```typescript
<Button variant="primary" size="lg" fullWidth>
  Click Me
</Button>

<Badge variant="success">Active</Badge>

<Card elevation="lg">
  Content
</Card>
```

## Form Handling

### Basic Form Example

```typescript
import { useState } from 'react';
import { Button } from '@components/Button';
import { useNotificationStore } from '@stores/notification-store';

export const ParticipantForm = () => {
  const [formData, setFormData] = useState({ name: '', did: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addNotification } = useNotificationStore();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.did) newErrors.did = 'DID is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // API call
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Participant added',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add participant',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.name ? 'border-error' : 'border-neutral-300'
          }`}
        />
        {errors.name && <span className="text-sm text-error">{errors.name}</span>}
      </div>

      <Button type="submit">Submit</Button>
    </form>
  );
};
```

## Testing Guidelines

### Component Testing

Use Vitest (already configured):

```typescript
// src/components/Button.spec.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

Run tests:
```bash
npm test
npm test -- --watch
npm test -- --coverage
```

## Performance Tips

1. **Lazy Load Components**
```typescript
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

2. **Memoize Components**
```typescript
import { memo } from 'react';

const MyComponent = memo(({ data }) => {
  return <div>{data}</div>;
});
```

3. **Use useCallback**
```typescript
const handleClick = useCallback(() => {
  // handle click
}, [dependencies]);
```

4. **Optimize Re-renders**
```typescript
// Avoid inline objects/functions
const buttonStyle = { padding: '8px' };
const handleClick = () => {};

<Component style={buttonStyle} onClick={handleClick} />
```

## Debugging

### Browser DevTools

1. Open Chrome/Firefox DevTools (F12)
2. Check Console for errors
3. Use React DevTools extension
4. Use Redux DevTools for Zustand state

### Logging

```typescript
console.log('Data:', data);
console.table(items); // Table view
console.time('operation'); // Performance timing
console.timeEnd('operation');
```

### VS Code Debugging

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "firefox",
      "request": "launch",
      "name": "Launch Firefox",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

## Code Quality

### Pre-commit Hooks

Setup git hooks with husky (optional):

```bash
npm install -D husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run fmt"
```

### Linting

```bash
npm run lint       # Check for issues
npm run lint -- --fix  # Auto-fix issues
```

### Formatting

```bash
npm run fmt        # Format all files
```

### Type Checking

```bash
npm run type-check # Check TypeScript errors
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/my-feature

# Create pull request on GitHub
```

Commit message format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code reorganization
- `test:` Tests
- `chore:` Build, deps

## Troubleshooting

### Vite Hot Reload Not Working

```bash
# Clear cache and restart
rm -rf .vite node_modules
npm install
npm run dev
```

### Type Errors

```bash
# Check for TypeScript errors
npm run type-check

# If issues persist, rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Module Not Found

Check file paths match imports:
- Relative imports: `./Component`
- Alias imports: `@/Component` (from src/)

## Environment Variables

Create `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_LOG_LEVEL=debug
VITE_APP_NAME=Dataspace Platform
```

Use in code:
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## Resources

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Vite Docs](https://vitejs.dev)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Lucide Icons](https://lucide.dev)

---

Happy coding! 🚀
