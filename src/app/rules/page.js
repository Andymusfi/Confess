'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const TypewriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(intervalId);
    }, 50); // Kecepatan mengetik
    
    return () => clearInterval(intervalId);
  }, [text]);

  return <div style={{ whiteSpace: 'pre-wrap', fontFamily: '"Courier New", Courier, monospace', fontWeight: 'bold', color: '#1a0000', fontSize: '11px', textShadow: '1px 1px 0px rgba(255,255,255,0.4)', textAlign: 'left', lineHeight: '1.3', overflow: 'hidden' }}>{displayedText}</div>;
};

export default function RulesPage() {
  
  const rulesText = `1. Gunakan bahasa yang sopan.
2. Dilarang mengirim ujaran kebencian, SARA, atau bullying.
3. Jangan menyebutkan nama lengkap atau informasi pribadi sensitif seseorang.
4. Menfess bersifat anonim, jaga kerahasiaan.
5. Admin berhak menghapus pesan yang melanggar aturan.
6. Harap bersabar menunggu pesan diproses oleh admin.

Terima kasih telah mematuhi aturan ini!`;

  return (
    <main className={styles.wrapper}>
      {/* Background */}
      <img src="/Pubb/Pubb/tampilan%20rules/IMG_20260707_153353.jpg" alt="Background Rules" className={styles.layer} style={{zIndex: 1}} />
      
      {/* Interactive Area */}
      <div className={styles.interactiveArea}>
        
        {/* Typewriter Box */}
        <div className={styles.typewriterBox}>
          <TypewriterText text={rulesText} />
        </div>

        <Link href="/" className={styles.backBtn}>KEMBALI</Link>
      </div>

      {/* Front Layer */}
      <img src="/Pubb/Pubb/tampilan%20rules/tampilan%20paling%20depan.png" alt="Front Layer Rules" className={`${styles.layer} ${styles.frontLayer}`} />
    </main>
  );
}
