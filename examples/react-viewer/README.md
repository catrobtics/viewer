# `@catrobtics/viewer` React example

由 Vite 官方 `react-ts` 模板创建的最小 React 接入示例。它直接安装 npm 上发布的 `@catrobtics/viewer@0.1.0`，不会引用 monorepo 内部源码，因此也可以作为真实消费项目的冒烟测试。

## 运行

需要 Node.js 22.12+、pnpm 10，以及 Chrome 120+。

```sh
cd examples/react-viewer
pnpm install --ignore-workspace --frozen-lockfile
pnpm dev
```

打开终端输出的本地地址即可。Viewer 会填满浏览器窗口。

## 生产构建

```sh
pnpm build
pnpm preview
```

## 核心接入代码

```tsx
import { Viewer } from '@catrobtics/viewer'
import '@catrobtics/viewer/style.css'

export default function App() {
  return (
    <main style={{ width: '100%', height: '100%', minHeight: 0 }}>
      <Viewer branding={{ productName: 'My Robotics Viewer' }} />
    </main>
  )
}
```

宿主容器必须有明确高度。`@catrobtics/viewer` 是浏览器端 ESM 包，React 和 React DOM 由宿主应用提供。
