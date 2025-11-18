import { useState, FormEvent, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { verifyToken } from '../services/verificationService';
import styles from '../styles/Verify.module.css';

// Cloudflare Turnstile types
declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement | string, options: {
        sitekey: string;
        callback?: (token: string) => void;
        'error-callback'?: () => void;
        'expired-callback'?: () => void;
        theme?: 'light' | 'dark' | 'auto';
        size?: 'normal' | 'compact';
        language?: string;
      }) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export default function Verify() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY || '';

  // Load Cloudflare Turnstile script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        // Render Turnstile widget after script loads
        if (window.turnstile && turnstileContainerRef.current && siteKey) {
          try {
            const widgetId = window.turnstile.render(turnstileContainerRef.current, {
              sitekey: siteKey,
              callback: (token: string) => {
                setTurnstileToken(token);
                setError(null);
              },
              'error-callback': () => {
                setError('Turnstile verification failed. Please try again.');
                setTurnstileToken(null);
              },
              'expired-callback': () => {
                setError('Verification expired. Please verify again.');
                setTurnstileToken(null);
              },
              theme: 'auto',
              size: 'normal',
            });
            turnstileWidgetId.current = widgetId;
          } catch (err) {
            console.error('Error rendering Turnstile:', err);
            setError('Failed to load verification widget. Please refresh the page.');
          }
        }
      };
    } else if (window.turnstile && turnstileContainerRef.current && siteKey && !turnstileWidgetId.current) {
      // Script already loaded, render widget
      try {
        const widgetId = window.turnstile.render(turnstileContainerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            setTurnstileToken(token);
            setError(null);
          },
          'error-callback': () => {
            setError('Turnstile verification failed. Please try again.');
            setTurnstileToken(null);
          },
          'expired-callback': () => {
            setError('Verification expired. Please verify again.');
            setTurnstileToken(null);
          },
          theme: 'auto',
          size: 'normal',
        });
        turnstileWidgetId.current = widgetId;
      } catch (err) {
        console.error('Error rendering Turnstile:', err);
        setError('Failed to load verification widget. Please refresh the page.');
      }
    }

    return () => {
      // Cleanup: remove Turnstile widget when component unmounts
      if (window.turnstile && turnstileWidgetId.current) {
        try {
          window.turnstile.remove(turnstileWidgetId.current);
        } catch (err) {
          console.error('Error removing Turnstile widget:', err);
        }
      }
    };
  }, [siteKey]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!turnstileToken) {
      setError('Please complete the verification challenge.');
      return;
    }

    if (!name.trim() || !email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await verifyToken(turnstileToken, '/verify');

      if (response.success) {
        setSuccess(true);
        setName('');
        setEmail('');
        setMessage('');
        setTurnstileToken(null);
        
        // Reset Turnstile widget
        if (window.turnstile && turnstileWidgetId.current) {
          window.turnstile.reset(turnstileWidgetId.current);
        }
      } else {
        setError(response.error || 'Verification failed. Please try again.');
        // Reset Turnstile widget on failure
        if (window.turnstile && turnstileWidgetId.current) {
          window.turnstile.reset(turnstileWidgetId.current);
        }
        setTurnstileToken(null);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('An error occurred during verification. Please try again.');
      // Reset Turnstile widget on error
      if (window.turnstile && turnstileWidgetId.current) {
        window.turnstile.reset(turnstileWidgetId.current);
      }
      setTurnstileToken(null);
    } finally {
      setLoading(false);
    }
  };

  if (!siteKey) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Verification - MonkeyVerify</title>
        </Head>
        <main className={styles.main}>
          <div className={styles.error}>
            <h1>Configuration Error</h1>
            <p>Cloudflare Turnstile site key is not configured.</p>
            <p>Please set NEXT_PUBLIC_CLOUDFLARE_SITE_KEY environment variable.</p>
            <Link href="/" className={styles.link}>
              ← Back to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Verification - MonkeyVerify</title>
        <meta name="description" content="Cloudflare Turnstile Verification Demo" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <span className={styles.highlight}>MonkeyVerify</span> Demo
        </h1>

        <p className={styles.description}>
          Experience seamless human verification with Cloudflare Turnstile
        </p>

        <div className={styles.card}>
          <h2>Contact Form</h2>
          <p className={styles.subtitle}>
            Fill out the form below. Turnstile will verify you're human automatically.
          </p>

          {success && (
            <div className={styles.success}>
              ✓ Verification successful! Your submission has been received.
            </div>
          )}

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message (optional)"
                rows={4}
                disabled={loading}
              />
            </div>

            <div className={styles.turnstileContainer}>
              <div ref={turnstileContainerRef} className={styles.turnstile}></div>
            </div>

            <button 
              type="submit" 
              className={styles.button}
              disabled={loading || !turnstileToken}
            >
              {loading ? 'Verifying...' : 'Submit'}
            </button>
          </form>
        </div>

        <Link href="/" className={styles.link}>
          ← Back to Home
        </Link>
      </main>
    </div>
  );
}

