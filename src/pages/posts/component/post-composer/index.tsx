import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faImage} from '@fortawesome/free-regular-svg-icons';
import Avatar from '../../../../components/avatar';
import {IPostAuthor} from '../../../../api/post/interface';

interface IPostComposerProps {
  currentUser: IPostAuthor;
  content: string;
  attachedImages: string[];
  isSubmitting?: boolean;
  onChangeContent: (value: string) => void;
  onAttachImage: () => void;
  onRemoveImage: (image: string) => void;
  onSubmit: () => void;
}

const PostComposer: React.FC<IPostComposerProps> = ({
  currentUser,
  content,
  attachedImages,
  isSubmitting = false,
  onChangeContent,
  onAttachImage,
  onRemoveImage,
  onSubmit,
}) => {
  const isDisabled = isSubmitting || (!content.trim() && attachedImages.length === 0);

  return (
    <section className="rounded-2xl border border-white/80 bg-white/95 p-4 shadow-sm shadow-slate-200/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/80 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 p-0.5">
          <Avatar src={currentUser.avatar} size="48" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-slate-900">{currentUser.fullname}</p>
          <p className="text-sm font-medium text-slate-500">@{currentUser.username}</p>
        </div>
        <span className="hidden rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600 ring-1 ring-sky-100 sm:inline-flex">
          Bài đăng mới
        </span>
      </div>

      <div className="mt-4">
        <textarea
          value={content}
          onChange={(event) => onChangeContent(event.target.value)}
          placeholder="Bạn đang nghĩ gì?"
          className="min-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-700 outline-none ring-0 transition duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-sky-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(56,189,248,0.14)] sm:text-base"
        />
      </div>

      {attachedImages.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {attachedImages.map((image) => {
            return (
              <div
                key={image}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm"
              >
                <img
                  src={image}
                  alt="preview"
                  className="h-40 w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                <button
                  type="button"
                  className="absolute right-2 top-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-200 active:scale-95"
                  onClick={() => onRemoveImage(image)}
                >
                  Xóa
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-100 active:translate-y-0"
          onClick={onAttachImage}
        >
          <FontAwesomeIcon icon={faImage} />
          Thêm ảnh mẫu
        </button>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-200 active:translate-y-0 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:text-white/80 disabled:shadow-none"
          onClick={onSubmit}
          disabled={isDisabled}
        >
          {isSubmitting ? 'Đang đăng...' : 'Đăng bài'}
        </button>
      </div>
    </section>
  );
};

export default PostComposer;
