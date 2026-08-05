// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type {
  DataSourceFactoryInitializeArgs,
  IDataSourceFactory,
} from '@catrobotics/studio-base/context/PlayerSelectionContext'

import type { Player } from '@catrobotics/studio-base/players/types'
import { defaultBranding, useBranding } from '@catrobotics/studio-base/context/BrandingContext'
import { IterablePlayer, WorkerIterableSource } from '@catrobotics/studio-base/players/IterablePlayer'
import { getFileExtension } from '@catrobotics/studio-base/util/getFileExtension'
import { Link } from '@mui/material'

function RemoteFileWarning(): React.JSX.Element {
  const { productName = defaultBranding.productName } = useBranding()

  return (
    <>
      Loading large files over HTTP can be slow. For better performance, we recommend
      {' '}
      <Link href="https://catrotics.com" target="_blank">
        {productName}
        {' Data Platform'}
      </Link>
      .
    </>
  )
}

const initWorkers: Record<string, () => Worker> = {
  '.bag': () => {
    return new Worker(
      new URL('../players/IterablePlayer/BagIterableSourceWorker.worker.ts', import.meta.url),
      { type: 'module' },
    )
  },
  '.mcap': () => {
    return new Worker(
      new URL('../players/IterablePlayer/Mcap/McapIterableSourceWorker.worker.ts', import.meta.url),
      { type: 'module' },
    )
  },
}

class RemoteDataSourceFactory implements IDataSourceFactory {
  public id = 'remote-file'

  // The remote file feature use to be handled by two separate factories with these IDs.
  // We consolidated this into one factory that appears in the "connection" list and has a `url` field.
  //
  // Preserve the previous deep-link IDs as aliases at this input boundary.
  public legacyIds = ['mcap-remote-file', 'ros1-remote-bagfile']

  public type: IDataSourceFactory['type'] = 'connection'
  public displayName = 'Remote file'
  public iconName: IDataSourceFactory['iconName'] = 'FileASPX'
  public supportedFileTypes = ['.bag', '.mcap']
  public description = 'Open pre-recorded .bag or .mcap files from a remote location.'
  public docsLinks = [
    {
      label: 'ROS 1',
      url: 'https://catrotics.com',
    },
    {
      label: 'MCAP',
      url: 'https://catrotics.com',
    },
  ]

  public formConfig = {
    fields: [
      {
        id: 'url',
        label: 'Remote file URL',
        placeholder: 'https://example.com/file.bag',
        validate: (newValue: string): Error | undefined => {
          return this.#validateUrl(newValue)
        },
      },
    ],
  }

  public warning = <RemoteFileWarning />

  public initialize(args: DataSourceFactoryInitializeArgs): Player | undefined {
    const url = args.params?.url
    if (!url) {
      throw new Error('Missing url argument')
    }

    const extension = getFileExtension(new URL(url).pathname)
    const initWorker = initWorkers[extension]
    if (!initWorker) {
      throw new Error(`Unsupported extension: ${extension}`)
    }

    const source = new WorkerIterableSource({ initWorker, initArgs: { url } })

    return new IterablePlayer({
      source,
      name: url,
      metricsCollector: args.metricsCollector,
      // Use blank url params so the data source is set in the url
      urlParams: { url },
      sourceId: this.id,
    })
  }

  #validateUrl(newValue: string): Error | undefined {
    try {
      const url = new URL(newValue)
      const extension = getFileExtension(url.pathname)

      if (extension.length === 0) {
        return new Error('URL must end with a filename and extension')
      }

      if (!this.supportedFileTypes.includes(extension)) {
        const supportedExtensions = new Intl.ListFormat('en-US', { style: 'long' }).format(
          this.supportedFileTypes,
        )
        return new Error(`Only ${supportedExtensions} files are supported.`)
      }

      return undefined
    }
    catch {
      return new Error('Enter a valid url')
    }
  }
}

export default RemoteDataSourceFactory
