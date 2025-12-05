# 🎨 FLUX.2 AI 圖像生成器

基於 Cloudflare Workers AI (FLUX.2 [dev]) + Remix Framework 的智能自適應圖像生成應用

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/kinai9661/flux.2)

## ✨ 核心特性

- 🚀 **超快速生成** - 基於 Cloudflare 全球邊緣網絡，毫秒級響應
- 🎯 **物理真實感** - FLUX.2 [dev] 模型提供高保真、物理準確的圖像
- 🌍 **多語言支持** - 原生支持中文、英文及多種拉丁/非拉丁語言
- 🎨 **精細控制** - 支持 Hex 色碼、JSON Prompting 等高級功能
- 🖼️ **多圖參考** - 最多4張參考圖像進行風格遷移和對象合成
- 💰 **成本優化** - 按使用量計費，免費層額度充足

## 🚀 一鍵部署到 Cloudflare Workers & Pages

### 方法 1: 通過 GitHub 連接（推薦）

1. 訪問 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 進入 **Workers & Pages** > **Create Application**
3. 選擇 **Pages** > **Connect to Git**
4. 授權 GitHub 並選擇 `kinai9661/flux.2` 倉庫
5. 配置構建設置：
   - **Framework preset**: Remix
   - **Build command**: `npm run build`
   - **Build output directory**: `build/client`
6. 點擊 **Save and Deploy**

### 方法 2: 使用 Wrangler CLI

```bash
# 克隆倉庫
git clone https://github.com/kinai9661/flux.2.git
cd flux.2

# 安裝依賴
npm install

# 登錄 Cloudflare
npx wrangler login

# 部署
npm run deploy
```

## ⚙️ 環境配置

### 1. Workers AI Binding

已在 `wrangler.toml` 中配置：

```toml
[ai]
binding = "AI"
```

### 2. 創建 KV Namespace（可選 - 用於歷史記錄）

```bash
npx wrangler kv:namespace create "IMAGE_HISTORY"
```

將返回的 ID 填入 `wrangler.toml`：

```toml
[[kv_namespaces]]
binding = "IMAGE_HISTORY"
id = "your-kv-namespace-id"
```

### 3. 創建 R2 Bucket（可選 - 用於圖片持久化）

```bash
npx wrangler r2 bucket create flux-generated-images
```

## 📖 使用指南

### 基礎文本生成

```text
一隻穿著宇航服的橘貓漂浮在太空中，背景是地球和星空，超現實主義風格
```

### 多語言支持

```text
A cyberpunk style orange cat wearing sunglasses, neon city background
一隻賽博朋克風格的貓，戴著墨鏡，霓虹燈城市背景
```

### 顏色精確控制

```text
現代簡約風格的客廳，主色調使用 #2ECC71 綠色和 #3498DB 藍色
```

### JSON Prompting 高級控制

```json
{
  "scene": "科技公司辦公室",
  "lighting": "柔和的晨光透過大窗戶",
  "elements": [
    { "type": "person", "description": "程序員在工作", "position": "center" },
    { "type": "object", "description": "MacBook Pro", "color": "#A8A9AD" }
  ],
  "style": "攝影級真實感，4K質量"
}
```

### 多參考圖像合成

上傳2-4張參考圖像，然後使用自然語言描述：

```text
將圖1的主體人物放到圖2的場景中，使用圖3的風格渲染
```

## 🛠️ 技術架構

```
用戶瀏覽器
    ↓
Cloudflare Pages (Remix Frontend)
    ↓
Cloudflare Workers (Server-side)
    ↓
Workers AI (@cf/black-forest-labs/flux-2-dev)
    ↓
生成的圖像 → R2 存儲（可選）
                → KV 歷史記錄（可選）
```

## 📦 項目結構

```
flux.2/
├── app/
│   ├── routes/
│   │   └── _index.tsx          # 主頁面 + 生成 API
│   └── root.tsx                # 應用根組件
├── wrangler.toml               # Cloudflare 配置
├── package.json                # 依賴管理
└── README.md                   # 本文檔
```

## 💡 高級功能開發建議

### 1. 添加圖像歷史記錄

使用 KV 存儲用戶生成歷史：

```typescript
await context.cloudflare.env.IMAGE_HISTORY.put(
  `gen:${Date.now()}`,
  JSON.stringify({ prompt, timestamp: new Date().toISOString() })
);
```

### 2. 批量生成變體

```typescript
const variations = await Promise.all(
  [1, 2, 3, 4].map(i => 
    ai.run("@cf/black-forest-labs/flux-2-dev", {
      prompt: `${basePrompt}, variation ${i}`
    })
  )
);
```

### 3. 添加圖像編輯功能

- Inpainting（局部重繪）
- Outpainting（畫面擴展）
- Style Transfer（風格遷移）

## 📊 性能與成本

### Workers AI 定價

- FLUX.2 [dev]: 按使用量計費（預計近期降價）
- Workers: 免費層 100,000 請求/天
- KV: 免費層 100,000 讀取/天
- R2: 免費層 10GB 存儲

### 性能指標

- **首次響應**: ~2-5秒（取決於模型負載）
- **全球延遲**: <100ms（Cloudflare 邊緣網絡）
- **並發支持**: 無限制（自動擴展）

## 🔗 相關資源

- [Cloudflare Workers AI 文檔](https://developers.cloudflare.com/workers-ai/)
- [FLUX.2 [dev] 模型頁面](https://developers.cloudflare.com/workers-ai/models/flux-2-dev/)
- [Remix 框架文檔](https://remix.run/docs)
- [Black Forest Labs 官方博客](https://blackforestlabs.ai/)

## 📄 License

MIT License - 自由使用和修改

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

---

**Made with ❤️ by [kinai9661](https://github.com/kinai9661) | Powered by Cloudflare Workers AI**
