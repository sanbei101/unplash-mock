<script setup lang="ts">
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";

const props = defineProps<{
  urls: string[];
}>();

const selectedLang = ref("typescript");

const languages = [
  { value: "typescript", label: "TypeScript", icon: "TS" },
  { value: "go", label: "Go", icon: "Go" },
  { value: "python", label: "Python", icon: "Py" },
  { value: "rust", label: "Rust", icon: "Rs" },
  { value: "java", label: "Java", icon: "Ja" },
  { value: "json", label: "JSON", icon: "{}" },
  { value: "markdown", label: "Markdown", icon: "MD" },
];

const formatUrls = (lang: string): string => {
  if (props.urls.length === 0) return "// No URLs available";

  switch (lang) {
    case "typescript":
      return `const imageUrls = [\n${props.urls.map((u) => `  "${u}"`).join(",\n")}\n] as const\n\n// Or as a type-safe array\nconst urls: string[] = [\n${props.urls.map((u) => `  "${u}"`).join(",\n")}\n]`;

    case "go":
      return `package main\n\nvar imageUrls = []string{\n${props.urls.map((u) => `\t"${u}",`).join("\n")}\n}`;

    case "python":
      return `IMAGE_URLS = [\n${props.urls.map((u) => `    "${u}"`).join(",\n")}\n]\n\n# Or as a tuple\nURLS_TUPLE = (\n${props.urls.map((u) => `    "${u}",`).join("\n")}\n)`;

    case "rust":
      return `fn main() {\n    let image_urls: [&str; ${props.urls.length}] = [\n${props.urls.map((u) => `        "${u}",`).join("\n")}\n    ];\n}`;

    case "java":
      return `public class ImageUrls {\n    public static final String[] IMAGE_URLS = {\n${props.urls.map((u) => `        "${u}",`).join("\n")}\n    };\n}`;

    case "json":
      return JSON.stringify({ imageUrls: props.urls }, null, 2);

    case "markdown":
      return `# Image URLs\n\n| # | URL |\n|---|-----|\n${props.urls.map((u, i) => `| ${i + 1} | \`${u}\` |`).join("\n")}\n\n## Plain List\n\n${props.urls.map((u, i) => `${i + 1}. ${u}`).join("\n")}`;

    default:
      return props.urls.join("\n");
  }
};

const formattedCode = computed(() => formatUrls(selectedLang.value));

const copied = ref(false);

const copyAll = async () => {
  await navigator.clipboard.writeText(formattedCode.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1500);
};
</script>

<template>
  <Sheet>
    <SheetTrigger as-child>
      <slot name="trigger" />
    </SheetTrigger>
    <SheetContent side="right" class="w-[90vw] sm:max-w-2xl">
      <SheetHeader>
        <SheetTitle>URL 格式化复制</SheetTitle>
        <SheetDescription>将图片 URL 转换为多种编程语言格式</SheetDescription>
      </SheetHeader>

      <Tabs v-model="selectedLang" class="mt-4">
        <TabsList class="flex flex-wrap gap-1">
          <TabsTrigger
            v-for="lang in languages"
            :key="lang.value"
            :value="lang.value"
            class="text-xs"
          >
            {{ lang.icon }}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div class="relative mt-4 flex-1 overflow-hidden">
        <pre
          class="max-h-96 overflow-auto rounded-lg bg-neutral-900 p-4 text-sm text-green-400"
        ><code>{{ formattedCode }}</code></pre>
        <Button class="absolute right-2 top-2" size="sm" variant="secondary" @click="copyAll">
          {{ copied ? "✓ 已复制" : "复制代码" }}
        </Button>
      </div>

      <div class="mt-4 text-sm text-neutral-600">
        <p class="mb-2 font-medium text-neutral-900">使用提示</p>
        <p v-if="selectedLang === 'typescript'">适合前端项目,直接作为 const 使用</p>
        <p v-else-if="selectedLang === 'go'">适合后端服务,复制到你的 go 文件</p>
        <p v-else-if="selectedLang === 'python'">适合数据处理或脚本项目</p>
        <p v-else-if="selectedLang === 'rust'">适合性能敏感的项目</p>
        <p v-else-if="selectedLang === 'java'">适合 Java/Kotlin 项目</p>
        <p v-else-if="selectedLang === 'json'">适合配置文件或 API 响应</p>
        <p v-else-if="selectedLang === 'markdown'">适合文档或 README</p>
      </div>
    </SheetContent>
  </Sheet>
</template>
