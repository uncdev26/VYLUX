import { describe, it, expect } from 'vitest';
import { generateSlug } from './utils';

describe('generateSlug', () => {
  it('converts title to URL-safe slug', () => {
    const slug = generateSlug('Hello World');
    expect(slug).toMatch(/^hello-world-[a-z0-9]{4}$/);
  });

  it('handles special characters', () => {
    const slug = generateSlug('AI & Machine Learning: A Guide!');
    expect(slug).toMatch(/^ai-machine-learning-a-guide-[a-z0-9]{4}$/);
  });

  it('handles multiple spaces and dashes', () => {
    const slug = generateSlug('  Hello   World  ');
    expect(slug).toMatch(/^hello-world-[a-z0-9]{4}$/);
  });

  it('generates unique slugs for same title', () => {
    const slug1 = generateSlug('Same Title');
    const slug2 = generateSlug('Same Title');
    // Slugs should have different suffixes (probabilistic, but extremely likely)
    expect(slug1).not.toBe(slug2);
  });

  it('handles empty-ish titles', () => {
    const slug = generateSlug('a');
    expect(slug).toMatch(/^a-[a-z0-9]{4}$/);
  });
});
