import {
  LocationInUnloadedChunkError,
  LocationOutOfWorldBoundariesError,
  MolangVariableMap,
  world,
} from '@minecraft/server'
import { Vector } from 'lib/vector'

export const WE_CONFIG = {
  BRUSH_LOCATOR: '§c │ \n§c─┼─\n§c │',

  STRUCTURE_CHUNK_SIZE: { x: 64, y: 384, z: 64 },
  COPY_FILE_NAME: 'copy',
  BACKUP_PREFIX: 'backup',

  /** The ammout of blocks in a generation before it will check servers speed to delay the loading of a generation */
  BLOCKS_BEFORE_AWAIT: 10000,

  /** The ammout of ticks to delay during a heavy proccess generation */
  TICKS_TO_SLEEP: 1,

  DRAW_SELECTION_PARTICLE: 'minecraft:balloon_gas_particle',
  DRAW_SELECTION_MAX_SIZE: 5000,
  DRAW_SELECTION_PARTICLE_OPTIONS: new MolangVariableMap(),
}

WE_CONFIG.DRAW_SELECTION_PARTICLE_OPTIONS.setVector3('direction', {
  x: 0,
  y: 0,
  z: 0,
})

export function spawnParticlesInArea(
  pos1: Vector3,
  pos2: Vector3,
  { min = Vector.min(pos1, pos2), max = Vector.max(pos1, pos2) }: { min?: Vector3; max?: Vector3 } = {},
) {
  const size = Vector.size(min, max)
  if (size > WE_CONFIG.DRAW_SELECTION_MAX_SIZE) return
  for (const { x, y, z } of Vector.foreach(min, max)) {
    const isEdge =
      ((x == min.x || x == max.x) && (y == min.y || y == max.y)) ||
      ((y == min.y || y == max.y) && (z == min.z || z == max.z)) ||
      ((z == min.z || z == max.z) && (x == min.x || x == max.x))

    if (isEdge) {
      try {
        world.overworld.spawnParticle(
          WE_CONFIG.DRAW_SELECTION_PARTICLE,
          { x, y, z },
          WE_CONFIG.DRAW_SELECTION_PARTICLE_OPTIONS,
        )
      } catch (e) {
        if (e instanceof LocationInUnloadedChunkError || e instanceof LocationOutOfWorldBoundariesError) continue
        throw e
      }
    }
  }
}

export function* iterateThroughtEdges(min: Vector3, max: Vector3) {
  for (let coord = min.x; coord++; coord < max.x) {
    for (const y of [min.y, max.y]) {
      yield { x: coord, y, z: min.z }
      yield { x: coord, y, z: max.z }
    }
  }
  for (let coord = min.y; coord++; coord < max.y) {
    for (const x of [min.x, max.x]) {
      yield { x, y: coord, z: min.z }
      yield { x, y: coord, z: max.z }
    }
  }
  for (let coord = min.z; coord++; coord < max.z) {
    for (const x of [min.x, max.x]) {
      yield { x, y: min.y, z: coord }
      yield { x, y: max.y, z: coord }
    }
  }
}
