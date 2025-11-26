# uniapp-preset

uniapp 的预设项目，在 `dcloudio/uni-preset-vue#vite-ts` 的基础上添加了一些开箱即用的功能。

- UnoCSS：

## 使用方法

创建项目的方式和 `uniapp` 命令行创建 `vue3` 项目的方式一样。推荐使用 `pnpm`。

```bash
pnpx degit hayden-fr/uniapp-preset project_name
```

更新项目的方式是使用 `degit` 重新拉取模板。
拉取模板后，线上代码会覆盖本地代码，需要利用 `git` 的比较功能来进行代码合并。
所以在拉取模板前，请确保当前项目所有修改已经提交。

```bash
cd project_name
pnpx degit hayden-fr/uniapp-preset --force
```
