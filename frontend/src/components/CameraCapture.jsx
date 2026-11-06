import { useEffect, useRef, useState } from 'react';

/**
 * Fixes the "camera doesn't turn off" bug from the original app.
 *
 * What was wrong before: the stream's tracks were only stopped when the
 * Cancel/Capture buttons were clicked. If the modal closed any other way
 * (unmount, navigating to another page, re-opening the camera while one
 * was already active, the browser tab being backgrounded), the stream kept
 * running and the camera's hardware light stayed on.
 *
 * The fix here:
 *  1. release() stops every track AND clears video.srcObject = null —
 *     some browsers keep the light on until the element itself lets go of
 *     the stream, not just the track.
 *  2. any existing stream is released BEFORE a new one is requested.
 *  3. a useEffect cleanup calls release() on unmount — so navigating away
 *     or closing the modal via the backdrop/Escape also turns the camera off.
 *  4. the stream is released when the tab is hidden (visibilitychange),
 *     and re-requested if the user comes back while the modal is still open.
 */
export default function CameraCapture({ open, onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');

  function release() {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  async function start() {
    setError('');
    release(); // never let two streams be open at once
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setError('Could not access camera. Please allow camera permission and try again.');
    }
  }

  useEffect(() => {
    if (open) start();
    return release; // covers unmount AND `open` flipping back to false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    function onVisibility() {
      if (document.hidden) {
        release();
      } else if (open) {
        start();
      }
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 300;
    canvas.height = video.videoHeight || 220;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    release();
    onCapture(dataUrl);
  }

  function cancel() {
    release();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="webcam-box" onClick={cancel}>
      <div className="webcam-inner" onClick={(e) => e.stopPropagation()}>
        <div className="table-title" style={{ marginBottom: 10 }}>📸 Take item photo</div>
        {error ? (
          <div style={{ color: 'var(--red)', fontSize: 13, padding: '20px 10px' }}>{error}</div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted width="300" height="220" />
        )}
        <div className="webcam-actions">
          <button className="btn btn-gold" onClick={capture} disabled={!!error}>📸 Capture</button>
          <button className="btn btn-outline" onClick={cancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
