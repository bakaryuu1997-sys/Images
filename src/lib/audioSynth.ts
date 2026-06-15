/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio Ambient Synthesizer Engine for Cinematic Studio
// Generates professional, rich soundscapes procedurally in real-time.

let audioCtx: AudioContext | null = null;
let activeNodes: {
  oscillators: OscillatorNode[];
  gains: GainNode[];
  filters: BiquadFilterNode[];
  lfo?: OscillatorNode;
  noiseInterval?: NodeJS.Timeout | any;
} | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function stopAmbientSound() {
  if (activeNodes) {
    try {
      if (activeNodes.noiseInterval) {
        clearInterval(activeNodes.noiseInterval);
      }
      activeNodes.oscillators.forEach(osc => { try { osc.stop(); } catch(e){} });
      if (activeNodes.lfo) {
        try { activeNodes.lfo.stop(); } catch(e){}
      }
    } catch (e) {
      console.warn("Error stopping nodes:", e);
    }
    activeNodes = null;
  }
}

export function playAmbientSound(trackStyle: "none" | "lofi" | "cyber" | "cinematic" | "scifi") {
  // Stop any active sound first
  stopAmbientSound();
  
  if (trackStyle === "none") return;
  
  try {
    const ctx = getAudioContext();
    const destination = ctx.destination;
    
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];
    const filters: BiquadFilterNode[] = [];
    let lfo: OscillatorNode | undefined;
    let noiseInterval: any = null;

    // Master Volume Limiter
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 1.5); // Warm fade-in
    masterGain.connect(destination);
    
    if (trackStyle === "lofi") {
      // LO-FI DREAMSCAPE
      // Soft minor/major 9th chords swapping slowly (e.g. Cmaj9 and Am9)
      // Generates warm, low-pass filtered triangle waves
      const chordC = [130.81, 164.81, 196.00, 246.94, 293.66]; // C, E, G, B, D (Cmaj9)
      const chordA = [110.00, 146.83, 164.81, 220.00, 261.63]; // A, D, E, A, C (Am9/11)
      
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);
      filter.connect(masterGain);
      filters.push(filter);

      // Create oscillators for the chord
      chordC.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        // Slight detune for analog thickness
        osc.detune.setValueAtTime((Math.random() - 0.5) * 12, ctx.currentTime);
        
        oscGain.gain.setValueAtTime(0.02, ctx.currentTime);
        
        osc.connect(oscGain);
        oscGain.connect(filter);
        
        osc.start();
        oscillators.push(osc);
        gains.push(oscGain);
        
        // Slowly evolve pitches to create moving pads
        const interval = setInterval(() => {
          if (!activeNodes) {
            clearInterval(interval);
            return;
          }
          const isChordA = Math.floor(ctx.currentTime / 8) % 2 === 1;
          const nextFreq = isChordA ? chordA[idx] : chordC[idx];
          osc.frequency.exponentialRampToValueAtTime(nextFreq, ctx.currentTime + 4.0);
        }, 8000);
      });

      // Add soft vinyl crackles and ocean wave sweep
      const sweepFltr = ctx.createBiquadFilter();
      sweepFltr.type = "bandpass";
      sweepFltr.frequency.setValueAtTime(180, ctx.currentTime);
      sweepFltr.Q.setValueAtTime(1.0, ctx.currentTime);
      sweepFltr.connect(masterGain);
      filters.push(sweepFltr);

      // LFO for ocean wave swell
      lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // very slow 12s wave cycles
      lfoGain.gain.setValueAtTime(200, ctx.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(sweepFltr.frequency);
      lfo.start();

      // Simple white-ish noise helper for the crackle and sea sweep
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.004, ctx.currentTime);
      whiteNoise.connect(noiseGain);
      noiseGain.connect(sweepFltr);
      whiteNoise.start();
      oscillators.push(whiteNoise as any);
      gains.push(noiseGain);

      // Procedural soft vinyl crackle transients
      noiseInterval = setInterval(() => {
        if (!activeNodes) return;
        if (Math.random() > 0.4) {
          const crackle = ctx.createOscillator();
          const crkGain = ctx.createGain();
          crkGain.gain.setValueAtTime(0.0, ctx.currentTime);
          crkGain.gain.linearRampToValueAtTime(0.005 + Math.random() * 0.015, ctx.currentTime + 0.005);
          crkGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);
          
          crackle.type = "sawtooth";
          crackle.frequency.setValueAtTime(200 + Math.random() * 1800, ctx.currentTime);
          
          crackle.connect(crkGain);
          crkGain.connect(masterGain);
          crackle.start();
          crackle.stop(ctx.currentTime + 0.05);
        }
      }, 150);

    } else if (trackStyle === "cyber") {
      // CYBERPUNK SYNTHWAVE
      // Deep pulsating fat analog square wave bass + neon arpeggio chords
      const bassFreq = 55.0; // A1
      const leadNotes = [220.00, 261.63, 329.63, 392.00, 440.00]; // A minor pentatonic scales
      
      const subFilter = ctx.createBiquadFilter();
      subFilter.type = "lowpass";
      subFilter.frequency.setValueAtTime(150, ctx.currentTime);
      subFilter.connect(masterGain);
      filters.push(subFilter);

      // Deep Sub Synth
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = "sawtooth";
      subOsc.frequency.setValueAtTime(bassFreq, ctx.currentTime);
      subGain.gain.setValueAtTime(0.08, ctx.currentTime);
      
      // Pulse filter with LFO to give synthwave bass "wobble"
      lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(2.2, ctx.currentTime); // rhythmic pulsation
      lfoGain.gain.setValueAtTime(45, ctx.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(subFilter.frequency);
      lfo.start();

      subOsc.connect(subGain);
      subGain.connect(subFilter);
      subOsc.start();
      oscillators.push(subOsc);
      gains.push(subGain);

      // Neo Arpeggiated sequence
      let chordIndex = 0;
      noiseInterval = setInterval(() => {
        if (!activeNodes) return;
        const currentNote = leadNotes[chordIndex % leadNotes.length];
        const ping = ctx.createOscillator();
        const pingGain = ctx.createGain();
        const pingFilter = ctx.createBiquadFilter();

        pingFilter.type = "bandpass";
        pingFilter.frequency.setValueAtTime(1200, ctx.currentTime);
        pingFilter.Q.setValueAtTime(1.0, ctx.currentTime);
        pingFilter.connect(masterGain);

        ping.type = "sawtooth";
        // cyber styling detuning
        ping.detune.setValueAtTime(-5, ctx.currentTime);
        ping.frequency.setValueAtTime(currentNote, ctx.currentTime);
        
        pingGain.gain.setValueAtTime(0.0, ctx.currentTime);
        pingGain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.04);
        pingGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
        
        ping.connect(pingGain);
        pingGain.connect(pingFilter);
        ping.start();
        ping.stop(ctx.currentTime + 0.5);

        chordIndex++;
      }, 500);

    } else if (trackStyle === "cinematic") {
      // CINEMATIC ORCHESTRAL
      // Lush, swelling dramatic major chords, high strings + warm low string section
      const lowSwell = [73.42, 110.00]; // D2, A2
      const highSwell = [220.00, 277.18, 329.63, 440.00, 554.37]; // A, C#, E, A, C# (A major)
      
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(600, ctx.currentTime);
      filter.connect(masterGain);
      filters.push(filter);

      lowSwell.concat(highSwell).forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.detune.setValueAtTime((Math.random() - 0.5) * 8, ctx.currentTime);
        
        // Evolving volume swelling
        gain.gain.setValueAtTime(0.0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 2.0);
        
        osc.connect(gain);
        gain.connect(filter);
        osc.start();
        
        oscillators.push(osc);
        gains.push(gain);

        // Slow swelling loop
        let isUp = true;
        const swellInterval = setInterval(() => {
          if (!activeNodes) {
            clearInterval(swellInterval);
            return;
          }
          isUp = !isUp;
          const nextVol = isUp ? 0.022 : 0.006;
          // slow ramp
          gain.gain.linearRampToValueAtTime(nextVol, ctx.currentTime + 3.0);
        }, 5000);
      });

    } else if (trackStyle === "scifi") {
      // SCI-FI AMBIENT DRONE
      // Resonant, sweeping cosmic oscillator peaks + ringing futuristic frequencies
      const frequencies = [87.31, 130.81, 196.00, 392.00, 587.33]; // F, C, G, G, D
      
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.Q.setValueAtTime(6.0, ctx.currentTime); // dynamic high-Q filter
      filter.connect(masterGain);
      filters.push(filter);

      // Sweep the filter frequency slowly
      lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = "triangle";
      lfo.frequency.setValueAtTime(0.04, ctx.currentTime); // 25s sweep
      lfoGain.gain.setValueAtTime(450, ctx.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      frequencies.forEach((freq) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.detune.setValueAtTime((Math.random() - 0.5) * 15, ctx.currentTime);
        
        oscGain.gain.setValueAtTime(0.015, ctx.currentTime);
        
        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start();
        
        oscillators.push(osc);
        gains.push(oscGain);
      });
    }

    activeNodes = {
      oscillators,
      gains,
      filters,
      lfo,
      noiseInterval
    };

  } catch (err) {
    console.error("Synthesizer initialization encountered error:", err);
  }
}
