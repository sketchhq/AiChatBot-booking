import {
  SEQUELIZE
} from '../../core/constants';
import { Sequelize } from 'sequelize-typescript';

export const usersProviders = [

  {
    provide: SEQUELIZE,
    useValue: Sequelize,
  },
];
