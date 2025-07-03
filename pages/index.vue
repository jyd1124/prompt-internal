<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- 页面标题 -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">提示词管理中心</h1>
      <p class="text-gray-600">管理和分享您的AI提示词模板</p>
    </div>

    <!-- 筛选条件区域 -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="flex flex-col md:flex-row gap-4 items-end">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">场景</label>
          <select 
            v-model="filters.scenario" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部场景</option>
            <option value="writing">写作助手</option>
            <option value="coding">编程助手</option>
            <option value="analysis">数据分析</option>
            <option value="translation">翻译助手</option>
          </select>
        </div>
        
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">角色</label>
          <select 
            v-model="filters.role" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部角色</option>
            <option value="assistant">助手</option>
            <option value="expert">专家</option>
            <option value="teacher">老师</option>
            <option value="analyst">分析师</option>
          </select>
        </div>
        
        <button
          @click="searchPrompts"
          class="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          搜索
        </button>
      </div>
    </div>

    <!-- 提示词卡片网格 -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
        <div
          v-for="prompt in displayedPrompts"
          :key="prompt.id"
          class="border rounded-lg p-4 hover:shadow-md transition-shadow relative group"
        >
          <!-- 编辑按钮 -->
          <button
            @click="editPrompt(prompt)"
            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
          >
            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          
          <!-- 卡片内容 -->
          <h3 class="font-semibold text-gray-900 mb-2 pr-6">{{ prompt.title }}</h3>
          <p class="text-sm text-gray-600 mb-3 line-clamp-3">{{ prompt.content }}</p>
          
          <!-- 标签 -->
          <div class="flex flex-wrap gap-1">
            <span
              v-for="tag in prompt.tags"
              :key="tag"
              class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="flex justify-center items-center gap-2">
        <button
          @click="prevPage"
          :disabled="currentPage <= 1"
          class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一页
        </button>
        
        <span class="mx-4 text-sm text-gray-600">
          第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
        </span>
        
        <button
          @click="nextPage"
          :disabled="currentPage >= totalPages"
          class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 悬浮上传按钮 -->
    <button
      @click="showUploadDialog = true"
      class="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
    </button>

    <!-- 编辑弹窗 -->
    <div
      v-if="showEditDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeEditDialog"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">编辑提示词</h2>
          <button @click="closeEditDialog" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="saveEdit">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">标题</label>
            <input
              v-model="editingPrompt.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">标签（用逗号分隔）</label>
            <input
              v-model="editingTagsString"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如：助手,专业,高效"
            />
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">内容</label>
            <textarea
              v-model="editingPrompt.content"
              rows="8"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          
          <div class="flex gap-3 justify-end">
            <button
              type="button"
              @click="closeEditDialog"
              class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 上传弹窗 -->
    <div
      v-if="showUploadDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeUploadDialog"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">上传提示词</h2>
          <button @click="closeUploadDialog" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="saveUpload">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">提示词标题</label>
            <input
              v-model="newPrompt.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="请输入标题"
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">标签（用逗号分隔）</label>
            <input
              v-model="newPrompt.tagsString"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如：助手,专业,高效"
            />
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">提示词内容</label>
            <textarea
              v-model="newPrompt.content"
              rows="8"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="请输入提示词内容"
            ></textarea>
          </div>
          
          <div class="flex gap-3 justify-end">
            <button
              type="button"
              @click="closeUploadDialog"
              class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Prompt, FilterOptions } from '~/types'

// 响应式数据
const filters = ref<FilterOptions>({
  scenario: '',
  role: ''
})

const currentPage = ref(1)
const itemsPerPage = 20 // 4行 x 5列
const showEditDialog = ref(false)
const showUploadDialog = ref(false)

// 模拟数据
const allPrompts = ref<Prompt[]>([
  {
    id: 1,
    title: "专业的写作助手",
    content: "你是一个专业的写作助手，擅长各种文体的写作，包括学术论文、商业文档、创意写作等。请根据用户的需求提供高质量的写作建议和内容。",
    tags: ["写作", "助手", "专业"],
    scenario: "writing",
    role: "assistant"
  },
  {
    id: 2,
    title: "编程代码审查专家",
    content: "你是一位经验丰富的编程专家，能够对各种编程语言进行代码审查，提供优化建议，发现潜在bug，并给出最佳实践建议。",
    tags: ["编程", "代码审查", "专家"],
    scenario: "coding",
    role: "expert"
  },
  {
    id: 3,
    title: "数据分析师",
    content: "你是一名专业的数据分析师，擅长使用统计学方法分析数据，发现数据中的模式和趋势，并提供有价值的洞察。",
    tags: ["数据分析", "统计", "洞察"],
    scenario: "analysis",
    role: "analyst"
  },
  // 添加更多模拟数据
  ...Array.from({ length: 50 }, (_, i) => ({
    id: i + 4,
    title: `提示词标题 ${i + 4}`,
    content: `这是第 ${i + 4} 个提示词的内容，用于演示分页功能和卡片展示效果。内容可能会比较长，需要合适的截断处理。`,
    tags: [`标签${i + 1}`, `类型${(i % 3) + 1}`],
    scenario: ["writing", "coding", "analysis", "translation"][i % 4],
    role: ["assistant", "expert", "teacher", "analyst"][i % 4]
  }))
])

const filteredPrompts = ref<Prompt[]>([])
const editingPrompt = ref<Prompt>({} as Prompt)
const editingTagsString = ref('')

const newPrompt = ref({
  title: '',
  content: '',
  tagsString: ''
})

// 计算属性
const displayedPrompts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredPrompts.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredPrompts.value.length / itemsPerPage)
})

// 方法
const searchPrompts = () => {
  filteredPrompts.value = allPrompts.value.filter(prompt => {
    const matchScenario = !filters.value.scenario || prompt.scenario === filters.value.scenario
    const matchRole = !filters.value.role || prompt.role === filters.value.role
    return matchScenario && matchRole
  })
  currentPage.value = 1
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const editPrompt = (prompt: Prompt) => {
  editingPrompt.value = { ...prompt }
  editingTagsString.value = prompt.tags.join(', ')
  showEditDialog.value = true
}

const closeEditDialog = () => {
  showEditDialog.value = false
  editingPrompt.value = {} as Prompt
  editingTagsString.value = ''
}

const saveEdit = () => {
  const tags = editingTagsString.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
  
  editingPrompt.value.tags = tags
  
  // 更新原数据
  const index = allPrompts.value.findIndex(p => p.id === editingPrompt.value.id)
  if (index !== -1) {
    allPrompts.value[index] = { ...editingPrompt.value }
  }
  
  // 重新搜索以更新显示
  searchPrompts()
  closeEditDialog()
}

const closeUploadDialog = () => {
  showUploadDialog.value = false
  newPrompt.value = {
    title: '',
    content: '',
    tagsString: ''
  }
}

const saveUpload = () => {
  const tags = newPrompt.value.tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
  
  const prompt: Prompt = {
    id: Date.now(), // 简单的ID生成
    title: newPrompt.value.title,
    content: newPrompt.value.content,
    tags
  }
  
  allPrompts.value.unshift(prompt)
  searchPrompts()
  closeUploadDialog()
}

// 初始化
onMounted(() => {
  searchPrompts()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 