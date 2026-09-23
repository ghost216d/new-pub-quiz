import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';

interface Props {
  roomCode: string;
  size?: number;
  className?: string;
}

export const RoomJoinQR: React.FC<Props> = ({ roomCode, size = 132, className = '' }) => {
  const [src, setSrc] = useState('');
  const joinUrl = useMemo(() => {
    const url = new URL(import.meta.env.BASE_URL, window.location.origin);
    url.searchParams.set('room', roomCode);
    url.searchParams.set('role', 'player');
    return url.toString();
  }, [roomCode]);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(joinUrl, { width: size, margin: 1, errorCorrectionLevel: 'M' })
      .then((value) => { if (active) setSrc(value); })
      .catch(() => { if (active) setSrc(''); });
    return () => { active = false; };
  }, [joinUrl, size]);

  if (!src) return null;
  return (
    <img
      src={src}
      width={size}
      height={size}
      className={`rounded-xl border-2 border-amber-900 bg-white p-1 ${className}`}
      alt={`Scan to join pub quiz room ${roomCode}`}
    />
  );
};
