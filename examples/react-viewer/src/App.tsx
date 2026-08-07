import { Viewer } from '@catrobtics/viewer'
import '@catrobtics/viewer/style.css'
import './App.css'

function App() {
  return (
    <main className="viewer-shell">
      <Viewer
        branding={{ productName: 'CatRobotics Viewer Example' }}
        loadingFallback={<div className="viewer-status">Loading Viewer…</div>}
        errorFallback={error => (
          <div className="viewer-status viewer-status--error" role="alert">
            Viewer failed to initialize:
            {' '}
            {error.message}
          </div>
        )}
        onReady={() => console.info('CatRobotics Viewer is ready')}
      />
    </main>
  )
}

export default App
