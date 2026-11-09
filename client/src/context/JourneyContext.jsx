import React, { createContext, useContext, useState } from 'react';

const JourneyContext = createContext(null);

export const JOURNEY_STEPS = [
  'Describe',
  'Analyze',
  'Match',
  'Pricing',
  'Negotiation',
  'Agreement',
  'Payment',
  'Fulfillment'
];

export function JourneyProvider({ children }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const nextStep = () => setCurrentStepIndex(i => Math.min(i + 1, JOURNEY_STEPS.length - 1));
  const setStep = (index) => setCurrentStepIndex(Math.max(0, Math.min(index, JOURNEY_STEPS.length - 1)));

  return (
    <JourneyContext.Provider value={{ currentStepIndex, nextStep, setStep, steps: JOURNEY_STEPS }}>
      {children}
    </JourneyContext.Provider>
  );
}

export const useJourney = () => useContext(JourneyContext);
