import { createContext, useState } from 'react';

export const PwmConfigContext = createContext();

export const PwmConfigProvider = ({ children }) => {
  const [usePWM, setUsePWM] = useState(false);
  const [width, setWidth] = useState(0.5);
  const [pulseWidthLFO, setPulseWidthLFO] = useState({ rate: 1, depth: 0.2 });

  return (
    <PwmConfigContext.Provider
      value={{
        usePWM,
        setUsePWM,
        width,
        setWidth,
        pulseWidthLFO,
        setPulseWidthLFO,
      }}
    >
      {children}
    </PwmConfigContext.Provider>
  );
};
