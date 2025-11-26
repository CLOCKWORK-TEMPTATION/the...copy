/**
 * ESLint Rule: no-duplicate-exports
 * Enhanced rule to detect and prevent duplicate exports in JavaScript/TypeScript files
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow duplicate exports in the same file',
      category: 'Possible Errors',
      recommended: true,
      url: 'https://eslint.org/docs/rules/no-duplicate-exports'
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreCase: {
            type: 'boolean',
            default: false
          },
          allowExportDefault: {
            type: 'boolean',
            default: true
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      duplicateExport: 'Duplicate export of {{exportName}}. Export the name only once.',
      duplicateExportDefault: 'Duplicate export of default. You can only have one default export.',
      duplicateExportFrom: 'Duplicate export of {{name}} from module "{{source}}".'
    }
  },
  create(context) {
    const options = context.options[0] || {};
    const ignoreCase = options.ignoreCase || false;
    const allowExportDefault = options.allowExportDefault !== false;
    
    const sourceCode = context.getSourceCode();
    const filename = context.getFilename();
    
    return {
      ExportNamedDeclaration(node) {
        if (!node.declaration && node.specifiers) {
          // export { name1, name2, ... } from 'module'
          handleExportFrom(node);
          return;
        }
        
        handleNamedDeclaration(node, filename);
      },
      
      ExportDefaultDeclaration(node) {
        if (allowExportDefault) return;
        
        const exports = context.getScope().getExports();
        const defaultExport = exports.find(exp => exp.type === 'ExportDefaultSpecifier');
        
        if (defaultExport) {
          context.report({
            node,
            messageId: 'duplicateExportDefault',
            data: { exportName: 'default' }
          });
        }
      }
    };
    
    function handleExportFrom(node) {
      const source = node.source.value;
      const scope = context.getScope();
      const exports = scope.getExports();
      
      node.specifiers.forEach(spec => {
        if (spec.exported.name) {
          const exportedName = ignoreCase ? spec.exported.name.toLowerCase() : spec.exported.name;
          
          const duplicate = exports.find(exp => {
            const expName = ignoreCase ? exp.name.toLowerCase() : exp.name;
            return expName === exportedName && exp.type === 'ExportSpecifier';
          });
          
          if (duplicate) {
            context.report({
              node: spec,
              messageId: 'duplicateExportFrom',
              data: {
                name: spec.exported.name,
                source: source
              }
            });
          }
        }
      });
    }
    
    function handleNamedDeclaration(node, filename) {
      if (!node.declaration) return;
      
      const scope = context.getScope();
      const exports = scope.getExports();
      
      if (node.declaration.type === 'VariableDeclaration') {
        node.declaration.declarations.forEach(declaration => {
          if (declaration.id.type === 'Identifier') {
            const name = declaration.id.name;
            const nameToCheck = ignoreCase ? name.toLowerCase() : name;
            
            const duplicate = exports.find(exp => {
              const expName = ignoreCase ? exp.name.toLowerCase() : exp.name;
              return expName === nameToCheck;
            });
            
            if (duplicate) {
              context.report({
                node: declaration.id,
                messageId: 'duplicateExport',
                data: { exportName: name }
              });
            }
          }
        });
      }
      
      if (node.declaration.type === 'FunctionDeclaration' && node.declaration.id) {
        const name = node.declaration.id.name;
        const nameToCheck = ignoreCase ? name.toLowerCase() : name;
        
        const duplicate = exports.find(exp => {
          const expName = ignoreCase ? exp.name.toLowerCase() : exp.name;
          return expName === nameToCheck;
        });
        
        if (duplicate) {
          context.report({
            node: node.declaration.id,
            messageId: 'duplicateExport',
            data: { exportName: name }
          });
        }
      }
      
      if (node.declaration.type === 'ClassDeclaration' && node.declaration.id) {
        const name = node.declaration.id.name;
        const nameToCheck = ignoreCase ? name.toLowerCase() : name;
        
        const duplicate = exports.find(exp => {
          const expName = ignoreCase ? exp.name.toLowerCase() : exp.name;
          return expName === nameToCheck;
        });
        
        if (duplicate) {
          context.report({
            node: node.declaration.id,
            messageId: 'duplicateExport',
            data: { exportName: name }
          });
        }
      }
    }
  }
};
