import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Button, Pagination, Tag, Spin } from 'antd';
import { FolderOpenOutlined, FileTextOutlined, HeartOutlined, BellOutlined, LeftOutlined, RightOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardApi } from '../api/dashboardApi';
import type { DashboardStats } from '../api/dashboardApi';
import { paperApi } from '../api/paperApi';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import './DashboardPage.css';

const { Title, Text } = Typography;

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#8dd1e1', '#a4de6c', '#d0ed57', '#f29c9f', '#b8a9c9', '#f4a582'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DashboardPage: React.FC = () => {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1); // 1-indexed

  const [statsData, setStatsData] = useState<DashboardStats>({
    topicCount: 0,
    newPaperCount: 0,
    favoriteCount: 0,
    notificationCount: 0,
    trendData: [],
    followedTopicNames: []
  });

  const [trendData, setTrendData] = useState<any[]>([]);
  const [topicNames, setTopicNames] = useState<string[]>([]);

  const navigate = useNavigate();
  const [topPapers, setTopPapers] = useState<any[]>([]);
  const [topPage, setTopPage] = useState<number>(1);
  const [topTotal, setTopTotal] = useState<number>(0);
  const [loadingTop, setLoadingTop] = useState<boolean>(false);

  useEffect(() => {
    const fetchTopRated = async () => {
      setLoadingTop(true);
      try {
        const res: any = await paperApi.getTopRatedPapers(topPage - 1, 6);
        const data = res.data || res;
        setTopPapers(data.papers || []);
        setTopTotal(data.totalElements || 0);
      } catch (error) {
        console.error("Failed to fetch top rated papers", error);
      } finally {
        setLoadingTop(false);
      }
    };
    fetchTopRated();
  }, [topPage]);

  const handleDetailPaper = (paperId: string) => {
    navigate(`/paper/${paperId}`);
  };

  // Fetch stats (only once on mount)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response: any = await dashboardApi.getStats();
        setStatsData(response.data ?? response);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };
    fetchStats();
  }, []);

  // Fetch trend data whenever month changes
  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const response: any = await dashboardApi.getStats(currentYear, currentMonth);
        const data = response.data ?? response;
        setTrendData(data.trendData || []);
        setTopicNames(data.followedTopicNames || []);
      } catch (error) {
        console.error("Failed to fetch trend data", error);
      }
    };
    fetchTrend();
  }, [currentYear, currentMonth]);

  const isCurrentMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1;

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (isCurrentMonth) return; // Không cho xem quá tháng hiện tại
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const stats = [
    { title: 'YOUR TOPICS', value: statsData.topicCount.toString(), extra: '', extraColor: '#52c41a', bgColor: '#ffffff', icon: <FolderOpenOutlined style={{ color: '#1677ff', fontSize: '16px' }} /> },
    { title: <>NEW PAPERS<br />(Topic followed)</>, value: statsData.newPaperCount.toString(), bgColor: '#ffffff', icon: <FileTextOutlined style={{ color: '#52c41a', fontSize: '16px' }} /> },
    { title: 'FAVORITE PAPERS', value: statsData.favoriteCount.toString(), bgColor: '#ffffff', icon: <HeartOutlined style={{ color: '#fa8c16', fontSize: '16px' }} /> },
    { title: 'NOTIFICATIONS', value: statsData.notificationCount.toString(), bgColor: '#ffffff', icon: <BellOutlined style={{ color: '#722ed1', fontSize: '16px' }} /> },
  ];

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#111827' }}>Statistics</Title>
        <Text type="secondary" style={{ fontSize: '15px', color:'blue' }}>Overview of your research activity</Text>
      </div>
      <Row gutter={[16, 16]} className="stats-row">
        {stats.map((stat, index) => (
          <Col xs={12} sm={12} md={6} key={index}>
            <Card className="stat-card" variant="outlined" style={{ backgroundColor: stat.bgColor, border: '1.5px solid #d1d5db' }}>
              <div className="stat-card-header">
                <Text type="secondary" className="stat-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {stat.icon}
                  {stat.title}
                </Text>
              </div>
              <div className="stat-value">{stat.value}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Chart Section */}
      <div style={{ marginTop: '40px', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #d1d5db', boxShadow: '0 4px 6px -1px rgba(72, 183, 211, 0.05)' }}>
        <Title level={4} style={{ marginBottom: '4px', color: '#1677ff' }}>Paper Trends by Topic</Title>

        {/* Month Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          paddingBottom: '12px',
          marginBottom: '16px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={handlePrevMonth}
            style={{ fontSize: '18px', color: '#374151', fontWeight: 600 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 600, color: '#1f2937', minWidth: '200px', justifyContent: 'center' }}>
            <CalendarOutlined style={{ color: '#6b7280' }} />
            {MONTH_NAMES[currentMonth - 1]} {currentYear}
          </div>
          <Button
            type="text"
            icon={<RightOutlined />}
            onClick={handleNextMonth}
            disabled={isCurrentMonth}
            style={{ fontSize: '18px', color: isCurrentMonth ? '#d1d5db' : '#374151', fontWeight: 600 }}
          />
        </div>

        {trendData.length > 0 ? (
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart
                data={trendData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip
                  cursor={{fill: 'rgba(0,0,0,0.05)'}}
                  content={({ active, payload, label }) => {
                    if (!active || !payload) return null;
                    const filtered = payload.filter((entry: any) => entry.value > 0);
                    if (filtered.length === 0) return null;
                    const total = filtered.reduce((sum: number, entry: any) => sum + entry.value, 0);
                    return (
                      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontWeight: 700, marginBottom: '8px', color: '#111827' }}>Day {label}</div>
                        {filtered.map((entry: any, i: number) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0', fontSize: '14px' }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color, display: 'inline-block' }} />
                            <span style={{ color: '#374151' }}>{entry.name}: <strong>{entry.value}</strong></span>
                          </div>
                        ))}
                        <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '8px', paddingTop: '8px', fontWeight: 700, fontSize: '14px', color: '#111827' }}>
                          Total: {total}
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', lineHeight: '18px' }}
                  iconSize={8}
                />
                <Bar dataKey="Total" name="Other topics" stackId="b" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                {topicNames.map((topicName, index) => (
                  <Bar key={topicName} dataKey={topicName} stackId="a" fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={40} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '60px 0', fontSize: '15px' }}>
            No trend data available for this month.
          </div>
        )}
      </div>

      {/* Top Rated Papers Section */}
      <div style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1677ff', marginBottom: '16px' }}> Paper worth reading</h2>
        {loadingTop ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin /></div>
        ) : topPapers.length > 0 ? (
          <>
            <div className="top-papers-grid">
              {topPapers.map((paper) => {
                const footerBg = '#f9fafb';

                return (
                  <Card 
                    key={paper.id} 
                    hoverable 
                    style={{ borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                    styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
                    onClick={() => handleDetailPaper(paper.id)}
                  >
                    <div style={{ padding: '16px', flex: 1, display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      {/* Score Badge */}
                      {paper.point != null && (
                        <div style={{ 
                          border: '1px solid #deecdeff', 
                          borderRadius: '6px', 
                          padding: '6px 4px', 
                          textAlign: 'center', 
                          color: '#1ba665ff', 
                          minWidth: '50px',
                          flexShrink: 0,
                          backgroundColor: '#d3edddff'
                        }}>
                          <div style={{ fontSize: '10px', fontWeight: 600, lineHeight: 1 }}>AI</div>
                          <div style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1.2, margin: '2px 0' }}>{paper.point}</div>
                          <div style={{ fontSize: '9px', opacity: 0.8, lineHeight: 1 }}>/ 100</div>
                        </div>
                      )}

                      {/* Content Area */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '15px', fontWeight: 700, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {paper.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280', fontSize: '13px', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <UserOutlined style={{ marginRight: '6px' }} /> 
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{paper.authors || 'Unknown Authors'}</span>
                        </div>

                        {paper.topics && paper.topics.length > 0 && (
                          <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {paper.topics.map((topic: any) => (
                              <Tag key={topic.id} style={{ fontSize: '11px', padding: '0 6px', margin: 0, borderRadius: '4px', border: 'none', background: '#f3f4f6', color: '#000000' }}>{topic.name}</Tag>
                            ))}
                          </div>
                        )}

                        <Typography.Paragraph 
                          ellipsis={{ rows: 5, expandable: false }}
                          style={{ color: '#9ca3af', fontSize: '13px', margin: 0, lineHeight: '1.5' }}
                        >
                          {paper.summary || paper.abstractText}
                        </Typography.Paragraph>
                      </div>
                    </div>
                    
                    <div style={{ 
                      padding: '12px 16px', 
                      background: footerBg, 
                      borderTop: '1px solid #f3f4f6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 'auto'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}>
                        <CalendarOutlined /> {paper.publishedAt ? dayjs(paper.publishedAt).format('DD/MM/YYYY') : 'N/A'}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: '#000000', fontSize: '12px', fontWeight: 'bold' }}>{paper.arxivId}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Pagination 
                current={topPage} 
                pageSize={6} 
                total={topTotal} 
                onChange={(page) => setTopPage(page)} 
                showSizeChanger={false}
              />
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px 0' }}>Chưa có bài báo đáng đọc nào.</div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
