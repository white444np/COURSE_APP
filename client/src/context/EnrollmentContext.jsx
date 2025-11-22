import { createContext, useContext, useMemo, useState, useCallback } from 'react';

const EnrollmentContext = createContext();

export function EnrollmentProvider({ children }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const clearSelection = useCallback(() => {
    setSelectedCourse(null);
    setActiveOrder(null);
    setIsProcessing(false);
  }, []);

  const value = useMemo(() => ({
    selectedCourse,
    selectCourse: setSelectedCourse,
    clearSelection,
    activeOrder,
    setActiveOrder,
    isProcessing,
    setProcessing: setIsProcessing,
  }), [selectedCourse, clearSelection, activeOrder, isProcessing]);

  return (
    <EnrollmentContext.Provider value={value}>
      {children}
    </EnrollmentContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEnrollment() {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error('useEnrollment must be used within an EnrollmentProvider');
  }
  return context;
}
