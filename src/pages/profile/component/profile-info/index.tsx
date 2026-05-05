import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCalendarDays, faEnvelope, faLocationDot, faPhone, faUser} from '@fortawesome/free-solid-svg-icons';
import {IUser} from '../../../../api/auth/interface';

interface IProfileInfoProps {
  user: IUser;
}

const ProfileInfo: React.FC<IProfileInfoProps> = ({user}) => {
  const infoItems = [
    {label: 'Ho va ten', value: user.fullname || 'Chua cap nhat', icon: faUser},
    {label: 'Email', value: user.email || 'Chua cap nhat', icon: faEnvelope},
    {label: 'So dien thoai', value: user.phone || 'Chua cap nhat', icon: faPhone},
    {label: 'Dia chi', value: user.address || 'Chua cap nhat', icon: faLocationDot},
    {label: 'Ngay tham gia', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Chua ro', icon: faCalendarDays},
  ];

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Thong tin</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-800">Thong tin ca nhan</h2>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {infoItems.map((item) => {
          return (
            <div key={item.label} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                <FontAwesomeIcon icon={item.icon} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-slate-400">{item.label}</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProfileInfo;
