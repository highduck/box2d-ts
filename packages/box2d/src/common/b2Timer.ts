/*
* Copyright (c) 2011 Erin Catto http://box2d.org
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

/// Timer for profiling. This has platform specific code and may
/// not work on every platform.
export class b2Timer {
    m_start = NaN;

    constructor() {
        if(!!B2_ENABLE_PROFILER) {
            this.m_start = performance.now();
        }
    }

    /// Reset the timer.
    Reset(): b2Timer {
        if(!!B2_ENABLE_PROFILER) {
            this.m_start = performance.now();
        }
        return this;
    }

    /// Get the time since construction or the last reset.
    GetMilliseconds(): number {
        if(!!B2_ENABLE_PROFILER) {
            return (performance.now() - this.m_start);
        }
        else{
            return 0;
        }
    }
}

export class b2Counter {
    m_count = 0;
    m_min_count = 0;
    m_max_count = 0;

    GetCount(): number {
        return this.m_count;
    }

    GetMinCount(): number {
        return this.m_min_count;
    }

    GetMaxCount(): number {
        return this.m_max_count;
    }

    ResetCount(): number {
        const count = this.m_count;
        this.m_count = 0;
        return count;
    }

    ResetMinCount(): void {
        this.m_min_count = 0;
    }

    ResetMaxCount(): void {
        this.m_max_count = 0;
    }

    Increment(): void {
        ++this.m_count;

        if (this.m_max_count < this.m_count) {
            this.m_max_count = this.m_count;
        }
    }

    Decrement(): void {
        --this.m_count;

        if (this.m_min_count > this.m_count) {
            this.m_min_count = this.m_count;
        }
    }
}
