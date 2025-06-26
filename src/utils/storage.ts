export type StorageKey = 'accessToken';

export type ValidValue = string | number | undefined | object;

export const storage = {
  set<T = ValidValue>(key: StorageKey | string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  get<T = ValidValue>(
    key: StorageKey | string,
    defaultValue?: T
  ): T | undefined {
    try {
      return JSON.parse(localStorage.getItem(key) || '');
    } catch (e) {
      return defaultValue;
    }
  },

  remove(key: StorageKey | string) {
    localStorage.removeItem(key);
  }
};
