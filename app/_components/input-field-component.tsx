'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EyeIcon, EyeSlashIcon, XCircleIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { singleInvocationThrottle } from '@/app/_lib/utils/shared-library';
import { ANIMATION_TOGGLE_SEGMENT_DURATION } from '@/app/_lib/utils/constants';
import styles from '@/app/_styles/modules/input-field.module.scss';

/*
ALL PROP DESCRIPTIONS
type: to specify special input types (ie. password)
name: The name value for the input field
placeholder: store placeholder text in ::before pseudo-element
errorMessage: error message to be displayed for invalid input
errorOnly: When you don't want to display input-level errors, but instead capture general errors (eg. invalid credentials during authentication)
initialValue: An input field that you want have initial values before modification
readOnlyValue: An input field that you want to be read-only (no modifications possible)
canCopy: Whether the copy icon should be displayed. This allows you to copy the contents of the input field to your clipboard
showValues: Shared values from a parent component and used with multiple password-type input fields to indicate whether the values for all related components should be visible/hidden
setShouldShowValues: Paired with `showValues`, this is a function from a parent component that should toggle the `showValues` state and affect all related components (a use case is if you want a single toggle to hide/show both field values for password and confirm password components)
*/
interface BaseInputFieldProps {
  type?: string;
  name: string;
  placeholder: string;
}

/*
CONDITIONAL PROPS DEFINITION
Either errorMessage (with optional initialValue) | errorOnly (with optional initialValue) | both readOnlyValue and canCopy

COMBINED WITH

Either (readOnlyValue & canCopy) | (showValues & setShouldShowValues)
*/
type ConfiguredInputFieldProps = BaseInputFieldProps &
(
  | { errorMessage?: string | undefined; errorOnly?: never; initialValue?: string | undefined; readOnlyValue?: never; canCopy?: never }
  | { errorMessage?: never; errorOnly?: string | undefined;  initialValue?: string | undefined; readOnlyValue?: never; canCopy?: never }
  | { errorMessage?: never; errorOnly?: never;  initialValue?: string | undefined; readOnlyValue?: never; canCopy?: never }
  | { errorMessage?: never; errorOnly?: never;  initialValue?: never; readOnlyValue?: string; canCopy?: boolean }
) &
(
  | {
    readOnlyValue?: string;
    canCopy?: boolean;
    showValues?: never;
    setShouldShowValues?: never;
  }
  | {
    readOnlyValue?: never;
    canCopy?: never;
    showValues: boolean;
    setShouldShowValues: React.Dispatch<React.SetStateAction<boolean>>;
  }
);

export default function InputField({ type, name, placeholder, errorMessage, errorOnly, initialValue, readOnlyValue = '', canCopy, showValues = false, setShouldShowValues }: ConfiguredInputFieldProps) {
  const [value, setValue] = useState(initialValue || readOnlyValue);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(showValues);

  const [showCheckIcon, setShowCheckIcon] = useState(false);
  
  const inputElementRef = useRef<HTMLInputElement>(null);
  const copyIconAreaElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialValue) {
      setValue(initialValue);
    } else if (readOnlyValue) {
      setValue(readOnlyValue);
    }
  }, [initialValue, readOnlyValue]); // Trigger the effect whenever initialValue or readOnlyValue changes

  const handleChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setValue(target.value);
  }, []);

  const handleFocus = useCallback(() => {
    setIsInputFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsInputFocused(false);
  }, []);

  // Memoize the throttled function using useMemo
  const throttledCopyToClipboard = useMemo(() => {
    return singleInvocationThrottle(async () => {
      /**
       * These functions handle the icon animation
       * A class is added which toggles the icons using scale and transitions
       * The set timeouts are used to control when each stage of the 'animation' fires
       */
      copyIconAreaElementRef.current?.classList.add(styles.transitionDisappear);

      setTimeout(() => {
        setShowCheckIcon(true);
        copyIconAreaElementRef.current?.classList.remove(styles.transitionDisappear);
      }, ANIMATION_TOGGLE_SEGMENT_DURATION);

      setTimeout(() => {
        copyIconAreaElementRef.current?.classList.add(styles.transitionDisappear);
      }, (ANIMATION_TOGGLE_SEGMENT_DURATION * 3));

      setTimeout(() => {
        setShowCheckIcon(false);
        copyIconAreaElementRef.current?.classList.remove(styles.transitionDisappear);
      }, ANIMATION_TOGGLE_SEGMENT_DURATION * 4);

      // Copy the text to the clipboard
      try {
        inputElementRef.current?.setSelectionRange(0, 0);// prevents input value flickers
        await navigator.clipboard.writeText(value);
      } catch (error) {
        console.error('Failed to copy content to the clipboard: ', error);
      }
    }, ANIMATION_TOGGLE_SEGMENT_DURATION * 5);
  }, [value]);

  const copyToClipboard = useCallback(() => {
    throttledCopyToClipboard();
  }, [throttledCopyToClipboard]);

  const togglePasswordVisibility = useCallback(() => {
    if (setShouldShowValues) {
      setShouldShowValues(!showValues);
    } else {
      setShowPassword((prev: boolean) => !prev);
    }
    
    requestAnimationFrame(() => {inputElementRef.current?.focus()});
  }, [showValues, setShouldShowValues]);
  
  const clearInput = useCallback(() => {
    setValue('');

    requestAnimationFrame(() => {inputElementRef.current?.focus()});
  }, []);

  return (
    <label
      htmlFor={name}
      data-placeholder={placeholder}
      className={clsx(
        styles['input-box'],
        {
          [styles.error]: errorOnly || errorMessage,
          [styles['focus-move']]: readOnlyValue || value || isInputFocused,
          [styles['focus-color']]: isInputFocused && !readOnlyValue
        }
      )}
    >
      <input
        className={styles.input}
        {...(
          (type === 'password') ? (
            (showPassword || showValues) ? { type: 'text' } : { type: 'password' }
          ) : { type }
        )}
        {...(
          readOnlyValue ? { readOnly: true, value: readOnlyValue } : {}
        )}
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        ref={inputElementRef}
      />
      {
        (canCopy) ? (
          <div className={styles['icon-area']} onMouseDown={copyToClipboard} ref={copyIconAreaElementRef}>
            <div>
              {showCheckIcon ? (
                <CheckIcon />
              ): (
                <DocumentDuplicateIcon />
              )}
            </div>
          </div>
        ) : (
          (!readOnlyValue) ? (
            (type === 'password') ? (
              <div className={styles['icon-area']} onMouseDown={togglePasswordVisibility}>
                {(showPassword || showValues) ? (
                  <EyeSlashIcon />
                ) :
                (<EyeIcon />)}
              </div>
            ) :
            (isInputFocused && value) ? (
              <div className={styles['icon-area']} onMouseDown={clearInput}>
                <XCircleIcon />
              </div>
            ) : null
          ) : null
        )
      }
      {errorMessage &&
        <div className={styles['error-message']}>{errorMessage}</div>
      }
    </label>
  );
}
