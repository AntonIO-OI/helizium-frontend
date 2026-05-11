'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { AlertCircle } from 'lucide-react';
import ChatModal from '@/app/components/ChatModal';
import { tasksApi, Task, PublicUser } from '@/app/lib/api/tasks';
import { commentsApi, Comment } from '@/app/lib/api/comments';
import { useAuth } from '@/app/lib/hooks/useAuth';
import TaskDetail from '@/app/components/task/TaskDetail';
import ProfileAvatar from '@/app/components/profile/ProfileAvatar';

export default function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { userId, isAdmin, isEmailConfirmed, isBanned, isAuthenticated } =
    useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [author, setAuthor] = useState<PublicUser | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const res = await tasksApi.getTask(resolvedParams.id);
      if (res.data) {
        setTask(res.data);
        if (res.data.author) {
          setAuthor(res.data.author);
        } else {
          const authorRes = await tasksApi.getPublicUser(res.data.authorId);
          setAuthor(authorRes.data ?? null);
        }
      }
      const commentsRes = await commentsApi.getComments(resolvedParams.id);
      setComments(commentsRes.data ?? []);
      setIsLoading(false);
    };
    load();
  }, [resolvedParams.id]);

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !task) return;
    const res = await commentsApi.createComment(task.id, commentText);
    if (res.data) {
      setComments((prev) => [...prev, res.data!]);
      setCommentText('');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!task) return;
    await commentsApi.deleteComment(task.id, commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTask(updatedTask);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
            <div className="h-64 bg-white rounded-lg" />
            <div className="h-24 bg-white rounded-lg" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!task || !author) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Task Not Found</h1>
            <a
              href="/search"
              className="inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Browse Tasks
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentUserPublic: PublicUser | null = userId
    ? { id: userId, username: '', rating: 0, joinedDate: '', isBanned, isAdmin }
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <TaskDetail
            task={task}
            author={author}
            currentUser={currentUserPublic}
            onTaskUpdate={handleTaskUpdate}
          />

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              Comments: {comments.length}
            </h2>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="border-t pt-4">
                  <div className="flex items-start space-x-4">
                    <ProfileAvatar
                      initial={comment.username.charAt(0).toUpperCase()}
                      size="sm"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={
                            comment.userId === userId
                              ? 'font-semibold text-green-600'
                              : comment.isAuthor
                                ? 'font-semibold text-blue-800'
                                : comment.isAdmin
                                  ? 'font-semibold text-red-800'
                                  : 'font-semibold'
                          }
                        >
                          {comment.username}
                          {comment.isAuthor
                            ? ' (Author)'
                            : comment.isAdmin
                              ? ' (Admin)'
                              : null}
                        </span>
                        <span className="text-sm text-gray-500">
                          {comment.createdAt}
                        </span>
                      </div>
                      <p className="my-2">{comment.text}</p>
                    </div>
                    {(userId === comment.userId || isAdmin) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No comments yet.</p>
            )}

            {isAuthenticated && isEmailConfirmed ? (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Add a Comment</h2>
                <textarea
                  placeholder="Write your comment..."
                  className="w-full p-4 border border-gray-300 rounded-lg mb-4"
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  onClick={handleCommentSubmit}
                  className="bg-black text-white px-6 py-2 rounded-lg"
                >
                  Post Comment
                </button>
              </div>
            ) : (
              <div className="mt-8">
                <b>
                  {isAuthenticated ? 'Confirm email' : 'Sign up'} to write
                  comments
                </b>
              </div>
            )}
          </div>
        </div>
      </main>
      <ChatModal />
      <Footer />
    </div>
  );
}
