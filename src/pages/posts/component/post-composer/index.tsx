import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faImage} from '@fortawesome/free-regular-svg-icons';
import Avatar from '../../../../components/avatar';
import {IPostAuthor} from '../../interface';

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
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar src={currentUser.avatar} size="48" />
        <div className="flex-1">
          <p className="font-semibold text-slate-800">{currentUser.fullname}</p>
          <p className="text-sm text-slate-500">@{currentUser.username}</p>
        </div>
      </div>

      <div className="mt-4">
        <textarea
          value={content}
          onChange={(event) => onChangeContent(event.target.value)}
          placeholder="Ban dang nghi gi?"
          className="min-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
        />
      </div>

      {attachedImages.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {attachedImages.map((image) => {
            return (
              <div key={image} className="relative overflow-hidden rounded-2xl border border-slate-200">
                <img src={image} alt="preview" className="h-40 w-full object-cover" />
                <button
                  type="button"
                  className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-slate-700"
                  onClick={() => onRemoveImage(image)}
                >
                  Xoa
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
          onClick={onAttachImage}
        >
          <FontAwesomeIcon icon={faImage} />
          Them anh mau
        </button>

        <button
          type="button"
          className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
          onClick={onSubmit}
          disabled={isDisabled}
        >
          {isSubmitting ? 'Dang dang...' : 'Dang bai'}
        </button>
      </div>
    </div>
  );
};

export default PostComposer;
