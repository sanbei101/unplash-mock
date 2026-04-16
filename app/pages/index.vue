<script setup lang="ts">
import type { UnsplashSearchResponse } from "~~/server/utils/types";
import CodePreviewSheet from "@/components/CodePreviewSheet.vue";

const keyword = ref("mountain");
const page = ref(1);

const { data, pending, error, execute } = await useFetch<UnsplashSearchResponse>(
  "/api/search-photos",
  {
    query: {
      query: keyword,
      per_page: 12,
      page,
      orientation: "landscape",
    },
    immediate: true,
  },
);

const search = () => {
  page.value = 1;
  execute();
};

const copiedIndex = ref<number | null>(null);

const copyUrl = async (url: string, index: number) => {
  await navigator.clipboard.writeText(url);
  copiedIndex.value = index;
  setTimeout(() => {
    copiedIndex.value = null;
  }, 1500);
};

const goToPage = (newPage: number) => {
  if (newPage >= 1 && newPage <= (data.value?.total_pages || 1)) {
    page.value = newPage;
    execute();
  }
};

const urls = computed(() => data.value?.results?.map((p) => p.urls.small) || []);
</script>

<template>
  <div class="min-h-screen bg-neutral-50 py-8">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-2 text-4xl font-bold text-neutral-900">Unsplash Mock</h1>
        <p class="text-neutral-500">搜索并发现高质量免费图片</p>
      </div>

      <!-- Search Card -->
      <div class="mb-8 flex gap-3">
        <Input
          v-model="keyword"
          placeholder="输入搜索词..."
          class="h-11 text-base"
          @keyup.enter="search"
        />
        <Button :disabled="pending" size="lg" class="h-11 px-6" @click="search">
          <span v-if="pending" class="animate-pulse">搜索中...</span>
          <span v-else>搜索</span>
        </Button>
      </div>

      <!-- Error State -->
      <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
        获取失败: {{ error.message }}
      </div>

      <!-- Loading State -->
      <div
        v-else-if="pending"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div v-for="i in 8" :key="i" class="animate-pulse">
          <div class="aspect-4/3 rounded-xl bg-neutral-200" />
          <div class="mt-3 h-4 w-3/4 rounded bg-neutral-200" />
        </div>
      </div>

      <!-- Results -->
      <div v-else-if="data?.results" class="space-y-6">
        <!-- Stats -->
        <div class="flex items-center justify-between">
          <Badge variant="secondary" class="text-sm">
            找到 {{ data.results.length }} 张图片,共 {{ data.total }} 张
          </Badge>
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" :disabled="page <= 1" @click="goToPage(page - 1)">
              上一页
            </Button>
            <span class="text-sm text-neutral-500">
              第 {{ page }} / {{ data.total_pages || 1 }} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              :disabled="page >= data.total_pages"
              @click="goToPage(page + 1)"
            >
              下一页
            </Button>
            <CodePreviewSheet :urls="urls">
              <template #trigger>
                <Button variant="outline" size="sm"> 复制所有 URL </Button>
              </template>
            </CodePreviewSheet>
          </div>
        </div>

        <!-- Photo Grid -->
        <div
          v-if="data.results.length > 0"
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <Card
            v-for="(photo, index) in data.results"
            :key="photo.id"
            class="overflow-hidden transition-all hover:shadow-lg pt-0"
          >
            <div class="relative aspect-4/3 overflow-hidden bg-neutral-100">
              <img
                :src="photo.urls.small"
                :alt="photo.description || 'unsplash photo'"
                class="h-full w-full object-cover transition-transform hover:scale-105"
                loading="lazy"
              />
            </div>
            <CardContent class="pt-0">
              <div class="flex items-center justify-between">
                <div class="min-w-0 flex-1">
                  <p class="truncate font-mono text-xs text-neutral-400">
                    {{ photo.urls.small }}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  class="ml-2 shrink-0"
                  @click="copyUrl(photo.urls.small, index)"
                >
                  <span v-if="copiedIndex === index" class="text-green-500">✓</span>
                  <span v-else>📋</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Empty State -->
        <div v-else class="py-16 text-center">
          <p class="text-lg text-neutral-500">没有找到相关照片</p>
          <p class="mt-2 text-sm text-neutral-400">试试其他搜索词</p>
        </div>
      </div>
    </div>
  </div>
</template>
