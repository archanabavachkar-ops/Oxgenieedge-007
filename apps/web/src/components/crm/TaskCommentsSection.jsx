import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

const TaskCommentsSection = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const records = await pb.collection('task_comments').getFullList({
        filter: `task_id = "${taskId}"`,
        sort: 'created',
        expand: 'user_id',
        $autoCancel: false
      });
      setComments(records);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await apiServerClient.fetch(`/task-comments/${taskId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      });
      
      if (!res.ok) throw new Error("Failed to post comment");
      
      setNewComment('');
      fetchComments();
      toast.success("Comment added");
    } catch (err) {
      console.error(err);
      toast.error("Could not post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">Discussion</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No comments yet. Start the conversation below.
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarImage src={comment.expand?.user_id?.avatar ? pb.files.getUrl(comment.expand.user_id, comment.expand.user_id.avatar) : ''} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(comment.expand?.user_id?.name || comment.expand?.user_id?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-sm text-foreground">
                    {comment.expand?.user_id?.name || comment.expand?.user_id?.email || 'Unknown User'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created), { addSuffix: true })}
                  </span>
                </div>
                <div className="text-sm text-foreground bg-muted/40 p-3 rounded-lg rounded-tl-none border border-border">
                  {comment.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-muted/10 border-t border-border">
        <div className="relative">
          <Textarea 
            placeholder="Add a comment... (use @ to mention)" 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none pr-12 text-foreground"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button 
            size="icon" 
            className="absolute bottom-2 right-2 h-8 w-8"
            onClick={handleSubmit}
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskCommentsSection;