// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import type {
  DataSourceFactoryInitializeArgs,
  IDataSourceFactory,
} from '@catrobotics/studio-base/context/PlayerSelectionContext'
import type { Player } from '@catrobotics/studio-base/players/types'
import { McapIterableSource } from '@catrobotics/studio-base/players/IterablePlayer/Mcap/McapIterableSource'

import { BenchmarkPlayer } from '../players'

class McapLocalBenchmarkDataSourceFactory implements IDataSourceFactory {
  public id = 'mcap-local-file'
  public type: IDataSourceFactory['type'] = 'file'
  public displayName = 'MCAP'
  public iconName: IDataSourceFactory['iconName'] = 'OpenFile'
  public supportedFileTypes = ['.mcap']

  public initialize(args: DataSourceFactoryInitializeArgs): Player | undefined {
    const file = args.file
    if (!file) {
      return
    }

    const mcapProvider = new McapIterableSource({ type: 'file', file })
    return new BenchmarkPlayer(file.name, mcapProvider)
  }
}

export { McapLocalBenchmarkDataSourceFactory }
