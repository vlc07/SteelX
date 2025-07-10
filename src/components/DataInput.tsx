import React, { useState } from 'react';
import { Upload, Table, X, FilePlus, FileText } from 'lucide-react';
import { useDataContext } from '../context/DataContext';

export const DataInput: React.FC = () => {
  const { addNotification } = useDataContext();
  const [activeSection, setActiveSection] = useState<'upload' | 'manual' | 'sample'>('upload');
  const [csvData, setCsvData] = useState<string | null>(null);
  
  // Sample data similar to the Python example
  const sampleData = {
    headers: ['Temperature', 'Time', 'Pressure', 'Speed', 'Quality'],
    rows: [
      [1450, 30, 101, 300, 350],
      [1460, 40, 102, 310, 355],
      [1470, 50, 100, 290, 360],
      [1480, 60, 101, 305, 358],
      [1490, 70, 101, 300, 362],
      [1500, 80, 100, 295, 365],
      [1510, 90, 102, 310, 370],
      [1520, 35, 101, 300, 352],
      [1495, 55, 100, 305, 359],
      [1485, 75, 101, 295, 367]
    ]
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvData(event.target?.result as string);
        addNotification('File uploaded successfully', 'success');
      };
      reader.readAsText(file);
    }
  };

  const handleUseSampleData = () => {
    addNotification('Sample data loaded', 'info');
    // In a real app, this would parse the data and store it in state/context
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Data Input</h2>
      
      <div className="bg-gray-50 rounded-lg mb-8">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium text-sm flex-1 ${
              activeSection === 'upload' ? 'bg-white text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('upload')}
          >
            Upload File
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex-1 ${
              activeSection === 'manual' ? 'bg-white text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('manual')}
          >
            Manual Entry
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex-1 ${
              activeSection === 'sample' ? 'bg-white text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('sample')}
          >
            Use Sample Data
          </button>
        </div>
        
        <div className="p-6">
          {activeSection === 'upload' && (
            <div className="text-center">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop your CSV file here</p>
                <p className="text-gray-500 text-sm mb-4">or</p>
                <label className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
                  Browse Files
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
              <p className="text-sm text-gray-500">Supported formats: CSV with headers</p>
              
              {csvData && (
                <div className="mt-6 p-4 bg-white rounded-md border text-left">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">File Preview</h3>
                    <button 
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => setCsvData(null)}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <pre className="text-xs text-gray-600 overflow-x-auto max-h-40 bg-gray-50 p-2 rounded">
                    {csvData.substring(0, 500)}
                    {csvData.length > 500 && '...'}
                  </pre>
                </div>
              )}
            </div>
          )}
          
          {activeSection === 'manual' && (
            <div>
              <p className="text-gray-600 mb-4">
                Use the table below to manually enter your process data.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Temperature (°C)', 'Time (min)', 'Pressure (kPa)', 'Speed (rpm)', 'Quality'].map((header, i) => (
                        <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Empty row with inputs */}
                    <tr>
                      <td className="px-6 py-2"><input type="number" className="border rounded p-1 w-full" placeholder="e.g., 1450" /></td>
                      <td className="px-6 py-2"><input type="number" className="border rounded p-1 w-full" placeholder="e.g., 30" /></td>
                      <td className="px-6 py-2"><input type="number" className="border rounded p-1 w-full" placeholder="e.g., 101" /></td>
                      <td className="px-6 py-2"><input type="number" className="border rounded p-1 w-full" placeholder="e.g., 300" /></td>
                      <td className="px-6 py-2"><input type="number" className="border rounded p-1 w-full" placeholder="e.g., 350" /></td>
                      <td className="px-6 py-2 text-right">
                        <button className="text-blue-600 hover:text-blue-800">
                          <FilePlus className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Save Data
                </button>
              </div>
            </div>
          )}
          
          {activeSection === 'sample' && (
            <div>
              <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md mb-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> This sample data is from a hypothetical manufacturing process where temperature, 
                  time, pressure, and speed affect the final product quality.
                </p>
              </div>
              
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {sampleData.headers.map((header, i) => (
                        <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sampleData.rows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        {row.map((cell, j) => (
                          <td key={j} className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end">
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  onClick={handleUseSampleData}
                >
                  Use This Sample Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
        <h3 className="text-blue-700 font-medium mb-2 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Data Requirements
        </h3>
        <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm">
          <li>Include all process parameters that might affect quality</li>
          <li>Ensure data is clean and free of missing values</li>
          <li>Include sufficient samples for model training (minimum 10 records)</li>
          <li>Numerical data is preferred for all parameters</li>
          <li>Include a quality metric column as the target variable</li>
        </ul>
      </div>
    </div>
  );
};