import { b2ChainShape } from './b2ChainShape';
import { b2CircleShape } from './b2CircleShape';
import { b2EdgeShape } from './b2EdgeShape';
import { b2PolygonShape } from './b2PolygonShape';
import { b2Shape, b2ShapeType } from './b2Shape';

function DumpChainShape(shape: b2ChainShape, log: (format: string, ...args: any[]) => void): void {
  log('    const shape: b2ChainShape = new b2ChainShape();\n');
  log('    const vs: b2Vec2[] = [];\n');
  for (let i = 0; i < shape.m_count; ++i) {
    log('    vs[%d] = new bVec2(%.15f, %.15f);\n', i, shape.m_vertices[i].x, shape.m_vertices[i].y);
  }
  log('    shape.CreateChain(vs, %d);\n', shape.m_count);
  log('    shape.m_prevVertex.Set(%.15f, %.15f);\n', shape.m_prevVertex.x, shape.m_prevVertex.y);
  log('    shape.m_nextVertex.Set(%.15f, %.15f);\n', shape.m_nextVertex.x, shape.m_nextVertex.y);
  log('    shape.m_hasPrevVertex = %s;\n', shape.m_hasPrevVertex ? 'true' : 'false');
  log('    shape.m_hasNextVertex = %s;\n', shape.m_hasNextVertex ? 'true' : 'false');
}

function DumpCircleShape(
  shape: b2CircleShape,
  log: (format: string, ...args: any[]) => void,
): void {
  log('    const shape: b2CircleShape = new b2CircleShape();\n');
  log('    shape.m_radius = %.15f;\n', shape.m_radius);
  log('    shape.m_p.Set(%.15f, %.15f);\n', shape.m_p.x, shape.m_p.y);
}

function DumpEdgeShape(shape: b2EdgeShape, log: (format: string, ...args: any[]) => void): void {
  log('    const shape: b2EdgeShape = new b2EdgeShape();\n');
  log('    shape.m_radius = %.15f;\n', shape.m_radius);
  log('    shape.m_vertex0.Set(%.15f, %.15f);\n', shape.m_vertex0.x, shape.m_vertex0.y);
  log('    shape.m_vertex1.Set(%.15f, %.15f);\n', shape.m_vertex1.x, shape.m_vertex1.y);
  log('    shape.m_vertex2.Set(%.15f, %.15f);\n', shape.m_vertex2.x, shape.m_vertex2.y);
  log('    shape.m_vertex3.Set(%.15f, %.15f);\n', shape.m_vertex3.x, shape.m_vertex3.y);
  log('    shape.m_hasVertex0 = %s;\n', shape.m_hasVertex0);
  log('    shape.m_hasVertex3 = %s;\n', shape.m_hasVertex3);
}

function DumpPolygonShape(
  shape: b2PolygonShape,
  log: (format: string, ...args: any[]) => void,
): void {
  log('    const shape: b2PolygonShape = new b2PolygonShape();\n');
  log('    const vs: b2Vec2[] = [];\n');
  for (let i = 0; i < shape.m_count; ++i) {
    log(
      '    vs[%d] = new b2Vec2(%.15f, %.15f);\n',
      i,
      shape.m_vertices[i].x,
      shape.m_vertices[i].y,
    );
  }
  log('    shape.Set(vs, %d);\n', shape.m_count);
}

export function DumpShape(shape: b2Shape, log: (format: string, ...args: any[]) => void): void {
  if (shape.m_type === b2ShapeType.e_chainShape) {
    DumpChainShape(shape as b2ChainShape, log);
  } else if (shape.m_type === b2ShapeType.e_circleShape) {
    DumpCircleShape(shape as b2CircleShape, log);
  } else if (shape.m_type === b2ShapeType.e_edgeShape) {
    DumpEdgeShape(shape as b2EdgeShape, log);
  } else if (shape.m_type === b2ShapeType.e_polygonShape) {
    DumpPolygonShape(shape as b2PolygonShape, log);
  } else {
    // TODO: log error
  }
}
