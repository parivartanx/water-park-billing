import Versions from './components/Versions'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <header>
        <h1 className="bg-purple-400"> sdfsfds</h1>
        <h1 className="text-2xl font-bold text-white hover:text-gray-300">
          Electron + React + TypeScript
        </h1>
      </header>
      <main>
        <button onClick={ipcHandle}>Ping</button>
        <Versions />
      </main>
    </>
  )
}

export default App
