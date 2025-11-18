import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>MonkeyVerify - Cloudflare Turnstile Demo</title>
        <meta name="description" content="Seamless human verification with Cloudflare Turnstile" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <span className={styles.highlight}>MonkeyVerify</span>
        </h1>

        <p className={styles.description}>
          Experience seamless human verification with Cloudflare Turnstile.
          No puzzles, no CAPTCHAs - just smooth, invisible protection.
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Try It Now</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Click the button below to see Cloudflare Turnstile in action.
              The verification happens automatically in the background.
            </p>
            <Link href="/verify" className={styles.ctaButton}>
              Go to Verification Demo →
            </Link>
          </div>

          <div className={styles.card}>
            <h2>How It Works</h2>
            <ul className={styles.featureList}>
              <li>
                <strong>Frictionless UX</strong>
                <p>Users verify without puzzles or CAPTCHAs</p>
              </li>
              <li>
                <strong>Automatic Verification</strong>
                <p>Turnstile silently generates a token in the background</p>
              </li>
              <li>
                <strong>Secure Backend</strong>
                <p>Server-side validation with Cloudflare API</p>
              </li>
              <li>
                <strong>Metrics Tracking</strong>
                <p>All verification attempts are logged for analytics</p>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <h3>🛡️ Cloudflare Turnstile</h3>
            <p>Advanced bot protection</p>
          </div>
          <div className={styles.feature}>
            <h3>📊 Metrics Tracking</h3>
            <p>Comprehensive analytics</p>
          </div>
          <div className={styles.feature}>
            <h3>⚡ Fast & Seamless</h3>
            <p>Zero user friction</p>
          </div>
        </div>
      </main>
    </div>
  );
}
