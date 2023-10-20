// eslint-disable-next-line import/no-relative-packages
import { replace, type ReplaceOptions } from '../../../scripts/replace';

export const fixCjsDts = async (options?: Partial<ReplaceOptions>) => {
  return replace({
    files: '**/*.d.{ts,cts}',
    ...options,
    name: 'fix-cjs-dts',

    callback: content => {
      const { imp } = /(?<imp>import .+ from 'tree-changes';)/u.exec(content)?.groups ?? {};
      const { exp, named } =
        /(?<exp>export (?<named>.+) from 'tree-changes';)/u.exec(content)?.groups ?? {};
      const { exportDefault } =
        /(?<exportDefault>export \{ useTreeChanges as default \};)/u.exec(content)?.groups ?? {};

      if (imp) {
        const statement = `declare namespace UseTreeChanges {
  export ${named.replace('default as treeChanges', 'treeChanges')};

  ${exportDefault}
}

export = UseTreeChanges;`;

        return (
          content
            .replace(imp, `import ${named} from 'tree-changes';`)
            .replace(`\n${exp}`, '')
            .replace(`\n${exportDefault}`, '') + statement
        );
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
