import { useState, useEffect } from 'react';
import Head from 'next/head';
import ItemList from '../components/ItemList';
import AddItemForm from '../components/AddItemForm';
import { fetchItems, createItem } from '../services/itemService';
import { IItem } from '@nx-mono-repo-deployment-test/shared/src';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [items, setItems] = useState<IItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await fetchItems();
      setItems(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleAddItem = async (name: string, description: string): Promise<void> => {
    try {
      const response = await createItem(name, description);
      if (response.success) {
        await loadItems();
      }
    } catch (err) {
      console.error('Failed to add item:', err);
      setError('Failed to add item');
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>NX Monorepo Demo</title>
        <meta name="description" content="NX Monorepo with CI/CD" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <span className={styles.highlight}>NX Monorepo</span>
        </h1>

        <p className={styles.description}>
          A modern monorepo setup with CI/CD for VPS deployment
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Add New Item</h2>
            <AddItemForm onAdd={handleAddItem} />
          </div>

          <div className={styles.card}>
            <h2>Items</h2>
            {loading && <p>Loading...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {!loading && !error && <ItemList items={items} />}
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <h3>🚀 NX Monorepo</h3>
            <p>Powerful build system and tooling</p>
          </div>
          <div className={styles.feature}>
            <h3>⚙️ CI/CD Ready</h3>
            <p>Automated deployments with GitHub Actions</p>
          </div>
          <div className={styles.feature}>
            <h3>🐳 Docker</h3>
            <p>Containerized for easy deployment</p>
          </div>
        </div>
      </main>
    </div>
  );
}
