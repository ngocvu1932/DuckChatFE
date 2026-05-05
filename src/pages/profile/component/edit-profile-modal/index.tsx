import React, {useEffect, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
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
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-0">
      <div className="overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Chinh sua ho so</h2>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Ho va ten</p>
            <TextInput value={fullname} changeText={setFullname} className="h-11 w-full" rounded="lg" />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">So dien thoai</p>
            <TextInput value={phone} changeText={setPhone} className="h-11 w-full" rounded="lg" />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Dia chi</p>
            <TextInput value={address} changeText={setAddress} className="h-11 w-full" rounded="lg" />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            onClick={onClose}
          >
            Huy
          </button>
          <button
            type="button"
            className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
            onClick={() => onSave({fullname: fullname.trim(), phone: phone.trim(), address: address.trim()})}
          >
            Luu thay doi
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditProfileModal;
