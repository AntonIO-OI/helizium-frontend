'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { Task, User, Comment } from '@/app/types/search';
import { getSearchData, delay, saveComments, saveTasks } from '@/app/utils/storage';
import { getUser } from '@/app/data/mockUsers';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import TaskDetail from '@/app/components/task/TaskDetail';
import { AlertCircle } from 'lucide-react';
import ChatModal from '@/app/components/ChatModal';
import { formatDate } from '@/app/utils/formatDate';
import ProfileAvatar from '@/app/components/profile/ProfileAvatar';

export default function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [task, setTask] = useState<Task | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const resolvedParams = use(params);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user: User = users.find((user: User) => user.id === +userId);
      if (user) {
        setCurrentUser(user);
      }
    }
  }, [setCurrentUser]);

  useEffect(() => {
    const fetchTask = async () => {
      setIsLoading(true);
      await delay(400);

      const taskId = parseInt(resolvedParams.id);
      const data = getSearchData();
      const foundTask = data.tasks.find((t) => t.id === taskId);

      if (foundTask) {
        setTask(foundTask);
        const taskAuthor = getUser(foundTask.authorId);
        if (taskAuthor) {
          setAuthor(taskAuthor);
        }

        const taskComments = data.comments.filter(
          (comment) => comment.taskId === taskId,
        );
        setComments(taskComments);
      }

      setIsLoading(false);
    };

    fetchTask();
  }, [resolvedParams.id]);

  const handleCommentSubmit = (commentText: string) => {
    if (!currentUser?.id || !commentText) return;

    const newComment: Comment = {
      id: Date.now(),
      userId: currentUser.id,
      taskId: task!.id,
      text: commentText,
      createdAt: formatDate(new Date(), true),
    };

    saveComments([...comments, newComment]);
    setComments((prevComments) => [...prevComments, newComment]);
  };

  const handleDeleteComment = (commentId: number) => {
    saveComments(comments.filter((comment) => comment.id !== commentId));
    setComments((prevComments) =>
      prevComments.filter((comment) => comment.id !== commentId),
    );
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTask(updatedTask);
    const data = getSearchData();
    const updatedTasks = data.tasks.map(t => 
      t.id === updatedTask.id ? updatedTask : t
    );
    saveTasks(updatedTasks);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
            <div className="h-64 bg-white rounded-lg"></div>
            <div className="h-24 bg-white rounded-lg"></div>
            <div className="h-48 bg-white rounded-lg"></div>
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
            <p className="text-gray-600 mb-8">
              The task you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <TaskDetail task={task} author={author} currentUser={currentUser} />

          {/* Comments List */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              Comments: {comments.length}
            </h2>
            {comments.length > 0 ? (
              comments.map((comment) => {
                const commentAuthor = getUser(comment.userId);
                if (!commentAuthor) return null;

                return (
                  <div key={comment.id} className="border-t pt-4">
                    <div className="flex items-start space-x-4">
                      {/* Profile Avatar */}
                      <ProfileAvatar
                        initial={commentAuthor.username.charAt(0).toUpperCase()}
                        size="sm"
                      />

                      <div className="flex-1">
                        {/* Username and Date */}
                        <div className="flex items-center justify-between">
                          <span
                            className={
                              commentAuthor.id === currentUser?.id
                                ? 'font-semibold text-green-600'
                                : commentAuthor.id === author.id
                                ? 'font-semibold text-red-800'
                                : 'font-semibold'
                            }
                          >
                            {commentAuthor.username}
                            {commentAuthor.id === author.id
                              ? ' (Author)'
                              : null}
                          </span>
                          <span className="text-sm text-gray-500">
                            {comment.createdAt}
                          </span>
                        </div>

                        {/* Comment Text */}
                        <p className="mt-2">{comment.text}</p>
                      </div>

                      {/* Delete button if the current user is the author of the comment */}
                      {currentUser?.id === comment.userId && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No comments yet.</p>
            )}

            {/* Comment Form */}
            {currentUser?.emailConfirmed ? (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Add a Comment</h2>
                <textarea
                  placeholder="Write your comment..."
                  className="w-full p-4 border border-gray-300 rounded-lg mb-4"
                  rows={4}
                  onChange={(e) => setCommentText(e.target.value)}
                ></textarea>
                <button
                  onClick={() => handleCommentSubmit(commentText)}
                  className="bg-black text-white px-6 py-2 rounded-lg"
                >
                  Post Comment
                </button>
              </div>
            ) : (
              <div className="mt-8">
                <b>
                  {currentUser?.id ? 'Confirm email' : 'Sign up'} to write
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
