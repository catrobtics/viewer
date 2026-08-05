// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type { ThemeConfig } from '@catrobotics/theme'
import type { ReactNode } from 'react'
import { CatRoboticsLogo } from '@catrobotics/studio-base/components/CatRoboticsLogo'
import { createContext, useContext, useMemo } from 'react'

export interface BrandingConfig {
  /** Accessible label used for custom image marks. */
  logoAlt?: string
  /** A React element used as the compact application mark. */
  logo?: ReactNode
  /** Product name used in labels and the About screen. */
  productName?: string
  /** Product website used for built-in product and support links. */
  websiteUrl?: string
  /** Theme tokens and optional advanced MUI overrides. */
  theme?: ThemeConfig
  /** A React element used for the full-width product wordmark. */
  wordmark?: ReactNode
  appBar?: {
    /** Content rendered next to the application menu, before panel actions. */
    afterMenu?: ReactNode
    /** Content rendered before the built-in right-side actions. */
    beforeActions?: ReactNode
    /** Replaces the built-in data source control when provided. */
    centerContent?: ReactNode
    /** Optional compact mark used only on the application bar. */
    logo?: ReactNode
    showMenuChevron?: boolean
    showProductName?: boolean
  }
}

export const CATROBOTICS_PINK = '#FB7299'

export const defaultBranding: BrandingConfig
  & Required<Pick<BrandingConfig, 'logoAlt' | 'productName'>> = {
    logoAlt: 'CatRobotics',
    logo: <CatRoboticsLogo />,
    productName: 'CatRobotics | Viewer',
    websiteUrl: 'https://catrotics.com',
    appBar: {
      logo: <CatRoboticsLogo />,
      showProductName: false,
    },
    theme: {
      dark: {
        accent: CATROBOTICS_PINK,
        appBarAccent: CATROBOTICS_PINK,
        appBarBackground: '#35363A',
        appBarForeground: '#FFFFFF',
      },
      light: {
        accent: CATROBOTICS_PINK,
        appBarAccent: CATROBOTICS_PINK,
        appBarBackground: '#35363A',
        appBarForeground: '#FFFFFF',
      },
    },
  }

const BrandingContext = createContext<BrandingConfig>(defaultBranding)
BrandingContext.displayName = 'BrandingContext'

export function BrandingProvider({
  branding,
  children,
}: React.PropsWithChildren<{ branding?: BrandingConfig }>): React.JSX.Element {
  const value = useMemo<BrandingConfig>(() => {
    const merged: BrandingConfig = {
      ...defaultBranding,
      ...branding,
      appBar: {
        ...defaultBranding.appBar,
        ...branding?.appBar,
      },
      theme: {
        ...defaultBranding.theme,
        ...branding?.theme,
        dark: {
          ...defaultBranding.theme?.dark,
          ...branding?.theme?.dark,
        },
        light: {
          ...defaultBranding.theme?.light,
          ...branding?.theme?.light,
        },
        muiThemeOptions: {
          ...defaultBranding.theme?.muiThemeOptions,
          ...branding?.theme?.muiThemeOptions,
        },
      },
    }

    return merged
  }, [branding])

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
}

export function useBranding(): BrandingConfig {
  return useContext(BrandingContext)
}
