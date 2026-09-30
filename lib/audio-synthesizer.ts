/**
 * Web Audio API based instant audio generator for Soniq SFX previews.
 * Generates rich, cinematic sounds right in the user's browser.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  playWhoosh() {
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime

      // Noise buffer for whoosh air rush
      const bufferSize = ctx.sampleRate * 0.8
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(200, now)
      filter.frequency.exponentialRampToValueAtTime(1400, now + 0.35)
      filter.frequency.exponentialRampToValueAtTime(120, now + 0.75)
      filter.Q.setValueAtTime(3.0, now)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.01, now)
      gain.gain.linearRampToValueAtTime(0.7, now + 0.35)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.78)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      noise.start(now)
      noise.stop(now + 0.8)
    } catch {
      // Audio context may fail if user has not interacted
    }
  }

  playImpact() {
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime

      // Sub drop oscillator
      const osc = ctx.createOscillator()
      const oscGain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(180, now)
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.6)

      oscGain.gain.setValueAtTime(0.9, now)
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7)

      osc.connect(oscGain)
      oscGain.connect(ctx.destination)

      // Initial punch click
      const click = ctx.createOscillator()
      const clickGain = ctx.createGain()
      click.type = 'triangle'
      click.frequency.setValueAtTime(350, now)
      click.frequency.exponentialRampToValueAtTime(60, now + 0.08)
      clickGain.gain.setValueAtTime(0.8, now)
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)

      click.connect(clickGain)
      clickGain.connect(ctx.destination)

      osc.start(now)
      click.start(now)
      osc.stop(now + 0.75)
      click.stop(now + 0.1)
    } catch {}
  }

  playBraam() {
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime

      // Sawtooth brass layer
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const masterGain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      osc1.type = 'sawtooth'
      osc1.frequency.setValueAtTime(55, now) // A1
      osc1.frequency.exponentialRampToValueAtTime(48, now + 1.2)

      osc2.type = 'square'
      osc2.frequency.setValueAtTime(55.5, now) // Detuned
      osc2.frequency.exponentialRampToValueAtTime(48.5, now + 1.2)

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(400, now)
      filter.frequency.exponentialRampToValueAtTime(1600, now + 0.2)
      filter.frequency.exponentialRampToValueAtTime(250, now + 1.3)
      filter.Q.value = 6

      masterGain.gain.setValueAtTime(0.01, now)
      masterGain.gain.linearRampToValueAtTime(0.8, now + 0.15)
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4)

      osc1.connect(filter)
      osc2.connect(filter)
      filter.connect(masterGain)
      masterGain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 1.45)
      osc2.stop(now + 1.45)
    } catch {}
  }

  playUI() {
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(950, now)
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08)

      gain.gain.setValueAtTime(0.5, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.13)
    } catch {}
  }

  playGlitch() {
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime

      for (let i = 0; i < 4; i++) {
        const stepTime = now + i * 0.05
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = i % 2 === 0 ? 'square' : 'sawtooth'
        osc.frequency.setValueAtTime(200 + Math.random() * 1200, stepTime)

        gain.gain.setValueAtTime(0.4, stepTime)
        gain.gain.exponentialRampToValueAtTime(0.01, stepTime + 0.04)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(stepTime)
        osc.stop(stepTime + 0.045)
      }
    } catch {}
  }

  playAnime() {
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(150, now)
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15)
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.4)

      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(800, now)
      filter.Q.value = 5

      gain.gain.setValueAtTime(0.01, now)
      gain.gain.linearRampToValueAtTime(0.8, now + 0.12)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.48)
    } catch {}
  }

  playRiser() {
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(80, now)
      osc.frequency.exponentialRampToValueAtTime(850, now + 1.0)

      gain.gain.setValueAtTime(0.05, now)
      gain.gain.linearRampToValueAtTime(0.7, now + 0.9)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.05)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 1.1)
    } catch {}
  }

  playByType(type?: string) {
    if (!type || type === 'none') {
      return
    }
    switch (type) {
      case 'whoosh':
        return this.playWhoosh()
      case 'impact':
        return this.playImpact()
      case 'braam':
        return this.playBraam()
      case 'ui':
        return this.playUI()
      case 'glitch':
        return this.playGlitch()
      case 'anime':
        return this.playAnime()
      case 'riser':
        return this.playRiser()
      default:
        return
    }
  }
}

export const audioSynthesizer = new SoundSynthesizer()
