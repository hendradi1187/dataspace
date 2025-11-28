# Dataspace Platform - React Frontend

Modern, responsive frontend dashboard for managing the Dataspace platform, built with React, TypeScript, and Tailwind CSS.

## Features

- **Dashboard**: Real-time service status monitoring and platform overview
- **Participant Management**: Manage dataspace participants and organizations
- **Dataset Catalog**: Browse and manage available datasets
- **Policy Management**: Create and manage data access policies
- **Contract Management**: Track and manage data exchange contracts
- **Connector Management**: Monitor and configure edge node connectors
- **Real-time Notifications**: Toast notifications for user feedback
- **Responsive Design**: Mobile-first, works on all screen sizes
- **Type-Safe**: Full TypeScript support throughout

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **React Router v6** - Client-side routing
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

## Project Structure

```
src/
├── assets/              # Static assets
├── components/          # Reusable UI components
│   ├── Navigation.tsx   # Top navigation bar
│   ├── Card.tsx         # Card container components
│   ├── Button.tsx       # Button variants
│   ├── Badge.tsx        # Badge components
│   ├── Table.tsx        # Data table
│   ├── Modal.tsx        # Dialog/Modal
│   ├── Tabs.tsx         # Tab component
│   └── index.ts         # Component exports
├── layouts/             # Layout components
│   └── MainLayout.tsx   # Main page layout with nav and toast
├── pages/               # Page components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Participants.tsx # Participants management
│   ├── Datasets.tsx     # Dataset catalog
│   ├── Policies.tsx     # Policy management
│   ├── Contracts.tsx    # Contract management
│   └── Connector.tsx    # Connector configuration
├── services/            # Business logic and API calls
├── stores/              # Zustand state management
│   ├── auth-store.ts    # Authentication state
│   ├── notification-store.ts  # Notifications
│   └── data-store.ts    # Application data
├── types/               # TypeScript type definitions
│   └── index.ts         # Global types
├── utils/               # Utility functions
│   └── api-client.ts    # Axios HTTP client
├── styles/              # CSS and Tailwind config
│   └── index.css        # Global styles
├── App.tsx              # Main app component with routing
└── main.tsx             # Entry point
```

## Installation

### Prerequisites

- Node.js 18+
- npm/pnpm 9+

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Development

### Running the App

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run fmt

# Type check
npm run type-check
```

## API Integration

The frontend connects to backend services on different ports:

| Service | Port | Base URL |
|---------|------|----------|
| IDP | 3000 | `http://localhost:3000` |
| Broker | 3001 | `http://localhost:3001` |
| Hub | 3002 | `http://localhost:3002` |
| Policy | 3003 | `http://localhost:3003` |
| Contract | 3004 | `http://localhost:3004` |
| Connector | 3009 | `http://localhost:3009` |

API client is configured in `src/utils/api-client.ts` with:
- Request/response interceptors
- Automatic authentication token injection
- Error handling and logging
- Base URL configuration per service

## State Management

Uses **Zustand** for lightweight, flexible state management:

### `auth-store.ts`
Manages authentication state:
- User information
- Authentication token
- Login/logout actions

### `data-store.ts`
Manages application data:
- Participants
- Datasets
- Policies
- Contracts
- Connectors
- Loading and error states

### `notification-store.ts`
Manages toast notifications:
- Add/remove notifications
- Mark as read
- Auto-dismiss after 5 seconds

## Component Architecture

### Base Components

- **Card**: Container component with optional header, body, and footer
- **Button**: Multiple variants (primary, secondary, outline, danger)
- **Badge**: Status and category badges
- **Table**: Sortable, paginated data table
- **Modal**: Dialog component for forms and confirmations
- **Tabs**: Tabbed content interface

### Layout Components

- **Navigation**: Top navigation bar with mobile menu
- **MainLayout**: Wraps pages with navigation and toast notifications

### Page Components

Each page manages its own state and API calls:
- **Dashboard**: Service status and platform overview
- **Participants**: Add, edit, delete participants
- **Datasets**: Browse and filter datasets
- **Policies**: Manage access policies
- **Contracts**: Track contract lifecycle
- **Connector**: Configure connector instances

## Styling

Uses **Tailwind CSS** with custom configuration:

### Color Palette

- **Primary**: Blue (governance, actions)
- **Secondary**: Purple (analytics, insights)
- **Success**: Green (positive states)
- **Warning**: Amber (caution states)
- **Error**: Red (negative states)
- **Neutral**: Gray (backgrounds, text)

### Responsive Design

Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Forms and Validation

Forms use React hooks with basic validation:

```typescript
const [formData, setFormData] = useState<Partial<Entity>>({});

// Validation before submit
if (!formData.name || !formData.did) {
  addNotification({
    type: 'warning',
    title: 'Validation Error',
    message: 'Please fill all required fields',
  });
  return;
}
```

## Error Handling

Global error handling with user-friendly notifications:

```typescript
try {
  const data = await apiClient.get('/endpoint');
} catch (error) {
  addNotification({
    type: 'error',
    title: 'Error',
    message: 'Failed to load data',
  });
}
```

## Performance Optimizations

- Code splitting with React Router
- Lazy component loading
- Memoized components
- Efficient state updates with Zustand
- CSS purging with Tailwind

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Color contrast compliance

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch: `git checkout -b feature/name`
2. Make changes and commit: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/name`
4. Submit a pull request

## Code Quality

- **ESLint**: Enforce code style
- **Prettier**: Auto-format code
- **TypeScript**: Type safety

Run checks:
```bash
npm run lint      # Check linting errors
npm run fmt       # Format code
npm run type-check # Check TypeScript
```

## Deployment

### Build for Production

```bash
npm run build
```

This generates optimized assets in the `dist/` directory.

### Environment Configuration

Create `.env` file for environment variables:

```bash
VITE_API_BASE_URL=https://api.example.com
VITE_APP_NAME=Dataspace Platform
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5173
npx kill-port 5173
```

### Vite Cache Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

### API Connection Issues

Verify backend services are running:
```bash
curl http://localhost:3000/health
curl http://localhost:3001/health
# etc.
```

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [issues](https://github.com/yourusername/dataspace/issues)
- Documentation: [docs](../../docs)

---

**Version**: 1.0.0
**Last Updated**: 2024
