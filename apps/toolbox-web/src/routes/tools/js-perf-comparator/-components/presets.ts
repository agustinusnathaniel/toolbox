import type { Preset } from './types';

export const PRESETS: Array<Preset> = [
  {
    name: 'Object Creation',
    description: 'Object literal vs new Object()',
    codeA: `// Object literal
const COUNT = 100000;
for (let i = 0; i < COUNT; i++) {
  const obj = { id: i, value: i * 2, active: i % 2 === 0 };
}
console.log('done');`,
    codeB: `// new Object()
const COUNT = 100000;
for (let i = 0; i < COUNT; i++) {
  const obj = new Object();
  obj.id = i;
  obj.value = i * 2;
  obj.active = i % 2 === 0;
}
console.log('done');`,
  },
  {
    name: 'Array Lookup',
    description: 'Set.has() vs Array.includes()',
    codeA: `// Set.has()
const items = new Set(['a', 'b', 'c', 'd', 'e']);
const COUNT = 100000;
let found = 0;
for (let i = 0; i < COUNT; i++) {
  if (items.has('c')) found++;
}
console.log('found:', found);`,
    codeB: `// Array.includes()
const items = ['a', 'b', 'c', 'd', 'e'];
const COUNT = 100000;
let found = 0;
for (let i = 0; i < COUNT; i++) {
  if (items.includes('c')) found++;
}
console.log('found:', found);`,
  },
  {
    name: 'Object Spread',
    description: 'Object spread vs Object.assign',
    codeA: `// Object spread
const base = { a: 1, b: 2 };
const COUNT = 100000;
for (let i = 0; i < COUNT; i++) {
  const copy = { ...base, c: 3 };
}
console.log('done');`,
    codeB: `// Object.assign
const base = { a: 1, b: 2 };
const COUNT = 100000;
for (let i = 0; i < COUNT; i++) {
  const copy = Object.assign({}, base, { c: 3 });
}
console.log('done');`,
  },
  {
    name: 'String Concat',
    description: 'Template literal vs string concatenation',
    codeA: `// Template literal
const COUNT = 100000;
for (let i = 0; i < COUNT; i++) {
  const str = \`value: \${i}, doubled: \${i * 2}\`;
}
console.log('done');`,
    codeB: `// String concatenation
const COUNT = 100000;
for (let i = 0; i < COUNT; i++) {
  const str = 'value: ' + i + ', doubled: ' + (i * 2);
}
console.log('done');`,
  },
  {
    name: 'Array Methods',
    description: 'for...of vs forEach',
    codeA: `// for...of
const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const COUNT = 100000;
let sum = 0;
for (let i = 0; i < COUNT; i++) {
  for (const val of arr) {
    sum += val;
  }
}
console.log('sum:', sum);`,
    codeB: `// forEach
const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const COUNT = 100000;
let sum = 0;
for (let i = 0; i < COUNT; i++) {
  arr.forEach(val => { sum += val; });
}
console.log('sum:', sum);`,
  },
  {
    name: 'Custom',
    description: 'Write your own code',
    codeA: '// Code A - write your comparison',
    codeB: '// Code B - write your comparison',
  },
];

export const DEFAULT_PRESET = PRESETS[0];

export const STABILITY_DEFAULT_ROUNDS = 6;
export const STABILITY_MAX_ROUNDS = 20;
export const STABILITY_MIN_ROUNDS = 2;
