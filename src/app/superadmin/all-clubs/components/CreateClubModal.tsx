'use client';

import { useState } from 'react';
import styles from './CreateClubModal.module.css';

const closeIcon = "/images/icons/superadmin/all-clubs/modal-close.svg";

interface CreateClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClubFormData) => void;
}

export interface ClubFormData {
  name: string;
  category: string;
  leader: string;
  description: string;
}

export default function CreateClubModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateClubModalProps) {
  const [formData, setFormData] = useState<ClubFormData>({
    name: '',
    category: '',
    leader: '',
    description: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: '', category: '', leader: '', description: '' });
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
          <h3 className={styles.title}>Create New Club</h3>
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
            <label className={styles.label}>Leader</label>
            <input
              type="text"
              name="leader"
              className={styles.input}
              value={formData.leader}
              onChange={handleChange}
              required
            />
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

          <button type="submit" className={styles.submitButton}>
            Create Club
          </button>
        </form>
      </div>
    </div>
  );
}









