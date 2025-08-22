# TabSeed Tailwind CSS 設定文檔

## 概述

本專案已成功配置高品質的 Tailwind CSS 基礎建置，包含設計代幣、深色模式、shadcn/ui 整合，以及完整的開發工具鏈。

## 已安裝套件

### 核心 Tailwind 插件

- `@tailwindcss/typography` - Markdown 內容樣式
- `@tailwindcss/container-queries` - 容器查詢支援
- `tailwindcss-animate` - 動畫系統
- `tailwind-scrollbar` - 自訂滾動條

### 開發工具

- `prettier-plugin-tailwindcss` - 自動排序 class 名稱
- `eslint-plugin-tailwindcss` - Tailwind 語法檢查

### 實用工具

- `clsx` + `tailwind-merge` - 條件式 class 合併
- `class-variance-authority` - 元件變體系統
- `lucide-react` - 圖示庫

### Markdown 渲染

- `react-markdown` - React Markdown 渲染器
- `remark-gfm` - GitHub Flavored Markdown
- `rehype-sanitize` - XSS 防護
- `rehype-external-links` - 外部連結安全處理

## 設計系統

### 品牌色彩

- **Primary**: `#86C166` (綠色) - HSL(99 42% 58%)
- **Secondary**: `#FAD689` (黃色) - HSL(41 92% 76%)

### 設計代幣

採用 HSL CSS 變數系統，支援：

- 完整色彩調色盤 (background, foreground, muted, accent, etc.)
- 一致的 border-radius 變數
- 深色/亮色主題切換

### 深色模式

- 使用 `class` 策略 (`darkMode: 'class'`)
- 透過 `.dark` class 控制
- 所有設計代幣都有深色版本

## 檔案結構

```
src/
├── lib/
│   └── utils.ts          # cn() 函數，class 合併工具
├── components/
│   └── ui/
│       ├── button.tsx    # Button 元件 (cva 變體系統)
│       ├── input.tsx     # Input 元件
│       └── markdown.tsx  # Markdown 渲染元件
└── app/
    ├── globals.css       # 設計代幣與全域樣式
    └── page.tsx          # 測試頁面
```

## 配置檔案

- `tailwind.config.js` - Tailwind 主配置
- `components.json` - shadcn/ui 配置
- `.prettierrc` - Prettier 設定
- `eslint.config.mjs` - ESLint 配置
- `tsconfig.json` - TypeScript 路徑別名

## 使用方式

### 基本元件

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Input placeholder="Type here..." />
```

### Markdown 渲染

```tsx
import { Markdown } from '@/components/ui/markdown';

<Markdown content="# Hello **World**!" />;
```

### 深色模式切換

```tsx
const toggleDark = () => {
  document.documentElement.classList.toggle('dark');
};
```

### Class 合併

```tsx
import { cn } from '@/lib/utils';

<div className={cn('base-classes', condition && 'conditional-classes')} />;
```

## 驗證

執行 `pnpm run dev` 並訪問首頁查看完整的設計系統展示，包含：

- ✅ 品牌色彩展示
- ✅ 深色/亮色模式切換
- ✅ Button/Input 元件測試
- ✅ 即時 Markdown 編輯器
- ✅ Typography 樣式
- ✅ 響應式設計

## 開發指令

```bash
# 開發伺服器
pnpm run dev

# 程式碼格式化 (含 Tailwind 排序)
pnpm prettier --write .

# 語法檢查
pnpm run lint

# 型別檢查
pnpm tsc --noEmit
```

## 未來擴展

### 可以輕鬆加入的元件

- Dialog/Modal 系統
- Dropdown Menu
- Tooltip
- Toast 通知
- Tabs 切換
- Card 容器

### 設計系統進階功能

- 多主題支援 (運行時切換)
- 動態色彩生成
- 容器查詢響應式
- 自訂動畫庫擴展

本設定為 TabSeed 提供了強大、可維護、可擴展的 UI 基礎架構。
