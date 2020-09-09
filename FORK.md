- Project Structure remade to monorepo
- pnpm
- TS projects and root solution
- TS -> ESM -> ROLLUP to anything

Code style changes:
- [ ] make it simple (declarations)
- [x] no namespaces
- [ ] remove prefixes
- [ ] remove simple get/set methods
- [x] remove `.js` from all imports
- [ ] 

some of optimizations:
- [x] add `b2Body::SetLinearVelocityXY(x, y)`
- [x] remove TypedArray and custom constructors from: `b2Vec2`, `b2Vec3`, `b2Mat22`, `b2Mat33`, `b2Color`
- [x] remove `subarray` allocations from set buffer functions in `b2ParticleSystem`
- [ ] flat structures Mat22, Rot, Transform, etc
- [ ] remove optional Math constructors
- [x] `const enum` for: 
        - `b2BodyType`
        - `b2ContactFeatureType`
        - `b2ManifoldType`
        - `b2TOIOutputState`
        - `b2SeparationFunctionType`
        - `b2ShapeType`
        - `b2DrawFlags`
        - `b2JointType`
        - `b2LimitState`
        - `b2ParticleFlag`
        - `b2ParticleGroupFlag`
       TODO: provide const enum for JS usage 
- [x] remove `for-of` loops: not detected (`b2Fixture`)
- [x] `b2ContactFactory::m_registers[(typeA << 4) | typeB]` hack
- [ ] TODO: `b2Pair` allocation in `b2BroadPhase` ??
- [x] Reuse single `m_profile` and introduce `enabled` switch to get rid Timers overhead

Fixes:
- Fix `b2GrowableStack` null check

- Some Redundant checks,
- Cache Shape radius and type in Fixture to avoid type remapping in preparation code
- `NaN` hacks all around dynamic DOUBLES fields (v8 wrong map deopt fix)
 