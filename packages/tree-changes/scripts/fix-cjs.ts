// eslint-disable-next-line import/no-relative-packages
import { replace, type ReplaceOptions } from '../../../scripts/replace';

export const fixCjsDts = async (options?: Partial<ReplaceOptions>) => {
  return replace({
    files: '**/*.d.{ts,cts}',
    ...options,
    name: 'fix-cjs-dts',

    callback: content => {
      const result = /(?<code>export .+)/u.exec(content);
      const { code } = result?.groups ?? {};

      if (code) {
        const statement = `declare namespace TreeChangesModule {
  ${code}
}

export = TreeChangesModule;`;

        if (!content.endsWith(statement)) {
          return content.replace(`\n${code}`, '') + statement;
        }
      }

      return false;
    },
  });
};

export const fixCjsExports = async (options?: Partial<ReplaceOptions>) => {
  const statement = `
// fix-cjs-exports
if (module.exports.default) {
  Object.assign(module.exports.default, module.exports);
  module.exports = module.exports.default;
  delete module.exports.default;
}
`;

  return replace({
    files: '**/*.js',
    ...options,
    name: 'fix-cjs-exports',

    callback: content => {
      if (content.includes('module.exports = __toCommonJS') && !content.endsWith(statement)) {
        return content + statement;
      }

      return false;
    },
  });
};

fixCjsDts();
fixCjsExports();
