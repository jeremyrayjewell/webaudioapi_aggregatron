import { createContext, useState } from 'react';

export const ReverbConfigContext = createContext();

export const ReverbConfigProvider = ({ children }) => {
  const [reverbLevel, setReverbLevel] = useState(0.5);

  return (
    <ReverbConfigContext.Provider
      value={{ reverbLevel, setReverbLevel }}
    >
      {children}
    </ReverbConfigContext.Provider>
  );
};
