import React from 'react';

interface DataContextType {
  addNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const DataContext = React.createContext<DataContextType>({
  addNotification: () => {},
});

export const useDataContext = () => React.useContext(DataContext);