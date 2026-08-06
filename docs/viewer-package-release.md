# `@catrobtics/viewer` 发布指南

本文面向 `catrobtics/viewer` 仓库维护者。npm scope 与 GitHub organization 都是 `catrobtics`，完整包名为 `@catrobtics/viewer`。稳定版本只由正式 GitHub Release 触发，标签必须是 `viewer-vX.Y.Z`，例如 `viewer-v0.1.0`。

发布工作流位于 [`.github/workflows/release.yml`](../.github/workflows/release.yml)。它会校验标签，把 `packages/viewer/package.json` 临时改成精确版本，重新下载 Git LFS 资源、构建并检查 tarball，然后执行：

```sh
npm publish --access public --provenance
```

## 一次性准备

### 1. npm organization 与发布账号

1. 确认 npm organization `catrobtics` 已创建。
2. 确认发布账号是 organization 成员，并有权创建和发布 `@catrobtics/viewer`。
3. 为账号启用双因素认证。npm 版本发布后不能覆盖或复用。
4. 用 `npm view @catrobtics/viewer` 确认包当前状态；首发前返回 `E404` 是正常结果。

### 2. GitHub Environment

在 GitHub 仓库的 **Settings → Environments** 创建名为 `npm` 的 Environment：

1. 按团队策略添加 required reviewers。
2. 将 deployment branches/tags 限制为允许 `viewer-v*` 发布标签。
3. 首发 Token 只放在此 Environment，不保存为仓库级长期 Secret。

发布标签必须指向已包含 `release.yml`、包源码和 Git LFS 对象的提交。

## 首次发布 `0.1.0`

npm 只有在包创建后才能为它配置 Trusted Publisher，因此首发需使用一个短期 granular access token：

1. 在 npm 创建 granular token，过期时间设为完成首发所需的最短期限。
2. 将权限限制到 `catrobtics` organization 的包创建/发布；若自动发布需要绕过 2FA，只对这个短期 Token 开启。
3. 在 GitHub `npm` Environment 新增 Secret `NPM_TOKEN`。
4. 确认 `main` 的 CI 通过。
5. 创建正式 GitHub Release，标签和标题使用 `viewer-v0.1.0`，不要勾选 prerelease。
6. 等待 **Publish Viewer package** workflow 成功。

发布完成后检查：

- `npm view @catrobtics/viewer version` 返回 `0.1.0`；
- `latest` dist-tag 指向 `0.1.0`；
- npm 页面正确展示 README、MPL-2.0、仓库链接和 provenance；
- tarball 只包含 `dist/**`、README、LICENSE、NOTICE、package.json；
- 在干净的 React/Vite 项目中可以同时使用 `<Viewer />` 和 `mountViewer()`，并导入 `@catrobtics/viewer/style.css`。

## 首发后切换 OIDC Trusted Publisher

在 npm 的 `@catrobtics/viewer` 包设置中添加 GitHub Actions Trusted Publisher：

| 字段 | 值 |
| --- | --- |
| GitHub owner / organization | `catrobtics` |
| Repository | `viewer` |
| Workflow filename | `release.yml` |
| Environment | `npm` |

随后立即：

1. 从 GitHub `npm` Environment 删除 `NPM_TOKEN`。
2. 在 npm 撤销首发 granular token。
3. 保留工作流的 `id-token: write` 和 `environment: npm`，它们是 OIDC 校验的一部分。

之后的 Release 通过 OIDC 获取短期发布身份，不需要长期 npm 密钥，并自动附带 provenance。

## 后续版本

1. 确认版本不存在，例如 `npm view @catrobtics/viewer versions --json`。
2. 合并发布改动并等待 `main` CI 通过。
3. 创建新的正式 GitHub Release，例如 `viewer-v0.2.0`。
4. 等待发布工作流完成，再核对 npm 版本、`latest` 和 provenance。

仓库源版本保持 `0.1.0-dev`；不要提交正式版本号。Release workflow 会根据标签临时注入版本，且不会把修改推回仓库。

## 保护规则与失败恢复

- 非 `viewer-v` Release 不会执行发布 job。
- `viewer-v` 开头但不符合稳定 SemVer 的标签会在校验步骤失败。
- prerelease Release 会被跳过；目前不发布 nightly、alpha 或 beta dist-tag。
- checkout 会下载 Git LFS；包校验会拒绝任何原始或 base64 内联的 LFS pointer。
- 发布前会查询 npm；已存在的版本会失败，不能覆盖。
- 缺少有效 Token，或 Trusted Publisher 的 owner、仓库、workflow、Environment 任一不匹配时，npm 会拒绝发布。
- 若 job 失败且 npm 上还没有该版本，修复认证、Environment、Git LFS 或临时服务问题后，在 Actions 中选择 **Re-run failed jobs**。
- 若 npm 已显示该版本，则发布已经完成；任何修正都必须使用新的 SemVer 与新 Release 标签。

常规发布与恢复都不应从维护者电脑直接执行 `npm publish`。GitHub Release 路径提供受保护 Environment、OIDC 和 provenance，是唯一正式发布入口。
