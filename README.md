# uniapp-preset

uniapp 的预设项目，在 `dcloudio/uni-preset-vue#vite-ts` 的基础上添加了一些开箱即用的功能。

## 使用方法

### 使用degit拉取项目

```bash
npx degit hayden-fr/uniapp-preset project_name
```

### 使用项目安装命令（推荐）

创建项目，`project_name` 为必填项，使用 `.` 表示在当前目录创建

```bash
curl https://raw.githubusercontent.com/hayden-fr/uniapp-preset/main/.bin/cli.js | node - create project_name
```

更新项目，可以在 `update` 参数后添加 `project_name` 指定项目目录，默认为当前目录

```bash
curl https://raw.githubusercontent.com/hayden-fr/uniapp-preset/main/.bin/cli.js | node - update
```
