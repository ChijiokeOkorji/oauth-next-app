'use client'

import { useFormStatus } from 'react-dom';
import styles from '@/app/_styles/modules/button.module.scss';

/*
BUTTON TYPES
contained (default)
outlined
text
*/
interface ButtonProps {
  type?: 'contained' | 'outlined' | 'text';
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export default function Button({ type = 'contained', label, onClick }: ButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button 
      className={styles[type]}
      onClick={onClick}
      disabled={pending}
    >
      <span className={styles.label}>{label.toUpperCase()}</span>
    </button>
  );
}
