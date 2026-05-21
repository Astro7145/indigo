'use client';

import Input from './Input';
import EyeButton from './inputButtons/EyeButton';
import { useState } from 'react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'typing';
}

export default function PasswordInput({ ...props }: PasswordInputProps) {
  const [hide, setHide] = useState(true);

  return (
    <Input
      type={hide ? 'password' : 'text'}
      iconRight={<EyeButton hide={hide} onClick={() => setHide((prev) => !prev)} />}
      {...props}
    />
  );
}
