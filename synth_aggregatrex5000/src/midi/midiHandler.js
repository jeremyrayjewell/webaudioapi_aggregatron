// filepath: /d:/JRJsite/aggregatron/my-app/src/midi/midiHandler.js
export const requestMIDI = (onMessage) => {
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess()
      .then((midiAccess) => {
        console.log('MIDI Access granted');
        const inputs = Array.from(midiAccess.inputs.values());
        console.log('Available MIDI inputs:', inputs);
        inputs.forEach((input) => {
          input.onmidimessage = onMessage;
        });
        return midiAccess;
      })
      .catch((err) => {
        console.error('Failed to get MIDI access', err);
      });
  } else {
    console.error('Web MIDI API not supported in this browser.');
  }
};