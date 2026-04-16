<script setup lang="ts">
import { type UnsplashSearchResponse } from "~~/server/utils/types"

const { data } = await useFetch<UnsplashSearchResponse>('/api/search-photos', {
  query: {
    query: 'mountain',
    per_page: 20,
    orientation: 'landscape'
  }
})

const urls = computed(() => data.value?.results?.map(p => p.urls.small) || [])

const selectedLang = ref('typescript')

const languages = [
  { value: 'typescript', label: 'TypeScript', icon: 'TS' },
  { value: 'go', label: 'Go', icon: 'Go' },
  { value: 'python', label: 'Python', icon: 'Py' },
  { value: 'rust', label: 'Rust', icon: 'Rs' },
  { value: 'java', label: 'Java', icon: 'Ja' },
  { value: 'json', label: 'JSON', icon: '{}' },
  { value: 'markdown', label: 'Markdown', icon: 'MD' },
]

const formatUrls = (lang: string): string => {
  if (urls.value.length === 0) return '// No URLs available'

  switch (lang) {
    case 'typescript':
      return `const imageUrls = [\n${urls.value.map(u => `  "${u}"`).join(',\n')}\n] as const\n\n// Or as a type-safe array\nconst urls: string[] = [\n${urls.value.map(u => `  "${u}"`).join(',\n')}\n]`

    case 'go':
      return `package main\n\nvar imageUrls = []string{\n${urls.value.map(u => `\t"${u}",`).join('\n')}\n}`

    case 'python':
      return `IMAGE_URLS = [\n${urls.value.map(u => `    "${u}"`).join(',\n')}\n]\n\n# Or as a tuple\nURLS_TUPLE = (\n${urls.value.map(u => `    "${u}",`).join('\n')}\n)`

    case 'rust':
      return `fn main() {\n    let image_urls: [&str; ${urls.value.length}] = [\n${urls.value.map(u => `        "${u}",`).join('\n')}\n    ];\n}`

    case 'java':
      return `public class ImageUrls {\n    public static final String[] IMAGE_URLS = {\n${urls.value.map(u => `        "${u}",`).join('\n')}\n    };\n}`

    case 'json':
      return JSON.stringify({ imageUrls: urls.value }, null, 2)

    case 'markdown':
      return `# Image URLs\n\n| # | URL |\n|---|-----|\n${urls.value.map((u, i) => `| ${i + 1} | \`${u}\` |`).join('\n')}\n\n## Plain List\n\n${urls.value.map((u, i) => `${i + 1}. ${u}`).join('\n')}`

    default:
      return urls.value.join('\n')
  }
}

const formattedCode = computed(() => formatUrls(selectedLang.value))

const copied = ref(false)

const copyAll = async () => {
  await navigator.clipboard.writeText(formattedCode.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 1500)
}

const copySingle = async (url: string) => {
  await navigator.clipboard.writeText(url)
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 p-8">
    <div class="mx-auto max-w-6xl">
      <div class="mb-8">
        <NuxtLink to="/" class="mb-4 inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900">
          ← 返回搜索
        </NuxtLink>
        <h1 class="text-3xl font-bold text-neutral-900">URL 格式化复制</h1>
        <p class="mt-1 text-neutral-500">将图片 URL 转换为多种编程语言格式</p>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <Card class="flex flex-col">
          <CardHeader>
            <CardTitle>代码预览</CardTitle>
            <CardDescription>选择语言并一键复制</CardDescription>
          </CardHeader>
          <CardContent class="flex-1">
            <!-- Language Tabs -->
            <Tabs v-model="selectedLang" class="mb-4">
              <TabsList class="flex flex-wrap gap-1">
                <TabsTrigger v-for="lang in languages" :key="lang.value" :value="lang.value" class="text-xs">
                  {{ lang.icon }}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <!-- Code Block -->
            <div class="relative">
              <pre
                class="max-h-100 overflow-auto rounded-lg bg-neutral-900 p-4 text-sm text-green-400"><code>{{ formattedCode }}</code></pre>
              <Button class="absolute right-2 top-2" size="sm" variant="secondary" @click="copyAll">
                {{ copied ? '✓ 已复制' : '复制代码' }}
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- URL List -->
        <Card class="flex flex-col">
          <CardHeader>
            <CardTitle>图片列表</CardTitle>
            <CardDescription>共 {{ urls.length }} 个 URL</CardDescription>
          </CardHeader>
          <CardContent class="flex-1 overflow-auto">
            <div v-if="urls.length === 0" class="py-8 text-center text-neutral-500">
              暂无图片数据
            </div>
            <div v-else class="space-y-2">
              <div v-for="(url, index) in urls" :key="index"
                class="group flex items-center gap-2 rounded-lg border p-2 hover:bg-neutral-50">
                <Badge variant="outline" class="shrink-0 w-8 justify-center">
                  {{ index + 1 }}
                </Badge>
                <span class="min-w-0 flex-1 truncate font-mono text-xs text-neutral-600">
                  {{ url }}
                </span>
                <Button variant="ghost" size="icon"
                  class="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" @click="copySingle(url)">
                  📋
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Usage Tips -->
      <Card class="mt-6">
        <CardContent class="p-6">
          <h3 class="mb-3 font-semibold">使用提示</h3>
          <div class="grid gap-4 text-sm text-neutral-600 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p class="font-medium text-neutral-900">TypeScript</p>
              <p>适合前端项目,直接作为 const 使用</p>
            </div>
            <div>
              <p class="font-medium text-neutral-900">Go</p>
              <p>适合后端服务,复制到你的 go 文件</p>
            </div>
            <div>
              <p class="font-medium text-neutral-900">Python</p>
              <p>适合数据处理或脚本项目</p>
            </div>
            <div>
              <p class="font-medium text-neutral-900">Rust</p>
              <p>适合性能敏感的项目</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
