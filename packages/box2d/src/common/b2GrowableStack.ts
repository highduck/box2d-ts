/*
 * Copyright (c) 2010 Erin Catto http://www.box2d.org
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

import { b2Assert, b2MakeNullArray } from './b2Settings';

/// This is a growable LIFO stack with an initial capacity of N.
/// If the stack size exceeds the initial capacity, the heap is used
/// to increase the size of the stack.

export class b2GrowableStack<T> {
  m_stack: Array<T | null>;
  m_count = 0;

  constructor(N: number) {
    this.m_stack = b2MakeNullArray(N);
  }

  Reset(): this {
    this.m_count = 0;
    return this;
  }

  Push(element: T): void {
    if (this.m_count < this.m_stack.length) {
      this.m_stack[this.m_count] = element;
    } else {
      this.m_stack.push(element);
    }
    ++this.m_count;
  }

  Pop(): T {
    !!B2_DEBUG && b2Assert(this.m_count > 0);
    if (this.m_count === 0) {
      throw new Error();
    }
    --this.m_count;
    const element = this.m_stack[this.m_count]!;
    this.m_stack[this.m_count] = null;
    return element;
  }

  GetCount(): number {
    return this.m_count;
  }
}
