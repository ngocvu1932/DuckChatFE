import React from 'react';
import Avatar from '../../../../components/avatar';
import {IUser} from '../../../../api/auth/interface';

interface IProfileHeroProps {
  user: IUser;
  postCount: number;
  imageCount: number;
  onEdit: () => void;
}

const ProfileHero: React.FC<IProfileHeroProps> = ({user, postCount, imageCount, onEdit}) => {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="h-40 bg-[linear-gradient(120deg,#0f172a_0%,#2563eb_45%,#7dd3fc_100%)]" />

      <div className="relative px-6 pb-6">
        <div className="-mt-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-4">
            <div className="rounded-full border-4 border-white bg-white shadow-md">
              <Avatar src={user.avatar ?? ''} size="96" />
            </div>
            <div className="pb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-slate-900">{user.fullname}</h1>
                {user.isVerified && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                    Da xac thuc
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">@{user.username}</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Khong gian ca nhan de quan ly thong tin, theo doi bai dang va ket noi nhanh voi cac tinh nang trong
                DuckChat.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pb-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Bai dang</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">{postCount}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Hinh anh</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">{imageCount}</p>
            </div>
            <button
              type="button"
              className="rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
              onClick={onEdit}
            >
              Chinh sua ho so
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHero;
