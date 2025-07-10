import React from 'react';
import { Activity } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6" />
          <span className="text-xl font-bold">ProcessOptimizer</span>
        </div>
        <div className="flex space-x-4 items-center">
          <a href="#about" className="hover:text-blue-200 transition-colors duration-200">About</a>
          <a href="#documentation" className="hover:text-blue-200 transition-colors duration-200">Docs</a>
          <a href="#github" className="px-4 py-1.5 bg-white text-blue-700 rounded-md hover:bg-blue-100 transition-colors duration-200 font-medium">GitHub</a>
        </div>
      </div>
    </nav>
  );
};