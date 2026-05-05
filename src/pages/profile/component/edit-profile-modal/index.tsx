import React, {useEffect, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFloppyDisk, faLocationDot, faPhone, faUser, faXmark} from '@fortawesome/free-solid-svg-icons';
import {IUser} from '../../../../api/auth/interface';
import Modal from '../../../../components/modal';
import TextInput from '../../../../components/text-input';

interface IEditProfileModalProps {
  isOpen: boolean;
  user: IUser;
  onClose: () => void;
  onSave: (payload: {fullname: string; phone: string; address: string}) => void;
}

const EditProfileModal: React.FC<IEditProfileModalProps> = ({isOpen, user, onClose, onSave}) => {
  const [fullname, setFullname] = useState(user.fullname || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');

  useEffect(() => {
    setFullname(user.fullname || '');
    setPhone(user.phone || '');
    setAddress(user.address || '');
  }, [user, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl overflow-hidden p-0">
      <div className="rounded-3xl bg-white">
        <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-500">Hồ sơ</p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Chỉnh sửa hồ sơ</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">Cập nhật thông tin hiển thị trên trang cá nhân.</p>
            </div>

            <button
              type="button"
              aria-label="Đóng"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-slate-500 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-100 active:scale-95"
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Họ và tên</span>
            <TextInput
              value={fullname}
              changeText={setFullname}
              placeholder="Nhập họ và tên"
              prefix={<FontAwesomeIcon icon={faUser} />}
              className="h-12 w-full"
              rounded="xl"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Số điện thoại</span>
            <TextInput
              value={phone}
              changeText={setPhone}
              placeholder="Nhập số điện thoại"
              prefix={<FontAwesomeIcon icon={faPhone} />}
              className="h-12 w-full"
              rounded="xl"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Địa chỉ</span>
            <TextInput
              value={address}
              changeText={setAddress}
              placeholder="Nhập địa chỉ"
              prefix={<FontAwesomeIcon icon={faLocationDot} />}
              className="h-12 w-full"
              rounded="xl"
            />
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/80 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-200 active:translate-y-0"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/30 focus:outline-none focus:ring-4 focus:ring-sky-200 active:translate-y-0"
            onClick={() => onSave({fullname: fullname.trim(), phone: phone.trim(), address: address.trim()})}
          >
            <FontAwesomeIcon icon={faFloppyDisk} />
            Lưu thay đổi
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditProfileModal;
