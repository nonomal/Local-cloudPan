<template>
  <el-card class="container">
    <div class="md-wrapper" ref="mdWrapper"></div>
  </el-card>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import request from '@/utils/request';

  import MarkdownIt from 'markdown-it';
  import { full as emoji } from 'markdown-it-emoji';
  import Mark from 'markdown-it-mark';
  import hljs from 'highlight.js';
  import 'highlight.js/styles/github.min.css';

  const mdWrapper = ref<HTMLElement>(null);
  const md = MarkdownIt({
    html: true, //可以识别html
    linkify: true, //自动检测像链接的文本
    typographer: true, //优化排版，标点
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return (
            '<pre><code class="hljs">' +
            hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
            '</code></pre>'
          );
        } catch (__) {}
      }
      return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
    },
  });
  md.use(emoji).use(Mark);
  const initRender = async () => {
    const res = await request.get(
      'http://127.0.0.1:9527/WYC/%E5%89%8D%E7%AB%AF%E5%AD%A6%E4%B9%A0/vue.md'
    );
    mdWrapper.value.innerHTML = md.render(res);
  };

  onMounted(() => {
    initRender();
  });
</script>

<style scoped lang="scss">
  .container {
    border-radius: 10px;
    max-width: calc(100% - 5px);
    min-width: 700px;
    max-height: calc(100vh - var(--ep-menu-horizontal-height) - 160px);
    border: 1px solid black;
    overflow-y: auto;
    text-align: initial;
  }
  .md-wrapper {
    max-width: 860px;
    margin: 0 auto;
    padding: 20px 30px 100px;
    font-size: 15px;
  }
  :deep() {
    h1 {
      padding-bottom: 0.4rem;
      font-size: 2.2rem;
      line-height: 1.3;
    }
    h2 {
      font-size: 1.75rem;
      line-height: 1.225;
      margin: 35px 0 15px;
      padding-bottom: 0.5em;
      border-bottom: 1px solid #ddd;
    }
    h3 {
      font-size: 1.4rem;
      line-height: 1.43;
      margin: 20px 0 7px;
    }
    h4 {
      font-size: 1.2rem;
    }
    h5 {
      font-size: 1rem;
    }
    h6 {
      font-size: 1rem;
      color: #777;
    }
    p {
      line-height: 1.6rem;
      word-spacing: 0.05rem;
    }
    pre .hljs {
      border-radius: 10px;
      background: #eceaea;
    }
    ol li {
      padding-left: 0.5rem;
    }
    ul,
    ol {
      padding-left: 30px;
    }
    p,
    blockquote,
    ul,
    ol,
    dl,
    table {
      margin: 0.8em 0;
    }

    li > ol,
    li > ul {
      margin: 0 0;
    }

    hr {
      height: 2px;
      padding: 0;
      margin: 16px 0;
      background-color: #e7e7e7;
      border: 0 none;
      overflow: hidden;
      box-sizing: content-box;
    }
    blockquote {
      border-left: 4px solid #42b983;
      padding: 10px 15px;
      color: #777;
      background-color: rgba(66, 185, 131, 0.1);
    }
    thead {
      background-color: #fafafa;
    }
    mark {
      background-color: #81a781;
      border-radius: 2px;
      padding: 2px 4px;
      margin: 0 2px;
      color: #222;
      font-weight: 500;
    }
    table {
      padding: 0;
      word-break: initial;
      tr {
        border-top: 1px solid #dfe2e5;
        margin: 0;
        padding: 0;
        &:nth-child(2n) {
          background-color: #fafafa;
        }
        th {
          font-weight: bold;
          border: 1px solid #dfe2e5;
          border-bottom: 0;
          text-align: left;
          margin: 0;
          padding: 6px 13px;
        }
        td {
          border: 1px solid #dfe2e5;
          text-align: left;
          margin: 0;
          padding: 6px 13px;
        }
      }
    }
  }
</style>
