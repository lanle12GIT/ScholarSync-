import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Spin, Card, Typography, Pagination, Tag, Button, Row, Col, Popover, DatePicker, Radio } from 'antd';
import dayjs from 'dayjs';
import { paperApi } from '../api/paperApi';
import { CalendarOutlined, LinkOutlined, UserOutlined, StarFilled, FilterOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

// Theo dõi các bài đã được FE thử gọi AI trong phiên hiện tại.
// Mỗi bài chỉ kích hoạt tối đa 1 lần -> không bắn lại request mỗi lần render / đổi tab / phân trang / quay lại trang.
// Việc tóm tắt & chấm điểm chủ yếu do scheduler BE lo; FE chỉ hiển thị trạng thái "đang xử lý".
const attemptedSummaryIds = new Set<string>();
const attemptedScoreIds = new Set<string>();

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

  const [loading, setLoading] = useState<boolean>(true);

  const [summarizingIds, setSummarizingIds] = useState<Set<string>>(new Set());
  const [scoringIds, setScoringIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'your_topic'>('your_topic');
  const pageSize = 10;

  // Bộ lọc nâng cao (popup cạnh title): khoảng ngày + phạm vi topic
  const [dateRange, setDateRange] = useState<any>(null);        // [Dayjs, Dayjs] | null
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingRange, setPendingRange] = useState<any>(null);
  const [pendingScope, setPendingScope] = useState<'all' | 'your_topic'>('your_topic');

  useEffect(() => {
    if (topicId || keyword) {
      // Force "all" tab behavior if searching via URL params
      setActiveTab('all');
      fetchPapersSearch(currentPage, 'all');
    } else {
      if (activeTab === 'your_topic') {
        fetchUserFeed(currentPage);
      } else {
        fetchPapersSearch(currentPage, activeTab);
      }
    }
  }, [topicId, keyword, currentPage, activeTab, dateRange]);

  const fetchPapersSearch = async (page: number, tab: 'all' | 'today' | 'your_topic') => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      // Ưu tiên khoảng ngày từ bộ lọc; nếu không có thì tab "today" lọc đúng hôm nay
      const fromDate = dateRange?.[0] ? dateRange[0].format('YYYY-MM-DD') : (tab === 'today' ? today : undefined);
      const toDate = dateRange?.[1] ? dateRange[1].format('YYYY-MM-DD') : (tab === 'today' ? today : undefined);
      const response: any = await paperApi.searchPapers({
        topicId: topicId || undefined,
        keyword: keyword || undefined,
        fromDate,
        toDate,
        page,
        size: pageSize
      });
      const data = response?.data ?? response;
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
      const data = response?.data ?? response;
      let fetchedPapers = data.papers || [];
      let total = data.totalElements || 0;

      // Feed followed-topics không lọc ngày ở BE -> lọc thêm phía client theo khoảng ngày đã chọn
      if (dateRange?.[0] && dateRange?.[1]) {
        const from = dateRange[0].startOf('day');
        const to = dateRange[1].endOf('day');
        fetchedPapers = fetchedPapers.filter((p: PaperType) => {
          const d = dayjs(p.publishedAt);
          return d.isValid() && !d.isBefore(from) && !d.isAfter(to);
        });
        total = fetchedPapers.length;
      }

      setPapers(fetchedPapers);
      setTotalElements(total);
      autoSummarizeMissing(fetchedPapers, setPapers);
      autoScoreMissing(fetchedPapers, setPapers);
    } catch (error) {
      console.error('Failed to fetch user feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoSummarizeMissing = async (currentPapers: PaperType[], setter: React.Dispatch<React.SetStateAction<PaperType[]>>) => {
    const missing = currentPapers.filter(p => !p.summary && !attemptedSummaryIds.has(p.id));
    if (missing.length === 0) return;

    for (const paper of missing) {
      attemptedSummaryIds.add(paper.id); // đánh dấu đã thử trong phiên này
      setSummarizingIds(prev => new Set(prev).add(paper.id));
      try {
        const response: any = await paperApi.summarizePaper(paper.id);
        const newSummary = response?.data ?? response;
        
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
    const missing = currentPapers.filter(p => p.point == null && !attemptedScoreIds.has(p.id));
    if (missing.length === 0) return;

    for (const paper of missing) {
      attemptedScoreIds.add(paper.id); // đánh dấu đã thử trong phiên này
      setScoringIds(prev => new Set(prev).add(paper.id));
      try {
        const response: any = await paperApi.scorePaper(paper.id);
        const newScore = response?.data ?? response;
        
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
      
      <div style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'center', gap: isCompact ? '10px' : '16px', marginBottom: '16px', color: '#6b7280', fontSize: isCompact ? '13px' : '14px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '0 1 auto', minWidth: 0 }}>
          <UserOutlined style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {paper.authors || 'Unknown Authors'}
          </span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, whiteSpace: 'nowrap' }}><CalendarOutlined /> {paper.publishedAt ? new Date(paper.publishedAt).toLocaleDateString('en-GB') : 'Unknown Date'}</span>
        {!isCompact && (
          <Link to={`/paper/${paper.id}`} onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
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

  const handleFilterOpenChange = (v: boolean) => {
    setFilterOpen(v);
    if (v) {
      // Đồng bộ giá trị đang chọn vào form khi mở
      setPendingRange(dateRange);
      setPendingScope(activeTab === 'your_topic' ? 'your_topic' : 'all');
    }
  };

  const applyFilter = () => {
    setDateRange(pendingRange);
    setActiveTab(pendingScope);
    setCurrentPage(0);
    setFilterOpen(false);
  };

  const clearFilter = () => {
    setPendingRange(null);
    setDateRange(null);
    setCurrentPage(0);
    setFilterOpen(false);
  };

  // Icon filter cạnh title: mở popup nhỏ chọn khoảng ngày + phạm vi topic
  const filterIcon = (
    <Popover
      trigger="click"
      placement="rightTop"
      open={filterOpen}
      onOpenChange={handleFilterOpenChange}
      content={
        <div style={{ width: 280 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Date range</div>
          <DatePicker
            value={pendingRange?.[0] || null}
            onChange={(d) => setPendingRange([d, pendingRange?.[1] || null])}
            placeholder="From date"
            placement="bottomLeft"
            popupClassName="paper-month-only"
            allowClear
            style={{ width: '100%', marginBottom: 8 }}
          />
          <DatePicker
            value={pendingRange?.[1] || null}
            onChange={(d) => setPendingRange([pendingRange?.[0] || null, d])}
            placeholder="To date"
            placement="bottomLeft"
            popupClassName="paper-month-only"
            allowClear
            style={{ width: '100%' }}
          />

          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '14px 0 6px' }}>Topic scope</div>
          <Radio.Group value={pendingScope} onChange={(e) => setPendingScope(e.target.value)}>
            <Radio value="all">All topics</Radio>
            <Radio value="your_topic">Followed topics</Radio>
          </Radio.Group>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button size="small" onClick={clearFilter}>Clear</Button>
            <Button size="small" type="primary" onClick={applyFilter}>Apply</Button>
          </div>
        </div>
      }
    >
      <FilterOutlined style={{ fontSize: '30px', color: '#2563eb', cursor: 'pointer' }} title="Filter by date & topic scope" />
    </Popover>
  );

  return (
    <div style={{ padding: '24px 0', background: '#f9fafb', minHeight: 'calc(100vh - 64px)' }}>
      {(topicId || keyword || activeTab === 'all' || activeTab === 'today') ? (
        // Single column layout for specific topic, search, All, or Today
        <div style={{ width: '90%', margin: '0 auto', maxWidth: '1400px' }}>
          <Row justify="center">
            <Col xs={24} lg={20}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>
                  {keyword ? `Search results for: "${keyword}"` :
                   (topicName ? `Paper of topic: ${topicName}` :
                   (activeTab === 'today' ? 'Papers Today' : 'All Papers'))}
                </span>
                {filterIcon}
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
        // Single column layout for personalized feed
        <div style={{ width: '90%', margin: '0 auto', maxWidth: '1400px' }}>
          <Row justify="center">
            <Col xs={24} lg={20}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <StarFilled style={{ color: '#f59e0b' }} /> Your Topic Feed
                </span>
                {filterIcon}
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
          </Row>
        </div>
      )}
    </div>
  );
};

export default PaperPage;
