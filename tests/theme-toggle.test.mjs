import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../src/components/ThemeToggle.astro', import.meta.url), 'utf8');
const script = source.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];
assert.match(script, /var RENDITIONS =/, 'expected the theme controls script');

function theme({ blocked = false, stored = null } = {}) {
  const classes = new Set(['pulp']);
  let metaColor;
  const buttons = ['pulp', 'pulp-hc', 'beta', 'beta-hc'].map((id) => {
    const attrs = { 'data-rendition': id };
    return {
      attrs,
      getAttribute: (name) => attrs[name],
      setAttribute: (name, value) => { attrs[name] = value; },
      addEventListener(_name, callback) { this.click = callback; },
    };
  });
  const group = {
    hasAttribute: () => false,
    setAttribute: () => {},
    querySelectorAll: () => buttons,
  };
  vm.runInNewContext(script, {
    localStorage: {
      getItem() { if (blocked) throw new Error('Storage blocked'); return stored; },
      setItem(_key, value) { if (blocked) throw new Error('Storage blocked'); stored = value; },
    },
    document: {
      readyState: 'complete',
      documentElement: { classList: { contains: (id) => classes.has(id), add: (id) => classes.add(id), remove: (id) => classes.delete(id) } },
      querySelectorAll: (selector) => selector === '.corner' ? [group] : buttons,
      querySelector: () => ({ setAttribute: (_name, value) => { metaColor = value; } }),
    },
  });
  return { buttons, classes, stored: () => stored, metaColor: () => metaColor };
}

test('theme changes persist and update the selected control', () => {
  const t = theme();
  t.buttons[2].click();
  assert.equal(t.stored(), 'beta');
  assert.equal(t.buttons[2].attrs['aria-pressed'], 'true');
});

test('theme controls remain usable when browser storage is blocked', () => {
  const t = theme({ blocked: true });
  assert.equal(t.buttons[0].attrs['aria-pressed'], 'true');
  t.buttons[2].click();
  assert.deepEqual([...t.classes], ['beta']);
  assert.equal(t.buttons[2].attrs['aria-pressed'], 'true');
  assert.equal(t.metaColor(), '#0B0B0C');
});

const layout = await readFile(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
const boot = layout.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];
assert.match(boot, /var RENDITIONS =/, 'expected the pre-paint theme script');

test('the pre-paint theme uses system preferences when storage is blocked', () => {
  const applied = [];
  let color;
  vm.runInNewContext(boot, {
    localStorage: { getItem() { throw new Error('Storage blocked'); } },
    matchMedia: () => ({ matches: true }),
    document: {
      documentElement: { classList: { add: (value) => applied.push(value) } },
      querySelector: () => ({ setAttribute: (_name, value) => { color = value; } }),
    },
  });
  assert.deepEqual(applied, ['beta-hc']);
  assert.equal(color, '#050506');
});
