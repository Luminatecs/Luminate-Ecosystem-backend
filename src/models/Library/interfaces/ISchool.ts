import { BaseEntity } from "../../Auth/interfaces/BaseEntity";


export interface ISchool extends BaseEntity {
  "S.N"?: number;
  REGION: string;
  DISTRICT: string;
  SCHOOL: string;
  CATEGORIES: string;
  LOCATION: string;
  GENDER: string;
  RESIDENCY: string;
  "EMAIL ADDRESS": string;
  Categories2: string;
  electives: string;
  core: string;
}