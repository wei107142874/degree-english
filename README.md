# 学位英语备考助手

面向四川师范大学学位英语考试的 Web 备考应用：背单词、语法、专项练习、模拟考试、错题本和学习计划。

## 运行

```bash
npm install
npm run build
npm run serve
```

访问：

- 电脑：`http://localhost:4173`
- 手机：打开服务启动时打印的局域网地址，例如 `http://192.168.1.5:4173`

开发时另开一个终端：

```bash
npm run serve
npm run dev
```

Vite dev server 会把 `/api` 代理到 `http://localhost:4173`。

## 数据存储

学习数据不再存浏览器本地，也不支持离线使用。所有学习记录都通过服务端 API 写入 PostgreSQL。

首次启动时，如果 PostgreSQL 为空，服务端会优先从 `data/degree-english.sqlite` 迁移，兜底从旧的 `data/sync-data.json` 迁移。

Docker 部署时仍保留 `data` 挂载，作为旧数据迁移和备份目录：

```yaml
volumes:
  - /home/admin/syncthing-data:/app/data
```

## 技术栈

Vite 8 · React 19 · TypeScript · Tailwind CSS v4 · Zustand · Node `server.mjs` · PostgreSQL

## 测试

```bash
npm test
npm run build
```
