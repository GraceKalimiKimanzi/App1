
export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private analyzer: AnalyserNode | null = null;

  async init() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  async startRecording(): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.chunks = [];

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };

    this.mediaRecorder.start();
    return stream;
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) return resolve(new Blob());
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/wav' });
        resolve(blob);
      };
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  }

  createVisualizer(stream: MediaStream): AnalyserNode {
    if (!this.audioContext) this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(stream);
    this.analyzer = this.audioContext.createAnalyser();
    this.analyzer.fftSize = 256;
    source.connect(this.analyzer);
    return this.analyzer;
  }

  // Simulates professional enhancement using Web Audio filters
  async applyStudioEnhancement(inputBlob: Blob): Promise<Blob> {
    const arrayBuffer = await inputBlob.arrayBuffer();
    if (!this.audioContext) this.audioContext = new AudioContext();
    
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    
    // Offline Context for rendering the enhanced version
    const offlineCtx = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;

    // 1. High-Pass Filter (Remove low-end rumble)
    const hpFilter = offlineCtx.createBiquadFilter();
    hpFilter.type = 'highpass';
    hpFilter.frequency.value = 80;

    // 2. EQ: Voice Clarity Boost
    const clarityBoost = offlineCtx.createBiquadFilter();
    clarityBoost.type = 'peaking';
    clarityBoost.frequency.value = 3000;
    clarityBoost.Q.value = 1.0;
    clarityBoost.gain.value = 3.5;

    // 3. Simple Compressor
    const compressor = offlineCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, offlineCtx.currentTime);
    compressor.knee.setValueAtTime(40, offlineCtx.currentTime);
    compressor.ratio.setValueAtTime(12, offlineCtx.currentTime);
    compressor.attack.setValueAtTime(0.003, offlineCtx.currentTime);
    compressor.release.setValueAtTime(0.25, offlineCtx.currentTime);

    // 4. Normalizer Gain
    const gainNode = offlineCtx.createGain();
    gainNode.gain.value = 1.2;

    source.connect(hpFilter);
    hpFilter.connect(clarityBoost);
    clarityBoost.connect(compressor);
    compressor.connect(gainNode);
    gainNode.connect(offlineCtx.destination);

    source.start(0);
    const renderedBuffer = await offlineCtx.startRendering();

    return this.bufferToWav(renderedBuffer);
  }

  private bufferToWav(abuffer: AudioBuffer): Blob {
    const numOfChan = abuffer.numberOfChannels,
      length = abuffer.length * numOfChan * 2 + 44,
      buffer = new ArrayBuffer(length),
      view = new DataView(buffer),
      channels = [],
      sampleRate = abuffer.sampleRate;
    let offset = 0,
      pos = 0;

    function setUint16(data: number) {
      view.setUint16(pos, data, true);
      pos += 2;
    }
    function setUint32(data: number) {
      view.setUint32(pos, data, true);
      pos += 4;
    }

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(sampleRate);
    setUint32(sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded)
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    for (let i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([buffer], { type: "audio/wav" });
  }
}
