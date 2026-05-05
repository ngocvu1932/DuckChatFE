import React, {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faHeart, faMessage} from '@fortawesome/free-regular-svg-icons';
import {faHeart as faHeartSolid, faPaperPlane, faQuoteLeft} from '@fortawesome/free-solid-svg-icons';
import Avatar from '../../../../components/avatar';
import {IComment, IPost} from '../../../../api/post/interface';
import {formatTimeAgo} from '../../../../utils/date';

interface IPostCardProps {
  post: IPost;
  isLikeSubmitting?: boolean;
  isCommentSubmitting?: boolean;
  onToggleLike: (postId: string) => void | Promise<void>;
  onAddComment: (postId: string, commentText: string) => void | Promise<void>;
}

const PostCard: React.FC<IPostCardProps> = ({
  post,
  isLikeSubmitting = false,
  isCommentSubmitting = false,
  onToggleLike,
  onAddComment,
}) => {
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      return;
    }

    await onAddComment(post._id, commentText);
    setCommentText('');
    setIsCommentOpen(true);
  };

  const renderComment = (comment: IComment) => {
    return (
      <div
        key={comment._id}
        className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition duration-200 hover:border-sky-200 hover:shadow-md"
      >
        <div className="flex h-fit rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 p-0.5 shadow-sm">
          <Avatar src={comment.user.avatar} size="34" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="truncate text-sm font-black text-slate-900">{comment.user.fullname}</p>
            <p className="text-xs font-semibold text-slate-400">{formatTimeAgo(comment.createdAt)}</p>
          </div>
          <p className="text-xs font-semibold text-slate-500">@{comment.user.username}</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{comment.content}</p>
        </div>
      </div>
    );
  };

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60 transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-2xl hover:shadow-slate-200/80 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-full bg-gradient-to-br from-sky-400 via-indigo-400 to-violet-400 p-0.5 shadow-md shadow-sky-200">
            <Avatar src={post.user.avatar} size="48" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-black text-slate-950">{post.user.fullname}</p>
            <p className="truncate text-sm font-semibold text-slate-500">
              @{post.user.username} · {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-100">
          <FontAwesomeIcon icon={faQuoteLeft} className="text-[10px]" />
          Bài đăng
        </span>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700 sm:text-base">{post.content}</p>

      {post.images.length > 0 && (
        <div className={`mt-4 grid gap-3 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.images.map((image) => {
            return (
              <div
                key={image}
                className="group overflow-hidden rounded-3xl bg-slate-100 shadow-sm ring-1 ring-slate-200"
              >
                <img
                  src={image}
                  alt="Bài đăng"
                  className={`${post.images.length === 1 ? 'h-72 sm:h-96' : 'h-44 sm:h-56'} w-full object-cover transition duration-700 ease-out group-hover:scale-105`}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4 text-sm font-bold">
        <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-600 ring-1 ring-rose-100">
          {post.likeCount} lượt thích
        </span>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700 ring-1 ring-sky-100">
          {post.commentCount} bình luận
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-black shadow-sm transition duration-200 focus:outline-none focus:ring-4 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
            post.isLiked
              ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-100 hover:bg-rose-100 focus:ring-rose-100'
              : 'bg-slate-100 text-slate-600 hover:-translate-y-0.5 hover:bg-slate-200 focus:ring-slate-200'
          }`}
          onClick={() => onToggleLike(post._id)}
          disabled={isLikeSubmitting}
        >
          <FontAwesomeIcon icon={post.isLiked ? faHeartSolid : faHeart} />
          {post.isLiked ? 'Đã thích' : 'Thích'}
        </button>

        <button
          type="button"
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-black shadow-sm transition duration-200 focus:outline-none focus:ring-4 focus:ring-sky-100 active:scale-95 ${
            isCommentOpen
              ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-100'
              : 'bg-slate-100 text-slate-600 hover:-translate-y-0.5 hover:bg-slate-200'
          }`}
          onClick={() => setIsCommentOpen((prev) => !prev)}
        >
          <FontAwesomeIcon icon={faMessage} />
          Bình luận
        </button>
      </div>

      {isCommentOpen && (
        <div className="mt-4 space-y-3 rounded-3xl border border-slate-200 bg-slate-50/80 p-3 shadow-inner shadow-white/80">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Viết bình luận..."
              disabled={isCommentSubmitting}
              className="h-11 flex-1 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition duration-200 placeholder:text-slate-400 hover:border-sky-300 focus:border-sky-500 focus:shadow-[0_0_0_4px_rgba(14,165,233,0.14)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            />
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 px-5 text-sm font-black text-white shadow-lg shadow-sky-500/25 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/30 focus:outline-none focus:ring-4 focus:ring-sky-200 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleSubmitComment}
              disabled={isCommentSubmitting}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
              {isCommentSubmitting ? 'Đang gửi...' : 'Gửi'}
            </button>
          </div>

          {post.comments.length > 0 ? (
            <div className="space-y-3">{post.comments.map(renderComment)}</div>
          ) : (
            <div className="rounded-2xl bg-white p-4 text-sm font-semibold text-slate-500 ring-1 ring-slate-100">
              Chưa có bình luận nào.
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export default PostCard;
