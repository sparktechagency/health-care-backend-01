export interface IAffiliatedDoctor {
  name: string;
  specialization: string;
  image: string; // Path to the doctor's image
  createdAt?: Date;
  updatedAt?: Date;
}
