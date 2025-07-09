<template>
  <div class="min-h-screen bg-background p-6">
    <!-- 页面标题 -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-foreground mb-2">提示词管理中心</h1>
      <p class="text-muted-foreground">管理和分享您的AI提示词模板</p>
    </div>

    <!-- 筛选条件区域 -->
    <Card class="mb-6">
      <CardContent class="p-6">
        <div class="flex flex-col md:flex-row gap-4 items-end">
          <div class="flex-1">
            <Label for="scenario" class="text-sm font-medium mb-2">场景</Label>
              <Select v-model="filters.scenario">
               <SelectTrigger>
                 <SelectValue placeholder="全部场景" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">全部场景</SelectItem>
                 <SelectItem value="writing">写作助手</SelectItem>
                 <SelectItem value="coding">编程助手</SelectItem>
                 <SelectItem value="analysis">数据分析</SelectItem>
                 <SelectItem value="translation">翻译助手</SelectItem>
               </SelectContent>
             </Select>
          </div>
          
          <div class="flex-1">
            <Label for="role" class="text-sm font-medium mb-2">角色</Label>
              <Select v-model="filters.role">
               <SelectTrigger>
                 <SelectValue placeholder="全部角色" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">全部角色</SelectItem>
                 <SelectItem value="assistant">助手</SelectItem>
                 <SelectItem value="expert">专家</SelectItem>
                 <SelectItem value="teacher">老师</SelectItem>
                 <SelectItem value="analyst">分析师</SelectItem>
               </SelectContent>
             </Select>
          </div>
          
          <Button @click="searchPrompts" class="w-full md:w-auto">
            搜索
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 提示词卡片网格 -->
    <Card class="mb-6">
      <CardContent class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
          <Card
            v-for="prompt in displayedPrompts"
            :key="prompt.id"
            class="hover:shadow-md transition-shadow relative group cursor-pointer"
          >
            <CardContent class="p-4">
              <!-- 编辑按钮 -->
              <Button
                @click="editPrompt(prompt)"
                variant="ghost"
                size="sm"
                class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              >
                <Edit class="h-4 w-4" />
              </Button>
              
              <!-- 卡片内容 -->
              <CardTitle class="text-sm mb-2 pr-6">{{ prompt.title }}</CardTitle>
              <p class="text-sm text-muted-foreground mb-3 line-clamp-3">{{ prompt.content }}</p>
              
              <!-- 标签 -->
              <div class="flex flex-wrap gap-1">
                <Badge
                  v-for="tag in prompt.tags"
                  :key="tag"
                  variant="secondary"
                  class="text-xs"
                >
                  {{ tag }}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <!-- 分页 -->
        <div class="flex justify-center items-center gap-2">
          <Button
            @click="prevPage"
            :disabled="currentPage <= 1"
            variant="outline"
            size="sm"
          >
            上一页
          </Button>
          
          <span class="mx-4 text-sm text-muted-foreground">
            第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
          </span>
          
          <Button
            @click="nextPage"
            :disabled="currentPage >= totalPages"
            variant="outline"
            size="sm"
          >
            下一页
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 悬浮上传按钮 -->
    <Button
      @click="showUploadDialog = true"
      class="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
      size="lg"
    >
      <Plus class="h-6 w-6" />
    </Button>

    <!-- 编辑弹窗 -->
    <Dialog :open="showEditDialog" @update:open="showEditDialog = $event">
      <DialogContent class="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>编辑提示词</DialogTitle>
        </DialogHeader>
        
        <form @submit.prevent="saveEdit" class="space-y-4">
          <div class="space-y-2">
            <Label for="edit-title">标题</Label>
            <Input
              id="edit-title"
              v-model="editingPrompt.title"
              required
            />
          </div>
          
          <div class="space-y-2">
            <Label for="edit-tags">标签（用逗号分隔）</Label>
            <Input
              id="edit-tags"
              v-model="editingTagsString"
              placeholder="例如：助手,专业,高效"
            />
          </div>
          
          <div class="space-y-2">
            <Label for="edit-content">内容</Label>
            <Textarea
              id="edit-content"
              v-model="editingPrompt.content"
              :rows="8"
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" @click="closeEditDialog">
              取消
            </Button>
            <Button type="submit">
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- 上传弹窗 -->
    <Dialog :open="showUploadDialog" @update:open="showUploadDialog = $event">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>上传提示词</DialogTitle>
        </DialogHeader>
        
        <form @submit.prevent="saveUpload" class="space-y-4">
          <div class="space-y-2">
            <Label for="new-title">提示词标题</Label>
            <Input
              id="new-title"
              v-model="newPrompt.title"
              required
              placeholder="请输入标题"
            />
          </div>
          
          <div class="space-y-2">
            <Label for="new-tags">标签（用逗号分隔）</Label>
            <Input
              id="new-tags"
              v-model="newPrompt.tagsString"
              placeholder="例如：助手,专业,高效"
            />
          </div>
          
          <div class="space-y-2">
            <Label for="new-content">提示词内容</Label>
            <Textarea
              id="new-content"
              v-model="newPrompt.content"
              :rows="8"
              required
              placeholder="请输入提示词内容"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" @click="closeUploadDialog">
              取消
            </Button>
            <Button type="submit">
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { Edit, Plus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// 响应式数据
const filters = ref({
  scenario: 'all',
  role: 'all'
})

const currentPage = ref(1)
const itemsPerPage = 20 // 4行 x 5列
const showEditDialog = ref(false)
const showUploadDialog = ref(false)

// 模拟数据
const allPrompts = ref([
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
    content: "你是一名专业的数据分析师，擅长使用统计学方法分析数据，发现数据中的模式和趋势，并提供有价值的洞察。你是一名专业的数据分析师，擅长使用统计学方法分析数据，发现数据中的模式和趋势，并提供有价值的洞察。你是一名专业的数据分析师，擅长使用统计学方法分析数据，发现数据中的模式和趋势，并提供有价值的洞察。你是一名专业的数据分析师，擅长使用统计学方法分析数据，发现数据中的模式和趋势，并提供有价值的洞察。",
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

const filteredPrompts = ref([])
const editingPrompt = ref({})
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
    const matchScenario = filters.value.scenario === 'all' || prompt.scenario === filters.value.scenario
    const matchRole = filters.value.role === 'all' || prompt.role === filters.value.role
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

const editPrompt = (prompt) => {
  editingPrompt.value = { ...prompt }
  editingTagsString.value = prompt.tags.join(', ')
  showEditDialog.value = true
}

const closeEditDialog = () => {
  showEditDialog.value = false
  editingPrompt.value = {}
  editingTagsString.value = ''
}

// 监听编辑弹窗状态变化
watch(showEditDialog, (newValue) => {
  if (!newValue) {
    editingPrompt.value = {}
    editingTagsString.value = ''
  }
})

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

// 监听上传弹窗状态变化
watch(showUploadDialog, (newValue) => {
  if (!newValue) {
    newPrompt.value = {
      title: '',
      content: '',
      tagsString: ''
    }
  }
})

const saveUpload = () => {
  const tags = newPrompt.value.tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
  
  const prompt = {
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