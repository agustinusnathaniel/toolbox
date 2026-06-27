export default function (plop) {
  plop.setGenerator('tool', {
    description: 'scaffold a new tool',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'tool slug (kebab-case, e.g. my-tool)',
      },
      {
        type: 'input',
        name: 'description',
        message: 'short description (1 sentence)',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/routes/_tools/{{dashCase name}}/index.tsx',
        templateFile: 'plop-templates/tool/route.tsx.hbs',
      },
      {
        type: 'add',
        path: 'src/lib/tools/{{dashCase name}}/adapters/{{dashCase name}}.ts',
        templateFile: 'plop-templates/tool/adapter.ts.hbs',
      },
      {
        type: 'add',
        path: 'src/lib/tools/{{dashCase name}}/adapters/{{dashCase name}}.test.ts',
        templateFile: 'plop-templates/tool/adapter.test.ts.hbs',
      },
    ],
  });
}
