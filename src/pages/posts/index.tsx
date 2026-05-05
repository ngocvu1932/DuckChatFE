import {useMemo, useState} from 'react';
import {useSelector} from 'react-redux';
import HeaderComp from '../home/component/header';
import LoginPage from '../login';
import {RootState} from '../../redux/store';
import PostComposer from './component/post-composer';
import PostCard from './component/post-card';
import {IComment, IPost, IPostAuthor} from './interface';

const sampleImages = [
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
];

const mockPosts: IPost[] = [
  {
    _id: 'post-1',
    user: {
      _id: 'user-2',
      fullname: 'Minh Thu',
      username: 'minhthu',
      avatar: 'https://i.pravatar.cc/120?img=5',
    },
    content:
      'Hom nay minh muon thu nghiem mot khu news feed rieng trong DuckChat. Neu lam tot, day se la noi chia se bai viet va cap nhat cua moi nguoi.',
    images: [sampleImages[0]],
    likeCount: 18,
    commentCount: 2,
    isLiked: false,
    createdAt: new Date().toISOString(),
    createdLabel: '5 phut truoc',
    comments: [
      {
        _id: 'comment-1',
        user: {
          _id: 'user-3',
          fullname: 'Duck Dev',
          username: 'duckdev',
          avatar: 'https://i.pravatar.cc/120?img=13',
        },
        content: 'UI nay nhin kha on, tiep tuc di.',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'comment-2',
        user: {
          _id: 'user-4',
          fullname: 'Lan Anh',
          username: 'lananh',
          avatar: 'https://i.pravatar.cc/120?img=11',
        },
        content: 'Mong co them upload anh that som.',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    _id: 'post-2',
    user: {
      _id: 'user-5',
      fullname: 'Hoang Nam',
      username: 'hoangnam',
      avatar: 'https://i.pravatar.cc/120?img=15',
    },
    content: 'Vua xong layout moi cho khu bai dang. Dang tinh them like va comment theo kieu nhe nhang truoc.',
    images: [sampleImages[1], sampleImages[2]],
    likeCount: 9,
    commentCount: 0,
    isLiked: true,
    createdAt: new Date().toISOString(),
    createdLabel: '23 phut truoc',
    comments: [],
  },
];

const PostPage = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const [posts, setPosts] = useState<IPost[]>(mockPosts);
  const [content, setContent] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = useMemo<IPostAuthor>(
    () => ({
      _id: user?._id ?? '',
      fullname: user?.fullname ?? 'Unknown User',
      username: user?.username ?? 'unknown',
      avatar: user?.avatar ?? 'https://i.pravatar.cc/120?img=9',
    }),
    [user],
  );

  if (!user) {
    return <LoginPage />;
  }

  const handleAttachImage = () => {
    const nextImage = sampleImages[attachedImages.length % sampleImages.length];

    if (attachedImages.includes(nextImage)) {
      return;
    }

    setAttachedImages((prev) => [...prev, nextImage]);
  };

  const handleRemoveImage = (image: string) => {
    setAttachedImages((prev) => prev.filter((item) => item !== image));
  };

  const handleSubmitPost = () => {
    if (!content.trim() && attachedImages.length === 0) {
      return;
    }

    setIsSubmitting(true);

    const nextPost: IPost = {
      _id: `post-${Date.now()}`,
      user: currentUser,
      content: content.trim(),
      images: attachedImages,
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      createdLabel: 'Vua xong',
      comments: [],
    };

    setTimeout(() => {
      setPosts((prev) => [nextPost, ...prev]);
      setContent('');
      setAttachedImages([]);
      setIsSubmitting(false);
    }, 300);
  };

  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post._id !== postId) {
          return post;
        }

        const isLiked = !post.isLiked;

        return {
          ...post,
          isLiked: isLiked,
          likeCount: isLiked ? post.likeCount + 1 : Math.max(post.likeCount - 1, 0),
        };
      }),
    );
  };

  const handleAddComment = (postId: string, commentText: string) => {
    const nextComment: IComment = {
      _id: `comment-${Date.now()}`,
      user: currentUser,
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((post) => {
        if (post._id !== postId) {
          return post;
        }

        return {
          ...post,
          commentCount: post.commentCount + 1,
          comments: [...post.comments, nextComment],
        };
      }),
    );
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-[#f4f7fb] p-1">
      <div className="flex h-[8vh] rounded-t-md border border-[#E0E0E0] bg-white">
        <HeaderComp />
      </div>

      <div className="flex h-[92vh] rounded-b-md border-x border-b border-[#E0E0E0] bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)]">
        <div className="hidden w-[22%] border-r border-slate-200 bg-white/70 p-5 lg:block">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Khong gian</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-800">Bang tin DuckChat</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Noi moi nguoi dang bai, chia se cap nhat va giu ket noi ngoai khung chat.
            </p>
          </div>
        </div>

        <div className="h-full flex-1 overflow-y-auto px-4 py-5">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
            <PostComposer
              currentUser={currentUser}
              content={content}
              attachedImages={attachedImages}
              isSubmitting={isSubmitting}
              onChangeContent={setContent}
              onAttachImage={handleAttachImage}
              onRemoveImage={handleRemoveImage}
              onSubmit={handleSubmitPost}
            />

            {posts.length > 0 ? (
              posts.map((post) => {
                return (
                  <PostCard
                    key={post._id}
                    post={post}
                    onToggleLike={handleToggleLike}
                    onAddComment={handleAddComment}
                  />
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                Chua co bai dang nao. Hay tao bai dau tien.
              </div>
            )}
          </div>
        </div>

        <div className="hidden w-[24%] border-l border-slate-200 bg-white/70 p-5 xl:block">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">MVP</p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
              <li>Dang bai bang text</li>
              <li>Gan anh mau de review UI</li>
              <li>Like va comment local</li>
              <li>San sang noi API that o phase tiep theo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
