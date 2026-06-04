import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Spin, Card, Typography, Pagination, Tag, Button, Row, Col, Segmented } from 'antd';
import { paperApi } from '../api/paperApi';
import { CalendarOutlined, LinkOutlined, UserOutlined, CompassOutlined, StarFilled } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface TopicType {
  id: number;
  name: string;
  key: string;
}

interface PaperType {
  id: string;
  arxivId: string;
  title: string;
  abstractText: string;
  summary: string;
  authors: string;
  link: string;
  publishedAt: string;
  topics?: TopicType[];
  point?: number;
}

const PaperPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const topicId = searchParams.get('topic_id');
  const keyword = searchParams.get('keyword');
  const topicName = location.state?.topicName;

  const [papers, setPapers] = useState<PaperType[]>([]);
  const [discoverPapers, setDiscoverPapers] = useState<PaperType[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingDiscover, setLoadingDiscover] = useState<boolean>(true);
  
  const [summarizingIds, setSummarizingIds] = useState<Set<string>>(new Set());
  const [scoringIds, setScoringIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'your_topic'>('your_topic');
  const pageSize = 10;

  useEffect(() => {
    if (topicId || keyword) {
      // Force "all" tab behavior if searching via URL params
      setActiveTab('all');
      fetchPapersSearch(currentPage, 'all');
    } else {
      if (activeTab === 'your_topic') {
        fetchUserFeed(currentPage);
        if (currentPage === 0) fetchDiscoverFeed();
      } else {
        fetchPapersSearch(currentPage, activeTab);
      }
    }
  }, [topicId, keyword, currentPage, activeTab]);

  const fetchPapersSearch = async (page: number, tab: 'all' | 'today' | 'your_topic') => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response: any = await paperApi.searchPapers({
        topicId: topicId || undefined,
        keyword: keyword || undefined,
        fromDate: tab === 'today' ? today : undefined,
        toDate: tab === 'today' ? today : undefined,
        page,
        size: pageSize
      });
      const data = response.data || response;
      const fetchedPapers = data.papers || [];
      setPapers(fetchedPapers);
      setTotalElements(data.totalElements || 0);
      autoSummarizeMissing(fetchedPapers, setPapers);
      autoScoreMissing(fetchedPapers, setPapers);
    } catch (error) {
      console.error('Failed to fetch papers by topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFeed = async (page: number) => {
    setLoading(true);
    try {
      const response: any = await paperApi.getUserFeed(page, pageSize);
      const data = response.data || response;
      const fetchedPapers = data.papers || [];
      setPapers(fetchedPapers);
      setTotalElements(data.totalElements || 0);
      autoSummarizeMissing(fetchedPapers, setPapers);
      autoScoreMissing(fetchedPapers, setPapers);
    } catch (error) {
      console.error('Failed to fetch user feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscoverFeed = async () => {
    setLoadingDiscover(true);
    try {
      const response: any = await paperApi.getDiscoverFeed(0, 5); // Get top 5 recommendations
      const data = response.data || response;
      const fetchedPapers = data.papers || [];
      setDiscoverPapers(fetchedPapers);
      autoSummarizeMissing(fetchedPapers, setDiscoverPapers);
      autoScoreMissing(fetchedPapers, setDiscoverPapers);
    } catch (error) {
      console.error('Failed to fetch discover feed:', error);
    } finally {
      setLoadingDiscover(false);
    }
  };

  const autoSummarizeMissing = async (currentPapers: PaperType[], setter: React.Dispatch<React.SetStateAction<PaperType[]>>) => {
    const missing = currentPapers.filter(p => !p.summary);
    if (missing.length === 0) return;

    for (const paper of missing) {
      setSummarizingIds(prev => new Set(prev).add(paper.id));
      try {
        const response: any = await paperApi.summarizePaper(paper.id);
        const newSummary = response.data || response;
        
        if (newSummary) {
          setter(prevPapers => 
            prevPapers.map(p => 
              p.id === paper.id ? { ...p, summary: newSummary } : p
            )
          );
        }
      } catch (error) {
        console.error(`Error auto-summarizing paper ${paper.id}:`, error);
      } finally {
        setSummarizingIds(prev => {
          const next = new Set(prev);
          next.delete(paper.id);
          return next;
        });
      }
    }
  };

  const autoScoreMissing = async (currentPapers: PaperType[], setter: React.Dispatch<React.SetStateAction<PaperType[]>>) => {
    const missing = currentPapers.filter(p => p.point == null);
    if (missing.length === 0) return;

    for (const paper of missing) {
      setScoringIds(prev => new Set(prev).add(paper.id));
      try {
        const response: any = await paperApi.scorePaper(paper.id);
        const newScore = response.data || response;
        
        if (newScore != null) {
          setter(prevPapers => 
            prevPapers.map(p => 
              p.id === paper.id ? { ...p, point: newScore } : p
            )
          );
        }
      } catch (error) {
        console.error(`Error auto-scoring paper ${paper.id}:`, error);
      } finally {
        setScoringIds(prev => {
          const next = new Set(prev);
          next.delete(paper.id);
          return next;
        });
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1); // Antd is 1-indexed, Spring is 0-indexed
  };

  const navigate = useNavigate();

  const handleDetailPaper = (paperId: string) => {
    navigate(`/paper/${paperId}`);
  };

  const renderPaperCard = (paper: PaperType, isCompact = false, index = 0) => {
    if (isCompact) {
      const footerColors = ['#f4f9ff', '#f0fdf4', '#fdf4ff', '#fffbeb', '#f5f3ff'];
      const footerBg = footerColors[index % footerColors.length];

      return (
        <Card 
          key={paper.id} 
          hoverable 
          style={{ borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '16px', overflow: 'hidden' }}
          styles={{ body: { padding: 0 } }}
          onClick={() => handleDetailPaper(paper.id)}
        >
          <div style={{ padding: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '15px', fontWeight: 700, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {paper.title}
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280', fontSize: '13px', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <UserOutlined style={{ marginRight: '6px' }} /> 
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{paper.authors || 'Unknown Authors'}</span>
            </div>

            {paper.topics && paper.topics.length > 0 && (
              <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {paper.topics.map(topic => (
                  <Tag key={topic.id} color="purple" style={{ fontSize: '11px', padding: '0 6px', margin: 0, borderRadius: '4px', border: 'none', background: '#f3e8ff', color: '#7e22ce' }}>{topic.name}</Tag>
                ))}
              </div>
            )}

            <Paragraph style={{ color: '#9ca3af', fontSize: '13px', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
              {paper.abstractText}
            </Paragraph>
          </div>
          
          <div style={{ padding: '12px 16px', background: footerBg, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6' }}>
            <span style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CalendarOutlined /> {paper.publishedAt ? new Date(paper.publishedAt).toLocaleDateString('en-GB') : 'Unknown Date'}
            </span>
            <span style={{ color: '#2563eb', fontSize: '12px', fontWeight: 600 }}>
              {paper.arxivId || 'N/A'}
            </span>
          </div>
        </Card>
      );
    }

    return (
    <Card 
      key={paper.id} 
      hoverable 
      style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1.5px solid #d1d1d8ff', marginBottom: '20px' }}
      styles={{ body: { padding: isCompact ? '16px' : '24px' } }}
      onClick={() => handleDetailPaper(paper.id)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1 }}>
          {/* Score Badge */}
          <div style={{ 
            border: `1px solid ${paper.point != null ? '#deecdeff' : '#e5e7eb'}`, 
            borderRadius: '6px', 
            padding: '6px 4px', 
            textAlign: 'center', 
            color: paper.point != null ? '#1ba665ff' : '#9ca3af', 
            minWidth: '50px',
            flexShrink: 0,
            backgroundColor: paper.point != null ? '#d3edddff' : '#f3f4f6'
          }}>
            <div style={{ fontSize: '10px', fontWeight: 600, lineHeight: 1 }}>AI</div>
            <div style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1.2, margin: '2px 0' }}>
              {scoringIds.has(paper.id) ? <Spin size="small" /> : (paper.point != null ? paper.point : '--')}
            </div>
            <div style={{ fontSize: '9px', opacity: 0.8, lineHeight: 1 }}>/ 100</div>
          </div>
          <Title level={isCompact ? 5 : 4} style={{ margin: 0, color: '#1f2937', paddingRight: '16px' }}>{paper.title}</Title>
        </div>
        <Tag color="blue" style={{ fontSize: '12px', padding: '2px 6px', borderRadius: '4px' }}>{paper.arxivId || 'N/A'}</Tag>
      </div>

      {paper.topics && paper.topics.length > 0 && (
        <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {paper.topics.map(topic => (
            <Tag key={topic.id} color="purple">{topic.name}</Tag>
          ))}
        </div>
      )}
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: isCompact ? '10px' : '16px', marginBottom: '16px', color: '#6b7280', fontSize: isCompact ? '13px' : '14px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><UserOutlined /> {paper.authors || 'Unknown Authors'}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CalendarOutlined /> {paper.publishedAt ? new Date(paper.publishedAt).toLocaleDateString('en-GB') : 'Unknown Date'}</span>
        {!isCompact && (
          <Link to={`/paper/${paper.id}`} onClick={(e) => e.stopPropagation()}>
            <Button type="primary" size="small" icon={<LinkOutlined/>} style={{ background: '#d6632eff', borderRadius: '6px', fontWeight: 600 }}>
              View Detail
            </Button>
          </Link>
        )}
      </div>

      {paper.summary ? (
        <div style={{ backgroundColor: '#edf2f5ff', marginLeft: "-10px", marginRight: "-10px", borderRadius:"12px" }} >
          <Paragraph style={{ fontSize: isCompact ? '14px' : '15px', lineHeight: '1.6', margin:"10px", padding: '10px' }}>
            <span style={{ fontWeight: 600, color: '#26ac62ff', marginRight: '8px' }}>Summary by AI:</span>
            <span style={{ color: '#4b5563', fontStyle: 'italic' }}>{paper.summary}</span>
          </Paragraph>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
          <span style={{ fontWeight: 600, color: '#26ac62ff' }}>Summary by AI:</span>
          <span style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '14px' }}>
            {summarizingIds.has(paper.id) ? "Generating summary with AI..." : "No summary available."}
          </span>
          {summarizingIds.has(paper.id) && <Spin size="small" />}
        </div>
      )}
    </Card>
    );
  };

  return (
    <div style={{ padding: '24px 0', background: '#f9fafb', minHeight: 'calc(100vh - 64px)' }}>
      {/* Filter Bar */}
      {!topicId && !keyword && (
        <div style={{ width: '100%', margin: '0 auto 32px auto', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '700px', maxWidth: '90%' }}>
            <Segmented
              className="paper-filter-bar"
              block
              options={[
                { label: <div style={{ padding: '2px 0', fontSize: '14px', fontWeight: 600 }}>All</div>, value: 'all' },
                { label: <div style={{ padding: '2px 0', fontSize: '14px', fontWeight: 600 }}>Paper today</div>, value: 'today' },
                { label: <div style={{ padding: '2px 0', fontSize: '14px', fontWeight: 600 }}>Paper Your Topic</div>, value: 'your_topic' },
              ]}
              value={activeTab}
              onChange={(val) => {
                setActiveTab(val as any);
                setCurrentPage(0);
              }}
              style={{ padding: '4px', background: '#f8f8f8ff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            />
          </div>
        </div>
      )}

      {(topicId || keyword || activeTab === 'all' || activeTab === 'today') ? (
        // Single column layout for specific topic, search, All, or Today
        <div style={{ width: '90%', margin: '0 auto', maxWidth: '1400px' }}>
          <Row>
            <Col xs={24} lg={20}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>
                {keyword ? `Search results for: "${keyword}"` : 
                 (topicName ? `Paper of topic: ${topicName}` : 
                 (activeTab === 'today' ? 'Papers Today' : 'All Papers'))}
              </h2>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
              ) : papers.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '40px', fontSize: '1.2rem' }}>No papers found for this topic.</div>
              ) : (
                <>
                  <div>{papers.map((p, idx) => renderPaperCard(p, false, idx))}</div>
                  <div style={{ marginTop: '32px', textAlign: 'center', marginBottom: '40px' }}>
                    <Pagination current={currentPage + 1} total={totalElements} pageSize={10} onChange={handlePageChange} showSizeChanger={false} />
                  </div>
                </>
              )}
            </Col>
          </Row>
        </div>
      ) : (
        // Split layout for personalized feed
        <div style={{ width: '90%', margin: '0 auto', maxWidth: '1400px' }}>
          <Row gutter={32}>
            {/* Left Column: User's Feed */}
            <Col xs={24} lg={16}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <StarFilled style={{ color: '#f59e0b' }} /> Your Topic Feed
              </h2>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
              ) : papers.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '40px', padding: '40px', background: 'white', borderRadius: '12px' }}>
                  You haven't followed any topics yet, or no papers are available for your topics. <br/>
                  <Link to="/topics"><Button type="primary" style={{ marginTop: '16px' }}>Follow Topics</Button></Link>
                </div>
              ) : (
                <>
                  <div>{papers.map((p, idx) => renderPaperCard(p, false, idx))}</div>
                  <div style={{ marginTop: '32px', textAlign: 'center', marginBottom: '40px' }}>
                    <Pagination current={currentPage + 1} total={totalElements} pageSize={10} onChange={handlePageChange} showSizeChanger={false} />
                  </div>
                </>
              )}
            </Col>

            {/* Right Column: Discover Feed */}
            <Col xs={24} lg={8}>
              <div style={{ position: 'sticky', top: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#4b5563', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CompassOutlined style={{ color: '#3b82f6' }} /> You might be interested in
                </h3>
                {loadingDiscover ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin /></div>
                ) : discoverPapers.length === 0 ? (
                  <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>No recommendations available right now.</div>
                ) : (
                  <div>{discoverPapers.map((p, idx) => renderPaperCard(p, true, idx))}</div>
                )}
              </div>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default PaperPage;
