'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import SplashScreen from './components/SplashScreen';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [showCr, setShowCr] = useState(false);
  const [copyAlert, setCopyAlert] = useState(false);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleInteract = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log('Autoplay blocked:', e));
    }
  };

  const [formData, setFormData] = useState({
    to_name: '',
    from_name: '',
    message_text: '',
    song: ''
  });
  const [status, setStatus] = useState('idle');
  const [trackId, setTrackId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setTrackId(data.id);
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackId);
    setCopyAlert(true);
    setTimeout(() => setCopyAlert(false), 3000);
  };

  return (
    <main className={styles.wrapper} onClick={handleInteract} onTouchStart={handleInteract}>
      <audio ref={audioRef} src="/bg-music.webm" loop />
      {/* Splash Screen */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Custom Copy Toast */}
      {copyAlert && (
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(to bottom, #4e342e, #3e2723)',
          color: '#d7ccc8',
          padding: '15px 20px',
          border: '2px solid #1a0000',
          borderRadius: '8px',
          fontFamily: '"Courier New", Courier, serif',
          fontWeight: 'bold',
          boxShadow: '2px 2px 10px rgba(0,0,0,0.8), inset 0 0 5px rgba(0,0,0,0.8)',
          zIndex: 100,
          textAlign: 'center',
          width: '80%',
          animation: 'toastSlideDown 0.3s ease-out'
        }}>
          <p style={{ margin: 0, textShadow: '1px 1px 2px #000' }}>
            ID BERHASIL DISALIN!<br /><br />
            Simpan ID ini untuk cek balasan atau status menfess kamu:<br />
            <span style={{ color: '#ffcc00', fontSize: '1.2rem' }}>{trackId}</span> aja
          </p>
        </div>
      )}

      {/* Background Layer */}
      <img
        src="/Pubb/Pubb/tampil%20user/Tampilanbelakang.png"
        alt="Background"
        className={styles.layer}
        style={{ zIndex: 1, filter: status === 'success' ? 'blur(5px)' : 'none', transition: 'filter 0.3s ease' }}
      />

      {/* Middle Layer */}
      <img
        src="/Pubb/Pubb/tampil%20user/Tampilandepan.png"
        alt="Middle Layer"
        className={styles.layer}
        style={{ zIndex: 2, filter: status === 'success' ? 'blur(5px)' : 'none', transition: 'filter 0.3s ease' }}
      />

      {/* Interactive Area (Form) */}
      <div className={styles.interactiveArea}>

        {status === 'success' ? (
          <div className={styles.resultBox}>
            <h2 style={{ fontFamily: '"Courier New", Courier, serif', fontSize: '2.5rem', color: '#1a0000', textShadow: '1px 1px 2px rgba(255,255,255,0.5)', letterSpacing: '2px', fontWeight: 'bold' }}>TERKIRIM!</h2>
            <p style={{ fontWeight: 'bold', marginTop: '15px', fontSize: '15px', color: '#4a3b2c' }}>
              Simpan ID ini untuk cek balasan atau status menfess kamu:
            </p>
            <div className={styles.trackId}>{trackId}</div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                className={styles.actionBtn}
                onClick={copyToClipboard}
              >
                Salin ID
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => {
                  setStatus('idle');
                  setFormData({ to_name: '', from_name: '', message_text: '', song: '' });
                }}
              >
                Kirim Lagi
              </button>
            </div>
          </div>
        ) : (
          <form className={styles.formContainer} onSubmit={handleSubmit} suppressHydrationWarning>
            <input
              type="text"
              name="to_name"
              placeholder="Yasasinta pramana"
              className={`${styles.inputBase} ${styles.inputTo}`}
              value={formData.to_name}
              onChange={handleChange}
              required
              suppressHydrationWarning
            />
            <input
              type="text"
              name="from_name"
              placeholder="kamu"
              className={`${styles.inputBase} ${styles.inputFrom}`}
              value={formData.from_name}
              onChange={handleChange}
              suppressHydrationWarning
            />
            <textarea
              name="message_text"
              placeholder="Jangan Lupa Belajar Ya"
              className={`${styles.inputBase} ${styles.inputMsg}`}
              value={formData.message_text}
              onChange={handleChange}
              maxLength={200}
              required
              suppressHydrationWarning
            />
            <div style={{
              position: 'absolute',
              right: '91%', /* align with the right side of textarea */
              top: '73%', /* just below textarea */
              fontSize: '10px',
              color: '#817773ff',
              fontWeight: 'bold'

            }}>
              {formData.message_text.length}/200
            </div>

            <input
              type="text"
              name="song"
              placeholder="Song:"
              className={`${styles.inputBase} ${styles.inputSong}`}
              value={formData.song}
              onChange={handleChange}
              suppressHydrationWarning
            />
            {status === 'error' && <p style={{ position: 'absolute', top: '85%', left: '8%', color: 'red', fontWeight: 'bold', fontSize: '12px' }}>Gagal mengirim, coba lagi.</p>}

            <div className={styles.submitContainer}>
              <button type="submit" className={styles.submitBtn} disabled={status === 'submitting'} suppressHydrationWarning>
                {status === 'submitting' ? 'MENGIRIM...' : 'KIRIM'}
              </button>
              <Link href="/status" className={styles.submitBtn} suppressHydrationWarning>
                CARI ID
              </Link>
            </div>
          </form>
        )}

        <Link href="/rules" className={styles.rulesLink}>Aturan Menfess</Link>
        <button className={styles.crBtn} onClick={() => setShowCr(true)}>CR</button>
      </div>

      {/* Front Layer (Pointer Events None) */}
      <img
        src="/Pubb/Pubb/tampil%20user/tampilan%20paling%20depan.png"
        alt="Front Layer"
        className={`${styles.layer} ${styles.frontLayer}`}
        style={{ filter: status === 'success' ? 'blur(5px)' : 'none', transition: 'filter 0.3s ease' }}
      />

      {/* CR Modal */}
      {showCr && (
        <div className={styles.crModal}>
          <button className={styles.closeCr} onClick={() => setShowCr(false)}>X</button>
          <img src="/Pubb/Pubb/cr%20pembuatan%20website.jpg" alt="Creator" className={styles.crImage} />
        </div>
      )}
    </main>
  );
}
