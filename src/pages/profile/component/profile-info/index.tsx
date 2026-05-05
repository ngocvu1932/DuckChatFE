import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCalendarDays, faEnvelope, faLocationDot, faPhone, faUser} from '@fortawesome/free-solid-svg-icons';
import {IUser} from '../../../../api/auth/interface';

interface IProfileInfoProps {
  user: IUser;
}

const ProfileInfo: React.FC<IProfileInfoProps> = ({user}) => {
  const infoItems = [
    {label: 'Họ và tên', value: user.fullname || 'Chưa cập nhật', icon: faUser, tone: 'text-sky-700 bg-sky-50'},
    {label: 'Email', value: user.email || 'Chưa cập nhật', icon: faEnvelope, tone: 'text-indigo-700 bg-indigo-50'},
    {label: 'Số điện thoại', value: user.phone || 'Chưa cập nhật', icon: faPhone, tone: 'text-emerald-700 bg-emerald-50'},
    {label: 'Địa chỉ', value: user.address || 'Chưa cập nhật', icon: faLocationDot, tone: 'text-rose-700 bg-rose-50'},
    {
      label: 'Ngày tham gia',
      value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Chưa rõ',
      icon: faCalendarDays,
      tone: 'text-violet-700 bg-violet-50',
    },
  ];

  return (
    <section className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm shadow-slate-200/70">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 ring-1 ring-emerald-100">
          Thông tin
        </div>
        <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900">Thông tin cá nhân</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">Các thông tin cơ bản dùng cho hồ sơ DuckChat.</p>
      </div>

      <div className="mt-5 space-y-3">
        {infoItems.map((item) => {
          return (
            <div
              key={item.label}
              className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700 hover:shadow-md"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.tone} shadow-sm transition duration-200 group-hover:scale-105`}
              >
                <FontAwesomeIcon icon={item.icon} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                <p className="mt-1 break-words text-sm font-bold leading-6 text-slate-700">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProfileInfo;
