import {useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import HeaderComp from '../home/component/header';
import LoginPage from '../login';
import {RootState} from '../../redux/store';
import {setUser} from '../../redux/slices/userSlice';
import PostCard from '../posts/component/post-card';
import ProfileHero from './component/profile-hero';
import ProfileInfo from './component/profile-info';
import EditProfileModal from './component/edit-profile-modal';
import {IComment, IPost} from '../../api/post/interface';

const myPostsSeed = [
  {
    _id: 'my-post-1',
    content:
      'Hom nay minh review tiep giao dien ProfilePage cho DuckChat. Muc tieu la gọn, ro, va de noi API that sau nay.',
    images: ['https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'],
    likeCount: 12,
    commentCount: 1,
    isLiked: false,
    createdLabel: 'Hom nay',
    comments: [
      {
        _id: 'my-comment-1',
        user: {
          _id: 'friend-1',
          fullname: 'Minh Thu',
          username: 'minhthu',
          avatar: 'https://i.pravatar.cc/120?img=5',
        },
        content: 'Profile nay nhin on, tiep tuc nhe.',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    _id: 'my-post-2',
    content: 'Sau profile se la phase noi API update thong tin va danh sach bai dang that.',
    images: [],
    likeCount: 4,
    commentCount: 0,
    isLiked: true,
    createdLabel: '2 ngay truoc',
    comments: [],
  },
];

const ProfilePage = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [myPosts, setMyPosts] = useState<IPost[]>([]);

  const posts = useMemo<IPost[]>(() => {
    if (!user) {
      return [];
    }

    if (myPosts.length > 0) {
      return myPosts;
    }

    return myPostsSeed.map((post) => ({
      _id: post._id,
      user: {
        _id: user._id,
        fullname: user.fullname,
        username: user.username,
        avatar: user.avatar,
      },
      content: post.content,
      images: post.images,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      isLiked: post.isLiked,
      createdAt: new Date().toISOString(),
      createdLabel: post.createdLabel,
      comments: post.comments,
    }));
  }, [myPosts, user]);

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

  const handleToggleLike = (postId: string) => {
    setMyPosts((prev) => {
      const basePosts = prev.length > 0 ? prev : posts;

      return basePosts.map((post) => {
        if (post._id !== postId) {
          return post;
        }

        const isLiked = !post.isLiked;

        return {
          ...post,
          isLiked,
          likeCount: isLiked ? post.likeCount + 1 : Math.max(post.likeCount - 1, 0),
        };
      });
    });
  };

  const handleAddComment = (postId: string, commentText: string) => {
    const nextComment: IComment = {
      _id: `profile-comment-${Date.now()}`,
      user: {
        _id: user._id,
        fullname: user.fullname,
        username: user.username,
        avatar: user.avatar,
      },
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
    };

    setMyPosts((prev) => {
      const basePosts = prev.length > 0 ? prev : posts;

      return basePosts.map((post) => {
        if (post._id !== postId) {
          return post;
        }

        return {
          ...post,
          commentCount: post.commentCount + 1,
          comments: [...post.comments, nextComment],
        };
      });
    });
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-[#f4f7fb] p-1">
      <div className="flex h-[8vh] rounded-t-md border border-[#E0E0E0] bg-white">
        <HeaderComp />
      </div>

      <div className="flex h-[92vh] rounded-b-md border-x border-b border-[#E0E0E0] bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)]">
        <div className="h-full flex-1 overflow-y-auto px-4 py-5">
          <div className="mx-auto grid w-full max-w-7xl gap-5 xl:grid-cols-[1.7fr_1fr]">
            <div className="space-y-5">
              <ProfileHero
                user={user}
                postCount={posts.length}
                imageCount={imageCount}
                onEdit={() => setIsEditOpen(true)}
              />

              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Bai dang</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-800">Bai dang cua toi</h2>
                  </div>
                  <Link
                    to="/posts"
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
                  >
                    Sang bang tin
                  </Link>
                </div>

                <div className="mt-5 space-y-5">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        onToggleLike={handleToggleLike}
                        onAddComment={handleAddComment}
                      />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
                      Chua co bai dang nao. Hay sang trang Bai dang de tao bai dau tien.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-5">
              <ProfileInfo user={user} />

              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Dieu huong</p>
                <div className="mt-4 space-y-3">
                  <Link
                    to="/"
                    className="block rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Ve khu chat
                  </Link>
                  <Link
                    to="/posts"
                    className="block rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Ve bang tin
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
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
