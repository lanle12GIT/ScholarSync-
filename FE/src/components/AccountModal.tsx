import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Form, Input, Button, message, Spin } from 'antd';
import { UserOutlined, SafetyOutlined, KeyOutlined } from '@ant-design/icons';
import { authApi } from '../api/authApi';

interface AccountInfo {
  userName: string;
  email: string;
  createdAt: string | null;
}

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}

const formatDate = (value: string | null): string => {
  if (!value) return '--';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '--';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const AccountModal: React.FC<AccountModalProps> = ({ open, onClose }) => {
  const [info, setInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    authApi.getMe()
      .then((data: any) => setInfo(data))
      .catch((err) => console.error('Failed to load account info:', err))
      .finally(() => setLoading(false));
  }, [open]);

  const handleChangePassword = async (values: any) => {
    setSubmitting(true);
    try {
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Password updated successfully!');
      form.resetFields();
      onClose(); // đóng modal sau khi đổi mật khẩu thành công
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : (err?.message || 'Failed to update password.');
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#040507', letterSpacing: '0.05em', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.0rem',  fontWeight: 500, color: '#7c7e81' }}>{value}</div>
    </div>
  );

  const profileTab = (
    loading ? (
      <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin /></div>
    ) : (
      <div style={{ paddingTop: '8px' }}>
        <Row label="Email" value={info?.email || '--'} />
        {/* Hiển thị USERNAME thay cho ROLE */}
        <Row label="UserName" value={info?.userName || '--'} />
        <Row label="Registration date" value={formatDate(info?.createdAt ?? null)} />
      </div>
    )
  );

  const passwordTab = (
    <Form form={form} layout="vertical" onFinish={handleChangePassword} style={{ paddingTop: '8px' }}>
      <Form.Item
        label={<span style={{ fontSize: '0.9rem',  fontWeight: 500, color: '#040507' }}>Current password</span>}
        name="currentPassword"
        rules={[{ required: true, message: 'Please enter your current password' }]}
      >
        <Input.Password placeholder="Enter current password" />
      </Form.Item>
      <Form.Item
        label={<span style={{ fontSize: '0.9rem',  fontWeight: 500, color: '#040507' }}>New password</span>}
        name="newPassword"
        rules={[{ required: true, min: 6, message: 'Please enter your current password.' }]}
      >
        <Input.Password placeholder="******" />
      </Form.Item>
      <Form.Item
        label={<span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#040507' }}>Confirm new password</span>}
        name="confirmPassword"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: 'Please confirm the new password' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
              return Promise.reject(new Error('Passwords do not match'));
            },
          }),
        ]}
      >
        <Input.Password placeholder="*******" />
      </Form.Item>
      <Button
        type="primary"
        htmlType="submit"
        block
        loading={submitting}
        style={{ background: '#2563eb', height: '42px', fontWeight: 600, borderRadius: '8px' }}
      >
        Update password
      </Button>
    </Form>
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={460}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#3a6ee7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserOutlined style={{ color: '#fff', fontSize: '18px' }} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#0d0d0e', lineHeight: 1.2 }}>Account</div>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 400 }}>{info?.email || ''}</div>
          </div>
        </div>
      }
    >
      <Tabs
        defaultActiveKey="profile"
        items={[
          { key: 'profile', label: <span><SafetyOutlined /> Profile</span>, children: profileTab },
          { key: 'password', label: <span><KeyOutlined /> Change password</span>, children: passwordTab },
        ]}
      />
    </Modal>
  );
};

export default AccountModal;
