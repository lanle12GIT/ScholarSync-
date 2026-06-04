import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Spin, Card, Typography, Pagination, Tag, Button, Row, Col } from 'antd';
import { paperApi } from '../api/paperApi';
import { CalendarOutlined, LinkOutlined, UserOutlined, HeartFilled } from '@ant-design/icons';

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
}

const FavoritesPage: React.FC = () => {
  const [papers, setPapers] = useState<PaperType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [summarizingIds, setSummarizingIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites(currentPage);
  }, [currentPage]);

  const fetchFavorites = async (page: number) => {
    setLoading(true);
    try {
      const response: any = await paperApi.getFavorites(page, pageSize);
      const data = response.data || response;
      const fetchedPapers = data.papers || [];
      setPapers(fetchedPapers);
      setTotalElements(data.totalElements || 0);

      // Auto trigger summarize for papers missing summary
      autoSummarizeMissing(fetchedPapers);
    } catch (error) {
      console.error('Failed to fetch favorite papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoSummarizeMissing = async (currentPapers: PaperType[]) => {
    const missing = currentPapers.filter(p => !p.summary);
    if (missing.length === 0) return;

    for (const paper of missing) {
      setSummarizingIds(prev => new Set(prev).add(paper.id));
      try {
        const response: any = await paperApi.summarizePaper(paper.id);
        const newSummary = response.data || response;
        
        if (newSummary) {
          setPapers(prevPapers => 
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1); // Antd is 1-indexed, Spring is 0-indexed
  };

  const handleDetailPaper = (paperId: string) => {
    navigate(`/paper/${paperId}`);
  };

  const handleUnfavorite = async (e: React.MouseEvent, paperId: string) => {
    e.stopPropagation(); // Prevent card click
    try {
      await paperApi.removeFavorite(paperId);
      // Remove from the current view
      setPapers(prev => prev.filter(p => p.id !== paperId));
      setTotalElements(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to unfavorite:', error);
    }
  };

  return (
    <div style={{ padding: '24px 0', background: '#f9fafb', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ width: '90%', margin: '0 auto', maxWidth: '1400px' }}>
        <Row>
          <Col xs={24} lg={20}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HeartFilled style={{ color: '#ef4444' }} /> Favorite Papers
              </h2>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <div>
          {papers.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '40px', fontSize: '1.2rem' }}>You have no favorite papers yet.</div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {papers.map((paper) => (
                  <Card 
                    key={paper.id} 
                    hoverable 
                    style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1.5px solid #d1d1d8ff' }}
                    styles={{ body: { padding: '24px' } }}
                    onClick={() => handleDetailPaper(paper.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <Title level={4} style={{ margin: 0, color: '#1f2937', flex: 1, paddingRight: '16px' }}>{paper.title}</Title>
                      <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px', borderRadius: '6px' }}>{paper.arxivId || 'N/A'}</Tag>
                    </div>

                    {paper.topics && paper.topics.length > 0 && (
                      <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {paper.topics.map(topic => (
                          <Tag key={topic.id} color="purple">{topic.name}</Tag>
                        ))}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px', color: '#6b7280', fontSize: '14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><UserOutlined /> {paper.authors || 'Unknown Authors'}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CalendarOutlined /> {paper.publishedAt ? new Date(paper.publishedAt).toLocaleDateString('en-GB') : 'Unknown Date'}</span>
                      <Link 
                        to={`/paper/${paper.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button 
                          type="primary" 
                          size="small" 
                          icon={<LinkOutlined/>} 
                          style={{ background: '#d6632eff', borderRadius: '6px', fontWeight: 600 }}
                        >
                        View Detail
                        </Button>
                      </Link>
                      <Button
                        size="small"
                        icon={<HeartFilled style={{ color: '#ef4444' }} />}
                        onClick={(e) => handleUnfavorite(e, paper.id)}
                        style={{ borderRadius: '6px', borderColor: '#fca5a5', marginLeft: 'auto' }}
                        title="Remove from favorites"
                      />
                    </div>

                    {paper.summary ? (
                      <div style={{ backgroundColor: '#edf2f5ff', marginLeft: "-10px", marginRight: "-10px", borderRadius:"12px" }}>
                        <Paragraph style={{ fontSize: '15px', lineHeight: '1.6', margin:"10px", padding: '10px' }}>
                          <span style={{ fontWeight: 600, color: '#26ac62ff', marginRight: '8px' }}>Summary by AI:</span>
                          <span style={{ color: '#4b5563', fontStyle: 'italic' }}>{paper.summary}</span>
                        </Paragraph>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
                        <span style={{ fontWeight: 600, color: '#26ac62ff' }}>Summary by AI:</span>
                        <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                          {summarizingIds.has(paper.id) ? "Generating summary with AI..." : "No summary available."}
                        </span>
                        {summarizingIds.has(paper.id) && <Spin size="small" />}
                      </div>
                    )}
                    
                  </Card>
                ))}
              </div>
              
              <div style={{ marginTop: '32px', textAlign: 'center', marginBottom: '40px' }}>
                <Pagination
                  current={currentPage + 1}
                  total={totalElements}
                  pageSize={10}
                  onChange={handlePageChange}
                />
              </div>
            </>
          )}
          </div>
        )}
      </Col>
    </Row>
      </div>
    </div>
  );
};

export default FavoritesPage;
