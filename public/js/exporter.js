// Records the invitation as a 1080×1920 video in the browser (MP4 where the browser supports it, otherwise WebM).
import { renderFrame, buildTimeline, W, H } from './engine.js';

export function pickMime() {
  const opts = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  return opts.find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
}

export async function exportVideo(inv, { photo, symbolImage, music, credit, watermark, onProgress, scale = 1 } = {}) {
  const mime = pickMime();
  if (!mime) throw new Error('This browser cannot record video. Please use Chrome, Edge or Safari.');
  const c = document.createElement('canvas'); c.width = Math.round(W * scale); c.height = Math.round(H * scale);
  const g = c.getContext('2d');
  const stream = c.captureStream(30);
  let audioCtx, audioEl;
  if (music) {
    try {
      audioCtx = new AudioContext(); audioEl = new Audio(music); audioEl.crossOrigin = 'anonymous'; audioEl.loop = true;
      const src = audioCtx.createMediaElementSource(audioEl), dest = audioCtx.createMediaStreamDestination();
      src.connect(dest); dest.stream.getAudioTracks().forEach((tr) => stream.addTrack(tr));
      await audioEl.play();
    } catch { /* video without music */ }
  }
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
  const chunks = []; rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const tl = buildTimeline(inv), total = tl.duration + 0.8;
  const done = new Promise((res) => (rec.onstop = res));
  rec.start(250);
  const t0 = performance.now();
  await new Promise((resolve) => {
    const step = () => {
      const t = (performance.now() - t0) / 1000;
      g.setTransform(scale, 0, 0, scale, 0, 0);
      renderFrame(g, inv, Math.min(t, tl.duration - 0.01), { timeline: tl, photo, symbolImage, credit, watermark });
      onProgress?.(Math.min(1, t / total));
      if (t >= total) return resolve();
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  rec.stop(); await done;
  audioEl?.pause(); audioCtx?.close();
  return new Blob(chunks, { type: mime.split(';')[0] });
}
