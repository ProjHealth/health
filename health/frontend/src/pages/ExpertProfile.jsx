import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./ExpertProfile.css";

const SERVER = "http://localhost:5000";
const ExpertProfile = () => {
  const { expertId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user || !expertId) return;
    fetchExpertProfile();
  }, [user, expertId]);

  const fetchExpertProfile = async () => {
    try {
      const res = await fetch(`${SERVER}/api/experts/${expertId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExpert(data);
      } else {
        console.error("Failed to fetch expert profile");
      }
    } catch (err) {
      console.error("Error fetching expert profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    try {
      const endpoint = expert.isFollowing ? 'unfollow' : 'follow';
      const res = await fetch(`${SERVER}/api/experts/${endpoint}/${expertId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        setExpert(prev => ({
          ...prev,
          isFollowing: !prev.isFollowing,
          followersCount: prev.isFollowing 
            ? prev.followersCount - 1 
            : prev.followersCount + 1
        }));
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="expert-profile-container">
        <div className="loading">Loading expert profile...</div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="expert-profile-container">
        <div className="error">Expert not found</div>
      </div>
    );
  }

  return (
    <div className="expert-profile-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Expert Header */}
      <div className="expert-header">
<div className="expert-avatar-large">
  <img
    src={expert.profilePicture}
    alt={expert.name}
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = "https://randomuser.me/api/portraits/men/32.jpg";
    }}
  />
</div>

        <div className="expert-header-info">
          <div className="expert-name-verified">
            <h1>{expert.name}</h1>
            {expert.verified && <span className="verified-badge">✓</span>}
          </div>
          <h2 className="expert-title">{expert.title}</h2>
          <p className="expert-bio">{expert.bio}</p>
          
          <div className="expert-stats">
            <div className="stat">
              <span className="stat-number">{expert.followersCount}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat">
              <span className="stat-number">{expert.postsCount}</span>
              <span className="stat-label">Posts</span>
            </div>
          </div>

          <div className="expert-specializations">
            {expert.specializations.map(spec => (
              <span key={spec} className="specialization-tag-large">{spec}</span>
            ))}
          </div>

          {expert.credentials.length > 0 && (
            <div className="expert-credentials">
              <strong>Credentials:</strong> {expert.credentials.join(', ')}
            </div>
          )}

          <button 
            className={`follow-btn ${expert.isFollowing ? 'following' : ''}`}
            onClick={handleFollowToggle}
            disabled={followLoading}
          >
            {followLoading ? 'Loading...' : expert.isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>

      {/* Expert Posts */}
      <div className="expert-posts-section">
        <h3>Recent Posts</h3>
        {expert.posts.length === 0 ? (
          <div className="no-posts">No posts yet</div>
        ) : (
          <div className="posts-grid">
            {expert.posts
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map(post => (
                <div key={post._id} className="post-card">
                  {post.image && (
                    <div className="post-image">
                      <img src={post.image} alt={post.title} />
                    </div>
                  )}
                  <div className="post-content">
                    <div className="post-category">{post.category}</div>
                    <h4 className="post-title">{post.title}</h4>
                    <p className="post-text">{post.content}</p>
                    <div className="post-footer">
                      <span className="post-likes">❤️ {post.likes}</span>
                      <span className="post-date">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertProfile;