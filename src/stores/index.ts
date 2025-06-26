import { defineStore } from 'pinia';

export const useStore = defineStore('index', {
  state: () => {
    return {
      rootUrl: ''
    };
  },
  getters: {
    hashRootUrl: (state) => `${state.rootUrl}#/`
  },
  actions: {
    setRootUrl(val: string) {
      this.rootUrl = val;
    }
  }
});
