import type { ActionFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "FLUX.2 AI 圖像生成器 | Cloudflare Workers AI" },
    { name: "description", content: "基於 FLUX.2 [dev] 的智能圖像生成工具" },
  ];
};

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const prompt = formData.get("prompt") as string;
  const inputImages = formData.getAll("images") as File[];

  if (!prompt) {
    return json({ error: "請輸入圖像描述" }, { status: 400 });
  }

  try {
    // @ts-ignore - Workers AI binding
    const ai = context.cloudflare.env.AI;
    
    // 構建 multipart form data
    const apiFormData = new FormData();
    
    // 添加參考圖像（最多4張，每張需要512x512）
    const processedImages = inputImages.filter(img => img.size > 0).slice(0, 4);
    for (let i = 0; i < processedImages.length; i++) {
      apiFormData.append(`input_image_${i}`, processedImages[i]);
    }
    
    // 添加 prompt
    apiFormData.append("prompt", prompt);

    // 調用 FLUX.2 [dev] 模型
    const response = await ai.run(
      "@cf/black-forest-labs/flux-2-dev",
      apiFormData
    );

    // 將圖像轉換為 base64
    const buffer = await response.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    return json({ 
      success: true, 
      image: `data:image/png;base64,${base64}`,
      prompt 
    });
  } catch (error: any) {
    console.error("Generation error:", error);
    return json({ error: error.message || "生成失敗，請重試" }, { status: 500 });
  }
}

export default function Index() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isGenerating = navigation.state === "submitting";
  const [imageCount, setImageCount] = useState(0);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎨 FLUX.2 AI 圖像生成器</h1>
        <p style={styles.subtitle}>基於 Cloudflare Workers AI 的超高性能圖像生成</p>

        <Form method="post" encType="multipart/form-data" style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>圖像描述 Prompt</label>
            <textarea
              name="prompt"
              placeholder="描述您想要生成的圖像，例如：一隻賽博朋克風格的橘貓，戴著墨鏡，背景是霓虹燈城市"
              style={styles.textarea}
              rows={4}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              參考圖像（可選，最多4張）
              {imageCount > 0 && <span style={styles.badge}>{imageCount} 張</span>}
            </label>
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              style={styles.fileInput}
              onChange={(e) => setImageCount(e.target.files?.length || 0)}
            />
            <small style={styles.hint}>支持風格遷移、對象合成等高級功能</small>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            style={{
              ...styles.button,
              ...(isGenerating ? styles.buttonDisabled : {}),
            }}
          >
            {isGenerating ? "🔄 生成中..." : "✨ 生成圖像"}
          </button>
        </Form>

        {actionData?.error && (
          <div style={styles.error}>
            ❌ {actionData.error}
          </div>
        )}

        {actionData?.success && actionData.image && (
          <div style={styles.result}>
            <h3 style={styles.resultTitle}>生成結果</h3>
            <img
              src={actionData.image}
              alt={actionData.prompt}
              style={styles.resultImage}
            />
            <p style={styles.resultPrompt}>{actionData.prompt}</p>
          </div>
        )}

        <div style={styles.features}>
          <h3 style={styles.featuresTitle}>核心特性</h3>
          <ul style={styles.featureList}>
            <li>🚀 超快速生成 - Cloudflare 全球邊緣網絡</li>
            <li>🎯 物理真實感 - 高保真圖像渲染</li>
            <li>🌍 多語言支持 - 中文/英文/多種語言</li>
            <li>🎨 風格控制 - 支持 Hex 色碼和 JSON Prompting</li>
            <li>🖼️ 多圖參考 - 最多4張圖像風格合成</li>
          </ul>
        </div>
      </div>

      <footer style={styles.footer}>
        <p>Powered by <strong>FLUX.2 [dev]</strong> on Cloudflare Workers AI</p>
        <p style={styles.footerLink}>
          <a href="https://github.com/kinai9661/flux.2" target="_blank" rel="noopener" style={styles.link}>
            📦 GitHub Repository
          </a>
        </p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '2.5rem',
    maxWidth: '800px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#666',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontWeight: '600',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  badge: {
    background: '#667eea',
    color: 'white',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
  },
  textarea: {
    padding: '0.75rem',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
  },
  fileInput: {
    padding: '0.5rem',
    border: '2px dashed #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  hint: {
    color: '#999',
    fontSize: '0.85rem',
  },
  button: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '1rem 2rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  error: {
    background: '#fee',
    color: '#c33',
    padding: '1rem',
    borderRadius: '8px',
    marginTop: '1rem',
  },
  result: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: '#f9f9f9',
    borderRadius: '12px',
  },
  resultTitle: {
    marginBottom: '1rem',
    color: '#333',
  },
  resultImage: {
    width: '100%',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  resultPrompt: {
    color: '#666',
    fontSize: '0.9rem',
    fontStyle: 'italic',
  },
  features: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: '#f0f4ff',
    borderRadius: '12px',
  },
  featuresTitle: {
    marginBottom: '1rem',
    color: '#667eea',
  },
  featureList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  footer: {
    marginTop: '2rem',
    textAlign: 'center' as const,
    color: 'white',
    fontSize: '0.9rem',
  },
  footerLink: {
    marginTop: '0.5rem',
  },
  link: {
    color: 'white',
    textDecoration: 'underline',
  },
};
