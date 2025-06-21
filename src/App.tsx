import { NoteInput } from './components/NoteInput';
import { GraphBoard } from './components/GraphBoard';
import { Legend } from './components/Legend';

function App() {
  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header - Apple-style minimal */}
      <header className="bg-surface shadow-subtle" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 bg-action rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🧠</span>
                </div>
              </div>
              <div>
                <h1 className="text-title-2 font-semibold text-text-primary">
                  Diagnosis-Space
                </h1>
                <p className="text-caption text-text-secondary">
                  Clinical Reasoning Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface rounded-2xl shadow-subtle">
                <div className="w-2 h-2 bg-differential rounded-full"></div>
                <span className="text-differential text-caption font-medium">AI Ready</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex min-h-[calc(100vh-73px)]">
        {/* Left Sidebar - Legend */}
        <aside className="w-60 bg-surface/95 backdrop-blur-sm shadow-elevation flex-shrink-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          <div className="h-full overflow-y-auto p-6">
            <Legend />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Input Section */}
          <div className="bg-surface shadow-subtle" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
            <div className="p-6">
              <NoteInput />
            </div>
          </div>

          {/* Graph Visualization */}
          <div className="flex-1 relative bg-surface">
            <div className="absolute inset-0">
              <GraphBoard />
            </div>
            
            {/* Floating Performance Indicator */}
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-surface/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-elevation hover:shadow-elevation-hover transform hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-action rounded-full animate-pulse"></div>
                  <span className="text-text-primary text-caption font-medium">Live Analysis</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-surface shadow-subtle" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
        <div className="max-w-full mx-auto px-6 py-3">
          <div className="flex items-center justify-end text-text-secondary">
            <div className="text-xs">
              <span className="text-action font-semibold">
                ⚠️ Research & Education Only
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;