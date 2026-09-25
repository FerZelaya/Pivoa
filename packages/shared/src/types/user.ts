export interface User {
  id: string;
  email: string;
  fullName: string | null;
  createdAt: string;
}

export interface CreateUserDto {
  email: string;
  fullName?: string;
}
