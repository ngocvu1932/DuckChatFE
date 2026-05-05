import {useEffect, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';
import HeaderComp from '../home/component/header';
import LoginPage from '../login';
import {RootState} from '../../redux/store';
import PostComposer from './component/post-composer';
import PostCard from './component/post-card';
import {IPost, IPostAuthor} from '../../api/post/interface';
import postAPIs from '../../api/post';

const sampleImages = [
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
];

const PostPage = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [content, setContent] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingLikePostIds, setSubmittingLikePostIds] = useState<string[]>([]);
  const [submittingCommentPostIds, setSubmittingCommentPostIds] = useState<string[]>([]);

  useEffect(() => {
    // getPosst
    getPosts();
  }, []);

  const getPosts = async () => {
    try {
      const res = await postAPIs.getPost(20);

      if (res.success) {
        setPosts(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const currentUser = useMemo<IPostAuthor>(
    () => ({
      _id: user?._id ?? '',
      fullname: user?.fullname ?? 'Unknown User',
      username: user?.username ?? 'unknown',
      avatar: user?.avatar ?? 'https://i.pravatar.cc/120?img=9',
    }),
    [user],
  );

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

  const handleSubmitPost = async () => {
    if (!content.trim() && attachedImages.length === 0) {
      return;
    }

    setIsSubmitting(true);

    const body = {
      content: content.trim(),
      images: attachedImages,
      visibility: 'PUBLIC',
    };

    try {
      const res = await postAPIs.createPost(body);

      if (res.success) {
        setPosts((prev) => [res.data, ...prev]);
        setContent('');
        setAttachedImages([]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (submittingLikePostIds.includes(postId)) {
      return;
    }

    const currentPost = posts.find((post) => post._id === postId);

    if (!currentPost) {
      return;
    }

    setSubmittingLikePostIds((prev) => [...prev, postId]);

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

    try {
      const res = await postAPIs.likePost({postId});

      if (res.success) {
        setPosts((prev) => prev.map((post) => (post._id === postId ? res.data : post)));
      } else {
        setPosts((prev) => prev.map((post) => (post._id === postId ? currentPost : post)));
      }
    } catch (error) {
      console.log(error);
      setPosts((prev) => prev.map((post) => (post._id === postId ? currentPost : post)));
    } finally {
      setSubmittingLikePostIds((prev) => prev.filter((id) => id !== postId));
    }
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    const trimmedComment = commentText.trim();

    if (!trimmedComment || submittingCommentPostIds.includes(postId)) {
      return;
    }

    setSubmittingCommentPostIds((prev) => [...prev, postId]);

    try {
      const res = await postAPIs.commentPost({
        postId,
        content: trimmedComment,
        images: [],
      });

      if (res.success) {
        setPosts((prev) => prev.map((post) => (post._id === postId ? res.data : post)));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSubmittingCommentPostIds((prev) => prev.filter((id) => id !== postId));
    }
  };

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-100 p-2 text-slate-900 sm:p-2 lg:p-3">
      <div className="flex h-16 shrink-0 rounded-t-3xl border border-white/70 bg-white/90 shadow-sm shadow-slate-200/70 backdrop-blur">
        <HeaderComp />
      </div>

      <div className="flex h-[92vh] overflow-hidden rounded-b-2xl border-x border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_34%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)]">
        <aside className="hidden w-[23%] min-w-[260px] border-r border-slate-200/80 bg-white/70 p-5 backdrop-blur-xl lg:block">
          <div className="sticky top-5 space-y-4">
            <section className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm shadow-slate-200/70">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-500">Không gian</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Bảng tin DuckChat </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Nơi mọi người đăng bài, chia sẻ cập nhật và giữ kết nối ngoài khung chat.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-800">Tin đang hoạt động</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-sky-50 px-3 py-2 text-sm">
                  <span className="font-medium text-slate-600">Bài đăng</span>
                  <span className="font-bold text-sky-600">{posts.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-3 py-2 text-sm">
                  <span className="font-medium text-slate-600">Ảnh đính kèm</span>
                  <span className="font-bold text-emerald-600">{attachedImages.length}</span>
                </div>
              </div>
            </section>
          </div>
        </aside>

        <main className="h-full flex-1 overflow-y-auto px-3 py-4 sm:px-5 lg:px-7">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 pb-8">
            <div className="rounded-2xl border border-white/80 bg-white/75 px-4 py-4 shadow-sm shadow-slate-200/70 backdrop-blur sm:px-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">Social feed</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Cập nhật mới nhất</h1>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Chia sẻ ý tưởng, hình ảnh và những khoảnh khắc đang diễn ra trong DuckChat.
                  </p>
                </div>
                <div className="flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.18)]" />
                  Live preview
                </div>
              </div>
            </div>

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

            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Bài đăng gần đây</h2>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">
                {posts.length} bài
              </span>
            </div>

            {posts.length > 0 ? (
              posts.map((post) => {
                return (
                  <PostCard
                    key={post._id}
                    post={post}
                    isLikeSubmitting={submittingLikePostIds.includes(post._id)}
                    isCommentSubmitting={submittingCommentPostIds.includes(post._id)}
                    onToggleLike={handleToggleLike}
                    onAddComment={handleAddComment}
                  />
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-800">Chưa có bài đăng nào</p>
                <p className="mt-2 text-sm text-slate-500">Hãy tạo bài đầu tiên để khởi động bảng tin.</p>
              </div>
            )}
          </div>
        </main>

        <aside className="hidden w-[25%] min-w-[300px] border-l border-slate-200/80 bg-white/70 p-5 backdrop-blur-xl xl:block">
          <div className="sticky top-5 space-y-4">
            <section className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm shadow-slate-200/70">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-500">MVP</p>
              <h3 className="mt-3 text-lg font-bold text-slate-900">San sang ket noi API</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Giao dien dang dung state local de giu luong tao bai, thich va binh luan.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-800">Tinh nang hien co</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  Dang bai bang text
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Gan anh mau de review UI
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  Like va comment local
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                  San sang noi API that o phase tiep theo
                </li>
              </ul>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-950 p-5 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-300">Design tone</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Clean SaaS dashboard, nhan nhe bang mau sky, indigo va emerald.
              </p>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PostPage;
