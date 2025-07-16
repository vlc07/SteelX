// Realistic parameter limits based on industrial carbon steel melting processes
export interface ParameterLimits {
  min: number;
  max: number;
  step: number;
  unit: string;
  industrialRange: string;
  criticalNotes: string;
}

export const PARAMETER_LIMITS = {
  temperatura: {
    min: 1400,
    max: 1600,
    step: 5,
    unit: '°C',
    industrialRange: '1450-1550°C (típico)',
    criticalNotes: 'Abaixo de 1400°C: fusão incompleta. Acima de 1600°C: degradação excessiva e alto consumo energético.'
  } as ParameterLimits,
  
  tempo: {
    min: 15,
    max: 120,
    step: 5,
    unit: 'min',
    industrialRange: '30-90 min (típico)',
    criticalNotes: 'Abaixo de 15 min: processo incompleto. Acima de 120 min: oxidação excessiva e ineficiência.'
  } as ParameterLimits,
  
  pressao: {
    min: 95,
    max: 110,
    step: 0.5,
    unit: 'kPa',
    industrialRange: '98-105 kPa (típico)',
    criticalNotes: 'Abaixo de 95 kPa: instabilidade do processo. Acima de 110 kPa: risco de segurança e equipamentos.'
  } as ParameterLimits,
  
  velocidade: {
    min: 250,
    max: 350,
    step: 5,
    unit: 'rpm',
    industrialRange: '280-320 rpm (típico)',
    criticalNotes: 'Abaixo de 250 rpm: mistura inadequada. Acima de 350 rpm: turbulência excessiva e desgaste.'
  } as ParameterLimits
};

export const validateParameter = (
  parameterName: keyof typeof PARAMETER_LIMITS,
  value: number
): { isValid: boolean; message?: string; correctedValue?: number } => {
  const limits = PARAMETER_LIMITS[parameterName];
  
  if (isNaN(value) || value === null || value === undefined) {
    return {
      isValid: false,
      message: `Valor inválido para ${parameterName}. Insira um número válido.`,
      correctedValue: limits.min
    };
  }
  
  if (value < limits.min) {
    return {
      isValid: false,
      message: `${parameterName.charAt(0).toUpperCase() + parameterName.slice(1)} muito baixa (${value}${limits.unit}). Mínimo industrial: ${limits.min}${limits.unit}. ${limits.criticalNotes}`,
      correctedValue: limits.min
    };
  }
  
  if (value > limits.max) {
    return {
      isValid: false,
      message: `${parameterName.charAt(0).toUpperCase() + parameterName.slice(1)} muito alta (${value}${limits.unit}). Máximo industrial: ${limits.max}${limits.unit}. ${limits.criticalNotes}`,
      correctedValue: limits.max
    };
  }
  
  return { isValid: true };
};

export const validateAllParameters = (params: {
  temperatura: number;
  tempo: number;
  pressao: number;
  velocidade: number;
}): { isValid: boolean; errors: string[]; correctedParams?: typeof params } => {
  const errors: string[] = [];
  const correctedParams = { ...params };
  let hasCorrections = false;
  
  Object.entries(params).forEach(([key, value]) => {
    const validation = validateParameter(key as keyof typeof PARAMETER_LIMITS, value);
    if (!validation.isValid) {
      errors.push(validation.message!);
      if (validation.correctedValue !== undefined) {
        correctedParams[key as keyof typeof params] = validation.correctedValue;
        hasCorrections = true;
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    correctedParams: hasCorrections ? correctedParams : undefined
  };
};

// Industrial safety checks for parameter combinations
export const validateParameterCombination = (params: {
  temperatura: number;
  tempo: number;
  pressao: number;
  velocidade: number;
}): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  
  // High temperature + long time = excessive energy consumption
  if (params.temperatura > 1550 && params.tempo > 80) {
    warnings.push('⚠️ Combinação de alta temperatura (>1550°C) com tempo longo (>80min) resulta em consumo energético excessivo e possível degradação do material.');
  }
  
  // Low temperature + short time = incomplete process
  if (params.temperatura < 1450 && params.tempo < 30) {
    warnings.push('⚠️ Combinação de baixa temperatura (<1450°C) com tempo curto (<30min) pode resultar em fusão incompleta.');
  }
  
  // High pressure + high speed = equipment stress
  if (params.pressao > 105 && params.velocidade > 320) {
    warnings.push('⚠️ Combinação de alta pressão (>105kPa) com alta velocidade (>320rpm) pode causar estresse excessivo nos equipamentos.');
  }
  
  // Low pressure + high speed = instability
  if (params.pressao < 98 && params.velocidade > 300) {
    warnings.push('⚠️ Combinação de baixa pressão (<98kPa) com alta velocidade (>300rpm) pode causar instabilidade no processo.');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
};