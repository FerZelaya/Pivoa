export interface Category {
  id: string;
  userId: string | null;
  name: string;
  icon: string;
  color: string;
}

export interface CreateCategoryDto {
  name: string;
  icon: string;
  color: string;
}

export interface UpdateCategoryDto {
  name?: string;
  icon?: string;
  color?: string;
}
