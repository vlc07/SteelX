import React from 'react';
import { Github, Twitter, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">ProcessOptimizer</h3>
            <p className="text-sm">
              An advanced tool for process parameter optimization using machine learning techniques.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#docs" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#examples" className="hover:text-white transition-colors">Examples</a></li>
              <li><a href="#api" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#contributing" className="hover:text-white transition-colors">Contributing</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4 text-sm">
              <a href="#github" className="hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#twitter" className="hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#mail" className="hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-sm">
          <p>© {new Date().getFullYear()} ProcessOptimizer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};