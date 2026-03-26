import React, { useState, useEffect } from "react";
import "./CryptoNewsWidget.css";
import { ExternalLink, RefreshCw, AlertCircle } from "lucide-react";

interface NewsArticle {
  title: string;
  urlToImage: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

const CryptoNewsWidget: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(
        "https://newsapi.org/v2/everything?q=crypto OR bitcoin&sortBy=publishedAt&language=en&apiKey=82f66afc52af4d00a1a29427d83d79d9"
      );
      const data = await res.json();
      if (data.status === "ok") {
        // NewsAPI often returns articles without images, filter them out to keep UI elegant
        const validArticles = data.articles.filter((a: any) => a.urlToImage).slice(0, 4);
        setNews(validArticles);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Failed to fetch crypto news", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "";
    const timestamp = Math.floor(new Date(dateString).getTime() / 1000);
    const diff = Math.floor(Date.now() / 1000) - timestamp;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <section className="crypto-news-container card">
      <div className="section-header news-header">
        <div className="news-title">
          <h3>Berita Kripto Terkini</h3>
          <span className="live-indicator">LIVE</span>
        </div>
        <button className="refresh-btn" onClick={fetchNews} disabled={loading} title="Segarkan Berita">
          <RefreshCw size={16} className={loading ? "spin" : ""} />
        </button>
      </div>

      {loading && !news.length ? (
        <div className="news-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="news-skeleton">
              <div className="skel-img"></div>
              <div className="skel-text-1"></div>
              <div className="skel-text-2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="news-error">
          <AlertCircle size={32} />
          <p>Gagal memuat berita pasar.</p>
          <button onClick={fetchNews}>Coba Lagi</button>
        </div>
      ) : (
        <div className="news-grid">
          {news.map((article, idx) => (
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="news-card" key={idx}>
              <div className="news-image-wrapper">
                <img src={article.urlToImage} alt={article.title} loading="lazy" />
                <div className="news-source-badge">
                  <span>{article.source.name}</span>
                </div>
              </div>
              <div className="news-content">
                <h4 title={article.title}>{article.title}</h4>
                <div className="news-footer">
                  <span className="news-time">{formatTimeAgo(article.publishedAt)}</span>
                  <ExternalLink size={14} className="ext-icon" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
};

export default CryptoNewsWidget;
