
import React, { useState, useEffect } from 'react';

const AGENT_MESSAGES = [
  "Room Analyzer: Identifying space layout and light sources...",
  "Strategy Agent: Researching buyer demographics for this property...",
  "Buyer Persona Expert: Curating furniture selection for your target audience...",
  "Style Specialist: Applying aesthetic finishes and textures...",
  "Visual Enhancement: Optimizing lighting and shadows for photorealism...",
  "Quality Control: Final verification of architectural integrity..."
];

const ProcessingState: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % AGENT_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-12">
        <div className="w-32 h-32 border-8 border-blue-100 rounded-full border-t-blue-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fas fa-couch text-blue-600 text-3xl"></i>
        </div>
      </div>
      <h2 className="text-3xl font-bold mb-4">Staging Your Space...</h2>
      <p className="text-xl text-gray-500 max-w-lg mb-8 h-12">
        {AGENT_MESSAGES[messageIndex]}
      </p>
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-75"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-300"></div>
      </div>
      <p className="mt-12 text-sm text-gray-400 italic">
        "Visualization removes uncertainty—uncertainty kills decisions."
      </p>
    </div>
  );
};

export default ProcessingState;
