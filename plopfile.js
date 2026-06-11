export default function configure(
  /** @type {import('plop').NodePlopAPI} */ plop
) {
  plop.setGenerator('feature', {
    description: 'Create a new feature module (types, data, operations)',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Feature name (e.g., "users"):',
      },
    ],
    actions: [
      {
        type: 'addMany',
        destination: 'src/lib/features/{{dashCase name}}',
        base: 'plop-templates/feature',
        templateFiles: 'plop-templates/feature/*.ts.hbs',
        stripExtensions: ['hbs'],
      },
      {
        type: 'modify',
        path: 'src/lib/features/{{dashCase name}}/types.ts',
        pattern: /export const get\w+Status/g,
        template:
          '// TODO: Add your status/helper functions here\nexport const get{{pascalCase name}}Status',
      },
    ],
  });
}
