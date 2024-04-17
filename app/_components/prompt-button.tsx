import Link from 'next/link';
import Button from '@/app/_components/button';
import styles from '@/app/_styles/modules/prompt-button.module.scss';

interface PromptButtonProps {
  href: string;
  prompt: string;
  buttonLabel: string;
}

export default function PromptButton({ href, prompt, buttonLabel }: PromptButtonProps) {
  return (
    <div className={styles['prompt-button-area']}>
      <span>{prompt}</span>

      <Link href={href}>
        <Button type="text" label={buttonLabel} />
      </Link>
    </div>
  );
}
