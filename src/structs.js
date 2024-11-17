import * as s from 'superstruct';

const CATEGORIES = [
  'FASHION',
  'BEAUTY',
  'SPORTS',
  'ELECTRONICS',
  'HOME_INTERIOR',
  'HOUSEHOLD_SUPPLIES',
  'KITCHENWARE',
];

export const CreatePoduct = s.object({
  name: s.size(s.string(), 1, 10), 
  description: s.optional(s.size(s.string(), 10, 100)),
  category: s.optional(s.enums(CATEGORIES)),
  price: s.min(s.number(), 0),
  stock: s.optional(s.min(s.integer(), 0)),
  images: s.optional(s.array(s.size(s.string(), 1, 255))),
  tags: s.optional(s.array(s.size(s.string(), 1, 5))),
  authorId: s.number(),
});

export const PatchProduct = s.partial(CreatePoduct);

export const CreateArticle = s.object({
  title: s.size(s.string(), 1, 255),      // 요구사항에 제약 조건이 없어 여유있게 지정
  content: s.size(s.string(), 1, 5000),
});

export const PatchArticle = s.partial(CreateArticle);

export const CreateArticleComment = s.object({
  content: s.size(s.string(), 1, 1000),
  userId: s.optional(s.number()), 
});

export const PatchArtcleComment = s.partial(CreateArticleComment);

export const CreateProductComment = s.object({
  content: s.size(s.string(), 1, 1000),
  userId: s.optional(s.number()), 
});

export const PatchProductComment = s.partial(CreateProductComment);