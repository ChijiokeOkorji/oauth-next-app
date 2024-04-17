import styles from '@/app/_styles/modules/form.module.scss';

// title prop displays a form title
// action prop performs an action when the form is submitted
interface FormProps {
  children:  React.ReactNode;
  title?: string;
  // eslint-disable-next-line no-unused-vars
  action(payload: FormData): void;
}

export default function Form({ children, title, action }: FormProps) {
  return (
    <form className={styles.form} action={action}>
      {title && <div className={styles.title}>{title}</div>}

      {children}
    </form>
  );
}
