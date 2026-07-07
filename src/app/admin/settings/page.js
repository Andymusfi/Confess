'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css'; // Reuse styles

export default function SettingsPage() {
  const canvasRef = useRef(null);
  const bgImageRef = useRef(null);
  
  // Dummy message for previewing
  const activeMessage = {
    to_name: 'Doyoung NCT',
    from_name: 'Your Secret Admirer',
    message_text: 'Tolong semangat terus ya! Aku selalu dukung kamu dari jauh. Jaga kesehatan dan jangan lupa istirahat yang cukup. You are doing great!',
  };

  const [coords, setCoords] = useState({
    rotation: 6,
    maxWidth: 750,
    toX: 465, toY: 676,
    fromX: 524, fromY: 755,
    msgX: 200, msgY: 1034,
    toFontSize: 50,
    fromFontSize: 50,
    fontSize: 45,
    lineHeight: 65,
    letterSpacing: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem('canvasCoords');
    if (saved) {
      try {
        setCoords(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved coords", e);
      }
    }

    const img = new Image();
    img.src = '/MTXX_ai_image_restoration_batch_1783420782979.png';
    img.onload = () => {
      bgImageRef.current = img;
      setCoords(prev => ({...prev}));
    };
    img.onerror = () => {
      bgImageRef.current = 'error';
      setCoords(prev => ({...prev}));
    };
  }, []);

  const saveSettings = () => {
    localStorage.setItem('canvasCoords', JSON.stringify(coords));
    alert('Pengaturan tata letak dan rotasi berhasil disimpan!');
  };

  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !bgImageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    
    canvas.width = 1080;
    canvas.height = 1920;
    
    if (bgImageRef.current === 'error') {
      ctx.fillStyle = '#2a5d8f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fdfbf7';
      ctx.fillRect(100, 300, 880, 1000);
    } else {
      ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height);
    }
    
    ctx.save();
    ctx.translate(540, 960);
    ctx.rotate((coords.rotation * Math.PI) / 180);
    ctx.translate(-540, -960);

    ctx.fillStyle = '#1a0000'; // Dark brown pirate theme
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Set letter spacing if supported
    if (ctx.letterSpacing !== undefined) {
      ctx.letterSpacing = `${coords.letterSpacing || 0}px`;
    }
    
    ctx.font = `bold ${coords.toFontSize || 50}px "Courier New", Courier, monospace`;
    ctx.fillText(activeMessage.to_name, coords.toX, coords.toY);
    
    ctx.font = `bold ${coords.fromFontSize || 50}px "Courier New", Courier, monospace`;
    ctx.fillText(activeMessage.from_name, coords.fromX, coords.fromY);
    
    ctx.font = `bold ${coords.fontSize}px "Courier New", Courier, monospace`;
    
    const text = activeMessage.message_text || '';
    let y = coords.msgY;
    const words = text.split(' ');
    let line = '';
    
    for (let n = 0; n < words.length; n++) {
      let word = words[n];
      let wordWidth = ctx.measureText(word).width;
      
      // Jika satu kata lebih panjang dari batas, pecah kata tersebut per karakter
      if (wordWidth > coords.maxWidth) {
        if (line !== '') {
          ctx.fillText(line, coords.msgX, y);
          y += coords.lineHeight;
          line = '';
        }
        
        let currentPart = '';
        for (let i = 0; i < word.length; i++) {
          let testPart = currentPart + word[i];
          if (ctx.measureText(testPart).width > coords.maxWidth) {
            ctx.fillText(currentPart, coords.msgX, y);
            y += coords.lineHeight;
            currentPart = word[i];
          } else {
            currentPart = testPart;
          }
        }
        line = currentPart + ' ';
      } else {
        // Proses kata normal
        let testLine = line + word + ' ';
        let metrics = ctx.measureText(testLine);
        
        if (metrics.width > coords.maxWidth && line !== '') {
          ctx.fillText(line, coords.msgX, y);
          line = word + ' ';
          y += coords.lineHeight;
        } else {
          line = testLine;
        }
      }
    }
    ctx.fillText(line, coords.msgX, y);
    
    ctx.restore();
  }, [coords, activeMessage]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleCoordChange = (e) => {
    setCoords({ ...coords, [e.target.name]: parseInt(e.target.value) || 0 });
  };

  const TuningControl = ({ label, name, value, min, max }) => (
    <div className={styles.tuningControl}>
      <label className={styles.tuningLabel}>{label}</label>
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <input 
          type="range" 
          name={name} 
          min={min} 
          max={max} 
          value={value} 
          onChange={handleCoordChange} 
          className={styles.rangeInput}
        />
        <input 
          type="number" 
          name={name} 
          value={value} 
          onChange={handleCoordChange} 
          className={styles.numInput}
        />
      </div>
    </div>
  );

  return (
    <main className="admin-page">
      <div className={styles.dashboard}>
        
        {/* Kolom Kiri: Pengaturan Tata Letak */}
        <div className={styles.card}>
          <div className={styles.header}>
            <h2>Pengaturan Tata Letak</h2>
            <Link href="/admin" style={{
              fontSize: '14px', 
              textDecoration: 'none', 
              background: '#e0e0e5', 
              color: '#333', 
              padding: '6px 12px', 
              borderRadius: '8px',
              fontWeight: 'bold'
            }}>
              ← Kembali
            </Link>
          </div>
          <div className={styles.tuningContainer} style={{maxHeight: '75vh', overflowY: 'auto', paddingRight: '10px'}}>
            <TuningControl label="Rotasi Kertas" name="rotation" value={coords.rotation} min="-45" max="45" />
            <TuningControl label="Batas Kanan Pesan (Lebar Maksimal Teks)" name="maxWidth" value={coords.maxWidth} min="400" max="1000" />
            
            <TuningControl label="TO (Geser Kiri/Kanan)" name="toX" value={coords.toX} min="0" max="1080" />
            <TuningControl label="TO (Atas/Bawah)" name="toY" value={coords.toY} min="0" max="1920" />
            <TuningControl label="Ukuran Font TO" name="toFontSize" value={coords.toFontSize || 50} min="10" max="100" />
            
            <TuningControl label="FROM (Kiri/Kanan)" name="fromX" value={coords.fromX} min="0" max="1080" />
            <TuningControl label="FROM (Atas/Bawah)" name="fromY" value={coords.fromY} min="0" max="1920" />
            <TuningControl label="Ukuran Font FROM" name="fromFontSize" value={coords.fromFontSize || 50} min="10" max="100" />
            
            <TuningControl label="Batas Kiri Pesan (Geser Kiri/Kanan)" name="msgX" value={coords.msgX} min="0" max="1080" />
            <TuningControl label="Posisi Atas Pesan (Geser Atas/Bawah)" name="msgY" value={coords.msgY} min="0" max="1920" />
            <TuningControl label="Ukuran Font PESAN" name="fontSize" value={coords.fontSize} min="10" max="100" />
            <TuningControl label="Jarak Antar Baris PESAN" name="lineHeight" value={coords.lineHeight} min="20" max="150" />
            <TuningControl label="Jarak Antar Huruf (Spasi)" name="letterSpacing" value={coords.letterSpacing || 0} min="-10" max="50" />
            
            <button onClick={saveSettings} className={styles.saveSettingsBtn} style={{marginTop: '20px'}}>
              Simpan Posisi Default
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Preview Gambar dengan Dummy Data */}
        <div className={styles.card}>
          <h2 className={styles.header}>Live Preview</h2>
          
          <div className={styles.previewArea}>
            <div className={styles.canvasWrapper} style={{maxWidth: '380px'}}>
              <canvas ref={canvasRef} className={styles.canvas} />
            </div>
            
            <div style={{background: 'rgba(0,122,255,0.1)', padding: '15px', borderRadius: '12px', textAlign: 'center', width: '100%'}}>
              <p style={{fontSize: '14px', color: '#0056b3'}}>
                <strong>Info:</strong> Preview ini menggunakan pesan percobaan. 
                Setelah posisi dirasa pas, klik <strong>Simpan</strong> lalu kembali ke halaman Dashboard.
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </main>
  );
}
