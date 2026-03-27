let audioContext = null;
let isContextReady = false;
let activationListenersAttached = false;
let activationHandler = null;

const removeUserActivationListeners = () => {
  if (!activationListenersAttached || !activationHandler) return;

  ['mousedown', 'touchstart', 'keydown'].forEach((type) => {
    window.removeEventListener(type, activationHandler);
  });

  activationListenersAttached = false;
  activationHandler = null;
};

const createContext = async () => {
  try {
    if (audioContext?.state === 'closed') {
      audioContext = null;
      isContextReady = false;
    }

    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Add state change listener
      audioContext.addEventListener('statechange', () => {
        console.log(`Audio context state changed to: ${audioContext.state}`);
        isContextReady = audioContext.state === 'running';
      });
    }
    
    return audioContext;
  } catch (error) {
    console.error('Failed to create AudioContext:', error);
    throw error;
  }
};

const setupUserActivationListeners = () => {
  if (activationListenersAttached) return;

  const activationEvents = ['mousedown', 'touchstart', 'keydown'];

  const initOnFirstInteraction = async (event) => {
    if (!audioContext) return;
    
    try {
      console.log('First user interaction detected, attempting to resume audio context');
      await audioContext.resume();
      
      if (audioContext.state === 'running') {
        console.log('Audio context resumed successfully');
        isContextReady = true;
        removeUserActivationListeners();
      }
    } catch (error) {
      console.error('Failed to resume audio context:', error);
    }
  };

  activationHandler = initOnFirstInteraction;
  activationListenersAttached = true;

  // Add listeners for user interaction events
  activationEvents.forEach(type => {
    window.addEventListener(type, initOnFirstInteraction);
  });
};

const resumeContext = async () => {
  if (!audioContext || audioContext.state === 'closed') return false;
  
  try {
    if (audioContext.state === 'suspended') {
      console.log('Attempting to resume suspended audio context');
      await audioContext.resume();
      isContextReady = audioContext.state === 'running';
      return isContextReady;
    }
    return true;
  } catch (error) {
    console.error('Failed to resume audio context:', error);
    return false;
  }
};

const isReady = () => isContextReady && audioContext?.state === 'running';

const getContext = () => audioContext;

const releaseContext = (contextToRelease = null) => {
  if (contextToRelease && audioContext && contextToRelease !== audioContext) {
    return;
  }

  removeUserActivationListeners();
  audioContext = null;
  isContextReady = false;
};

const audioContextManager = {
  createContext,
  setupUserActivationListeners,
  resumeContext,
  isReady,
  getContext,
  releaseContext
};

export default audioContextManager;
