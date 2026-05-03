import { describe, it, expect } from 'vitest';
import { validateQuestion, ValidationError } from '@/lib/validators/question';

describe('validateQuestion', () => {
  it('空文字は ValidationError をスローする', () => {
    expect(() => validateQuestion('')).toThrow(ValidationError);
  });

  it('1文字はエラーなし', () => {
    expect(() => validateQuestion('a')).not.toThrow();
  });

  it('ちょうど1000文字はエラーなし', () => {
    expect(() => validateQuestion('a'.repeat(1000))).not.toThrow();
  });

  it('1001文字は ValidationError をスローする', () => {
    expect(() => validateQuestion('a'.repeat(1001))).toThrow(ValidationError);
  });

  it('スペースのみは ValidationError をスローする', () => {
    expect(() => validateQuestion('   ')).toThrow(ValidationError);
  });
});
