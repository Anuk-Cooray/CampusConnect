import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const feedContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const feedItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Feed({
  userName,
  newPostContent,
  setNewPostContent,
  handleCreatePost,
  isPosting,
  feedPosts,
  formatMediaUrl,
}) {
  const firstName = userName?.split(' ')?.[0] || 'Student';
  const activeAuthor = userName || 'Anuk Cooray';
  const userInitial = (userName?.charAt(0) || 'S').toUpperCase();
  const [commentsByPost, setCommentsByPost] = useState({});
  const [newCommentByPost, setNewCommentByPost] = useState({});
  const [activeReplyTarget, setActiveReplyTarget] = useState({});
  const [replyDraftByTarget, setReplyDraftByTarget] = useState({});
  const [likeStateByPost, setLikeStateByPost] = useState({});
  const [selectedMediaFile, setSelectedMediaFile] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState('none');
  const photoInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const getStorageKey = (postId) => `viva_comments_${postId}`;
  const getLikeStorageKey = (postId) => `viva_post_likes_${postId}`;

  const readStoredComments = (postId) => {
    try {
      const stored = localStorage.getItem(getStorageKey(postId));
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const persistComments = (postId, comments) => {
    try {
      localStorage.setItem(getStorageKey(postId), JSON.stringify(comments));
    } catch (error) {
      // Ignore quota/storage errors for demo mode.
    }
  };

  const readStoredLikeState = (postId, fallbackLikes) => {
    try {
      const stored = localStorage.getItem(getLikeStorageKey(postId));
      if (!stored) {
        return { isLiked: false, likeCount: Number(fallbackLikes) || 0 };
      }
      const parsed = JSON.parse(stored);
      return {
        isLiked: Boolean(parsed?.isLiked),
        likeCount: Number.isFinite(parsed?.likeCount) ? parsed.likeCount : Number(fallbackLikes) || 0,
      };
    } catch (error) {
      return { isLiked: false, likeCount: Number(fallbackLikes) || 0 };
    }
  };

  const persistLikeState = (postId, likeState) => {
    try {
      localStorage.setItem(getLikeStorageKey(postId), JSON.stringify(likeState));
    } catch (error) {
      // Ignore quota/storage errors for demo mode.
    }
  };

  useEffect(() => {
    setCommentsByPost((prev) => {
      const next = { ...prev };
      let changed = false;

      feedPosts.forEach((post) => {
        if (next[post._id]) return;
        next[post._id] = readStoredComments(post._id);
        changed = true;
      });

      return changed ? next : prev;
    });
  }, [feedPosts]);

  useEffect(() => {
    setLikeStateByPost((prev) => {
      const next = { ...prev };
      let changed = false;

      feedPosts.forEach((post) => {
        if (next[post._id]) return;
        next[post._id] = readStoredLikeState(post._id, post.likes);
        changed = true;
      });

      return changed ? next : prev;
    });
  }, [feedPosts]);

  const handleAddComment = (postId) => {
    const text = (newCommentByPost[postId] || '').trim();
    if (!text) return;

    const newComment = {
      id: Date.now().toString(),
      author: activeAuthor,
      text,
      replies: [],
    };

    setCommentsByPost((prev) => {
      const nextComments = [...(prev[postId] || []), newComment];
      const next = { ...prev, [postId]: nextComments };
      persistComments(postId, nextComments);
      return next;
    });

    setNewCommentByPost((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleReplyToggle = (postId, commentId) => {
    setActiveReplyTarget((prev) => ({
      ...prev,
      [postId]: prev[postId] === commentId ? null : commentId,
    }));
  };

  const handleAddReply = (postId, commentId) => {
    const draftKey = `${postId}_${commentId}`;
    const replyText = (replyDraftByTarget[draftKey] || '').trim();
    if (!replyText) return;

    setCommentsByPost((prev) => {
      const updatedComments = (prev[postId] || []).map((comment) => {
        if (comment.id !== commentId) return comment;

        const reply = {
          id: Date.now().toString(),
          author: activeAuthor,
          text: replyText,
          replies: [],
        };

        return { ...comment, replies: [...(comment.replies || []), reply] };
      });

      const next = { ...prev, [postId]: updatedComments };
      persistComments(postId, updatedComments);
      return next;
    });

    setReplyDraftByTarget((prev) => ({ ...prev, [draftKey]: '' }));
    setActiveReplyTarget((prev) => ({ ...prev, [postId]: null }));
  };

  const handleToggleLike = (postId, fallbackLikes) => {
    setLikeStateByPost((prev) => {
      const current = prev[postId] || { isLiked: false, likeCount: Number(fallbackLikes) || 0 };
      const next = current.isLiked
        ? { isLiked: false, likeCount: Math.max(0, current.likeCount - 1) }
        : { isLiked: true, likeCount: current.likeCount + 1 };

      persistLikeState(postId, next);
      return { ...prev, [postId]: next };
    });
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedMediaFile(file);
    setSelectedMediaType('image');
  };

  const handleDocumentSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedMediaFile(file);
    setSelectedMediaType('document');
  };

  const clearSelectedMedia = () => {
    setSelectedMediaFile(null);
    setSelectedMediaType('none');
    if (photoInputRef.current) photoInputRef.current.value = '';
    if (documentInputRef.current) documentInputRef.current.value = '';
  };

  const handleSubmitPost = async (e) => {
    const created = await handleCreatePost(e, {
      mediaFile: selectedMediaFile,
      mediaType: selectedMediaType,
    });
    if (created) {
      clearSelectedMedia();
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm p-4">
        <form onSubmit={handleSubmitPost}>
          <div className="flex gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-600/20">
              {userInitial}
            </div>
            <div className="flex-grow min-w-0">
              <input
                type="text"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={`Ask a question or share notes, ${firstName}?`}
                className="w-full bg-slate-100 hover:bg-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 border border-transparent focus:border-blue-300/60 rounded-full px-5 py-3 text-sm outline-none transition-all font-medium"
                disabled={isPosting}
              />
            </div>
          </div>
          <div className="border-t border-slate-100 mt-4 pt-3 flex flex-wrap justify-between gap-2 px-1">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <input
              ref={documentInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
              onChange={handleDocumentSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={isPosting}
              className="flex items-center gap-2 text-slate-500 hover:bg-slate-100 py-2 px-4 rounded-xl font-semibold text-sm transition-colors"
            >
              <span className="text-lg">📷</span> Photo
            </button>
            <button
              type="button"
              onClick={() => documentInputRef.current?.click()}
              disabled={isPosting}
              className="flex items-center gap-2 text-slate-500 hover:bg-slate-100 py-2 px-4 rounded-xl font-semibold text-sm transition-colors"
            >
              <span className="text-lg">📄</span> Document
            </button>
            <button
              type="submit"
              disabled={!newPostContent.trim() || isPosting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-8 rounded-full font-bold text-sm transition-all shadow-md shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
            >
              {isPosting ? 'Posting…' : 'Post'}
            </button>
            {selectedMediaFile && (
              <div className="w-full mt-2 text-xs text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between">
                <span className="truncate">
                  Attached {selectedMediaType}: {selectedMediaFile.name}
                </span>
                <button
                  type="button"
                  onClick={clearSelectedMedia}
                  className="ml-3 text-slate-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      {feedPosts.length === 0 ? (
        <div className="text-center text-slate-500 py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-sm font-medium">
          No questions yet. Be the first to ask!
        </div>
      ) : (
        <motion.div variants={feedContainer} initial="hidden" animate="show" className="space-y-4">
          {feedPosts.map((post) => (
            (() => {
              const postComments = commentsByPost[post._id] || [];
              const likeMeta = likeStateByPost[post._id] || { isLiked: false, likeCount: Number(post.likes) || 0 };
              const nestedCommentCount = postComments.reduce((count, comment) => count + 1 + (comment.replies?.length || 0), 0);
              return (
            <motion.div
              key={post._id}
              variants={feedItem}
              className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden"
            >
              <div className="p-4 sm:p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0 ${
                        post.authorName?.includes('Admin')
                          ? 'bg-slate-900'
                          : 'bg-gradient-to-br from-slate-500 to-slate-700'
                      }`}
                    >
                      {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center hover:text-blue-600 cursor-pointer truncate">
                        {post.authorName || 'Unknown Student'}
                        {post.authorName?.includes('Admin') && (
                          <svg className="w-4 h-4 text-blue-500 ml-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500 flex items-center">
                        {new Date(post.createdAt).toLocaleDateString()} <span className="mx-1">•</span> 🌎
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors flex-shrink-0"
                    aria-label="Post menu"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </button>
                </div>

                <p className="text-slate-800 text-sm mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                {post.mediaUrl && post.mediaType !== 'none' && (
                  <div className="mt-3 mb-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    {post.mediaType === 'video' && (
                      <div className="relative group">
                        <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded-lg shadow-md z-10 flex items-center gap-1">
                          <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                          Watch Kuppi
                        </div>
                        <video controls className="w-full max-h-[500px] object-cover bg-black" src={formatMediaUrl(post.mediaUrl)} />
                      </div>
                    )}
                    {post.mediaType === 'image' && (
                      <img src={formatMediaUrl(post.mediaUrl)} alt="Material" className="w-full max-h-[500px] object-cover" />
                    )}
                    {post.mediaType === 'document' && (
                      <div className="p-4 flex items-center justify-between bg-white border-y border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 text-xl">📄</div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">Study material attached</p>
                            <p className="text-[11px] text-slate-500 uppercase tracking-wide">PDF document</p>
                          </div>
                        </div>
                        <a
                          href={formatMediaUrl(post.mediaUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                        >
                          Download
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between text-[11px] text-slate-500 mt-4 px-1 border-b border-slate-100 pb-3">
                  <span className="flex items-center gap-1">
                    <span className="bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center text-white text-[10px]">
                      👍
                    </span>
                    <span>{likeMeta.likeCount}</span>
                  </span>
                  <span>{nestedCommentCount || post.commentCount || 0} comments</span>
                </div>
              </div>

              <div className="px-2 py-1 flex justify-between bg-white">
                <button
                  type="button"
                  onClick={() => handleToggleLike(post._id, post.likes)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm active:scale-95 transition-all duration-200 ${
                    likeMeta.isLiked
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Like
                </button>
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 text-slate-500 hover:bg-slate-100 py-3 rounded-xl font-bold text-sm transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Comment
                </button>
              </div>

              <div className="px-4 sm:px-5 pb-4 pt-2 bg-white">
                <div className="space-y-3 mb-4">
                  {postComments.map((comment) => {
                    const replyTargetKey = `${post._id}_${comment.id}`;
                    const isReplyOpen = activeReplyTarget[post._id] === comment.id;
                    return (
                      <div key={comment.id} className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                        <div className="flex items-start gap-2.5">
                          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {comment.author?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800">{comment.author}</p>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.text}</p>
                            <button
                              type="button"
                              onClick={() => handleReplyToggle(post._id, comment.id)}
                              className="mt-1 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                            >
                              Reply
                            </button>
                          </div>
                        </div>

                        {isReplyOpen && (
                          <div className="mt-2 ml-8 border-l-2 border-slate-100 pl-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={replyDraftByTarget[replyTargetKey] || ''}
                                onChange={(e) =>
                                  setReplyDraftByTarget((prev) => ({
                                    ...prev,
                                    [replyTargetKey]: e.target.value,
                                  }))
                                }
                                placeholder="Write a reply..."
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddReply(post._id, comment.id)}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                              >
                                Post
                              </button>
                            </div>
                          </div>
                        )}

                        {(comment.replies || []).length > 0 && (
                          <div className="mt-3 ml-8 border-l-2 border-slate-100 pl-4 space-y-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-2.5 rounded-lg bg-white border border-slate-100 p-2.5">
                                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                  {reply.author?.charAt(0)?.toUpperCase() || 'A'}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[11px] font-semibold text-slate-800">{reply.author}</p>
                                  <p className="text-xs text-slate-700 whitespace-pre-wrap">{reply.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCommentByPost[post._id] || ''}
                    onChange={(e) =>
                      setNewCommentByPost((prev) => ({
                        ...prev,
                        [post._id]: e.target.value,
                      }))
                    }
                    placeholder="Write a comment..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddComment(post._id)}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            </motion.div>
              );
            })()
          ))}
        </motion.div>
      )}
    </div>
  );
}
