# @catrobtics/viewer

[![npm version](https://img.shields.io/npm/v/%40catrobtics%2Fviewer?logo=npm)](https://www.npmjs.com/package/@catrobtics/viewer)
[![CI](https://github.com/catrobtics/viewer/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/catrobtics/viewer/actions/workflows/ci.yml)
[![License](https://img.shields.io/npm/l/%40catrobtics%2Fviewer)](LICENSE)

The complete [CatRobotics Viewer](https://github.com/catrobtics/viewer) as an embeddable React component. The package includes the full robotics visualization workspace, built-in panels, local and live data sources, workers, codecs, WebAssembly, and styles.

中文说明见[下方](#中文)。

## Install

```sh
pnpm add @catrobtics/viewer react react-dom
# or: npm install @catrobtics/viewer react react-dom
```

The package is ESM-only. Import its stylesheet once in your browser application.

## React

```tsx
import { Viewer } from '@catrobtics/viewer'
import '@catrobtics/viewer/style.css'

export function RoboticsWorkspace() {
  return (
    <div style={{ height: '100vh', minHeight: 0 }}>
      <Viewer
        branding={{ productName: 'My Robotics Viewer' }}
        onReady={() => console.log('Viewer ready')}
      />
    </div>
  )
}
```

The parent element must have an explicit height. `Viewer` fills the parent with `width: 100%` and `height: 100%`.

## React DOM

Use `mountViewer()` when the host is not itself a React application:

```ts
import { mountViewer } from '@catrobtics/viewer'
import '@catrobtics/viewer/style.css'

const target = document.getElementById('viewer')
if (target == null) {
  throw new Error('Missing #viewer')
}

const mounted = mountViewer(target, {
  branding: { productName: 'Robot Operations' },
  loadingFallback: 'Loading Viewer…',
})

// Replace the complete props object later:
mounted.render({ branding: { productName: 'Robot Operations' } })

// Release React roots and listeners when the host view is removed:
mounted.unmount()
```

`mountViewer()` uses `React.StrictMode` by default. Pass `{ strictMode: false }` as its third argument only when integrating with code that cannot tolerate Strict Mode development checks.

## Full-page mode

Embedding defaults avoid changing the host page's global state. A dedicated full-page application can opt into the same behavior as the hosted Viewer:

```ts
mountViewer(document.getElementById('viewer')!, {
  deepLinks: [window.location.href],
  enableGlobalCss: true,
  enableLaunchPreferenceScreen: true,
  installDevtoolsFormatters: true,
  manageContextMenu: true,
  manageDocumentTitle: true,
  patchFetchErrors: true,
  syncUrl: true,
})
```

The opt-in flags named `manage*`, `patch*`, and `enableGlobalCss` affect document- or browser-global behavior. Leave them disabled when the Viewer shares a page with another application.

## Branding

Use `defineBranding()` for autocomplete while preserving literal types:

```tsx
import { defineBranding, Viewer } from '@catrobtics/viewer'

const branding = defineBranding({
  productName: 'Acme Robotics',
  websiteUrl: 'https://example.com',
  theme: {
    dark: {
      accent: '#54d2b0',
      appBarBackground: '#111827',
    },
    light: {
      accent: '#087f6b',
      appBarBackground: '#f8fafc',
    },
  },
})

export function App() {
  return <Viewer branding={branding} />
}
```

Branding accepts product text, links, React logos/wordmarks, app-bar slots, and light/dark theme tokens.

## Important props

| Prop | Embedded default | Purpose |
| --- | --- | --- |
| `persistLayout` | `true` | Saves the active layout to local storage. Disable or isolate origins for multiple independent Viewers. |
| `syncUrl` | `false` | Synchronizes data-source and playback state with the host URL. |
| `manageDocumentTitle` | `false` | Allows Viewer state to update `document.title`. |
| `manageContextMenu` | `false` | Suppresses the page context menu outside text inputs. |
| `enableGlobalCss` | `false` | Adds Viewer styles for `html`, `body`, and `#root`. |
| `enableLaunchPreferenceScreen` | `false` | Enables the first-run web/desktop choice screen. |
| `patchFetchErrors` | `false` | Wraps the global `fetch` function with clearer network errors. |
| `showCompatibilityBanner` | `true` | Shows the built-in browser compatibility warning. |
| `loadingFallback` / `errorFallback` | empty / message | Controls initialization UI. |
| `onReady` | — | Runs after i18n/fonts initialize and the complete Viewer tree mounts. |

See the bundled TypeScript declarations for the complete `ViewerProps`, `ViewerBranding`, `MountedViewer`, and theme contracts.

## Compatibility

- Browser-only; server-rendered frameworks should load the component on the client.
- Chrome 120+ is the supported runtime. The Viewer requires `BigInt64Array`, `BigUint64Array`, Web Workers, and `HTMLCanvasElement.transferControlToOffscreen()`.
- React and React DOM are peer dependencies and are not duplicated in the bundle.
- Modern ESM-aware bundlers such as Vite, webpack, Rspack, Rollup, and esbuild are expected. Your deployment must serve JavaScript workers and WebAssembly with normal same-origin/CORS access.
- Import `@catrobtics/viewer/style.css` exactly once.

## Versioning and support

The package follows Semantic Versioning independently from the hosted Viewer. Before `1.0.0`, minor releases may include breaking changes. Stable versions are published to npm `latest` from GitHub Releases tagged `viewer-vX.Y.Z`.

Report defects and integration requests in the [GitHub issue tracker](https://github.com/catrobtics/viewer/issues).

## License

Licensed under the [Mozilla Public License 2.0](LICENSE). See [NOTICE](NOTICE) for Foxglove Studio, Webviz, and third-party attribution.

## 中文

`@catrobtics/viewer` 是可嵌入 React 应用的完整 CatRobotics Viewer，包含内置面板、本地/实时数据源、Worker、编解码器、WebAssembly 与样式，不只是类型定义。

安装后，在应用中导入一次样式：

```sh
pnpm add @catrobtics/viewer react react-dom
```

```tsx
import { Viewer } from '@catrobtics/viewer'
import '@catrobtics/viewer/style.css'

export function App() {
  return (
    <div style={{ height: '100vh', minHeight: 0 }}>
      <Viewer branding={{ productName: '机器人数据中心' }} />
    </div>
  )
}
```

非 React 宿主可调用 `mountViewer(element, props)`，返回值提供 `render(nextProps)` 和 `unmount()`。嵌入模式默认不会修改宿主 URL、标题、右键菜单或全局 CSS；只有全屏独立应用才建议开启上方“Full-page mode”示例中的全局选项。当前支持 Chrome 120+，并要求父容器具有明确高度。
