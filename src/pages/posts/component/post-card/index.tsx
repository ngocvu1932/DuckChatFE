import React, {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faHeart, faMessage} from '@fortawesome/free-regular-svg-icons';
import {faHeart as faHeartSolid} from '@fortawesome/free-solid-svg-icons';
import Avatar from '../../../../components/avatar';
import {IComment, IPost} from '../../interface';

interface IPostCardProps {
  post: IPost;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
}

const PostCard: React.FC<IPostCardProps> = ({post, onToggleLike, onAddComment}) => {
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleSubmitComment = () => {
    if (!commentText.trim()) {
      return;
    }

    onAddComment(post._id, commentText);
    setCommentText('');
    setIsCommentOpen(true);
  };

  const renderComment = (comment: IComment) => {
    return (
      <div key={comment._id} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
        <Avatar src={comment.user.avatar} size="34" />
        <div>
          <p className="text-sm font-semibold text-slate-800">{comment.user.fullname}</p>
          <p className="text-xs text-slate-500">@{comment.user.username}</p>
          <p className="mt-1 text-sm text-slate-700">{comment.content}</p>
        </div>
      </div>
    );
  };

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar src={post.user.avatar} size="48" />
          <div>
            <p className="font-semibold text-slate-800">{post.user.fullname}</p>
            <p className="text-sm text-slate-500">
              @{post.user.username} · {post.createdLabel}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-slate-700">{post.content}</p>

      {post.images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {post.images.map((image) => {
            return <img key={image} src={image} alt="post" className="h-52 w-full rounded-2xl object-cover" />;
          })}
        </div>
      )}

      <div className="mt-4 flex items-center gap-5 border-b border-slate-100 pb-4 text-sm text-slate-500">
        <span>{post.likeCount} luot thich</span>
        <span>{post.commentCount} binh luan</span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
            post.isLiked ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          onClick={() => onToggleLike(post._id)}
        >
          <FontAwesomeIcon icon={post.isLiked ? faHeartSolid : faHeart} />
          {post.isLiked ? 'Da thich' : 'Thich'}
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
          onClick={() => setIsCommentOpen((prev) => !prev)}
        >
          <FontAwesomeIcon icon={faMessage} />
          Binh luan
        </button>
      </div>

      {isCommentOpen && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Viet binh luan..."
              className="h-11 flex-1 rounded-full border border-slate-200 px-4 outline-none transition focus:border-blue-400"
            />
            <button
              type="button"
              className="rounded-full bg-blue-500 px-4 text-sm font-medium text-white transition hover:bg-blue-600"
              onClick={handleSubmitComment}
            >
              Gui
            </button>
          </div>

          {post.comments.length > 0 ? (
            <div className="space-y-3">{post.comments.map(renderComment)}</div>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Chua co binh luan nao.</div>
          )}
        </div>
      )}
    </article>
  );
};

export default PostCard;
