import { Test } from '@highduck/box2d-testbed';
import { b2_version } from '@highduck/box2d';

export class Empty extends Test {
  constructor() {
    super();
    console.log(b2_version);
  }

  public static Create() {
    return new Empty();
  }
}
