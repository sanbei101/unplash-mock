<script setup lang="ts">
import type { UnsplashSearchResponse } from "~~/server/utils/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MockGenerator from "@/components/MockGenerator.vue";

const activeTab = ref("photos");

// Photos Tab
const keyword = ref("mountain");
const page = ref(1);
const perPage = ref(12);

const perPageOptions = [8, 12, 24, 30];

const { data, pending, error, execute } = await useFetch<UnsplashSearchResponse>(
  "/api/search-photos",
  {
    query: {
      query: keyword,
      per_page: perPage,
      page,
      orientation: "landscape",
    },
    immediate: true,
    watch: false,
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

watch(perPage, () => {
  page.value = 1;
  execute();
});
</script>

<template>
  <div class="min-h-screen bg-neutral-50 py-8">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-2 text-4xl font-bold text-neutral-900">Unsplash Mock</h1>
        <p class="text-neutral-500">搜索并发现高质量免费图片</p>
      </div>

      <!-- Tabs -->
      <Tabs v-model="activeTab" class="mb-8">
        <TabsList class="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="photos" class="gap-2">
            <span>🖼️</span>
            <span>图片</span>
          </TabsTrigger>
          <TabsTrigger value="mock" class="gap-2">
            <span>📝</span>
            <span>Mock</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <!-- Photos Tab Content -->
      <div v-if="activeTab === 'photos'">
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
            <div class="flex items-center gap-3">
              <Badge variant="secondary" class="text-sm">
                找到 {{ data.results.length }} 张图片,共 {{ data.total }} 张
              </Badge>
              <Select v-model="perPage">
                <SelectTrigger class="h-8 w-24 text-xs">
                  <SelectValue placeholder="每页" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="n in perPageOptions" :key="n" :value="n">
                    {{ n }} 条/页
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
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

      <!-- Mock Tab Content -->
      <div v-else-if="activeTab === 'mock'">
        <MockGenerator :urls="urls" />
      </div>
    </div>
  </div>
</template>
