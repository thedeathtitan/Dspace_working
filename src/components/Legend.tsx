export function Legend() {
  const legendItems = [
    {
      icon: '🩺',
      label: 'Primary Diagnosis',
      color: 'diagnosis'
    },
    {
      icon: '🤔',
      label: 'Differential Diagnosis',
      color: 'differential'
    },
    {
      icon: '🚨',
      label: 'Urgent Action',
      color: 'action'
    },
    {
      icon: '⚡',
      label: 'High Priority Action',
      color: 'action'
    },
    {
      icon: '📋',
      label: 'Standard Action',
      color: 'completed'
    }
  ];


  return (
    <div className="space-y-6">
      {/* Main Legend Card */}
      <div className="bg-surface rounded-2xl p-6 shadow-elevation hover:shadow-elevation-hover transform hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 bg-action rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">🧾</span>
          </div>
          <h3 className="text-title-2 font-semibold text-text-primary">
            Clinical Workflow Guide
          </h3>
        </div>
        
        {/* Node Types */}
        <div className="space-y-3 mb-6">
          <h4 className="text-caption font-medium text-text-secondary flex items-center gap-2">
            <span className="w-2 h-2 bg-action rounded-full"></span>
            Node Classifications
          </h4>
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-bg-base shadow-subtle hover:shadow-elevation transform hover:-translate-y-0.5 transition-all duration-300">
              <div className={`bg-${item.color} text-white rounded p-2 flex items-center justify-center`}>
                <span className="text-sm">{item.icon}</span>
              </div>
              <div className="font-medium text-body text-text-primary">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        
      </div>

    </div>
  );
}