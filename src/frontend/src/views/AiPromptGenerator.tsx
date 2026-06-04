import { defineComponent, reactive, ref, computed } from 'vue';
import styles from './AiPromptGenerator.module.scss';

/** 提示词模板预设 */
const PRESET_TEMPLATES = [
  {
    name: '通用助手',
    description: '适合大多数场景的通用型 prompt',
    fields: { role: '你是一个专业的AI助手', tone: '友好、专业、简洁' },
  },
  {
    name: '代码专家',
    description: '编程、代码审查、技术方案',
    fields: { role: '你是一个资深全栈开发工程师', tone: '严谨、逻辑清晰、附带代码示例' },
  },
  {
    name: '文案写作',
    description: '营销文案、文章撰写、内容创作',
    fields: { role: '你是一个经验丰富的文案策划', tone: '有感染力、富有创意、贴近目标读者' },
  },
  {
    name: '数据分析',
    description: '数据解读、报告撰写、趋势分析',
    fields: { role: '你是一个数据分析师', tone: '客观、数据驱动、结论明确' },
  },
];

export default defineComponent({
  name: 'AiPromptGenerator',
  setup() {
    /** 表单数据 */
    const form = reactive({
      role: '',          // 角色设定
      task: '',          // 任务描述
      audience: '',       // 目标受众
      format: '',         // 输出格式
      style: '',          // 风格/语气
      constraints: '',     // 约束条件
      examples: '',       // 示例参考
    });

    const generatedPrompt = ref('');
    const copied = ref(false);

    /** 生成的提示词 */
    const promptText = computed(() => {
      const parts: string[] = [];

      if (form.role) parts.push(`## 角色设定\n${form.role}`);
      if (form.task) parts.push(`## 任务\n${form.task}`);
      if (form.audience) parts.push(`## 目标受众\n${form.audience}`);
      if (form.format) parts.push(`## 输出格式\n${form.format}`);
      if (form.style) parts.push(`## 风格要求\n${form.style}`);
      if (form.constraints) parts.push(`## 约束条件\n${form.constraints}`);
      if (form.examples) parts.push(`## 参考\n${form.examples}`);

      return parts.join('\n\n');
    });

    /** 应用预设模板 */
    function applyPreset(preset: typeof PRESET_TEMPLATES[0]) {
      form.role = preset.fields.role;
      // 预设的 tone 填入风格字段
      if (!form.style) form.style = preset.fields.tone;
    }

    /** 生成提示词 */
    function generate() {
      generatedPrompt.value = promptText.value || '';
    }

    /** 复制到剪贴板 */
    async function copyToClipboard() {
      try {
        await navigator.clipboard.writeText(generatedPrompt.value);
        copied.value = true;
        setTimeout(() => { copied.value = false; }, 2000);
      } catch {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = generatedPrompt.value;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        copied.value = true;
        setTimeout(() => { copied.value = false; }, 2000);
      }
    }

    /** 清空表单 */
    function resetForm() {
      Object.assign(form, { role: '', task: '', audience: '', format: '', style: '', constraints: '', examples: '' });
      generatedPrompt.value = '';
    }

    return {
      form,
      generatedPrompt,
      copied,
      PRESET_TEMPLATES,
      applyPreset,
      generate,
      copyToClipboard,
      resetForm,
      styles,
    };
  },
  render() {
    return (
      <div class={styles.container}>
        {/* 标题区 */}
        <div class={styles.header}>
          <div>
            <h2>🤖 AI 提示词生成器</h2>
            <p class={styles.desc}>填写以下条件，自动组装高效的结构化 Prompt</p>
          </div>

          {/* 快捷预设 */}
          <div class={styles.presets}>
            <span class={styles.presetLabel}>快捷模板：</span>
            {this.PRESET_TEMPLATES.map((preset) => (
              <button
                key={preset.name}
                class={styles.presetBtn}
                onClick={() => this.applyPreset(preset)}
                title={preset.description}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div class={styles.body}>
          {/* 左侧：输入表单 */}
          <div class={styles.formPanel}>
            <h3 class={styles.panelTitle}>输入条件</h3>

            <div class={styles.formGroup}>
              <label>
                <span class={styles.required}>*</span> 角色设定
              </label>
              <textarea
                value={this.form.role}
                onInput={(e) => { this.form.role = (e.target as HTMLTextAreaElement).value; }}
                placeholder="例如：你是一个资深前端工程师，精通 Vue、React 和 TypeScript..."
                rows={3}
              />
            </div>

            <div class={styles.formGroup}>
              <label>
                <span class={styles.required}>*</span> 任务描述
              </label>
              <textarea
                value={this.form.task}
                onInput={(e) => { this.form.task = (e.target as HTMLTextAreaElement).value; }}
                placeholder="例如：帮我写一个通用的表单验证 hook，支持自定义校验规则..."
                rows={3}
              />
            </div>

            <div class={styles.formGroup}>
              <label>目标受众</label>
              <input
                value={this.form.audience}
                onInput={(e) => { this.form.audience = (e.target as HTMLInputElement).value; }}
                placeholder="例如：初级开发者 / 产品经理 / 普通用户"
              />
            </div>

            <div class={styles.formGroup}>
              <label>输出格式</label>
              <input
                value={this.form.format}
                onInput={(e) => { this.form.format = (e.target as HTMLInputElement).value; }}
                placeholder="例如：Markdown 格式 / JSON / 分步骤列出"
              />
            </div>

            <div class={styles.formGroup}>
              <label>风格 / 语气</label>
              <input
                value={this.form.style}
                onInput={(e) => { this.form.style = (e.target as HTMLInputElement).value; }}
                placeholder="例如：严谨学术 / 轻松幽默 / 专业简练"
              />
            </div>

            <div class={styles.formGroup}>
              <label>约束条件</label>
              <textarea
                value={this.form.constraints}
                onInput={(e) => { this.form.constraints = (e.target as HTMLTextAreaElement).value; }}
                placeholder="例如：不要使用 jargon / 每个步骤不超过 3 行代码..."
                rows={2}
              />
            </div>

            <div class={styles.formGroup}>
              <label>示例参考（可选）</label>
              <textarea
                value={this.form.examples}
                onInput={(e) => { this.form.examples = (e.target as HTMLTextAreaElement).value; }}
                placeholder="粘贴期望输出的示例片段，帮助 AI 理解你的预期..."
                rows={2}
              />
            </div>

            {/* 操作按钮 */}
            <div class={styles.actions}>
              <button class={[styles.btn, styles.btnPrimary].join(' ')} onClick={this.generate}>
                生成提示词 ✨
              </button>
              <button class={[styles.btn, styles.btnSecondary].join(' ')} onClick={this.resetForm}>
                清空重置
              </button>
            </div>
          </div>

          {/* 右侧：生成结果 */}
          <div class={styles.resultPanel}>
            <h3 class={styles.panelTitle}>
              生成的 Prompt
              {this.generatedPrompt && (
                <button class={[styles.copyBtn, this.copied ? styles.copied : ''].join(' ')} onClick={this.copyToClipboard}>
                  {this.copied ? '已复制 ✓' : '复制'}
                </button>
              )}
            </h3>

            {this.generatedPrompt ? (
              <pre class={styles.resultContent}>{this.generatedPrompt}</pre>
            ) : (
              <div class={styles.placeholder}>
                <span class={styles.placeholderIcon}>📝</span>
                <p>填写左侧条件后点击「生成提示词」</p>
                <p class={styles.hint}>生成的 Prompt 将在此处显示，可直接复制使用</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
});
