import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TCategory } from './category.interface';
import { Category } from './category.model';
import { capitalizeEveryWord } from '../../utils';

const createCategory = async (payload: TCategory) => {
  const prevCategories = await Category.findOne({
    name: new RegExp(payload?.name, 'i'),
  });
  if (prevCategories) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `${payload.name} category is already exist`,
    );
  }

  const modifiedName = capitalizeEveryWord(payload?.name);

  const result = await Category.create({
    name: modifiedName,
  });
  return result;
};

const getAllCategories = async () => {
  const result = await Category.find().select('name');
  return result;
};

const updateCategory = async (id: string, payload: TCategory) => {
  const prevCategory = await Category.findById(id);
  if (!prevCategory) {
    throw new AppError(httpStatus.NOT_FOUND, 'This category is not found');
  }
  if (prevCategory.name === payload.name) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Same category name is not acceptable for updating',
    );
  }
  const result = await Category.findByIdAndUpdate(
    id,
    {
      name: payload?.name,
    },
    { new: true },
  );
  return result;
};

const deleteCategory = async (id: string) => {
  await Category.findByIdAndDelete(id, { new: true });
  return 'Category Deleted successfully';
};

const deleteAllCategories = async () => {
  await Category.deleteMany({}, { new: true });
  return 'All categories deleted successfully';
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  deleteAllCategories,
};
