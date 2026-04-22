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
