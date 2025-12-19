'use client';

import { useState, useEffect } from 'react';
import { collaborationApi, Comment, AddCommentRequest } from '@/lib/api-collaboration';
import { formatDistanceToNow } from 'date-fns';

interface CommentsSectionProps {
    consultationId: number;
}

export default function CommentsSection({ consultationId }: CommentsSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchComments();
    }, [consultationId]);

    const fetchComments = async () => {
        try {
            const response = await collaborationApi.getComments(consultationId);
            setComments(response);
        } catch (err: any) {
            console.error('Failed to fetch comments:', err);
            setError(err.message || 'Failed to load comments');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        setError(null);

        try {
            // Extract mentions from comment (simple @userId format)
            const mentionRegex = /@(\d+)/g;
            const mentions: number[] = [];
            let match;
            while ((match = mentionRegex.exec(newComment)) !== null) {
                mentions.push(parseInt(match[1]));
            }

            const data: AddCommentRequest = {
                content: newComment,
                mentions: mentions.length > 0 ? mentions : undefined,
            };

            await collaborationApi.addComment(consultationId, data);
            setNewComment('');
            await fetchComments();
        } catch (err: any) {
            setError(err.message || 'Failed to add comment');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (commentId: number) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            await collaborationApi.deleteComment(consultationId, commentId);
            await fetchComments();
        } catch (err: any) {
            setError(err.message || 'Failed to delete comment');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Comments</h3>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-6">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment... (Use @userId to mention someone)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                />
                <div className="mt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading || !newComment.trim()}
                        className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Posting...' : 'Post Comment'}
                    </button>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-900">
                                            {comment.user?.full_name || 'Unknown User'}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                                    {comment.mentions && comment.mentions.length > 0 && (
                                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span>Mentioned {comment.mentions.length} user(s)</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(comment.id)}
                                    className="text-red-600 hover:text-red-800 text-sm ml-4"
                                    title="Delete comment"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
