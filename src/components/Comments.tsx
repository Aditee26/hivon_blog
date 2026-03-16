'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function Comments({ postId, initialComments, session }: any) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !newComment.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: session.user.id,
          comment_text: newComment,
        })
        .select(`
          *,
          user:users(name, email)
        `)
        .single();

      if (error) throw error;
      
      setComments([data, ...comments]);
      setNewComment('');
    } catch (error) {
      alert('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t pt-6">
      <h2 className="text-xl font-bold mb-4">Comments ({comments.length})</h2>

      {session ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Write a comment..."
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <p className="mb-4 text-gray-600">Please login to comment.</p>
      )}

      <div className="space-y-4">
        {comments.map((comment: any) => (
          <div key={comment.id} className="border-b pb-4">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">{comment.user?.name}</span>
              <span className="text-sm text-gray-500">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700">{comment.comment_text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}