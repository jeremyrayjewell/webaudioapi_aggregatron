import Voice from './Voice';
import MIDIVoiceManager from './MIDIVoiceManager';
import Arpeggiator from './Arpeggiator';
import EffectChain from './EffectChain';
import audioContextManager from '../utils/audioContextManager';
import { 
  DEFAULT_MASTER_VOLUME, 
  DEFAULT_DETUNE, 
  DEFAULT_PULSE_WIDTH, 
  DEFAULT_SUB_ENABLED, 
  DEFAULT_SUB_MIX, 
  DEFAULT_SUB_WAVEFORM,
  DEFAULT_ARP_ENABLED,
  DEFAULT_ARP_RATE,
  DEFAULT_ARP_PATTERN,
  DEFAULT_ARP_OCTAVES,
  DEFAULT_ARP_GATE,
  DEFAULT_ARP_SWING,
  DEFAULT_ARP_STEP_LENGTH,
  DEFAULT_ARP_VELOCITY_MODE,
  DEFAULT_ARP_HOLD_MODE
} from '../constants/synth';

export default class SynthEngine {
  constructor() {
    this.isInitialized = false;
    this.initializationAttempts = 0;
    this.maxInitAttempts = 3;
    this.initPromise = this.initializeAudioContext();
    this.initPromise.catch(e => {
      console.error("Failed to initialize SynthEngine:", e);
      this.retryInitialization();
    });
  }

  retryInitialization() {
    if (this.initializationAttempts < this.maxInitAttempts) {
      this.initializationAttempts++;
      console.log(`Retrying SynthEngine initialization (attempt ${this.initializationAttempts}/${this.maxInitAttempts})`);
      setTimeout(() => {
        this.initPromise = this.initializeAudioContext();
      }, 1000);
    }
  }

  async initializeAudioContext() {
    try {
      this.audioContext = await audioContextManager.createContext();
      
      if (!this.audioContext) {
        throw new Error("Failed to create audio context");
      }

      // Set up listeners for user interaction to resume context
      audioContextManager.setupUserActivationListeners();
      
      // Add our own state change listener
      this.audioContext.addEventListener('statechange', () => {
        console.log(`Audio context state changed to: ${this.audioContext.state}`);
        if (this.audioContext.state === 'running') {
          this.isInitialized = true;
        }
      });
      
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = DEFAULT_MASTER_VOLUME;
      
      // Create effect chain
      this.effectChain = new EffectChain(this.audioContext);
      // Connect master gain through effect chain to destination
      this.masterGain.connect(this.effectChain.input);
      this.effectChain.output.connect(this.audioContext.destination);

      this.parameters = {
        oscillator1Type: 'sawtooth',
        oscillator1Detune: DEFAULT_DETUNE,
        oscillator1Mix: 0.8,  // Increased from 0.5
        oscillator1PulseWidth: DEFAULT_PULSE_WIDTH,
        oscillator2Type: 'square',
        oscillator2Detune: DEFAULT_DETUNE,
        oscillator2Mix: 0.3,  // Reduced to make oscillator1 more prominent
        oscillator2PulseWidth: DEFAULT_PULSE_WIDTH,
        subOscillatorEnabled: DEFAULT_SUB_ENABLED,
        subOscillatorType: DEFAULT_SUB_WAVEFORM,
        subOscillatorMix: DEFAULT_SUB_MIX,
        filterType: 'lowpass',
        filterCutoff: 8000,  // Increased from 2000 for brighter sound
        filterQ: 1,
        attack: 0.01,
        decay: 0.2,
        sustain: 0.7,
        release: 0.5,
        delayTime: 0.3,
        delayFeedback: 0.3,
        delayMix: 0.2,
        reverbSize: 0.5,
        reverbMix: 0.2,
        arpeggiatorEnabled: DEFAULT_ARP_ENABLED
      };

      this.voiceManager = new MIDIVoiceManager(this.audioContext);
      this.arpeggiator = new Arpeggiator(this.audioContext, this.voiceManager);
      this.cleanupInterval = setInterval(() => this.emergencyCleanupCheck(), 5000);
      
      console.log("SynthEngine initialized successfully");
      
      // Initialize arpeggiator with default settings
      this.updateArpeggiator({
        enabled: DEFAULT_ARP_ENABLED,
        rate: DEFAULT_ARP_RATE,
        pattern: DEFAULT_ARP_PATTERN,
        octaves: DEFAULT_ARP_OCTAVES,
        gate: DEFAULT_ARP_GATE,
        swing: DEFAULT_ARP_SWING,
        stepLength: DEFAULT_ARP_STEP_LENGTH,
        velocityMode: DEFAULT_ARP_VELOCITY_MODE,
        holdMode: DEFAULT_ARP_HOLD_MODE
      });
    } catch (error) {
      console.error("Failed to initialize SynthEngine:", error);
    }
  }

  createVoiceFactory(velocity) {
    return (note) => {
      try {
        // Early exit if audio context is suspended
        if (this.audioContext.state !== 'running') {
          console.log("Audio context not running, skipping voice creation");
          return null;
        }
        
        const currentGain = this.masterGain ? this.masterGain.gain.value : DEFAULT_MASTER_VOLUME;
        const voice = new Voice(this.audioContext, this.masterGain, {
          ...this.parameters,
          velocity: velocity / 127,
          masterVolume: currentGain
        });
        voice.start(note);
        return voice;
      } catch (e) {
        console.error(`Error in voice factory for note ${note}:`, e);
        return null;
      }
    };
  }

  noteOn(note, velocity = 127) {
    if (!this.audioContext) {
      console.error("Audio context not initialized");
      return;
    }

    // Enhanced audio context handling with retries
    if (this.audioContext.state === 'suspended') {
      console.log("Auto-resuming suspended audio context");
      const maxRetries = 3;
      let retryCount = 0;
      
      const attemptResume = () => {
        this.audioContext.resume().then(() => {
          console.log("Audio context resumed successfully, processing note");
          this._performNoteOn(note, velocity);
        }).catch(e => {
          console.error(`Failed to resume audio context (attempt ${retryCount + 1}/${maxRetries}):`, e);
          retryCount++;
          if (retryCount < maxRetries) {
            console.log("Retrying audio context resume...");
            setTimeout(attemptResume, 100);
          }
        });
      };
      
      attemptResume();
      return;
    }
    
    this._performNoteOn(note, velocity);
  }

  _performNoteOn(note, velocity = 127) {
    // Skip if audio context is not running
    if (this.audioContext.state !== 'running') {
      console.warn("Audio context not running, note skipped");
      return;
    }
    
    try {
      const voiceFactory = this.createVoiceFactory(velocity);
      
      // If arpeggiator is enabled, add the note to the arpeggiator
      if (this.parameters.arpeggiatorEnabled) {
        this.arpeggiator.addNote(note, velocity);
        return;
      }

      // Direct voice creation for normal playback
      return this.voiceManager.noteOn(note, velocity, voiceFactory);
    } catch (e) {
      console.error("Error in _performNoteOn:", e);
    }
  }

  noteOff(note) {
    try {
      // If arpeggiator is enabled, release the note from the arpeggiator
      if (this.arpeggiator && this.arpeggiator.isEnabled) {
        this.arpeggiator.releaseNote(note);
        return true;
      } else {
        // Normal note release
        const releaseCallback = (voice, immediate = false) => {
          if (voice && typeof voice.stop === 'function') {
            voice.stop(immediate);
          }
        };
        return this.voiceManager.noteOff(note, releaseCallback);
      }
    } catch (e) {
      console.error(`Error in noteOff for note ${note}:`, e);
      return false;
    }
  }

  // Method to update arpeggiator settings
  updateArpeggiator(settings) {
    if (!this.arpeggiator) return;
    
    console.log("Updating arpeggiator settings:", settings);
    
    // If we're disabling the arpeggiator
    if (settings.hasOwnProperty('enabled') && 
        !settings.enabled && 
        this.arpeggiator.isEnabled) {
      
      // Force immediate silence and cleanup
      console.log("🚨 EMERGENCY SHUTDOWN: Arpeggiator disabled");
      
      try {
        // 1. Stop the arpeggiator using emergency stop
        if (typeof this.arpeggiator.emergencyStop === 'function') {
          this.arpeggiator.emergencyStop();
        }
        
        // 2. Force all voices to stop immediately
        if (typeof this.voiceManager.emergencyReleaseAll === 'function') {
          this.voiceManager.emergencyReleaseAll();
        }
        
        // 3. Temporarily disconnect audio output for immediate silence
        if (this.masterGain) {
          this.masterGain.disconnect();
          
          // Reconnect after a brief moment of silence
          setTimeout(() => {
            try {
              if (this.masterGain && this.effectChain) {
                this.masterGain.connect(this.effectChain.input);
                console.log("Audio output reconnected after emergency silence");
              }
            } catch (e) {
              console.error("Error reconnecting master output:", e);
            }
          }, 100);
        }
      } catch (e) {
        console.error("Error in emergency arpeggiator shutdown:", e);
      }
    }
    
    // Now update the parameters
    this.arpeggiator.updateParameters(settings);
  }

  allNotesOff() {
    console.log("All notes off triggered in SynthEngine");
    try {
      // Always try to clean up the arpeggiator, regardless of enabled state
      if (this.arpeggiator) {
        if (this.arpeggiator.isEnabled) {
          // Temporarily disable the arpeggiator 
          console.log("Disabling arpeggiator during allNotesOff");
          this.arpeggiator.isEnabled = false;
        }
        
        // Clear any held notes in the arpeggiator
        this.arpeggiator.clearHeldNotes();
      }
      
      // Special case for arpeggiated notes
      if (this.voiceManager && typeof this.voiceManager.releaseAllArpeggiatedNotes === 'function') {
        this.voiceManager.releaseAllArpeggiatedNotes();
      }
      
      // Then release all voices in the voice manager
      const releaseCallback = (voice, immediate = true) => {
        if (voice && typeof voice.stop === 'function') {
          voice.stop(immediate);
        }
      };
      return this.voiceManager.allNotesOff(releaseCallback);
    } catch (e) {
      console.error("Error in allNotesOff:", e);
      return false;
    }
  }

  emergencyCleanupCheck() {
    if (this.audioContext.state !== 'running') return;
    if (this.voiceManager.voiceCount > Math.floor(this.voiceManager.maxVoices * 0.75)) {
      console.warn(`Emergency cleanup: ${this.voiceManager.voiceCount} voices active`);
      this.voiceManager.performCleanup();
      if (this.voiceManager.voiceCount > Math.floor(this.voiceManager.maxVoices * 0.75)) {
        console.warn("Still over threshold after cleanup, forcing all notes off");
        this.allNotesOff();
      }
    }
  }

  setParam(param, value) {
    console.log('Setting synth param:', param, value);
    
    // Handle effect parameters
    if (param.startsWith('effect_')) {
      const parts = param.split('_');
      if (parts.length === 3) {
        const effectName = parts[1];
        const paramName = parts[2];
        this.effectChain.setEffectParam(effectName, paramName, value);
        return;
      }
    }
    
    // Handle effect enable/disable
    if (param.startsWith('effectEnabled_')) {
      const effectName = param.replace('effectEnabled_', '');
      this.effectChain.toggleEffect(effectName, value);
      return;
    }
    
    // Handle regular synth parameters
    if (this.parameters.hasOwnProperty(param)) {
      this.parameters[param] = value;
      if (this.voiceManager && typeof this.voiceManager.getAllVoices === 'function') {
        try {
          const voices = this.voiceManager.getAllVoices();
          if (voices && voices.length > 0) {
            voices.forEach(voice => {
              if (voice && typeof voice.updateParam === 'function') {
                voice.updateParam(param, value);
              }
            });
          }
        } catch (e) {
          console.error('Error applying parameter change to voices:', e);
        }
      }
    } else {
      console.warn('Unknown parameter:', param);
    }
  }

  setWaveform(type) {
    this.parameters.waveform = type;
  }

  setFilter(type, cutoff, q) {
    console.log(`Setting filter: ${type}, cutoff: ${cutoff}, Q: ${q}`);
    this.parameters.filterType = type;
    this.parameters.filterCutoff = cutoff;
    this.parameters.filterQ = q;
    this.parameters.filterEnabled = true;

    if (this.voiceManager && typeof this.voiceManager.getAllVoices === 'function') {
      try {
        const voices = this.voiceManager.getAllVoices();
        if (voices && voices.length > 0) {
          voices.forEach(voice => {
            if (voice && voice.filter) {
              voice.filter.type = type;
              voice.filter.frequency.value = cutoff;
              voice.filter.Q.value = q;
            }
          });
        } else {
          console.log('No active voices to apply filter to');
        }
      } catch (e) {
        console.error('Error applying filter to voices:', e);
      }
    } else {
      console.log('Voice manager not available or missing getAllVoices method');
    }
  }

  bypassFilter() {
    console.log('Bypassing filter');
    this.parameters.filterEnabled = false;

    if (this.voiceManager && typeof this.voiceManager.getAllVoices === 'function') {
      try {
        const voices = this.voiceManager.getAllVoices();
        if (voices && voices.length > 0) {
          voices.forEach(voice => {
            if (voice && voice.filter) {
              if (voice.filter.type === 'lowpass') {
                voice.filter.frequency.value = 20000;
                voice.filter.Q.value = 0.1;
              } else if (voice.filter.type === 'highpass') {
                voice.filter.frequency.value = 20;
                voice.filter.Q.value = 0.1;
              } else if (voice.filter.type === 'bandpass') {
                voice.filter.frequency.value = 1000;
                voice.filter.Q.value = 0.01;
              }
            }
          });
        } else {
          console.log('No active voices to bypass filter on');
        }
      } catch (e) {
        console.error('Error bypassing filter:', e);
      }
    } else {
      console.log('Voice manager not available or missing getAllVoices method');
    }
  }

  setEnvelope(attack, decay, sustain, release) {
    this.parameters.attack = attack;
    this.parameters.decay = decay;
    this.parameters.sustain = sustain;
    this.parameters.release = release;
  }

  dispose() {
    clearInterval(this.cleanupInterval);
    this.allNotesOff();
    
    // Remove audio context state listener
    if (this.audioContextStateHandler) {
      this.audioContext.removeEventListener('statechange', this.audioContextStateHandler);
    }
    
    // Dispose the arpeggiator if it exists
    if (this.arpeggiator) {
      this.arpeggiator.dispose();
    }
    
    // Dispose the effect chain
    if (this.effectChain) {
      this.effectChain.dispose();
    }
    
    if (this.voiceManager) {
      this.voiceManager.dispose();
    }
    if (this.masterGain) {
      this.masterGain.disconnect();
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(e => {
        console.error("Error closing audio context:", e);
      });
    }
  }

  emergencyStopArpeggiator() {
    console.log("🚨 EMERGENCY: SynthEngine stopping arpeggiator");
    
    if (this.arpeggiator) {
      // First disconnect the main output to silence everything
      const destination = this.effectChain.input;
      this.masterGain.disconnect();
      
      // Call the arpeggiator's emergency stop
      if (typeof this.arpeggiator.emergencyStop === 'function') {
        this.arpeggiator.emergencyStop();
      }
      
      // Additional failsafe: force all notes off
      this.allNotesOff();
      
      // Reconnect the output after a brief moment
      setTimeout(() => {
        if (this.masterGain && destination) {
          try {
            this.masterGain.connect(destination);
          } catch (e) {
            console.error("Error reconnecting master output:", e);
          }
        }
      }, 100);
      
      return true;
    }
    
    return false;
  }

  // Effects management methods
  setEffectParam(effectName, paramName, value) {
    if (this.effectChain) {
      this.effectChain.setEffectParam(effectName, paramName, value);
    }
  }

  toggleEffect(effectName, enabled) {
    if (this.effectChain) {
      this.effectChain.toggleEffect(effectName, enabled);
    }
  }

  getEffectParams(effectName) {
    return this.effectChain ? this.effectChain.getEffectParams(effectName) : null;
  }

  getAllEffects() {
    return this.effectChain ? this.effectChain.getAllEffects() : {};
  }

  setEffectPreset(presetName) {
    if (this.effectChain) {
      this.effectChain.setPreset(presetName);
    }
  }
}
