import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCameraRetro, faCircleCheck, faFeatherPointed, faPenToSquare} from '@fortawesome/free-solid-svg-icons';
import Avatar from '../../../../components/avatar';
import {IUser} from '../../../../api/auth/interface';

interface IProfileHeroProps {
  user: IUser;
  postCount: number;
  imageCount: number;
  onEdit: () => void;
}

const ProfileHero: React.FC<IProfileHeroProps> = ({user, postCount, imageCount, onEdit}) => {
  const stats = [
    {label: 'Bài đăng', value: postCount, icon: faFeatherPointed, tone: 'from-sky-500 to-cyan-400'},
    {label: 'Hình ảnh', value: imageCount, icon: faCameraRetro, tone: 'from-violet-500 to-fuchsia-400'},
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-sm shadow-slate-200/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/80">
      <div className="relative h-40 overflow-hidden bg-[radial-gradient(circle_at_top_left,#bfdbfe_0%,transparent_34%),linear-gradient(120deg,#0f172a_0%,#2563eb_48%,#7dd3fc_100%)] sm:h-44">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/35 to-transparent" />
        <div className="absolute bottom-5 left-5 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/90 shadow-sm backdrop-blur">
          Hồ sơ DuckChat
        </div>
      </div>

      <div className="relative px-4 pb-5 sm:px-5">
        <div className="-mt-14 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Avatar src={user.avatar ?? ''} size="120" />

            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{user.fullname}</h1>
                {user.isVerified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600 ring-1 ring-sky-100">
                    <FontAwesomeIcon icon={faCircleCheck} />
                    Đã xác thực
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium text-slate-500">@{user.username}</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Không gian cá nhân để quản lý thông tin, theo dõi bài đăng và kết nối nhanh với các tính năng trong
                DuckChat.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-end">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
              >
                <div
                  className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${item.tone} text-white shadow-sm`}
                >
                  <FontAwesomeIcon icon={item.icon} className="text-sm" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">{item.value}</p>
              </div>
            ))}

            <button
              type="button"
              className="col-span-2 inline-flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-200 active:translate-y-0 sm:min-h-0"
              onClick={onEdit}
            >
              <FontAwesomeIcon icon={faPenToSquare} />
              Chỉnh sửa hồ sơ
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHero;
