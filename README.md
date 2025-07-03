# prompt-internal 项目

# 提示词管理web

## 功能
### 1.提示词分页展示

- 筛选条件包括场景、角色
- 选择筛选条件后，点击搜索按钮，可以分页展示4行5 列提示词卡片
  - 提示词由 卡片形式 展示
    - 包括提示词 title
    - 提示词内容
    - 提示词标签
- 点击提示词卡片上的编辑 icon 后，可以弹窗编辑提示词，以及关闭弹窗

### 2.提示词上传

- 右下侧有一个悬浮的上传按钮，当用户点击上传后，出现提交表格，表格包括
  - 提示词标题
  - 标签
  - 提示词内容
- 用户输入选择后可以进行保存和取消

# 技术

- Vue3 + Nuxt3
- UI组件库：完全使用 [shadcn-vue](https://www.shadcn-vue.com/) 组件
- CSS：Tailwind CSS v4
- 图标：Lucide Vue Next

## 运行项目

1. 安装依赖：
```bash
pnpm install
```

2. 启动开发服务器：
```bash
pnpm dev
```

3. 访问 http://localhost:3000

## 功能特性

✅ 提示词分页展示（响应式布局，支持1-5列）
✅ 场景和角色筛选功能（使用 shadcn Select 组件）
✅ 提示词卡片展示（使用 shadcn Card 组件，包含标题、内容、标签）
✅ 编辑提示词功能（使用 shadcn Dialog 组件）
✅ 悬浮上传按钮（使用 shadcn Button 组件）
✅ 提示词上传表单（使用 shadcn Form 组件）
✅ 分页导航（使用 shadcn Button 组件）
✅ 响应式设计，支持移动端
✅ 完整的 shadcn-vue 组件生态系统
✅ 现代化设计系统和主题支持

### 使用的 shadcn-vue 组件

- Button：按钮交互
- Card：卡片布局
- Dialog：模态弹窗
- Input：文本输入
- Textarea：多行文本
- Select：下拉选择
- Label：表单标签
- Badge：标签展示