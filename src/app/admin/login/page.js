'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      router.push('/admin');
    } else {
      setError('Login gagal. Cek username dan password.');
    }
  };

  return (
    <main className="admin-page" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'}}>
      <div className="ios-card" style={{width: '100%', maxWidth: '400px'}}>
        <div className={styles.loginContainer}>
          <h1 className={styles.title}>Admin Login</h1>
          
          <form onSubmit={handleLogin} style={{width: '100%'}}>
            <div className={styles.inputGroup}>
              <input 
                type="text" 
                placeholder="Username" 
                className={styles.input}
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className={styles.inputGroup}>
              <input 
                type="password" 
                placeholder="Password" 
                className={styles.input}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && <p style={{color: 'red', textAlign: 'center', marginBottom: '15px'}}>{error}</p>}

            <button type="submit" className={styles.button}>
              Masuk
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
