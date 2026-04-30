'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase/auth';
import styles from './CreateClubModal.module.css';

const closeIcon = "/images/icons/superadmin/all-clubs/modal-close.svg";

interface EditClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: {
    id: string;
    name: string;
    description?: string;
    categories: string[];
    activity_type: string[];
    status: string;
  } | null;
  onSuccess: () => void;
}

interface ClubFormData {
  name: string;
  category: string;
  description: string;
  is_active: boolean;
  activity_type: string[];
}

export default function EditClubModal({
  isOpen,
  onClose,
  club,
  onSuccess,
}: EditClubModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ClubFormData>({
    name: '',
    category: '',
    description: '',
    is_active: true,
    activity_type: [],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (club) {
      setFormData({
        name: club.name,
        category: club.categories[0] || '',
        description: club.description || '',
        is_active: club.status === 'active',
        activity_type: club.activity_type || [],
      });
    }
  }, [club]);

  if (!isOpen || !club) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/clubs/${club.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            categories: [formData.category],
            activity_type: formData.activity_type,
            is_active: formData.is_active,
          }),
        }
      );

      if (response.ok) {
        alert('Club updated successfully!');
        onClose();
        onSuccess();
      } else {
        const error = await response.json();
        alert(`Failed to update club: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to update club:', error);
      alert('Failed to update club');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Edit Club</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <img src={closeIcon} alt="Close" className={styles.closeIcon} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Club Name</label>
            <input
              type="text"
              name="name"
              className={styles.input}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Category</label>
            <select
              name="category"
              className={styles.select}
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              <option value="Student Leadership and Media">Student Leadership and Media</option>
              <option value="Cultural Affinity Groups">Cultural Affinity Groups</option>
              <option value="Community Service and Social Justice">Community Service and Social Justice</option>
              <option value="Gender Equity and Sexual Health">Gender Equity and Sexual Health</option>
              <option value="Mental Wellness">Mental Wellness</option>
              <option value="Stem Research and Olympiad">Stem Research and Olympiad</option>
              <option value="Data Science and Engineering">Data Science and Engineering</option>
              <option value="Finance and Economy">Finance and Economy</option>
              <option value="Humanities">Humanities</option>
              <option value="Literature, Language, and Philiology">Literature, Language, and Philiology</option>
              <option value="Visual Arts">Visual Arts</option>
              <option value="Performing Arts">Performing Arts</option>
              <option value="Food, Cooking, Cuisine">Food, Cooking, Cuisine</option>
              <option value="Sports and Recreations">Sports and Recreations</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              name="description"
              className={styles.textarea}
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                style={{ marginRight: '8px' }}
              />
              Active
            </label>
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Club'}
          </button>
        </form>
      </div>
    </div>
  );
}
