# Contributing to CatRobotics

**Supported development environments:** Linux, Windows, macOS

**Dependencies:**

- [Node.js](https://nodejs.org/en/) v22.12+ (Node.js 24 LTS recommended)
- [Git LFS](https://git-lfs.github.com/)

## Getting started

1. Clone repo
1. Run `git lfs pull` to ensure Git LFS objects are up to date
1. Install Node.js, then run `corepack enable` and `pnpm install --frozen-lockfile`
   - If Corepack is unavailable, update or reinstall Node.js before continuing.
1. Launch the development environment:

```sh
# To launch the app:
$ pnpm web:serve

# To launch the storybook:
$ pnpm storybook
```

### Other useful commands

```sh
$ pnpm run          # list available commands
$ pnpm lint         # lint all files
$ pnpm test         # run all tests
$ pnpm test:watch   # run tests on changed files
```

## Localization

At this time, first-class support for CatRobotics is provided in English only. Localization into other languages is available on a best-effort basis, with translations provided by community volunteers. Current community supported-languages are:

- Chinese
- Japanese

Translation support is implemented using [`react-i18next`](https://react.i18next.com).

### Add translations

- We value having _high-quality_ translations over having _all_ translations for a given component or view. Though every PR must have up-to-date English translations, updating other languages is completely optional.
- If you update an English translation and cannot provide updated non-English translations, delete the non-English versions in that PR. Optionally, open follow-up PRs to add accurate non-English translations.

### Add translations to the `i18n` directory

The [`i18n` directory](packages/studio-base/src/i18n) contains translated (localized) strings for all languages supported by CatRobotics.

Translated strings are organized into _namespaces_ — e.g. [`i18n/[language]/appSettings.ts`](packages/studio-base/src/i18n/en/appSettings.ts) contains translations for the app's Settings tab.

### Use `useTranslation()` and `t()` to access translated strings

1. Call the [<code>useTranslation(<i>namespace</i>)</code> hook](https://react.i18next.com/latest/usetranslation-hook) inside a React component to access strings in a given namespace. The hook returns a function called `t`.

2. Call the `t` function to get the translation for a string.

For example:

```ts
const { t } = useTranslation("myComponent");
return <p>{t("hello")}</p>;
```

### Add localization support to a component

1. Move English strings out of the component code, and into the `i18n` folder. Use a new namespace for logical groups of components or app views.

2. Replace strings hard-coded in source code with calls to the `t()` function. Use `camelCase` for new localization keys.

<table><tr><th>Before</th><th>After</th></tr><tr><td>

```ts
function MyComponent() {
  return <p>Hello!</p>;
}
```

</td><td>

```ts
function MyComponent() {
  const { t } = useTranslation("myComponent");
  return <p>{t("hello")}</p>;
}
```

```ts
// i18n/en/myComponent.ts
export const myComponent = {
  hello: "Hello!",
};
```

</td></tr></table>

### Complete example

```ts
// MyComponent.ts

import { useTranslation } from "react-i18next";

function MyComponent(props: Props): JSX.Element {
  const { t } = useTranslation("myComponent");

  return <p>{t("hello")}</p>;
}
```

```ts
// i18n/en/myComponent.ts
export const myComponent = {
  hello: "Hello!",
};

// i18n/en/index.ts
export * from "./myComponent";
```

```ts
// i18n/zh/myComponent.ts
export const myComponent: Partial<TypeOptions["resources"]["myComponent"]> = {
  hello: "你好！",
};

// i18n/zh/index.ts
export * from "./myComponent";
```

Result:

| English         | Chinese         |
| --------------- | --------------- |
| `<p>Hello!</p>` | `<p>你好！</p>` |
