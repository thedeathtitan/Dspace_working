import React from 'react';

// Main App component
function App() {
  return (
    // Centering container for the demonstration
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-2xl">
        {/* Example 1: Subtle Elevated Card */}
        <ModernBorderCard title="Elevated Card Example" className="mb-8">
          <p className="text-gray-700 leading-relaxed">
            This card demonstrates a modern, subtle 3D effect achieved through multi-layered box shadows and rounded corners, inspired by Google's design language. It gives a sense of elevation without being overly pronounced.
          </p>
          <button className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">
            Learn More
          </button>
        </ModernBorderCard>

        {/* Example 2: Interactive Elevated Card */}
        <ModernBorderCard title="Interactive Hover Effect" className="mb-8 group">
          <p className="text-gray-700 leading-relaxed">
            This component also features an interactive hover effect, subtly increasing the shadow to indicate interactivity and drawing the user's attention.
          </p>
          <div className="flex justify-end mt-4">
            <button className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md group-hover:shadow-lg hover:bg-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75">
              Interact
            </button>
          </div>
        </ModernBorderCard>

        {/* Example 3: Different color theme */}
        <ModernBorderCard title="Alternative Theme" bgColor="bg-gradient-to-br from-indigo-100 to-purple-100" textColor="text-indigo-800">
          <p className="leading-relaxed">
            You can easily customize the background and text colors to fit your application's theme while retaining the border effect.
          </p>
          <div className="flex justify-center mt-4">
            <button className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75">
              Customize
            </button>
          </div>
        </ModernBorderCard>
      </div>
    </div>
  );
}

// ModernBorderCard Component
// This component applies the 3D-like border effect
function ModernBorderCard({ children, title, className = '', bgColor = 'bg-white', textColor = 'text-gray-900' }) {
  return (
    <div
      className={`
        ${bgColor} ${textColor}
        p-6 sm:p-8
        rounded-2xl
        shadow-lg
        hover:shadow-xl
        transform hover:-translate-y-1
        transition-all duration-300 ease-in-out
        border border-gray-100
        ${className}
      `}
      style={{
        // Custom box-shadow for a deeper 3D effect, mimicking elevation
        // This combines a typical shadow with a more spread-out, lighter one for depth
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05)'
      }}
    >
      {title && (
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 pb-2 border-b border-gray-200 text-gray-800">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

export default App;