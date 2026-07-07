'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const [messages, setMessages] = useState([]);
  const [activeMessage, setActiveMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // Default tampilkan yang belum selesai

  const canvasRef = useRef(null);
  const bgImageRef = useRef(null);
  const router = useRouter();

  const [coords, setCoords] = useState({
    rotation: 3,
    maxWidth: 755,
    toX: 283, toY: 1011,
    fromX: 291, fromY: 893,
    msgX: 94, msgY: 1199,
    toFontSize: 41,
    fromFontSize: 40,
    fontSize: 35,
    lineHeight: 47,
    letterSpacing: -1,
  });

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setMessages(data.messages || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
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

  const drawCanvas = useCallback(() => {
    if (!activeMessage || !canvasRef.current || !bgImageRef.current) return;
    
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

    ctx.fillStyle = '#1a0000'; // Dark brown/black for pirate theme
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
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
  }, [activeMessage, coords]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `menfess-${activeMessage.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleMarkAsPosted = async () => {
    if (!activeMessage) return;
    
    try {
      const res = await fetch(`/api/messages/${activeMessage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'posted' })
      });
      
      if (res.ok) {
        setMessages(messages.map(m => m.id === activeMessage.id ? { ...m, status: 'posted' } : m));
        setActiveMessage({ ...activeMessage, status: 'posted' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <main className="admin-page"><p>Loading...</p></main>;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch(err) {
      console.error(err);
    }
  };

  // Saring pesan berdasarkan filter
  const filteredMessages = messages.filter(m => filter === 'all' || m.status === filter);

  return (
    <main className="admin-page">
      <div className={styles.dashboard} style={{maxWidth: '1000px'}}>
        
        {/* Kolom 1: Daftar Pesan */}
        <div className={`${styles.card} ${styles.messageListCard} ${activeMessage ? styles.hiddenOnMobile : ''}`}>
          <div className={styles.header} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h2>Daftar Pesan Masuk</h2>
            <button onClick={handleLogout} style={{
              background: '#ff3b30', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
            }}>Keluar</button>
          </div>
          
          {/* Tabs Sortir/Filter */}
          <div className={styles.filterTabs}>
            <button 
              className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => { setFilter('all'); setActiveMessage(null); }}
            >
              Semua
            </button>
            <button 
              className={`${styles.filterBtn} ${filter === 'pending' ? styles.active : ''}`}
              onClick={() => { setFilter('pending'); setActiveMessage(null); }}
            >
              Belum Selesai
            </button>
            <button 
              className={`${styles.filterBtn} ${filter === 'posted' ? styles.active : ''}`}
              onClick={() => { setFilter('posted'); setActiveMessage(null); }}
            >
              Selesai
            </button>
          </div>

          <div className={styles.messageList}>
            {filteredMessages.length === 0 ? (
              <p style={{textAlign: 'center', color: '#888', marginTop: '20px'}}>
                Tidak ada pesan.
              </p>
            ) : null}
            {filteredMessages.map(msg => (
              <div 
                key={msg.id} 
                className={`${styles.messageItem} ${activeMessage?.id === msg.id ? styles.active : ''}`}
                onClick={() => setActiveMessage(msg)}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <strong>ID: {msg.id}</strong>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    {msg.song && <span title={`Song: ${msg.song}`} style={{fontSize: '16px'}}>🎵</span>}
                    <span className={`${styles.statusBadge} ${msg.status === 'posted' ? styles.statusPosted : styles.statusPending}`}>
                      {msg.status === 'posted' ? 'Selesai' : 'Pending'}
                    </span>
                  </div>
                </div>
                <div style={{marginTop: '5px'}}><strong>To:</strong> {msg.to_name}</div>
                <div style={{fontSize: '0.8rem', color: '#666', marginTop: '5px'}}>
                  {new Date(msg.created_at).toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom 2: Preview Gambar & Aksi */}
        <div className={`${styles.card} ${styles.previewCard} ${activeMessage ? styles.activeOnMobile : ''}`}>
          {activeMessage && (
            <button className={styles.mobileBackBtn} onClick={() => setActiveMessage(null)}>
              ⬅ Kembali
            </button>
          )}
          <div className={styles.header}>
            <h2>Preview Gambar</h2>
            {/* Tombol Pindah Halaman Pengaturan */}
            <Link href="/admin/settings" style={{
              fontSize: '14px', 
              textDecoration: 'none', 
              background: '#007aff', 
              color: 'white', 
              padding: '6px 12px', 
              borderRadius: '8px',
              fontWeight: 'bold'
            }}>
              ⚙️ Pengaturan
            </Link>
          </div>
          
          {activeMessage ? (
            <div className={styles.previewArea}>
              
              <div className={styles.canvasWrapper}>
                <canvas ref={canvasRef} className={styles.canvas} />
              </div>
              
              {activeMessage.song && (
                <div className={styles.songInfoBox}>
                  <strong>🎵 Lagu Request:</strong> {activeMessage.song}
                </div>
              )}

              <div className={styles.actionButtons}>
                <button className={`${styles.actionBtn} ${styles.downloadBtn}`} onClick={handleDownload}>
                  Download Gambar
                </button>
                {activeMessage.status !== 'posted' && (
                  <button className={`${styles.actionBtn} ${styles.markBtn}`} onClick={handleMarkAsPosted}>
                    Tandai "Selesai"
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className={styles.emptyPreview}>
              <p>Pilih pesan dari daftar di sebelah kiri untuk melihat hasil.</p>
            </div>
          )}
        </div>
        
      </div>

      {/* Bottom Navbar for Mobile */}
      <div className={styles.mobileNav}>
        <button 
          className={`${styles.mobileNavBtn} ${filter === 'all' ? styles.mobileNavActive : ''}`}
          onClick={() => { setFilter('all'); setActiveMessage(null); }}
        >
          📄 Semua
        </button>
        <button 
          className={`${styles.mobileNavBtn} ${filter === 'pending' ? styles.mobileNavActive : ''}`}
          onClick={() => { setFilter('pending'); setActiveMessage(null); }}
        >
          ⏳ Belum
        </button>
        <button 
          className={`${styles.mobileNavBtn} ${filter === 'posted' ? styles.mobileNavActive : ''}`}
          onClick={() => { setFilter('posted'); setActiveMessage(null); }}
        >
          ✅ Selesai
        </button>
      </div>
    </main>
  );
}
