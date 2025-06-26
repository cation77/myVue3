let activeEffect: any = null;
export const effect = (fn: Function) => {
  activeEffect = fn;
  fn();
  activeEffect = null;
};

export const reactive = (obj: any) => {
  const effectMap: any = {};
  return new Proxy(obj, {
    get(target, key) {
      if (activeEffect) {
        if (!effectMap[key]) {
          effectMap[key] = [];
        }
        console.log('收集依赖', key, activeEffect);
        effectMap[key].push(activeEffect);
      }
      return target[key];
    },
    set(target, key, val) {
      target[key] = val;
      console.log('派发更新', key, val);
      effectMap[key]?.forEach((fn: any) => fn());
      return true;
    }
  });
};

export const ref = (value: any) => {
  return reactive({ value });
};
