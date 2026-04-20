<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const props = defineProps<{
  urls: string[];
}>();

const mockUrls = ref<string>(props.urls.join("\n"));
const selectedLang = ref("typescript");
const copied = ref(false);

const languages = [
  { value: "typescript", label: "TypeScript", icon: "TS" },
  { value: "go", label: "Go", icon: "Go" },
  { value: "python", label: "Python", icon: "Py" },
  { value: "rust", label: "Rust", icon: "Rs" },
  { value: "java", label: "Java", icon: "Ja" },
  { value: "json", label: "JSON", icon: "{}" },
  { value: "markdown", label: "Markdown", icon: "MD" },
];

const parsedUrls = computed(() => {
  return mockUrls.value
    .split("\n")
    .map((u) => u.trim())
    .filter((u) => u.length > 0);
});

const formatUrls = (lang: string, urls: string[]): string => {
  if (urls.length === 0) return "// 请输入 URL";

  switch (lang) {
    case "typescript":
      return `const imageUrls = [\n${urls.map((u) => `  "${u}"`).join(",\n")}\n] as const`;

    case "go":
      return `package main\n\nvar imageUrls = []string{\n${urls.map((u) => `\t"${u}",`).join("\n")}\n}`;

    case "python":
      return `IMAGE_URLS = [\n${urls.map((u) => `    "${u}"`).join(",\n")}\n]\n`;

    case "rust":
      return `fn main() {\n    let image_urls: [&str; ${urls.length}] = [\n${urls.map((u) => `        "${u}",`).join("\n")}\n    ];\n}`;

    case "java":
      return `public class ImageUrls {\n    public static final String[] IMAGE_URLS = {\n${urls.map((u) => `        "${u}",`).join("\n")}\n    };\n}`;

    case "json":
      return JSON.stringify({ imageUrls: urls }, null, 2);

    case "markdown":
      return `# Image URLs\n\n| # | URL |\n|---|-----|\n${urls.map((u, i) => `| ${i + 1} | \`${u}\` |`).join("\n")}\n\n## 纯文本列表\n\n${urls.map((u, i) => `${i + 1}. ${u}`).join("\n")}`;

    default:
      return urls.join("\n");
  }
};

const formattedCode = computed(() => formatUrls(selectedLang.value, parsedUrls.value));

const copyCode = async () => {
  await navigator.clipboard.writeText(formattedCode.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1500);
};
</script>

<template>
  <Card class="border-0 shadow-none bg-transparent">
    <CardContent class="p-0">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left: URL Input -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-neutral-900">URL 列表</h2>
          </div>
          <textarea
            v-model="mockUrls"
            placeholder="输入图片 URL,每行一个..."
            class="min-h-100 w-full rounded-lg border border-neutral-200 bg-white p-4 font-mono text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100 resize-none"
          />
          <p class="text-sm text-neutral-500">已输入 {{ parsedUrls.length }} 个 URL</p>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-neutral-900">代码预览</h2>
            <Button :disabled="parsedUrls.length === 0" size="sm" @click="copyCode">
              <span v-if="copied">✓ 已复制</span>
              <span v-else>复制代码</span>
            </Button>
          </div>

          <!-- Language Tabs -->
          <Tabs v-model="selectedLang" class="w-full">
            <TabsList class="flex flex-wrap gap-1 bg-transparent p-0">
              <TabsTrigger
                v-for="lang in languages"
                :key="lang.value"
                :value="lang.value"
                class="text-xs data-[state=active]:bg-neutral-900 data-[state=active]:text-white"
              >
                {{ lang.label }}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <!-- Code Block -->
          <div class="relative overflow-hidden rounded-lg bg-neutral-900">
            <pre
              class="max-h-100 overflow-auto p-4 text-sm leading-relaxed"
            ><code class="text-green-400">{{ formattedCode }}</code></pre>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
