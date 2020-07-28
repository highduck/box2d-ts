/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
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

import {b2Vec2, XY} from "../common/b2Math";
import {b2AABB, b2RayCastInput} from "./b2Collision";
import {b2DynamicTree, b2TreeNode} from "./b2DynamicTree";

function std_iter_swap<T>(array: T[], a: number, b: number): void {
    const tmp: T = array[a];
    array[a] = array[b];
    array[b] = tmp;
}

function default_compare<T>(a: T, b: T): boolean {
    return a < b;
}

function std_sort<T>(array: T[], first: number = 0, len: number = array.length - first, cmp: (a: T, b: T) => boolean = default_compare): T[] {
    let left = first;
    const stack: number[] = [];
    let pos = 0;

    for (; ;) { /* outer loop */
        for (; left + 1 < len; len++) { /* sort left to len-1 */
            const pivot = array[left + Math.floor(Math.random() * (len - left))]; /* pick random pivot */
            stack[pos++] = len; /* sort right part later */
            for (let right = left - 1; ;) { /* inner loop: partitioning */
                while (cmp(array[++right], pivot)) {
                } /* look for greater element */
                while (cmp(pivot, array[--len])) {
                } /* look for smaller element */
                if (right >= len) {
                    break;
                } /* partition point found? */
                std_iter_swap(array, right, len); /* the only swap */
            } /* partitioned, continue left part */
        }
        if (pos === 0) {
            break;
        } /* stack empty? */
        left = len; /* left to right is sorted */
        len = stack[--pos]; /* get next range to sort */
    }

    return array;
}

export class b2Pair<T> {
    constructor(public proxyA: b2TreeNode<T>,
                public proxyB: b2TreeNode<T>) {
    }
}

/// The broad-phase is used for computing pairs and performing volume queries and ray casts.
/// This broad-phase does not persist pairs. Instead, this reports potentially new pairs.
/// It is up to the client to consume the new pairs and to track subsequent overlap.
export class b2BroadPhase<T> {

    private _queryCache: b2TreeNode<T>[] = [];

    readonly m_tree: b2DynamicTree<T> = new b2DynamicTree<T>();
    m_proxyCount: number = 0;
    // m_moveCapacity: number = 16;
    m_moveCount: number = 0;
    readonly m_moveBuffer: Array<b2TreeNode<T> | null> = [];
    // m_pairCapacity: number = 16;
    m_pairCount: number = 0;
    readonly m_pairBuffer: Array<b2Pair<T>> = [];
    // m_queryProxyId: number = 0;

    /// Create a proxy with an initial AABB. Pairs are not reported until
    /// UpdatePairs is called.
    CreateProxy(aabb: b2AABB, userData: T): b2TreeNode<T> {
        const proxy: b2TreeNode<T> = this.m_tree.CreateProxy(aabb, userData);
        ++this.m_proxyCount;
        this.BufferMove(proxy);
        return proxy;
    }

    /// Destroy a proxy. It is up to the client to remove any pairs.
    DestroyProxy(proxy: b2TreeNode<T>): void {
        this.UnBufferMove(proxy);
        --this.m_proxyCount;
        this.m_tree.DestroyProxy(proxy);
    }

    /// Call MoveProxy as many times as you like, then when you are done
    /// call UpdatePairs to finalized the proxy pairs (for your time step).
    MoveProxy(proxy: b2TreeNode<T>, aabb: b2AABB, displacement: b2Vec2): void {
        const buffer: boolean = this.m_tree.MoveProxy(proxy, aabb, displacement);
        if (buffer) {
            this.BufferMove(proxy);
        }
    }

    /// Call to trigger a re-processing of it's pairs on the next call to UpdatePairs.
    TouchProxy(proxy: b2TreeNode<T>): void {
        this.BufferMove(proxy);
    }

    /// Get the fat AABB for a proxy.
    // GetFatAABB(proxy: b2TreeNode<T>): b2AABB {
    //   return this.m_tree.GetFatAABB(proxy);
    // }

    /// Get user data from a proxy. Returns NULL if the id is invalid.
    // GetUserData(proxy: b2TreeNode<T>): T {
    //   return this.m_tree.GetUserData(proxy);
    // }

    /// Test overlap of fat AABBs.
    // TestOverlap(proxyA: b2TreeNode<T>, proxyB: b2TreeNode<T>): boolean {
    //   const aabbA: b2AABB = this.m_tree.GetFatAABB(proxyA);
    //   const aabbB: b2AABB = this.m_tree.GetFatAABB(proxyB);
    //   return b2TestOverlapAABB(aabbA, aabbB);
    // }

    /// Get the number of proxies.
    GetProxyCount(): number {
        return this.m_proxyCount;
    }

    /// Update the pairs. This results in pair callbacks. This can only add pairs.
    // UpdatePairs(callback: (a: T, b: T) => void): void {
    //   // Reset pair buffer
    //   this.m_pairCount = 0;
    //
    //   // Perform tree queries for all moving proxies.
    //   for (let i = 0; i < this.m_moveCount; ++i) {
    //     const queryProxy: b2TreeNode<T> | null = this.m_moveBuffer[i];
    //     if (queryProxy === null) {
    //       continue;
    //     }
    //
    //     // This is called from box2d.b2DynamicTree::Query when we are gathering pairs.
    //     // boolean b2BroadPhase::QueryCallback(int32 proxyId);
    //
    //     // We have to query the tree with the fat AABB so that
    //     // we don't fail to create a pair that may touch later.
    //     const fatAABB: b2AABB = queryProxy.aabb; // this.m_tree.GetFatAABB(queryProxy);
    //
    //     // Query tree, create pairs and add them pair buffer.
    //     this.m_tree.Query(fatAABB, (proxy: b2TreeNode<T>): boolean => {
    //       // A proxy cannot form a pair with itself.
    //       if (proxy.m_id === queryProxy.m_id) {
    //         return true;
    //       }
    //
    //       // const proxyA = proxy < queryProxy ? proxy : queryProxy;
    //       // const proxyB = proxy >= queryProxy ? proxy : queryProxy;
    //       let proxyA: b2TreeNode<T>;
    //       let proxyB: b2TreeNode<T>;
    //       if (proxy.m_id < queryProxy.m_id) {
    //         proxyA = proxy;
    //         proxyB = queryProxy;
    //       } else {
    //         proxyA = queryProxy;
    //         proxyB = proxy;
    //       }
    //
    //       // Grow the pair buffer as needed.
    //       if (this.m_pairCount === this.m_pairBuffer.length) {
    //         this.m_pairBuffer[this.m_pairCount] = new b2Pair(proxyA, proxyB);
    //       } else {
    //         const pair: b2Pair<T> = this.m_pairBuffer[this.m_pairCount];
    //         pair.proxyA = proxyA;
    //         pair.proxyB = proxyB;
    //       }
    //
    //       ++this.m_pairCount;
    //
    //       return true;
    //     });
    //   }
    //
    //   // Reset move buffer
    //   this.m_moveCount = 0;
    //
    //   // Sort the pair buffer to expose duplicates.
    //   std_sort(this.m_pairBuffer, 0, this.m_pairCount, b2PairLessThan);
    //
    //   // Send the pairs back to the client.
    //   let i: number = 0;
    //   while (i < this.m_pairCount) {
    //     const primaryPair: b2Pair<T> = this.m_pairBuffer[i];
    //     const userDataA: T = primaryPair.proxyA.userData; // this.m_tree.GetUserData(primaryPair.proxyA);
    //     const userDataB: T = primaryPair.proxyB.userData; // this.m_tree.GetUserData(primaryPair.proxyB);
    //
    //     callback(userDataA, userDataB);
    //     ++i;
    //
    //     // Skip any duplicate pairs.
    //     while (i < this.m_pairCount) {
    //       const pair: b2Pair<T> = this.m_pairBuffer[i];
    //       if (pair.proxyA.m_id !== primaryPair.proxyA.m_id || pair.proxyB.m_id !== primaryPair.proxyB.m_id) {
    //         break;
    //       }
    //       ++i;
    //     }
    //   }
    //
    //   // Try to keep the tree balanced.
    //   // this.m_tree.Rebalance(4);
    // }

    /// Update the pairs. This results in pair callbacks. This can only add pairs.
    UpdatePairs_(a: T[], b: T[]): void {
        // Reset pair buffer
        this.m_pairCount = 0;

        // Perform tree queries for all moving proxies.
        this._PerformTreeQueriesForMovingProxies();

        // Reset move buffer
        this.m_moveCount = 0;

        // Sort the pair buffer to expose duplicates.
        std_sort(this.m_pairBuffer, 0, this.m_pairCount, b2PairLessThan);

        // Send the pairs back to the client.
        this._SendPairsBackToClient(a, b);

        // Try to keep the tree balanced.
        // this.m_tree.Rebalance(4);
    }

    _PerformTreeQueriesForMovingProxies(): void {
        // Perform tree queries for all moving proxies.
        for (let i = 0; i < this.m_moveCount; ++i) {
            const queryProxy: b2TreeNode<T> | null = this.m_moveBuffer[i];
            if (queryProxy === null) {
                continue;
            }

            // This is called from box2d.b2DynamicTree::Query when we are gathering pairs.
            // boolean b2BroadPhase::QueryCallback(int32 proxyId);

            // We have to query the tree with the fat AABB so that
            // we don't fail to create a pair that may touch later.
            const fatAABB: b2AABB = queryProxy.aabb; // this.m_tree.GetFatAABB(queryProxy);

            this._queryCache.length = 0;
            // Query tree, create pairs and add them pair buffer.
            this.m_tree.Query_(fatAABB, this._queryCache);
            for (let j = 0; j < this._queryCache.length; ++j) {
                const proxy: b2TreeNode<T> = this._queryCache[j];
                // A proxy cannot form a pair with itself.
                if (proxy.m_id === queryProxy.m_id) {
                    continue;
                }

                // const proxyA = proxy < queryProxy ? proxy : queryProxy;
                // const proxyB = proxy >= queryProxy ? proxy : queryProxy;
                let proxyA: b2TreeNode<T>;
                let proxyB: b2TreeNode<T>;
                if (proxy.m_id < queryProxy.m_id) {
                    proxyA = proxy;
                    proxyB = queryProxy;
                } else {
                    proxyA = queryProxy;
                    proxyB = proxy;
                }

                // Grow the pair buffer as needed.
                if (this.m_pairCount === this.m_pairBuffer.length) {
                    this.m_pairBuffer[this.m_pairCount] = new b2Pair(proxyA, proxyB);
                } else {
                    const pair: b2Pair<T> = this.m_pairBuffer[this.m_pairCount];
                    pair.proxyA = proxyA;
                    pair.proxyB = proxyB;
                }

                ++this.m_pairCount;
            }
        }
    }

    _SendPairsBackToClient(a: T[], b: T[]) {
        const count = this.m_pairCount;
        let i: number = 0;
        let j: number = 0;
        while (i < count) {
            const primaryPair: b2Pair<T> = this.m_pairBuffer[i];
            a[j] = primaryPair.proxyA.userData; // this.m_tree.GetUserData(primaryPair.proxyA);
            b[j] = primaryPair.proxyB.userData; // this.m_tree.GetUserData(primaryPair.proxyB);
            ++j;
            ++i;

            // Skip any duplicate pairs.
            while (i < count) {
                const pair: b2Pair<T> = this.m_pairBuffer[i];
                if (pair.proxyA.m_id !== primaryPair.proxyA.m_id || pair.proxyB.m_id !== primaryPair.proxyB.m_id) {
                    break;
                }
                ++i;
            }
        }
    }

    /// Query an AABB for overlapping proxies. The callback class
    /// is called for each proxy that overlaps the supplied AABB.
    Query(aabb: b2AABB, callback: (node: b2TreeNode<T>) => boolean): void {
        this.m_tree.Query(aabb, callback);
    }

    QueryPoint(point: XY, callback: (node: b2TreeNode<T>) => boolean): void {
        this.m_tree.QueryPoint(point, callback);
    }

    /// Ray-cast against the proxies in the tree. This relies on the callback
    /// to perform a exact ray-cast in the case were the proxy contains a shape.
    /// The callback also performs the any collision filtering. This has performance
    /// roughly equal to k * log(n), where k is the number of collisions and n is the
    /// number of proxies in the tree.
    /// @param input the ray-cast input data. The ray extends from p1 to p1 + maxFraction * (p2 - p1).
    /// @param callback a callback class that is called for each proxy that is hit by the ray.
    RayCast(input: b2RayCastInput, callback: (input: b2RayCastInput, node: b2TreeNode<T>) => number): void {
        this.m_tree.RayCast(input, callback);
    }

    /// Get the height of the embedded tree.
    GetTreeHeight(): number {
        return this.m_tree.GetHeight();
    }

    /// Get the balance of the embedded tree.
    GetTreeBalance(): number {
        return this.m_tree.GetMaxBalance();
    }

    /// Get the quality metric of the embedded tree.
    GetTreeQuality(): number {
        return this.m_tree.GetAreaRatio();
    }

    /// Shift the world origin. Useful for large worlds.
    /// The shift formula is: position -= newOrigin
    /// @param newOrigin the new origin with respect to the old origin
    ShiftOrigin(newOrigin: XY): void {
        this.m_tree.ShiftOrigin(newOrigin);
    }

    BufferMove(proxy: b2TreeNode<T>): void {
        this.m_moveBuffer[this.m_moveCount] = proxy;
        ++this.m_moveCount;
    }

    UnBufferMove(proxy: b2TreeNode<T>): void {
        const i: number = this.m_moveBuffer.indexOf(proxy);
        if (i >= 0) {
            this.m_moveBuffer[i] = null;
        }
    }
}

/// This is used to sort pairs.
function b2PairLessThan<T>(pair1: b2Pair<T>, pair2: b2Pair<T>): boolean {
    if (pair1.proxyA.m_id < pair2.proxyA.m_id) {
        return true;
    }

    if (pair1.proxyA.m_id === pair2.proxyA.m_id) {
        return pair1.proxyB.m_id < pair2.proxyB.m_id;
    }

    return false;
}
