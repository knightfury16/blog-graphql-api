import { PrismaSelect } from '@paljs/plugins';

// For the contex
export const prismaSelect = (info, raw = false) => {
  // user id is always selected
  const select = new PrismaSelect(info, {
    defaultFields: {
      User: { id: true }
    }
  });

  // returning literal function or only the select value
  return raw ? select : select.value;
};
