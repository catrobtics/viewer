/** @vitest-environment jsdom */
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { BrandMark } from '@catrobotics/studio-base/components/BrandMark'
import {
  BrandingProvider,
  defaultBranding,
} from '@catrobotics/studio-base/context/BrandingContext'
import ThemeProvider from '@catrobotics/studio-base/theme/ThemeProvider'
import { render } from '@testing-library/react'

describe('<BrandMark />', () => {
  it('uses the CatRobotics website by default', () => {
    expect(defaultBranding.websiteUrl).toBe('https://catrotics.com')
  })

  it('uses the CatRobotics identity by default', () => {
    const root = render(
      <ThemeProvider isDark>
        <BrandingProvider>
          <BrandMark variant="wordmark" />
        </BrandingProvider>
      </ThemeProvider>,
    )

    expect(root.getByText('CatRobotics | Viewer')).toBeDefined()
    const mark = root.getByLabelText('CatRobotics')
    expect(mark).toBeDefined()
    expect(mark.querySelector('svg')?.getAttribute('fill')).toBe('currentColor')
  })

  it('renders a configured logo element', () => {
    const root = render(
      <ThemeProvider isDark>
        <BrandingProvider
          branding={{
            logo: <svg data-testid="acme-logo" viewBox="0 0 10 10" />,
            logoAlt: 'Acme Robotics',
          }}
        >
          <BrandMark />
        </BrandingProvider>
      </ThemeProvider>,
    )

    expect(root.getByLabelText('Acme Robotics')).toBeDefined()
    expect(root.getByTestId('acme-logo')).toBeDefined()
  })

  it('builds a wordmark from the configured logo and product name', () => {
    const root = render(
      <ThemeProvider isDark>
        <BrandingProvider
          branding={{ logo: <span data-testid="custom-logo">A</span>, productName: 'Acme Studio' }}
        >
          <BrandMark variant="wordmark" />
        </BrandingProvider>
      </ThemeProvider>,
    )

    expect(root.getByTestId('custom-logo')).toBeDefined()
    expect(root.getByText('Acme Studio')).toBeDefined()
  })
})
