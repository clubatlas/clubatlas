'use client';

import { useState } from 'react';
import styles from './RequestsTable.module.css';
import RequestDetailsModal from './RequestDetailsModal';
import ResetPasswordModal from './ResetPasswordModal';
import PasswordGeneratedModal from './PasswordGeneratedModal';

const imgIconView = "https://www.figma.com/api/mcp/asset/c4f7ba6a-fefb-4029-a234-a2f05ca54cc3";
const imgIconReset = "https://www.figma.com/api/mcp/asset/754918b3-8efb-4b24-8930-04dd02f16901";

interface PasswordRequest {
  id: string;
  name: string;
  initial: string;
  email: string;
  accountType: string;
  department: string;
  requestTime: string;
  requestDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  clubName?: string;
  role?: string;
  studentId?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  rejectedReason?: string;
}

const allRequests: PasswordRequest[] = [
  {
    id: '1',
    name: 'John Doe',
    initial: 'J',
    email: 'john.doe@email.edu',
    accountType: 'Student',
    department: 'Computer Science',
    requestTime: '2 hours ago',
    requestDate: 'Dec 18, 2025 14:30',
    status: 'PENDING',
    studentId: 'STU202301234'
  },
  {
    id: '2',
    name: 'Jane Smith',
    initial: 'J',
    email: 'jane.smith@email.edu',
    accountType: 'Club Leader',
    department: 'Drama Society',
    requestTime: '5 hours ago',
    requestDate: 'Dec 18, 2025 11:15',
    status: 'PENDING',
    clubName: 'Drama Society',
    role: 'President'
  },
  {
    id: '3',
    name: 'Alex Kim',
    initial: 'A',
    email: 'alex.kim@email.edu',
    accountType: 'Student',
    department: 'Business Administration',
    requestTime: '1 day ago',
    requestDate: 'Dec 17, 2025 09:20',
    status: 'PENDING',
    studentId: 'STU202301233'
  },
  {
    id: '4',
    name: 'Michael Chen',
    initial: 'M',
    email: 'michael.c@email.edu',
    accountType: 'Club Leader',
    department: 'Photography Club',
    requestTime: '2 days ago',
    requestDate: 'Dec 16, 2025 16:45',
    status: 'APPROVED',
    clubName: 'Photography Club',
    role: 'Vice President',
    approvedBy: 'System Admin',
    approvedDate: 'Dec 16, 2025 17:00'
  },
  {
    id: '5',
    name: 'Sarah Wilson',
    initial: 'S',
    email: 'sarah.w@email.edu',
    accountType: 'Student',
    department: 'Engineering',
    requestTime: '3 days ago',
    requestDate: 'Dec 15, 2025 10:30',
    status: 'REJECTED',
    studentId: 'STU202301235',
    rejectedBy: 'System Admin',
    rejectedDate: 'Dec 15, 2025 11:00',
    rejectedReason: 'Unable to verify identity'
  }
];

interface RequestsTableProps {
  filterStatus: 'all' | 'pending' | 'approved' | 'rejected';
}

export default function RequestsTable({ filterStatus }: RequestsTableProps) {
  const [requests, setRequests] = useState<PasswordRequest[]>(allRequests);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isPasswordGeneratedModalOpen, setIsPasswordGeneratedModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PasswordRequest | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const filteredRequests = requests.filter(request => {
    if (filterStatus === 'all') return true;
    return request.status.toLowerCase() === filterStatus;
  });

  const handleView = (id: string) => {
    const request = requests.find(req => req.id === id);
    if (request) {
      setSelectedRequest(request);
      setIsDetailsModalOpen(true);
    }
  };

  const handleReset = (id: string) => {
    const request = requests.find(req => req.id === id);
    if (request) {
      setSelectedRequest(request);
      setIsResetModalOpen(true);
    }
  };

  const handleApprove = () => {
    if (selectedRequest) {
      console.log('Approving request:', selectedRequest.id);
      // Update the request status to APPROVED
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === selectedRequest.id ? { ...req, status: 'APPROVED' } : req
        )
      );
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    if (selectedRequest) {
      const newPassword = generateRandomPassword();
      setGeneratedPassword(newPassword);
      setIsResetModalOpen(false);
      setIsPasswordGeneratedModalOpen(true);
      console.log('Generated password for:', selectedRequest.id, newPassword);
    }
  };

  const handleClosePasswordGeneratedModal = () => {
    setIsPasswordGeneratedModalOpen(false);
    setGeneratedPassword('');
    setSelectedRequest(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableHeader}>
        <div className={styles.headerCell} style={{ width: '205.5px' }}>User Information</div>
        <div className={styles.headerCell} style={{ width: '131.656px' }}>Account Type</div>
        <div className={styles.headerCell} style={{ width: '131.672px' }}>Request Time</div>
        <div className={styles.headerCell} style={{ width: '131.656px' }}>Status</div>
        <div className={styles.headerCell} style={{ width: '205.516px' }}>Actions</div>
      </div>

      <div className={styles.tableBody}>
        {filteredRequests.map((request) => (
          <div key={request.id} className={styles.tableRow}>
            <div className={styles.userCell} style={{ width: '205.5px' }}>
              <div className={styles.avatar}>{request.initial}</div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>{request.name}</div>
                <div className={styles.userEmail}>{request.email}</div>
              </div>
            </div>

            <div className={styles.accountCell} style={{ width: '131.656px' }}>
              <span className={styles.accountBadge}>{request.accountType}</span>
              <div className={styles.department}>{request.department}</div>
            </div>

            <div className={styles.timeCell} style={{ width: '131.672px' }}>
              <div className={styles.requestTime}>{request.requestTime}</div>
              <div className={styles.requestDate}>{request.requestDate}</div>
            </div>

            <div className={styles.statusCell} style={{ width: '131.656px' }}>
              <span className={`${styles.statusBadge} ${styles[request.status.toLowerCase()]}`}>
                {request.status}
              </span>
            </div>

            <div className={styles.actionsCell} style={{ width: '205.516px' }}>
              {request.status === 'PENDING' ? (
                <>
                  <button className={styles.viewButton} onClick={() => handleView(request.id)}>
                    <img src={imgIconView} alt="View" className={styles.buttonIcon} />
                    View
                  </button>
                  <button className={styles.resetButton} onClick={() => handleReset(request.id)}>
                    <img src={imgIconReset} alt="Reset" className={styles.buttonIcon} />
                    Reset
                  </button>
                </>
              ) : (
                <button className={styles.viewOnlyButton} onClick={() => handleView(request.id)}>
                  <img src={imgIconView} alt="View" className={styles.buttonIcon} />
                  View
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedRequest && (
        <>
          <RequestDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            request={selectedRequest}
            onApprove={handleApprove}
          />
          <ResetPasswordModal
            isOpen={isResetModalOpen}
            onClose={() => setIsResetModalOpen(false)}
            request={selectedRequest}
            onGeneratePassword={handleGeneratePassword}
          />
          <PasswordGeneratedModal
            isOpen={isPasswordGeneratedModalOpen}
            onClose={handleClosePasswordGeneratedModal}
            userName={selectedRequest.name}
            userEmail={selectedRequest.email}
            generatedPassword={generatedPassword}
          />
        </>
      )}
    </div>
  );
}

