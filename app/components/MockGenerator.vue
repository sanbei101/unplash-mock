<script setup lang="ts">
import type { UnsplashURLs } from "~~/server/utils/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const props = defineProps<{
  urls: UnsplashURLs[];
}>();

const selectedLang = ref("typescript");
const copied = ref(false);
const ossConfigured = ref(false);
const selectedSize = ref<keyof UnsplashURLs>("regular");

const sizes: { value: keyof UnsplashURLs; label: string }[] = [
  { value: "raw", label: "原始 (raw)" },
  { value: "full", label: "全尺寸 (full)" },
  { value: "regular", label: "常规 (regular)" },
  { value: "small", label: "小图 (small)" },
  { value: "thumb", label: "缩略 (thumb)" },
];

const mockUrls = computed<string[]>(() => props.urls.map((u) => u[selectedSize.value]));

const uploadedUrls = ref<string[]>([]);
const displayUrls = computed(() =>
  uploadedUrls.value.length > 0 ? uploadedUrls.value : mockUrls.value,
);

onMounted(async () => {
  try {
    const res = await $fetch<{ ossConfigured: boolean }>("/api/oss-config");
    ossConfigured.value = res.ossConfigured;
  } catch {
    ossConfigured.value = false;
  }
});

const getPhotoId = (url: string): string => {
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split("/");
    return parts[parts.length - 1] || "";
  } catch {
    return "";
  }
};

const uploadToOss = async (url: string): Promise<string> => {
  const photoId = getPhotoId(url);
  const size = selectedSize.value;
  const filename = `images/${photoId}-${size}.jpg`;

  const result = await $fetch<{ cdnUrl: string }>("/api/upload-to-oss", {
    method: "POST",
    body: { url, filename },
  });

  return result.cdnUrl;
};

const uploading = ref(false);
const uploadProgress = ref({ current: 0, total: 0 });
const uploadError = ref("");

const handleUploadToOss = async () => {
  if (mockUrls.value.length === 0) {
    uploadError.value = "URL 列表不能为空";
    return;
  }

  uploading.value = true;
  uploadProgress.value = { current: 0, total: mockUrls.value.length };
  uploadError.value = "";
  const results: string[] = [];

  try {
    for (let i = 0; i < mockUrls.value.length; i++) {
      uploadProgress.value.current = i + 1;
      const cdnUrl = await uploadToOss(mockUrls.value[i]!);
      results.push(cdnUrl);
    }
    uploadedUrls.value = results;
  } catch (err) {
    uploadError.value = err instanceof Error ? err.message : "Upload failed";
  } finally {
    uploading.value = false;
  }
};

const languages = [
  { value: "typescript", label: "TypeScript", icon: "TS" },
  { value: "go", label: "Go", icon: "Go" },
  { value: "python", label: "Python", icon: "Py" },
  { value: "rust", label: "Rust", icon: "Rs" },
  { value: "java", label: "Java", icon: "Ja" },
  { value: "json", label: "JSON", icon: "{}" },
  { value: "markdown", label: "Markdown", icon: "MD" },
];

const formatUrls = (lang: string, urls: string[]): string => {
  if (urls.length === 0) return "// No URLs";

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

const formattedCode = computed(() => formatUrls(selectedLang.value, displayUrls.value));

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
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <h2 class="text-lg font-semibold text-neutral-900">代码预览</h2>
            <Badge v-if="ossConfigured" variant="secondary" class="text-xs">OSS 已配置</Badge>
            <Select v-model="selectedSize">
              <SelectTrigger class="w-35">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="size in sizes" :key="size.value" :value="size.value">
                  <SelectItemText>{{ size.label }}</SelectItemText>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              v-if="ossConfigured"
              variant="default"
              size="sm"
              :disabled="uploading || mockUrls.length === 0"
              @click="handleUploadToOss"
            >
              <span v-if="uploading">
                上传中 {{ uploadProgress.current }}/{{ uploadProgress.total }}
              </span>
              <span v-else>上传到 OSS</span>
            </Button>
          </div>
          <Button :disabled="displayUrls.length === 0" size="sm" @click="copyCode">
            <span v-if="copied">✓ 已复制</span>
            <span v-else>复制代码</span>
          </Button>
        </div>

        <div v-if="uploading" class="flex items-center gap-2">
          <Progress
            :model-value="(uploadProgress.current / uploadProgress.total) * 100"
            class="flex-1"
          />
          <span class="text-sm text-neutral-500 shrink-0">
            {{ uploadProgress.current }}/{{ uploadProgress.total }}
          </span>
        </div>

        <div v-if="uploadError" class="rounded-md bg-red-50 p-2 text-sm text-red-600">
          {{ uploadError }}
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
    </CardContent>
  </Card>
</template>
