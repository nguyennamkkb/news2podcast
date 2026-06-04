# Phase 0 — Foundation

## Mục tiêu
Khởi tạo toàn bộ hạ tầng dự án: package.json, Prisma schema, Tailwind, shadcn, CSS, Prisma client.

## Trạng thái hiện tại
- ✅ `package.json` — đã tạo đủ dependencies
- ✅ `tsconfig.json` — đã cấu hình
- ✅ `next.config.ts` — đã tạo
- ✅ `tailwind.config.ts` — đã cấu hình shadcn theme
- ✅ `postcss.config.mjs` — đã tạo
- ✅ `components.json` — đã cấu hình shadcn
- 🔜 `prisma/schema.prisma` — CHƯA tạo
- 🔜 `.env` + `.env.example` — CHƯA tạo
- 🔜 `src/styles/globals.css` — CHƯA tạo
- 🔜 `src/lib/prisma.ts` — CHƯA tạo
- 🔜 `src/lib/utils/cn.ts` — CHƯA tạo

## Files cần tạo

### 0.2 `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ProjectStatus {
  DRAFT
  QUEUED
  GENERATING
  COMPLETED
  FAILED
  ARCHIVED
}

model Project {
  id             String        @id @default(cuid())
  title          String
  description    String?       @db.Text
  status         ProjectStatus @default(DRAFT)
  scriptData     Json?         @db.JsonB
  targetDuration Int?
  slideCount     Int?
  promptInput    String?       @db.Text
  style          String?
  language       String        @default("vi")
  targetPlatform String        @default("youtube")
  visualStyle    String        @default("cinematic")
  aiModel        String?
  aiTokensUsed   Int?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  versions       ScriptVersion[]

  @@index([status])
  @@index([createdAt])
}

model ScriptVersion {
  id         String   @id @default(cuid())
  projectId  String
  version    Int
  scriptData Json     @db.JsonB
  changelog  String?  @db.Text
  createdAt  DateTime @default(now())
  project    Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, version])
}
```

### 0.3 `.env` + `.env.example`
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/script_creator?schema=public"

# OpenAI
OPENAI_API_KEY=""
```

### 0.5 `src/styles/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 0.6 `src/lib/prisma.ts`
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 0.7 `src/lib/utils/cn.ts`
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Verification
- `npm install` thành công
- `npx prisma generate` thành công
- `npx prisma db push` kết nối được PostgreSQL
- `next dev` chạy không lỗi
