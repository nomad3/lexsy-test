# Lexsy Frontend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete React frontend for the Lexsy legal document automation platform with authentication, document management, conversational filling, data room, and analytics.

**Architecture:** React 18 SPA with TypeScript, Vite build tool, Zustand for state management, React Query for server state, shadcn/ui for components, and Tailwind CSS for styling. Client-side routing with React Router 6. Full integration with the backend API (already complete).

**Tech Stack:** React 18, TypeScript 5.3, Vite 5, Zustand, React Query (TanStack Query), React Router 6, shadcn/ui, Tailwind CSS, Axios, Zod

---

## Phase 1: Project Setup & Configuration

### Task 1: Initialize Frontend Project

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/.env.example`

**Step 1: Create package.json**

```json
{
  "name": "@lexsy/frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "zustand": "^4.4.7",
    "@tanstack/react-query": "^5.14.2",
    "axios": "^1.6.2",
    "zod": "^3.22.4",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
```

**Step 4: Create index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lexsy - AI-Powered Legal Documents</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 5: Create .env.example**

```env
VITE_API_URL=http://localhost:5000
```

**Step 6: Install dependencies**

```bash
cd frontend
npm install
```

**Step 7: Commit setup**

```bash
git add frontend/
git commit -m "feat(frontend): initialize React project with Vite and TypeScript"
```

---

### Task 2: Setup Tailwind CSS

**Files:**
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Create: `frontend/src/index.css`

**Step 1: Create tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Step 2: Create postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Step 3: Create src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Step 4: Commit Tailwind setup**

```bash
git add frontend/
git commit -m "feat(frontend): setup Tailwind CSS"
```

---

### Task 3: Create Base Application Structure

**Files:**
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/vite-env.d.ts`

**Step 1: Create main.tsx**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Step 2: Create App.tsx**

```typescript
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Lexsy - AI-Powered Legal Documents
            </h1>
            <p className="mt-2 text-gray-600">
              Frontend is initializing...
            </p>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
```

**Step 3: Create vite-env.d.ts**

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

**Step 4: Test development server**

```bash
npm run dev
```

Expected: Server starts on http://localhost:5173, shows "Lexsy" page

**Step 5: Commit base structure**

```bash
git add frontend/src/
git commit -m "feat(frontend): create base application structure"
```

---

## Phase 2: API Client & State Management

### Task 4: Create API Client

**Files:**
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/lib/types.ts`

**Step 1: Create types.ts**

```typescript
// User types
export interface User {
  id: string
  email: string
  fullName: string
  role: 'lawyer' | 'admin'
  organization?: string
}

export interface AuthResponse {
  user: User
  token: string
}

// Document types
export interface Document {
  id: string
  filename: string
  filePath: string
  uploadDate: string
  status: 'uploaded' | 'analyzing' | 'ready' | 'filling' | 'completed'
  documentType: string
  completionPercentage: number
}

export interface Placeholder {
  id: string
  documentId: string
  fieldName: string
  fieldType: string
  originalText: string
  position: number
  filledValue?: string
  aiSuggestedValue?: string
  confidence: number
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}
```

**Step 2: Create api.ts**

```typescript
import axios, { AxiosError } from 'axios'
import type { AuthResponse, Document, Placeholder, ApiResponse, ApiError } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: async (data: {
    email: string
    password: string
    fullName: string
    role: 'lawyer' | 'admin'
    organization?: string
  }) => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data)
    return response.data.data
  },

  login: async (email: string, password: string) => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    })
    return response.data.data
  },
}

// Documents API
export const documentsAPI = {
  upload: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<ApiResponse<Document>>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data
  },

  getAll: async () => {
    const response = await api.get<ApiResponse<Document[]>>('/documents')
    return response.data.data
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Document>>(`/documents/${id}`)
    return response.data.data
  },

  analyze: async (id: string) => {
    const response = await api.post<ApiResponse<any>>(`/documents/${id}/analyze`)
    return response.data.data
  },

  extractPlaceholders: async (id: string) => {
    const response = await api.post<ApiResponse<Placeholder[]>>(`/documents/${id}/placeholders`)
    return response.data.data
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/documents/${id}`)
    return response.data.data
  },
}
```

**Step 3: Commit API client**

```bash
git add frontend/src/lib/
git commit -m "feat(frontend): create API client with auth and documents endpoints"
```

---

### Task 5: Create Auth Store with Zustand

**Files:**
- Create: `frontend/src/stores/authStore.ts`

**Step 1: Create authStore.ts**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/lib/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
```

**Step 2: Commit auth store**

```bash
git add frontend/src/stores/
git commit -m "feat(frontend): create auth store with Zustand"
```

---

## Phase 3: Authentication Pages

### Task 6: Create Login Page

**Files:**
- Create: `frontend/src/pages/Login.tsx`
- Create: `frontend/src/components/ui/Button.tsx`
- Create: `frontend/src/components/ui/Input.tsx`

**Step 1: Create Button.tsx**

```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600':
              variant === 'primary',
            'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
            'border border-gray-300 bg-white hover:bg-gray-50': variant === 'outline',
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
```

**Step 2: Create Input.tsx**

```typescript
import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-600',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
```

**Step 3: Create Login.tsx**

```typescript
import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function Login() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const loginMutation = useMutation({
    mutationFn: () => authAPI.login(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.token)
      navigate('/dashboard')
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    loginMutation.mutate()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to Lexsy
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            AI-Powered Legal Document Automation
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {loginMutation.error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">
                Invalid email or password. Please try again.
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          </Button>

          <div className="text-center text-sm">
            <Link to="/register" className="text-blue-600 hover:text-blue-500">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <p className="text-center text-sm text-gray-600">
            Demo credentials:<br />
            <span className="font-mono text-xs">demo@lexsy.com / Demo123!</span>
          </p>
        </div>
      </div>
    </div>
  )
}
```

**Step 4: Commit login page**

```bash
git add frontend/src/
git commit -m "feat(frontend): create login page with form and validation"
```

---

**Note:** This plan continues with 20+ more tasks covering:
- Registration page
- Dashboard layout with navigation
- Document list and upload
- Document detail view
- Conversational filling interface
- Data room interface
- Analytics dashboard
- Routing and protected routes
- Error boundaries
- Loading states
- Responsive design

**Due to length constraints, the full plan would be 100+ tasks. Should I:**

1. **Continue with full detailed plan** (will be very long, 150+ tasks)
2. **Proceed directly to execution** using subagent-driven development
3. **Create condensed plan** with grouped tasks (faster to execute)

Which approach would you prefer?
