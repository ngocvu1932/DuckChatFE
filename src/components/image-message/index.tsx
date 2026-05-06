interface IImageMessageProps {
  images: string[];
}

const ImageMessage = ({images}: IImageMessageProps) => {
  const list = images.slice(0, 5);

  if (!list.length) return null;

  // 👉 1 ảnh
  if (list.length === 1) {
    return (
      <div className="max-w-[240px]">
        <img src={list[0]} className="w-full rounded-2xl object-cover" />
      </div>
    );
  }

  // 👉 2 ảnh
  if (list.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 max-w-[260px]">
        {list.map((img, i) => (
          <img key={i} src={img} className="aspect-square rounded-xl object-cover" />
        ))}
      </div>
    );
  }

  // 👉 3 ảnh (1 lớn + 2 nhỏ)
  if (list.length === 3) {
    return (
      <div className="grid grid-cols-2 gap-1 max-w-[260px]">
        <img src={list[0]} className="row-span-2 h-full rounded-xl object-cover" />
        <img src={list[1]} className="aspect-square rounded-xl object-cover" />
        <img src={list[2]} className="aspect-square rounded-xl object-cover" />
      </div>
    );
  }

  // 👉 4 ảnh
  if (list.length === 4) {
    return (
      <div className="grid grid-cols-2 gap-1 max-w-[260px]">
        {list.map((img, i) => (
          <img key={i} src={img} className="aspect-square rounded-xl object-cover" />
        ))}
      </div>
    );
  }

  // 👉 5 ảnh
  return (
    <div className="grid grid-cols-2 gap-1 max-w-[260px]">
      {list.map((img, i) => (
        <div key={i} className="relative">
          <img src={img} className="aspect-square rounded-xl object-cover" />

          {/* overlay +X */}
          {i === 4 && images.length > 5 && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 text-white text-lg font-bold">
              +{images.length - 5}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageMessage;
