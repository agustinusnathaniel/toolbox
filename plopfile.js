export default function (plop) {
  plop.setGenerator('tool', {
    actions: [
      {
        path: 'src/routes/_tools/{{dashCase name}}/index.tsx',
        templateFile: 'plop-templates/tool/route.tsx.hbs',
        type: 'add',
      },
      {
        path: 'src/lib/tools/{{dashCase name}}/adapters/{{dashCase name}}.ts',
        templateFile: 'plop-templates/tool/adapter.ts.hbs',
        type: 'add',
      },
    ],
    description: 'scaffold a new tool',
    prompts: [
      {
        message: 'tool slug (kebab-case, e.g. my-tool)',
        name: 'name',
        type: 'input',
      },
      {
        message: 'short description (1 sentence)',
        name: 'description',
        type: 'input',
      },
    ],
  });
}
