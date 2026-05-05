import moment from 'moment';

export const formatTime = (time: string): string => {
  const dateTime = moment(time).format('HH:mm');
  return dateTime;
};

export const formatTimeHHMM = (isoString: string) => {
  return moment(isoString).format('HH:mm');
};

export const formatMessageDateTime = (isoString: string): string => {
  const m = moment(isoString);

  if (m.isSame(moment(), 'day')) {
    return 'Hôm nay';
  }

  if (m.isSame(moment().subtract(1, 'day'), 'day')) {
    return 'Hôm qua';
  }

  return m.format('HH:mm DD/MM/YYYY');
};

export function formatTimeAgo(input: string | Date): string {
  const now = new Date().getTime();
  const time = new Date(input).getTime();

  const diffMs = now - time;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return 'Vừa xong';
  }

  if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);
    return `${minutes} phút trước`;
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours} giờ trước`;
  }

  const days = Math.floor(diffMs / day);
  return `${days} ngày trước`;
}
