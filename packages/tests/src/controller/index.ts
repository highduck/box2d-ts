import { registerTest } from '../test';
import { BuoyancyTest } from './BuoyancyTest';

if (B2_ENABLE_CONTROLLER) {
  registerTest('Controllers', 'Buoyancy Test', BuoyancyTest.Create);
}
