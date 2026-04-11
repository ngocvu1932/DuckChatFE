import moment from 'moment';

export const formatTime = (time: string): string => {
  const dateTime = moment(time).format('HH:mm');
  return dateTime;
};
