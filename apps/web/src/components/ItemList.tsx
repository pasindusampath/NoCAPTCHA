import React from 'react';
import { IItem } from '@nx-mono-repo-deployment-test/shared/src';
import styles from '../styles/ItemList.module.css';

interface ItemListProps {
  items: IItem[];
}

export default function ItemList({ items }: ItemListProps) {
  if (!items || items.length === 0) {
    return <p className={styles.empty}>No items yet. Add one above!</p>;
  }

  return (
    <ul className={styles.list}>
      {items.map((item, index) => (
        <li key={item.id ?? index} className={styles.item}>
          <h4>{item.name}</h4>
          {item.description && <p>{item.description}</p>}
        </li>
      ))}
    </ul>
  );
}
