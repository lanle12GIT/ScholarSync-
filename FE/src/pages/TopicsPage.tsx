import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, message, Button, Modal, Form, Input, Select, Popconfirm, Popover } from 'antd';
import {PlusOutlined, RightOutlined, DeleteOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import './DashboardPage.css';

import { topicApi } from '../api/topicApi';
import physicsImg from '../assets/images/physics.jpg';
import bioImg from '../assets/images/Quantitative Biology.jpg';
import mathsImg from '../assets/images/maths.jpg';
import csImg from '../assets/images/ComputerScience.jpg';
import qfImg from '../assets/images/Quantitative Finance.jpg';
import statImg from '../assets/images/Statistics.jpg';
import eeImg from '../assets/images/Electrical Engineering and Systems Science.jpg';
import econImg from '../assets/images/Economics.jpg';

// Map topicCateg to image & label based on provided table
const categoryMap: Record<number, { img?: string; label: string; }> = {
  1: { img: physicsImg, label: 'Physics' },
  2: { img: mathsImg, label: 'Mathematics'},
  3: { img: csImg, label: 'Computer Science'},
  4: { img: bioImg, label: 'Quantitative Biology'},
  5: { img: qfImg, label: 'Quantitative Finance'},
  6: { img: statImg, label: 'Statistics'},
  7: { img: eeImg, label: 'Electrical Engineering and Systems Science' },
  8: { img: econImg, label: 'Economics'},
};

const getCategoryImage = (topicCateg?: number) => {
  if (topicCateg && categoryMap[topicCateg]) {
    const { img, label } = categoryMap[topicCateg];
    if (img) {
      return <img src={img} alt={label} style={{ width: '100%', height: '90%', objectFit: 'cover' }} />;
    }
  }
};
interface TopicType {
  id?: string;
  key?: string;
  name: string;
  articlesCount?: number;
  notification?: boolean;
  topicCateg?: number;
  [key: string]: any;
}

const TopicsPage: React.FC = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<TopicType[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryTopics, setCategoryTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [form] = Form.useForm();

  // Lọc danh sách topic đang theo dõi theo tên (client-side)
  const filteredTopics = topics.filter(t =>
    (t.name || '').toLowerCase().includes(searchKeyword.trim().toLowerCase())
  );

  const fetchTopics = async () => {
    try {
      const data: any = await topicApi.getAll();
      const topicsData = Array.isArray(data) ? data : (data.data || data.content || []);
      setTopics(topicsData);
    } catch (err: any) {
      console.error('Error fetching topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategory = async () => {
    try {
      const data: any = await topicApi.getAllCategories();
      const catData = Array.isArray(data) ? data : (data.data || data.content || []);
      setCategories(catData);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => { 
    fetchTopics();
    fetchCategory();
  }, []);

  const handleCardClick = (topic: TopicType) => {
    navigate(`/paper?topic_id=${topic.id}`, { state: { topicName: topic.name } });
  };

  const handleSubjectChange = async (categoryId: number) => {
    try {
      form.setFieldsValue({ topic: undefined, key: undefined }); // Clear selected topic and key when subject changes
      setCategoryTopics([]); // Clear existing topics
      const res: any = await topicApi.getTopicsByCategory(categoryId);
      const data = Array.isArray(res) ? res : (res.data || res.content || []);
      setCategoryTopics(data);
    } catch (error) {
      console.error('Error fetching topics by category:', error);
      message.error('Failed to fetch topics for selected category.');
    }
  };

  const handleTopicChange = (topicId: number) => {
    const selectedTopic = categoryTopics.find(t => t.id === topicId);
    if (selectedTopic && selectedTopic.key) {
      form.setFieldsValue({ key: selectedTopic.key });
    } else {
      form.setFieldsValue({ key: undefined });
    }
  };

  const handleAddTopic = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  const handleModalSubmit = async (values: any) => {
    try {
      if (!values.key) {
        message.error('Please select a Topic to get the Topic Code.');
        return;
      }
      
      // Check if the topic is already in the followed list
      const isAlreadyFollowed = topics.some(t => t.key === values.key);
      if (isAlreadyFollowed) {
        message.warning('This topic is already in your followed list, cannot be added again.');
        setIsModalOpen(false);
        return;
      }

      // Gọi API gửi key lên Backend
      await topicApi.create({ key: values.key });
      
      message.success('Topic added successfully!');
      setIsModalOpen(false);
      fetchTopics(); // Refresh list after adding
    } catch (error: any) {
      console.error('Error adding topic:', error);
      setIsModalOpen(false);
      // Nếu có lỗi từ BE quăng ra (ví dụ: "Topic đã tồn tại...")
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to add topic.';
      message.error(errorMsg);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      await topicApi.delete(topicId);
      message.success('Topic removed from your list successfully!');
      fetchTopics(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting topic:', error);
      message.error('Failed to delete topic.');
    }
  };



  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '85%', margin: '0 auto 24px auto' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', margin: 0 }}>Following Topics</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Popover
            trigger="click"
            placement="bottomRight"
            content={
              <Input
                allowClear
                autoFocus
                placeholder="Enter topic name..."
                prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ width: 260 }}
              />
            }
          >
            <FilterOutlined
              style={{ fontSize: '30px', color: '#2563eb', cursor: 'pointer' }}
              title="Filter topics by name"
            />
          </Popover>
          <Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: '8px', fontWeight: 600 }}
          onClick={() => handleAddTopic()}
          >
            Add Topic
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div className="topics-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '85%', margin: '0 auto' }}>
          {filteredTopics.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>
              {searchKeyword ? `No topics matching "${searchKeyword}".` : 'You are not following any topics yet.'}
            </div>
          ) : filteredTopics.map((topic) => (
            <div key={topic.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                className="topic-card"
                onClick={() => handleCardClick(topic)}
                style={{
                  flex: 1,
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 3px 6px rgba(0, 0, 0, 0.02)',
                  border: '2px solid #eaeaea',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(6px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#bae0ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                  e.currentTarget.style.borderColor = '#eaeaea';
                }}
              >
                {/* Left: Image/Icon */}
                <div className="topic-card-img" style={{ width: '76px', height: '70px', borderRadius: '12px', overflow: 'initial'}}>
                  {getCategoryImage(topic.topicCateg)}
                </div>

                {/* Middle: Title and Key */}
                <div className="topic-card-info" style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                      {topic.name}
                    </h3>
                  </div>
                  {topic.key && (
                    <div style={{ fontSize: '1rem', color: '#4583fdff', marginBottom: '8px' }}>
                      {topic.key}
                    </div>
                  )}
                </div>
                
                {/* Right: Articles Count */}
                <div className="topic-card-count" style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '24px', borderLeft: '1px solid #f3f4f6' }}>
                  <div style={{ color: '#6b7280', fontSize: '1.05rem', marginBottom: '4px' }}>Total paper</div>
                  <div style={{ fontWeight: 700, color: '#17da17ff', fontSize: '1.5rem' }}>{topic.paperCount || 0}</div>
                </div>
                <div
                  className="topic-card-more"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#4069b9',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    padding: '6px 14px',
                    borderRadius: '20px',
                    background: '#eef3ff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#4069b9';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#eef3ff';
                    e.currentTarget.style.color = '#4069b9';
                  }}
                >
                  More <RightOutlined style={{ fontSize: '11px' }} />
                </div>
              </div>

              {/* Action Icons outside the card */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                <Popconfirm
                  title="Are you sure you want to delete this topic?"
                  description={
                    <div style={{ marginTop: '4px' }}>
                      <div style={{ fontWeight: 700, color: '#111827', marginBottom: '4px', fontSize: '16px' }}>
                       "{topic.name}"
                      </div>
                      <div style={{ color: '#ef4444', fontSize: '12px' }}>
                        This action cannot be undone.
                      </div>
                    </div>
                  }
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    if (topic.id) handleDeleteTopic(topic.id);
                  }}
                  onCancel={(e) => e?.stopPropagation()}
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                  placement="left"
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: '36px', height: '36px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '10px',
                      background: '#fff1f0',
                      color: '#cf1322',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#cf1322'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fff1f0'; e.currentTarget.style.color = '#cf1322'; }}
                  >
                    <DeleteOutlined style={{ fontSize: '16px' }} />
                  </div>
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      )} 
      
      {/* Add Topic Modal */}
      <Modal
        title={<div style={{ textAlign: 'center', fontSize: '1.5rem', color: '#1890ff', fontWeight: 700, }}>Add New Topic</div>}
        open={isModalOpen}
        onCancel={handleModalCancel}
        onOk={() => form.submit()}
        okText="Add"
        cancelText="Cancel"
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalSubmit}
          style={{ marginTop: '24px' }}
        >

          <Form.Item
            name="subject"
            label={<span style={{ fontWeight: 600, fontSize: '1.1rem', color: '#374151' }}>Subject</span>}
            rules={[{ required: true, message: 'Please select a subject' }]}
          >
            <Select placeholder="Select a subject" onChange={handleSubjectChange}>
              {categories.map((cat: any) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="topic"
            label={<span style={{ fontWeight: 600, fontSize: '1.1rem', color: '#374151' }}>Topic</span>}
            rules={[{ required: true, message: 'Please select a topic' }]}
          >
            <Select placeholder="Select a topic" disabled={categoryTopics.length === 0} onChange={handleTopicChange}>
              {categoryTopics.map((t: any) => (
                <Select.Option key={t.id} value={t.id}>
                  {t.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="key"
            label={<span style={{ fontWeight: 600, fontSize: '1.1rem', color: '#374151' }}>Topic Code</span>}
          >
            <Input placeholder="Topic code (e.g. CS101)" disabled style={{ color: '#000', backgroundColor: '#f0f0f0' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TopicsPage;
