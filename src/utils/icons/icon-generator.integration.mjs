// src/utils/icons/icon-generator.integration.mjs
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(
  new URL('./generate-icon-map.mjs', import.meta.url),
);

function runIconGenerator(logger) {
  logger.info('Generating icon map...');
  const result = spawnSync('node', [scriptPath], {
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error('Icon generator failed. See logs above for details.');
  }

  logger.info('Icon map updated.');
}

export default function iconGeneratorIntegration() {
  return {
    name: 'icon-generator',
    hooks: {
      'astro:config:setup': ({ logger }) => {
        runIconGenerator(logger);
      },
    },
  };
}
