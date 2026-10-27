import { useEffect, useRef, useState } from 'react';
import { Camera, ImageUp, QrCode, X } from 'lucide-react';
import type QrScanner from 'qr-scanner';

export function WeddingQrScanner({ onRead, disabled, english }: { onRead: (value: string) => Promise<void>; disabled: boolean; english: boolean }) {
  const video = useRef<HTMLVideoElement>(null), scanner = useRef<QrScanner | null>(null), attempt = useRef(0);
  const [running, setRunning] = useState(false), [starting, setStarting] = useState(false), [error, setError] = useState(''), [processing, setProcessing] = useState(false);
  function stop() { attempt.current++; scanner.current?.destroy(); scanner.current = null; setRunning(false); setStarting(false); }
  useEffect(() => () => { attempt.current++; scanner.current?.destroy(); scanner.current = null; }, []);
  useEffect(() => { if (disabled) stop(); }, [disabled]);
  async function start() {
    const generation = ++attempt.current; setStarting(true); setError('');
    try {
      const { default: Scanner } = await import('qr-scanner');
      if (generation !== attempt.current || !video.current) return;
      const instance = new Scanner(video.current, result => { if (generation !== attempt.current) return; stop(); void onRead(result.data); }, { preferredCamera: 'environment', maxScansPerSecond: 5, returnDetailedScanResult: true });
      scanner.current = instance; await instance.start();
      if (generation !== attempt.current) { instance.destroy(); return; }
      setRunning(true); setStarting(false);
    } catch { if (generation === attempt.current) { stop(); setError(english ? 'Camera unavailable. Allow camera access, choose a QR image or search by name.' : 'No pudimos abrir la cámara. Revisa el permiso, elige una imagen del QR o busca por nombre.'); } }
  }
  async function readFile(file?: File) {
    if (!file) return;
    stop(); setError(''); setProcessing(true);
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('image_too_large');
      const { default: Scanner } = await import('qr-scanner');
      const result = await Scanner.scanImage(file, { returnDetailedScanResult: true });
      await onRead(result.data);
    } catch { setError(english ? 'We could not read this QR. Use a clear image under 10 MB or search by name.' : 'No pudimos leer este QR. Usa una imagen nítida de menos de 10 MB o busca por nombre.'); }
    finally { setProcessing(false); }
  }
  return <div className="boreal-scanner">
    <div className={`boreal-camera${running ? ' is-running' : ''}`}><video ref={video} muted playsInline aria-label={english ? 'QR camera' : 'Cámara del lector QR'}/><div className="boreal-camera-frame" aria-hidden="true"/>{!running && <div className="boreal-camera-placeholder"><QrCode size={42} strokeWidth={1}/><h3>{english ? 'Welcome them in' : 'La bienvenida comienza aquí'}</h3><p>{english ? 'Point the camera at the guest’s pass' : 'Acerca el pase del invitado a la cámara'}</p></div>}</div>
    <button className="workspace-button" disabled={disabled || starting || processing} onClick={running ? stop : () => void start()}>{running ? <X size={17}/> : <Camera size={17}/>} {starting ? (english ? 'Opening camera…' : 'Abriendo cámara…') : running ? (english ? 'Close camera' : 'Cerrar cámara') : (english ? 'Scan QR' : 'Escanear QR')}</button>
    <label className={`boreal-upload${disabled || processing ? ' is-disabled' : ''}`}><ImageUp size={16}/>{processing ? (english ? 'Reading…' : 'Leyendo…') : (english ? 'Read a QR image' : 'Leer una imagen del QR')}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={disabled || processing} onChange={event => { void readFile(event.target.files?.[0]); event.target.value = ''; }}/></label>
    {error && <p role="alert" className="boreal-error">{error}</p>}
    <small>{english ? 'Internet is needed to validate and save each arrival' : 'Se necesita internet para validar y guardar cada llegada'}</small>
  </div>;
}
