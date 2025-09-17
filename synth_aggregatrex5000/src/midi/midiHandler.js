// filepath: /d:/JRJsite/aggregatron/my-app/src/midi/midiHandler.js
export const requestMIDI = async (onMessage) => {
  if (!navigator.requestMIDIAccess) {
    console.error('[MIDI] Web MIDI API not supported.');
    return null;
  }
  try {
    const access = await navigator.requestMIDIAccess({ sysex: false });
    console.log('[MIDI] Access granted');
    const attach = () => {
      const inputs = Array.from(access.inputs.values());
      console.log('[MIDI] Inputs:', inputs.map(i => `${i.name}:${i.state}`));
      inputs.forEach(inp => inp.onmidimessage = onMessage);
    };
    attach();
    access.onstatechange = () => attach();
    return access;
  } catch (e) {
    console.error('[MIDI] Failed to get access:', e);
    return null;
  }
};