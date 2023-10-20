/* eslint-disable no-await-in-loop */
import { readFile, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

import * as fg from 'fast-glob';

export type ReplaceActionResult = string | false | undefined;

export interface ReplaceOptions {
  callback(content: string): Promise<ReplaceActionResult> | ReplaceActionResult;
  files: fg.Pattern | fg.Pattern[];
  globOptions?: fg.Options;
  name?: string;
  silent?: boolean;
}

export const replace = async (options: ReplaceOptions) => {
  const { callback, globOptions = {}, name = 'reflect', silent } = options;
  const cwd = process.cwd();

  const files = await fg(options.files, {
    cwd: resolve(cwd, 'dist'),
    ...globOptions,
    absolute: true,
    ignore: [...(globOptions.ignore || []), 'node_modules'],
  });

  const logger = (message: string) => {
    if (!silent) {
      // eslint-disable-next-line no-console
      console.log(`[${name}]`, message);
    }
  };

  if (!files.length) {
    logger('No files matched');
  }

  const output = [];

  for (const file of files) {
    const content = await readFile(file, 'utf8');
    const result = await callback(content);
    const filename = relative(cwd, file);

    if (result) {
      await writeFile(file, result);
      output.push(result);
      logger(`✓ ${filename}`);
    } else {
      logger(`skip ${filename}`);
    }
  }

  return output;
};
