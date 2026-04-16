<script setup lang="ts">
const keyword = ref('mountain')
import { type UnsplashSearchResponse } from "~~/server/utils/types"

const { data, pending, error, execute } = await useFetch<UnsplashSearchResponse>('/api/search-photos', {
  query: {
    query: keyword,
    per_page: 10,
    orientation: 'landscape'
  },
  immediate: true
})

const search = () => {
  execute()
}
</script>

<template>
  <div>
    <input v-model="keyword" @keyup.enter="search" placeholder="输入搜索词..." />
    <button @click="search" :disabled="pending">搜索</button>

    <div v-if="pending">加载中...</div>
    <div v-else-if="error">获取失败: {{ error.message }}</div>

    <div v-else-if="data?.results">
      <div v-for="photo in data.results" :key="photo.id">
        <img :src="photo.urls.small" :alt="photo.description || 'unsplash photo'" />
      </div>
      <h1>图像url集合:</h1>
      <div v-for="photo in data.results" :key="photo.id">
        {{ photo.urls.small }}
      </div>
      <div v-if="data.results.length === 0">没有找到相关照片</div>
    </div>
  </div>
</template>