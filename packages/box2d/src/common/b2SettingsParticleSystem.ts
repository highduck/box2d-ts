// Particle

/// A symbolic constant that stands for particle allocation error.
export const b2_invalidParticleIndex: number = -1;

export const b2_maxParticleIndex: number = 0x7FFFFFFF;

/// The default distance between particles, multiplied by the particle diameter.
export const b2_particleStride: number = 0.75;

/// The minimum particle weight that produces pressure.
export const b2_minParticleWeight: number = 1.0;

/// The upper limit for particle pressure.
export const b2_maxParticlePressure: number = 0.25;

/// The upper limit for force between particles.
export const b2_maxParticleForce: number = 0.5;

/// The maximum distance between particles in a triad, multiplied by the particle diameter.
export const b2_maxTriadDistance: number = 2.0;
export const b2_maxTriadDistanceSquared: number = (b2_maxTriadDistance * b2_maxTriadDistance);

/// The initial size of particle data buffers.
export const b2_minParticleSystemBufferCapacity: number = 256;

/// The time into the future that collisions against barrier particles will be detected.
export const b2_barrierCollisionTime: number = 2.5;