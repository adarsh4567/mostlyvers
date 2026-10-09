import { format } from 'date-fns';

export const formatPublishDate = (isoDate: string): string => {
  try {
    return format(new Date(isoDate), 'MMMM yyyy');
  } catch (error) {
    console.error('Error formatting date', error);
    return isoDate;
  }
};
