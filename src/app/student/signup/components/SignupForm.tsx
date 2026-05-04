'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './SignupForm.module.css';
import { signIn, sendVerificationEmail, logout } from '@/lib/firebase/auth';
import { signupStudent } from '@/lib/api/auth';

const userPlusIcon = "/images/icons/signup/user-plus.svg";
const arrowLeftIcon = "/images/icons/signup/arrow-left.svg";

interface SignupFormProps {
  onVerificationSent?: () => void;
}

export default function SignupForm({ onVerificationSent }: SignupFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters.';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailLower = formData.email.toLowerCase();
    if (!emailLower.endsWith('@concordacademy.org') && !emailLower.endsWith('@gmail.com')) {
      setError('Only @concordacademy.org email addresses are allowed.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions.');
      return;
    }

    setLoading(true);

    try {
      const displayName = `${formData.firstName} ${formData.lastName}`.trim();

      const response = await signupStudent({
        email: formData.email,
        password: formData.password,
        display_name: displayName,
        student_id: formData.studentId || undefined,
      });

      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }

      const userCredential = await signIn(formData.email, formData.password);
      await sendVerificationEmail(userCredential.user);

      await logout();

      setVerificationSent(true);
      onVerificationSent?.();
    } catch (err: any) {
      console.error('Signup error:', err);
      setError('Sign up failed. Please try again.');
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>Check Your Email</h2>
          <p className={styles.subtitle}>A verification link has been sent to your inbox</p>
        </div>
        <div style={{
          padding: '24px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '12px',
          marginBottom: '24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '15px', color: '#166534', marginBottom: '8px', fontWeight: 500 }}>
            📧 Verification email sent to:
          </p>
          <p style={{ fontSize: '14px', color: '#15803d', marginBottom: '16px' }}>
            {formData.email}
          </p>
          <p style={{ fontSize: '13px', color: '#166534' }}>
            Please click the link in the email within <strong>1 hour</strong> to activate your account.
            After verifying, you can sign in.
          </p>
        </div>
        <Link href="/student/login" className={styles.submitButton} style={{ textDecoration: 'none', width: '30%', alignSelf: 'center' }}>
          Go to Sign In
        </Link>
        <Link href="/welcome" className={styles.backLink} style={{ marginTop: '16px' }}>
          <img src={arrowLeftIcon} alt="" className={styles.backIcon} />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Create Account</h2>
        <p className={styles.subtitle}>Fill in your details to get started</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            color: '#c33',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        {/* First Name & Last Name */}
        <div className={styles.nameFields}>
          <div className={styles.fieldGroup}>
            <label htmlFor="firstName" className={styles.label}>
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              className={styles.input}
              placeholder="John"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="lastName" className={styles.label}>
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              className={styles.input}
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className={styles.fieldGroup}>
          <label htmlFor="email" className={styles.label}>
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={styles.input}
            placeholder="student@concordacademy.org"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <p className={styles.hint}>Only @concordacademy.org email addresses are accepted</p>
        </div>

        {/* Student ID */}
        <div className={styles.fieldGroup}>
          <label htmlFor="studentId" className={styles.label}>
            Student ID
          </label>
          <input
            id="studentId"
            name="studentId"
            type="text"
            className={styles.input}
            placeholder="ca*********"
            value={formData.studentId}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password */}
        <div className={styles.fieldGroup}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className={styles.input}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <p className={styles.hint}>
            At least 8 characters with uppercase, lowercase, and numbers
          </p>
        </div>

        {/* Confirm Password */}
        <div className={styles.fieldGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className={styles.input}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        {/* Terms Checkbox */}
        <div className={styles.termsBox}>
          <input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            className={styles.checkbox}
            checked={formData.agreeToTerms}
            onChange={handleChange}
            required
          />
          <label htmlFor="agreeToTerms" className={styles.termsLabel}>
            I agree to the ClubAtlas Terms of Service and Privacy Policy. I understand that my information will be used to create my account and improve my experience on the platform.
          </label>
        </div>

        {/* Submit Button */}
        <button type="submit" className={styles.submitButton} disabled={loading}>
          <img src={userPlusIcon} alt="" className={styles.userIcon} />
          <span>{loading ? 'Creating Account...' : 'Create Student Account'}</span>
        </button>
      </form>

      <div className={styles.divider}></div>

      <div className={styles.footer}>
        <p className={styles.footerText}>Already have an account?</p>
        <Link href="/student/login" className={styles.signinLink}>
          Sign in instead →
        </Link>
      </div>

      <Link href="/welcome" className={styles.backLink}>
        <img src={arrowLeftIcon} alt="" className={styles.backIcon} />
        <span>Back to Home</span>
      </Link>
    </div>
  );
}











