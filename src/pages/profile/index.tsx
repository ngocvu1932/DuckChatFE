import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faComments,
  faCompass,
  faImage,
  faPenToSquare,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons';
import HeaderComp from '../home/component/header';
import LoginPage from '../login';
import {RootState} from '../../redux/store';
import {setUser} from '../../redux/slices/userSlice';
import PostCard from '../posts/component/post-card';
import ProfileHero from './component/profile-hero';
import ProfileInfo from './component/profile-info';
import EditProfileModal from './component/edit-profile-modal';
import {IPost} from '../../api/post/interface';
import postAPIs from '../../api/post';

const ProfilePage = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [posts, setPosts] = useState<IPost[]>([]);
  // const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  // const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);
  const [postError, setPostError] = useState('');
  const [submittingLikePostIds, setSubmittingLikePostIds] = useState<string[]>([]);
  const [submittingCommentPostIds, setSubmittingCommentPostIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user?._id) {
      return;
    }

    getPostsByUserId(user._id);
  }, [user?._id]);

  async function getPostsByUserId(userId: string, cursor?: string) {
    const isLoadMore = Boolean(cursor);

    if (isLoadMore) {
      // setIsLoadingMorePosts(true);
    } else {
      setIsLoadingPosts(true);
      setPosts([]);
      // setNextCursor(null);
    }

    setPostError('');

    try {
      const res = await postAPIs.getPostsByUserId(userId, 20, cursor);

      if (res.success) {
        setPosts((prev) => (isLoadMore ? [...prev, ...res.data] : res.data));
        // setNextCursor(res.nextCursor ?? null);
      } else {
        setPostError(res.message ?? 'Khong the lay danh sach bai dang.');
      }
    } catch (error) {
      console.log(error);
      setPostError('Khong the lay danh sach bai dang.');
    } finally {
      setIsLoadingPosts(false);
      // setIsLoadingMorePosts(false);
    }
  }

  if (!user) {
    return <LoginPage />;
  }

  const imageCount = posts.reduce((total, post) => total + post.images.length, 0);

  const handleSaveProfile = (payload: {fullname: string; phone: string; address: string}) => {
    dispatch(
      setUser({
        ...user,
        fullname: payload.fullname || user.fullname,
        phone: payload.phone,
        address: payload.address,
      }),
    );

    setIsEditOpen(false);
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
          isLiked,
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

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-100 p-2 text-slate-900 sm:p-2 lg:p-3">
      <div className="flex h-16 shrink-0 rounded-t-3xl border border-white/70 bg-white/90 shadow-sm shadow-slate-200/70 backdrop-blur">
        <HeaderComp />
      </div>

      <div className="flex h-[92vh] overflow-hidden rounded-b-2xl border-x border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_34%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)]">
        <main className="h-full flex-1 overflow-y-auto px-3 py-4 sm:px-5 lg:px-7">
          <div className="mx-auto grid w-full max-w-7xl gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
            <div className="space-y-5">
              <ProfileHero
                user={user}
                postCount={posts.length}
                imageCount={imageCount}
                onEdit={() => setIsEditOpen(true)}
              />

              <section className="rounded-2xl border border-white/80 bg-white/95 p-4 shadow-sm shadow-slate-200/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/80 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-sky-600 ring-1 ring-sky-100">
                      <FontAwesomeIcon icon={faWandMagicSparkles} />
                      Bài đăng
                    </div>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Bài đăng của tôi</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Theo dõi nội dung, hình ảnh và tương tác mới nhất trên hồ sơ của bạn.
                    </p>
                  </div>

                  <Link
                    to="/posts"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-100 active:translate-y-0"
                  >
                    Sang bảng tin
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                  </Link>
                </div>

                <div className="mt-6 space-y-5">
                  {isLoadingPosts ? (
                    <div className="rounded-2xl border border-slate-200 bg-white/80 p-10 text-center text-sm font-semibold text-slate-500 shadow-sm">
                      Dang tai bai dang...
                    </div>
                  ) : postError ? (
                    <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm font-semibold text-rose-600 shadow-sm">
                      {postError}
                    </div>
                  ) : posts.length > 0 ? (
                    posts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        isLikeSubmitting={submittingLikePostIds.includes(post._id)}
                        isCommentSubmitting={submittingCommentPostIds.includes(post._id)}
                        onToggleLike={handleToggleLike}
                        onAddComment={handleAddComment}
                      />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 shadow-sm">
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-slate-800">
                        Chưa có bài đăng nào. Hãy sang trang Bài đăng để tạo bài đầu tiên.
                      </p>
                    </div>
                  )}
                  {/* 
                  {!isLoadingPosts && nextCursor && (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => getPostsByUserId(user._id, nextCursor)}
                        disabled={isLoadingMorePosts}
                        className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-100 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isLoadingMorePosts ? 'Dang tai...' : 'Tai them'}
                      </button>
                    </div>
                  )} */}
                </div>
              </section>
            </div>

            <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
              <ProfileInfo user={user} />

              <section className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm shadow-slate-200/70">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 ring-1 ring-indigo-100">
                  <FontAwesomeIcon icon={faCompass} />
                  Điều hướng
                </div>

                <div className="mt-5 grid gap-3">
                  <Link
                    to="/"
                    className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-sky-100 active:translate-y-0"
                  >
                    <span className="inline-flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700 transition group-hover:bg-sky-600 group-hover:text-white">
                        <FontAwesomeIcon icon={faComments} />
                      </span>
                      Về khu chat
                    </span>
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="text-xs text-slate-400 transition group-hover:text-sky-600"
                    />
                  </Link>

                  <Link
                    to="/posts"
                    className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-100 active:translate-y-0"
                  >
                    <span className="inline-flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition group-hover:bg-violet-600 group-hover:text-white">
                        <FontAwesomeIcon icon={faImage} />
                      </span>
                      Về bảng tin
                    </span>
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="text-xs text-slate-400 transition group-hover:text-violet-600"
                    />
                  </Link>
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>

      <EditProfileModal
        isOpen={isEditOpen}
        user={user}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default ProfilePage;
