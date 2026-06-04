import React, { useEffect, useState } from 'react';
import { Typography, List, Card, Spin, message, Badge, Button } from 'antd';
import { CheckCircleOutlined, BellOutlined, ShareAltOutlined, CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { notificationApi, type NotificationDto } from '../api/notificationApi';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getUserNotifications();
      setNotifications(data);
    } catch (error) {
      console.error(error);
      message.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (item: NotificationDto) => {
    if (item.isRead === 0) {
      try {
        await notificationApi.markAsRead(item.id);
        setNotifications(prev => 
          prev.map(noti => noti.id === item.id ? { ...noti, isRead: 1 } : noti)
        );
      } catch (error) {
        console.error(error);
        message.error("Error updating read status.");
      }
    }
    // Chuyển hướng sang trang Topic Paper
    navigate(`/paper?topic_id=${item.topicId}`, { state: { topicName: item.topicName } });
  };

  return (
    <div style={{ padding: '2rem 5%', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <BellOutlined style={{ color: '#f59e0b' }} /> Your Notifications
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          locale={{ emptyText: "You don't have any notifications." }}
          renderItem={(item) => {
            const isUnread = item.isRead === 0;
            const match = item.message.match(/compiled (\d+) new/);
            const count = match ? match[1] : '0';
            const displayMessage = item.message.replace(/compiled \d+ new scientific articles/, 'compiled scientific articles');

            return (
              <List.Item style={{ padding: 0, marginBottom: '1.2rem', border: 'none' }}>
                <Card 
                  hoverable 
                  onClick={() => handleCardClick(item)}
                  style={{ 
                    width: '100%', 
                    borderRadius: '12px',
                    border: isUnread ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                    backgroundColor: isUnread ? '#eff6ff' : '#f8fafc',
                    boxShadow: isUnread ? '0 4px 12px rgba(59, 130, 246, 0.1)' : '0 2px 4px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease'
                  }}
                  styles={{ body: { padding: '16px 24px' } }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch' }}>
                    <div style={{ flex: 1, paddingRight: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        {isUnread && <Badge status="processing" color="#1677ff" />}
                        <h3 style={{ fontSize: '1.4rem', color: '#1d4ed8', margin: 0, fontWeight: 700 }}>
                          {item.topicName}
                        </h3>
                      </div>
                      
                      <div style={{ fontSize: '15px', color: '#334155', marginBottom: '16px', lineHeight: 1.6 }}>
                        {displayMessage}
                      </div>

                      <Text type="secondary" style={{ fontSize: '13px', color: '#94a3b8' }}>
                        {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
                      </Text>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ 
                        width: '100px', 
                        height: '100px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #bae6fd',
                        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5), 0 4px 6px rgba(0,0,0,0.05)',
                        position: 'relative'
                      }}>
                        <div style={{ fontSize: '34px', fontWeight: 800, color: '#1e3a8a', lineHeight: 1, marginTop: '-8px' }}>
                          +{count}
                        </div>
                        <div style={{ 
                          background: 'white', 
                          padding: '2px 14px', 
                          borderRadius: '12px', 
                          fontSize: '12px', 
                          color: '#1e3a8a', 
                          position: 'absolute',
                          bottom: '8px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          fontWeight: 600
                        }}>
                          papers
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </List.Item>
            );
          }}
        />
      )}
    </div>
  );
};

export default NotificationsPage;
