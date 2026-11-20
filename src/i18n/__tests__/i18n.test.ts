import { describe, it, expect } from 'vitest';
import en from '../en.json';
import hi from '../hi.json';
import gu from '../gu.json';

describe('i18n Message Catalog Completeness & Parity', () => {
  const enKeys = Object.keys(en).sort();
  const hiKeys = Object.keys(hi).sort();
  const guKeys = Object.keys(gu).sort();

  it('Hindi catalog contains all English keys without omission', () => {
    const missingInHi = enKeys.filter((k) => !(k in hi));
    expect(missingInHi).toHaveLength(0);
    expect(hiKeys).toEqual(enKeys);
  });

  it('Gujarati catalog contains all English keys without omission', () => {
    const missingInGu = enKeys.filter((k) => !(k in gu));
    expect(missingInGu).toHaveLength(0);
    expect(guKeys).toEqual(enKeys);
  });

  it('Mandatory statutory disclaimer is present in all 3 language catalogs', () => {
    expect(en.disclaimer).toContain('Draft only');
    expect(hi.disclaimer).toContain('केवल ड्राफ्ट');
    expect(gu.disclaimer).toContain('માત્ર ડ્રાફ્ટ');
  });

  it('DPDP right to erasure keys are defined in all catalogs', () => {
    expect(en.settings_delete_data).toBeDefined();
    expect(hi.settings_delete_data).toBeDefined();
    expect(gu.settings_delete_data).toBeDefined();
  });
});
