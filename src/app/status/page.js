'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from '../page.module.css';

export default function StatusPage() {
  const [trackId, setTrackId] = useState('');
  const [result, setResult] = useState(null); 

  const checkStatus = async (e) => {
    e.preventDefault();
    if (!trackId.trim()) return;
    
    setResult('loading');
    try {
      const res = await fetch(`/api/messages/${trackId.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data.message);
      } else {
        setResult('not_found');
      }
    } catch (err) {
      console.error(err);
      setResult('not_found');
    }
  };

  return (
    <main className={styles.wrapper}>
      {/* Background Layer */}
      <img src="/Pubb/Pubb/tampil%20user/Tampilanbelakang.png" alt="Background" className={styles.layer} style={{zIndex: 1, filter: 'blur(5px)'}} />
      
      {/* Middle Layer */}
      <img src="/Pubb/Pubb/tampil%20user/Tampilandepan.png" alt="Middle Layer" className={styles.layer} style={{zIndex: 2, filter: 'blur(5px)'}} />
      
      {/* Interactive Area */}
      <div className={styles.interactiveArea}>
        <div className={styles.resultBox} style={{display: 'flex', flexDirection: 'column'}}>
          
          <h2 style={{fontFamily: '"Courier New", Courier, serif', fontSize: '2.5rem', color: '#1a0000', textShadow: '1px 1px 2px rgba(255,255,255,0.5)', letterSpacing: '2px', fontWeight: 'bold', marginBottom: '15px'}}>CEK STATUS</h2>
          
          <form onSubmit={checkStatus} style={{display: 'flex', flexDirection: 'column', gap: '15px'}} suppressHydrationWarning>
            <input 
              type="text" 
              style={{
                width: '100%', padding: '15px', background: '#eae2d1', border: '2px dashed #8b7355', borderRadius: '8px',
                fontFamily: '"Courier New", monospace', fontSize: '18px', fontWeight: 'bold', color: '#4a3b2c',
                textAlign: 'center', outline: 'none'
              }} 
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              placeholder="Masukkan ID Pesan..."
              required
              suppressHydrationWarning
            />
            <button type="submit" className={styles.actionBtn} suppressHydrationWarning>
              {result === 'loading' ? 'MENGECEK...' : 'CARI ID'}
            </button>
          </form>

          {result && result !== 'loading' && result !== 'not_found' && (
            <div style={{marginTop: '25px', background: 'rgba(255,255,255,0.4)', padding: '15px', borderRadius: '8px', border: '1px solid #d3c4a8'}}>
              <h3 style={{
                  color: result.status === 'posted' ? '#185a28' : '#8c7300', 
                  fontFamily: '"Courier New", Courier, serif',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  textAlign: 'center'
                }}>
                  STATUS: {result.status === 'posted' ? 'SUDAH DIPOSTING!' : 'BELUM DIPOSTING'}
              </h3>
              
              {result.status === 'posted' && (
                <div style={{marginTop: '15px', fontSize: '0.9rem', color: '#185a28', background: 'rgba(255,255,255,0.6)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(24,90,40,0.2)', fontFamily: '"Courier New", monospace', fontWeight: 'bold'}}>
                  INFO: Pesan telah diposting admin. ID akan dihapus dalam 2 hari.
                </div>
              )}
              {result.status === 'pending' && (
                <div style={{marginTop: '15px', fontSize: '0.9rem', color: '#8c7300', background: 'rgba(255,255,255,0.6)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(140,115,0,0.2)', fontFamily: '"Courier New", monospace', fontWeight: 'bold'}}>
                  INFO: Pesan kamu masih dalam antrean proses admin.
                </div>
              )}
            </div>
          )}

          {result === 'not_found' && (
            <div style={{marginTop: '20px', color: '#fff', background: '#4e342e', padding: '10px', borderRadius: '8px', textAlign: 'center', fontFamily: '"Courier New", monospace', fontSize: '1.2rem', fontWeight: 'bold', border: '2px solid #1a0000'}}>
              ID PESAN TIDAK DITEMUKAN!
            </div>
          )}
          
          <Link href="/" className={styles.actionBtn} style={{marginTop: '25px', textAlign: 'center', textDecoration: 'none', display: 'block'}}>
            KEMBALI KE FORM
          </Link>
        </div>
      </div>

      {/* Front Layer (Pointer Events None) */}
      <img src="/Pubb/Pubb/tampil%20user/tampilan%20paling%20depan.png" alt="Front Layer" className={`${styles.layer} ${styles.frontLayer}`} style={{filter: 'blur(5px)'}} />
    </main>
  );
}
