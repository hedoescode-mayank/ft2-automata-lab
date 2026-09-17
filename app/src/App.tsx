import { useStore } from './store/useStore';
import { Dashboard } from './components/ui/Dashboard';
import { Workspace } from './components/ui/Workspace';
import { TutorialAgent } from './components/ui/TutorialAgent';

function App() {
  const { viewMode } = useStore();

  return (
    <div className="w-screen h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden">
      <header className="h-12 border-b border-slate-700 bg-slate-800/90 flex items-center px-6 justify-between shrink-0 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-xs font-black text-slate-900">A</div>
          <h1 className="text-base font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">
            Automata Lab
          </h1>
          <span className="text-xs text-slate-600">FT-2</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-400">
            XP: <span className="text-emerald-400 font-bold">{useStore((s) => s.xp)}</span>
          </span>
        </div>
      </header>

      <main className="flex-1 relative flex overflow-hidden">
        {viewMode === 'map' ? (
          <Dashboard />
        ) : (
          <Workspace />
        )}
      </main>
      
      <TutorialAgent />
    </div>
  );
}

export default App;
