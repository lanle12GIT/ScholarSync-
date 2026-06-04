import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Button, Tag, message } from 'antd';
import {
  LeftOutlined,
  HeartOutlined,
  HeartFilled,
  RobotOutlined,
  FileTextOutlined,
  CalendarOutlined,
  LinkOutlined,
  UserOutlined,
  TagsOutlined,
  InfoCircleOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { paperApi } from '../api/paperApi';
import './PaperDetailPage.css';

interface TopicType {
  id: number;
  name: string;
  key?: string;
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
  fetchedAt?: string;
  topics?: TopicType[];
}

/**
 * Validate that a URL is well-formed and uses http/https protocol
 */
const isValidUrl = (url: string | undefined | null): boolean => {
  if (!url || !url.trim()) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const PaperDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<PaperType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [relatedPapers, setRelatedPapers] = useState<PaperType[]>([]);
  const [relatedLoading, setRelatedLoading] = useState<boolean>(false);
  const [summarizing, setSummarizing] = useState<boolean>(false);
  const [iframeError, setIframeError] = useState<boolean>(false);
  const [relatedPage, setRelatedPage] = useState<number>(0);
  const [hasMoreRelated, setHasMoreRelated] = useState<boolean>(true);
  const [loadingMoreRelated, setLoadingMoreRelated] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      fetchPaperDetail(id);
    }
  }, [id]);

  // Fetch favorite state from backend
  useEffect(() => {
    if (id) {
      const checkFav = async () => {
        try {
          const res: any = await paperApi.checkFavorite(id);
          setIsFavorited(res.data ?? res);
        } catch (error) {
          console.error('Failed to check favorite state:', error);
        }
      };
      checkFav();
    }
  }, [id]);

  // Fetch related papers when paper loads
  useEffect(() => {
    if (paper?.topics && paper.topics.length > 0) {
      fetchRelatedPapers(paper.topics[0].id);
    }
  }, [paper?.id]);

  const fetchPaperDetail = async (paperId: string) => {
    try {
      setLoading(true);
      const response: any = await paperApi.getPaperById(paperId);
      const data = response.data || response;
      setPaper(data);

      // Auto-summarize if missing
      if (!data.summary) {
        triggerSummarize(paperId, data);
      }
    } catch (error) {
      console.error('Failed to fetch paper detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerSummarize = async (paperId: string, currentPaper: PaperType) => {
    setSummarizing(true);
    try {
      const response: any = await paperApi.summarizePaper(paperId);
      const newSummary = response.data || response;
      if (newSummary) {
        setPaper({ ...currentPaper, summary: newSummary });
      }
    } catch (error) {
      console.error('Error summarizing paper:', error);
    } finally {
      setSummarizing(false);
    }
  };

  const fetchRelatedPapers = async (topicId: number) => {
    setRelatedLoading(true);
    setRelatedPage(0);
    setHasMoreRelated(true);
    try {
      const response: any = await paperApi.searchPapers({ topicId, page: 0, size: 9 });
      const data = response.data || response;
      const fetched: PaperType[] = data.papers || [];
      // Exclude current paper
      const filtered = fetched.filter((p) => String(p.id) !== String(id));
      setRelatedPapers(filtered.slice(0, 9));
      if (filtered.length < 9) {
        setHasMoreRelated(false);
      }
    } catch (error) {
      console.error('Failed to fetch related papers:', error);
    } finally {
      setRelatedLoading(false);
    }
  };

  const handleLoadMoreRelated = async () => {
    if (!paper?.topics || paper.topics.length === 0) return;
    const topicId = paper.topics[0].id;
    const nextPage = relatedPage + 1;
    setLoadingMoreRelated(true);
    try {
      const response: any = await paperApi.searchPapers({ topicId, page: nextPage, size: 10 });
      const data = response.data || response;
      const fetched: PaperType[] = data.papers || [];
      const filtered = fetched.filter((p) => String(p.id) !== String(id));
      setRelatedPapers(prev => [...prev, ...filtered]);
      setRelatedPage(nextPage);
      if (fetched.length < 10) {
        setHasMoreRelated(false);
      }
    } catch (error) {
      console.error('Failed to load more related papers:', error);
    } finally {
      setLoadingMoreRelated(false);
    }
  };

  const toggleFavorite = async () => {
    if (!id) return;
    
    // Optimistic update
    const previousState = isFavorited;
    setIsFavorited(!previousState);

    try {
      if (previousState) {
        await paperApi.removeFavorite(id);
        message.info('Removed from favorites');
      } else {
        await paperApi.addFavorite(id);
        message.success('Added to favorites ❤️');
      }
    } catch (error) {
      // Revert on failure
      setIsFavorited(previousState);
      message.error('Failed to update favorites');
      console.error('Toggle favorite error:', error);
    }
  };

  const viewerUrl = useMemo(() => {
    if (paper?.arxivId) {
      // ArXiv blocks direct PDF embedding via X-Frame-Options in Chrome.
      // We use Google Docs Viewer as a proxy to safely embed the PDF.
      const pdfUrl = `https://arxiv.org/pdf/${paper.arxivId}.pdf`;
      return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
    }
    return paper?.link;
  }, [paper]);

  const linkValid = useMemo(() => isValidUrl(viewerUrl), [viewerUrl]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', minHeight: 'calc(100vh - 64px)' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!paper) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', fontSize: '1.1rem', color: '#6b7280' }}>
        Paper not found.
      </div>
    );
  }

  return (
    <div className="paper-detail-root">
      <div className="paper-detail-container">
        {/* Header */}
        <div className="paper-detail-header">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>
            {/* Left: Back Button */}
            <div style={{ flexShrink: 0 }}>
              <Button
                icon={<LeftOutlined />}
                onClick={() => navigate(-1)}
                className="paper-detail-back-btn"
                shape="circle"
                size="large"
                style={{ marginTop: '4px', marginBottom: 0 }}
              />
            </div>
            
            {/* Middle: Title & Meta */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 className="paper-detail-title" style={{ margin: 0, textAlign: 'left' }}>
                {paper.title}
              </h2>
              
              <div className="paper-detail-meta" style={{ marginBottom: 0 }}>
                <Tag color="blue" className="paper-detail-meta-tag">{paper.arxivId}</Tag>
                <span className="paper-detail-meta-info">
                  <CalendarOutlined /> {paper.publishedAt ? new Date(paper.publishedAt).toLocaleDateString('en-GB') : 'Unknown Date'}
                </span>
                <span className="paper-detail-meta-info">
                  <UserOutlined /> {paper.authors || 'Unknown Authors'}
                </span>
              </div>
              
              {paper.topics && paper.topics.length > 0 && (
                <div className="paper-detail-topics" style={{ marginTop: 0 }}>
                  {paper.topics.map((topic) => (
                    <Tag
                      key={topic.id}
                      color="purple"
                      className="paper-detail-topic-tag"
                      onClick={() => navigate(`/paper?topic_id=${topic.id}`, { state: { topicName: topic.name } })}
                    >
                      {topic.name}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
            
            {/* Right: Heart Button */}
            <div style={{ flexShrink: 0 }}>
              <button
                className={`paper-detail-heart-btn ${isFavorited ? 'active' : ''}`}
                onClick={toggleFavorite}
                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorited ? <HeartFilled /> : <HeartOutlined />}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content: iframe + Summary */}
        <div className="paper-detail-main">
          {/* Left: Paper Viewer / iframe */}
          <div className="paper-detail-viewer">
            <div className="paper-detail-viewer-header">
              <span className="paper-detail-viewer-title">
                <span className="paper-detail-viewer-dot green" />
                <span className="paper-detail-viewer-dot yellow" />
                <span className="paper-detail-viewer-dot red" />
                <span style={{ marginLeft: 4 }}>Paper Viewer</span>
              </span>
              {linkValid && (
                <a
                  href={paper.link || viewerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 13, color: '#2563eb', fontWeight: 500 }}
                >
                  <LinkOutlined /> Open in new tab
                </a>
              )}
            </div>

            {linkValid && !iframeError ? (
              <iframe
                className="paper-detail-iframe"
                src={viewerUrl}
                title={paper.title}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                onError={() => setIframeError(true)}
              />
            ) : (
              <div className="paper-detail-abstract-fallback">
                {linkValid && iframeError && (
                  <div style={{ textAlign: 'center', padding: '16px 0 8px', color: '#ef4444', fontSize: 14 }}>
                    ⚠️ Unable to embed this page. Showing abstract instead.
                    <div style={{ marginTop: 8 }}>
                      <a href={paper.link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
                        <LinkOutlined /> Open original source
                      </a>
                    </div>
                  </div>
                )}
                {!linkValid && paper.link && (
                  <div style={{ textAlign: 'center', padding: '16px 0 8px', color: '#f59e0b', fontSize: 14 }}>
                    ⚠️ Invalid link detected. Showing abstract instead.
                  </div>
                )}
                {!paper.link && (
                  <div className="paper-detail-no-preview">
                    <FileTextOutlined className="paper-detail-no-preview-icon" />
                    <h3>No preview available</h3>
                    <p>This paper doesn't have an external link. You can read the abstract below.</p>
                  </div>
                )}
                <h4><FileTextOutlined /> Abstract</h4>
                <p>{paper.abstractText || paper.abstract || 'No abstract available.'}</p>
              </div>
            )}
          </div>

          {/* Right: Summary + Info */}
          <div className="paper-detail-sidebar">
            {/* Summary Card */}
            <div className="paper-detail-summary-card">
              <div className="paper-detail-summary-header">
                <span className="paper-detail-summary-label">
                  <RobotOutlined /> Summary by AI
                </span>
              </div>

              {summarizing ? (
                <div className="paper-detail-summarizing">
                  <Spin size="small" />
                  <span>Generating AI summary...</span>
                </div>
              ) : paper.summary ? (
                <p className="paper-detail-summary-text">{paper.summary}</p>
              ) : (
                <div className="paper-detail-no-summary">
                  <p>No summary available for this paper.</p>
                  <Button
                    type="primary"
                    icon={<ExperimentOutlined />}
                    onClick={() => triggerSummarize(String(paper.id), paper)}
                    style={{ background: '#16a34a', borderColor: '#16a34a', borderRadius: 8 }}
                  >
                    Generate Summary
                  </Button>
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="paper-detail-info-card">
              <h4><InfoCircleOutlined /> Paper Details</h4>
              <div className="paper-detail-info-row">
                <TagsOutlined />
                <strong>ArXiv ID:</strong>
                <span>{paper.arxivId || '—'}</span>
              </div>
              <div className="paper-detail-info-row">
                <CalendarOutlined />
                <strong>Published:</strong>
                <span>{paper.publishedAt || '—'}</span>
              </div>
              <div className="paper-detail-info-row">
                <UserOutlined />
                <strong>Authors:</strong>
                <span style={{ flex: 1 }}>{paper.authors || '—'}</span>
              </div>
              {paper.link && (
                <div className="paper-detail-info-row">
                  <LinkOutlined />
                  <strong>Link:</strong>
                  <a href={paper.link} target="_blank" rel="noopener noreferrer">
                    {paper.link.length > 40 ? paper.link.substring(0, 40) + '…' : paper.link}
                  </a>
                </div>
              )}
              {paper.topics && paper.topics.length > 0 && (
                <div className="paper-detail-info-row" style={{ flexWrap: 'wrap' }}>
                  <ExperimentOutlined />
                  <strong>Topics:</strong>
                  <div className="paper-detail-topics">
                    {paper.topics.map((t) => (
                      <Tag key={t.id} color="geekblue" style={{ fontSize: 12, borderRadius: 12 }}>
                        {t.name}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Papers */}
        <div className="paper-detail-related">
          <div className="paper-detail-related-header">
            <h3>📚 Related Papers</h3>
            <div className="paper-detail-related-divider" />
          </div>

          {relatedLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="default" />
            </div>
          ) : relatedPapers.length > 0 ? (
            <div className="paper-detail-related-grid">
              {relatedPapers.map((rp) => (
                <div
                  key={rp.id}
                  className="paper-related-card"
                  onClick={() => navigate(`/paper/${rp.id}`)}
                >
                  <div className="paper-related-card-title">{rp.title}</div>
                  <div className="paper-related-card-authors">
                    <UserOutlined style={{ marginRight: 4 }} />
                    {rp.authors || 'Unknown Authors'}
                  </div>
                  <div className="paper-related-card-abstract">
                    {rp.abstractText || rp.summary || 'No abstract available.'}
                  </div>
                  <div className="paper-related-card-footer">
                    <span className="paper-related-card-date">
                      <CalendarOutlined />
                      {rp.publishedAt ? new Date(rp.publishedAt).toLocaleDateString('en-GB') : '—'}
                    </span>
                    <Tag color="blue" className="paper-related-card-id">{rp.arxivId || 'N/A'}</Tag>
                  </div>
                </div>
              ))}
              {hasMoreRelated && paper?.topics && paper.topics.length > 0 && (
                <div
                  className="paper-related-card"
                  onClick={handleLoadMoreRelated}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '2px dashed #cbd5e1', boxShadow: 'none' }}
                >
                  <div style={{ textAlign: 'center', color: '#64748b' }}>
                    {loadingMoreRelated ? (
                      <Spin size="default" />
                    ) : (
                      <>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>+</div>
                        <div style={{ fontWeight: 600, fontSize: '16px' }}>View More</div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="paper-detail-related-empty">
              No related papers found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaperDetailPage;
