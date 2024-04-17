import styles from '@/app/_styles/modules/form-error.module.scss';

interface FormErrorProps {
  errorMessage: string | undefined;
}

export default function FormError({ errorMessage }: FormErrorProps) {
  return (
    <div className={styles['form-error']}>{errorMessage}</div>
  );
}
