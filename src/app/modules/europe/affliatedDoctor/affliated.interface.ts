export interface IAffiliatedDoctor {
  name: string;
  specialization: string;
  image: string; 
  active?: boolean; 
  createdAt?: Date;
  updatedAt?: Date;
}
