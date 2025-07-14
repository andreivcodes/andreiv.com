// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypePrismPlus from 'rehype-prism-plus';
import rehypeKatex from 'rehype-katex';
import rehypeMermaid from 'rehype-mermaid';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  
  markdown: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      [rehypePrismPlus, { 
        theme: 'github-dark',
        ignoreMissing: true 
      }],
      rehypeKatex,
      [rehypeMermaid, {
        strategy: 'pre-mermaid'
      }]
    ],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src'
      }
    }
  },
  
  output: 'static'
});