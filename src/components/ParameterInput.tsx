import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { PARAMETER_LIMITS, validateParameter } from '../utils/parameterValidation';

interface ParameterInputProps {
  label: string;
  parameterName: keyof typeof PARAMETER_LIMITS;
  value: number;
  onChange: (value: number) => void;
  isDark: boolean;
  disabled?: boolean;
}

export const ParameterInput: React.FC<ParameterInputProps> = ({
  label,
  parameterName,
  value,
  onChange,
  isDark,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [validation, setValidation] = useState<{ isValid: boolean; message?: string }>({ isValid: true });
  const [showLimits, setShowLimits] = useState(false);
  
  const limits = PARAMETER_LIMITS[parameterName];
  
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const numericValue = parseFloat(newValue);
    const validationResult = validateParameter(parameterName, numericValue);
    setValidation(validationResult);
    
    if (validationResult.isValid) {
      onChange(numericValue);
    }
  };
  
  const handleBlur = () => {
    const numericValue = parseFloat(inputValue);
    const validationResult = validateParameter(parameterName, numericValue);
    
    if (!validationResult.isValid && validationResult.correctedValue !== undefined) {
      const correctedValue = validationResult.correctedValue;
      setInputValue(correctedValue.toString());
      onChange(correctedValue);
      setValidation({ isValid: true });
    }
  };
  
  const isInOptimalRange = () => {
    const numericValue = parseFloat(inputValue);
    if (isNaN(numericValue)) return false;
    
    // Define optimal ranges based on industrial standards
    const optimalRanges = {
      temperatura: { min: 1450, max: 1550 },
      tempo: { min: 30, max: 90 },
      pressao: { min: 98, max: 105 },
      velocidade: { min: 280, max: 320 }
    };
    
    const optimal = optimalRanges[parameterName];
    return numericValue >= optimal.min && numericValue <= optimal.max;
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className={`block font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {label} ({limits.unit}):
        </label>
        <button
          type="button"
          onClick={() => setShowLimits(!showLimits)}
          className={`p-1 rounded-full hover:bg-opacity-20 ${isDark ? 'hover:bg-white' : 'hover:bg-gray-500'}`}
        >
          <Info className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        </button>
      </div>
      
      <div className="relative">
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          min={limits.min}
          max={limits.max}
          step={limits.step}
          disabled={disabled}
          className={`w-full border rounded-lg p-3 transition-colors ${
            disabled 
              ? (isDark ? 'bg-gray-800 border-gray-600 text-gray-500' : 'bg-gray-100 border-gray-300 text-gray-500')
              : validation.isValid
                ? isInOptimalRange()
                  ? (isDark ? 'bg-gray-700 border-green-500 text-white' : 'bg-white border-green-500 text-gray-900')
                  : (isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900')
                : (isDark ? 'bg-gray-700 border-red-500 text-white' : 'bg-white border-red-500 text-gray-900')
          } ${
            isDark ? 'focus:border-blue-400' : 'focus:border-blue-500'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
        />
        
        {/* Status indicator */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {validation.isValid ? (
            isInOptimalRange() ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Info className="h-5 w-5 text-yellow-500" />
            )
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </div>
      
      {/* Validation message */}
      {!validation.isValid && validation.message && (
        <div className={`p-2 rounded text-sm ${isDark ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-700'} border ${isDark ? 'border-red-700' : 'border-red-200'}`}>
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{validation.message}</span>
          </div>
        </div>
      )}
      
      {/* Optimal range indicator */}
      {validation.isValid && !isInOptimalRange() && (
        <div className={`p-2 rounded text-sm ${isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-50 text-yellow-700'} border ${isDark ? 'border-yellow-700' : 'border-yellow-200'}`}>
          <div className="flex items-start">
            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Faixa ótima: {limits.industrialRange}</span>
          </div>
        </div>
      )}
      
      {/* Industrial limits info */}
      {showLimits && (
        <div className={`p-3 rounded-lg text-sm ${isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'} border`}>
          <h4 className={`font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
            Limites Industriais
          </h4>
          <div className={`space-y-1 ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
            <p><strong>Mínimo:</strong> {limits.min}{limits.unit}</p>
            <p><strong>Máximo:</strong> {limits.max}{limits.unit}</p>
            <p><strong>Faixa Ótima:</strong> {limits.industrialRange}</p>
            <p><strong>Observações:</strong> {limits.criticalNotes}</p>
          </div>
        </div>
      )}
      
      {/* Range slider for visual reference */}
      <div className="mt-2">
        <input
          type="range"
          min={limits.min}
          max={limits.max}
          step={limits.step}
          value={validation.isValid ? parseFloat(inputValue) : limits.min}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value);
            setInputValue(newValue.toString());
            onChange(newValue);
            setValidation({ isValid: true });
          }}
          disabled={disabled}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
            isDark ? 'bg-gray-600' : 'bg-gray-200'
          } ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
        <div className="flex justify-between text-xs mt-1">
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{limits.min}</span>
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{limits.max}</span>
        </div>
      </div>
    </div>
  );
};