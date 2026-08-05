// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type {
  DataSourceFactoryInitializeArgs,
  IDataSourceFactory,
} from '@catrobotics/studio-base/context/PlayerSelectionContext'
import type { Player } from '@catrobotics/studio-base/players/types'
import { IterablePlayer, WorkerIterableSource } from '@catrobotics/studio-base/players/IterablePlayer'

class Ros2LocalBagDataSourceFactory implements IDataSourceFactory {
  public id = 'ros2-local-bagfile'
  public type: IDataSourceFactory['type'] = 'file'
  public displayName = 'ROS 2 Bag'
  public iconName: IDataSourceFactory['iconName'] = 'OpenFile'
  public supportedFileTypes = ['.db3']
  public supportsMultiFile = true

  public initialize(args: DataSourceFactoryInitializeArgs): Player | undefined {
    const files = args.file ? [args.file] : args.files
    const name = args.file ? args.file.name : args.files?.map(file => file.name).join(', ')

    if (!files) {
      return
    }

    const source = new WorkerIterableSource({
      initWorker: () => {
        return new Worker(
          new URL(
            '../players/IterablePlayer/rosdb3/RosDb3IterableSourceWorker.worker.ts',
            import.meta.url,
          ),
          { type: 'module' },
        )
      },
      initArgs: { files },
    })

    return new IterablePlayer({
      metricsCollector: args.metricsCollector,
      source,
      name,
      sourceId: this.id,
    })
  }
}

export default Ros2LocalBagDataSourceFactory
