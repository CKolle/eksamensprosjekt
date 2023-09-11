(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function makeMap(str, expectsLowerCase) {
  const map = /* @__PURE__ */ Object.create(null);
  const list = str.split(",");
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase ? (val) => !!map[val.toLowerCase()] : (val) => !!map[val];
}
function normalizeStyle(value) {
  if (isArray$1(value)) {
    const res = {};
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString(value)) {
    return value;
  } else if (isObject$1(value)) {
    return value;
  }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:([^]+)/;
const styleCommentRE = /\/\*.*?\*\//gs;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
function normalizeClass(value) {
  let res = "";
  if (isString(value)) {
    res = value;
  } else if (isArray$1(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject$1(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
function includeBooleanAttr(value) {
  return !!value || value === "";
}
function looseCompareArrays(a, b) {
  if (a.length !== b.length)
    return false;
  let equal = true;
  for (let i = 0; equal && i < a.length; i++) {
    equal = looseEqual(a[i], b[i]);
  }
  return equal;
}
function looseEqual(a, b) {
  if (a === b)
    return true;
  let aValidType = isDate(a);
  let bValidType = isDate(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? a.getTime() === b.getTime() : false;
  }
  aValidType = isSymbol(a);
  bValidType = isSymbol(b);
  if (aValidType || bValidType) {
    return a === b;
  }
  aValidType = isArray$1(a);
  bValidType = isArray$1(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? looseCompareArrays(a, b) : false;
  }
  aValidType = isObject$1(a);
  bValidType = isObject$1(b);
  if (aValidType || bValidType) {
    if (!aValidType || !bValidType) {
      return false;
    }
    const aKeysCount = Object.keys(a).length;
    const bKeysCount = Object.keys(b).length;
    if (aKeysCount !== bKeysCount) {
      return false;
    }
    for (const key in a) {
      const aHasKey = a.hasOwnProperty(key);
      const bHasKey = b.hasOwnProperty(key);
      if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) {
        return false;
      }
    }
  }
  return String(a) === String(b);
}
const toDisplayString = (val) => {
  return isString(val) ? val : val == null ? "" : isArray$1(val) || isObject$1(val) && (val.toString === objectToString || !isFunction(val.toString)) ? JSON.stringify(val, replacer, 2) : String(val);
};
const replacer = (_key, val) => {
  if (val && val.__v_isRef) {
    return replacer(_key, val.value);
  } else if (isMap(val)) {
    return {
      [`Map(${val.size})`]: [...val.entries()].reduce((entries, [key, val2]) => {
        entries[`${key} =>`] = val2;
        return entries;
      }, {})
    };
  } else if (isSet(val)) {
    return {
      [`Set(${val.size})`]: [...val.values()]
    };
  } else if (isObject$1(val) && !isArray$1(val) && !isPlainObject(val)) {
    return String(val);
  }
  return val;
};
const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const NOOP = () => {
};
const NO = () => false;
const onRE = /^on[^a-z]/;
const isOn = (key) => onRE.test(key);
const isModelListener = (key) => key.startsWith("onUpdate:");
const extend = Object.assign;
const remove = (arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) {
    arr.splice(i, 1);
  }
};
const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
const isArray$1 = Array.isArray;
const isMap = (val) => toTypeString(val) === "[object Map]";
const isSet = (val) => toTypeString(val) === "[object Set]";
const isDate = (val) => toTypeString(val) === "[object Date]";
const isFunction = (val) => typeof val === "function";
const isString = (val) => typeof val === "string";
const isSymbol = (val) => typeof val === "symbol";
const isObject$1 = (val) => val !== null && typeof val === "object";
const isPromise$1 = (val) => {
  return isObject$1(val) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
const isPlainObject = (val) => toTypeString(val) === "[object Object]";
const isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const isReservedProp = /* @__PURE__ */ makeMap(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
);
const cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return (str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
};
const camelizeRE = /-(\w)/g;
const camelize = cacheStringFunction((str) => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : "");
});
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, "-$1").toLowerCase());
const capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
const toHandlerKey = cacheStringFunction((str) => str ? `on${capitalize(str)}` : ``);
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns = (fns, arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg);
  }
};
const def = (obj, key, value) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    value
  });
};
const looseToNumber = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
};
let _globalThis;
const getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
};
let activeEffectScope;
class EffectScope {
  constructor(detached = false) {
    this.detached = detached;
    this._active = true;
    this.effects = [];
    this.cleanups = [];
    this.parent = activeEffectScope;
    if (!detached && activeEffectScope) {
      this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
    }
  }
  get active() {
    return this._active;
  }
  run(fn) {
    if (this._active) {
      const currentEffectScope = activeEffectScope;
      try {
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = currentEffectScope;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    activeEffectScope = this;
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    activeEffectScope = this.parent;
  }
  stop(fromParent) {
    if (this._active) {
      let i, l;
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].stop();
      }
      for (i = 0, l = this.cleanups.length; i < l; i++) {
        this.cleanups[i]();
      }
      if (this.scopes) {
        for (i = 0, l = this.scopes.length; i < l; i++) {
          this.scopes[i].stop(true);
        }
      }
      if (!this.detached && this.parent && !fromParent) {
        const last = this.parent.scopes.pop();
        if (last && last !== this) {
          this.parent.scopes[this.index] = last;
          last.index = this.index;
        }
      }
      this.parent = void 0;
      this._active = false;
    }
  }
}
function recordEffectScope(effect, scope = activeEffectScope) {
  if (scope && scope.active) {
    scope.effects.push(effect);
  }
}
function getCurrentScope() {
  return activeEffectScope;
}
const createDep = (effects) => {
  const dep = new Set(effects);
  dep.w = 0;
  dep.n = 0;
  return dep;
};
const wasTracked = (dep) => (dep.w & trackOpBit) > 0;
const newTracked = (dep) => (dep.n & trackOpBit) > 0;
const initDepMarkers = ({ deps }) => {
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].w |= trackOpBit;
    }
  }
};
const finalizeDepMarkers = (effect) => {
  const { deps } = effect;
  if (deps.length) {
    let ptr = 0;
    for (let i = 0; i < deps.length; i++) {
      const dep = deps[i];
      if (wasTracked(dep) && !newTracked(dep)) {
        dep.delete(effect);
      } else {
        deps[ptr++] = dep;
      }
      dep.w &= ~trackOpBit;
      dep.n &= ~trackOpBit;
    }
    deps.length = ptr;
  }
};
const targetMap = /* @__PURE__ */ new WeakMap();
let effectTrackDepth = 0;
let trackOpBit = 1;
const maxMarkerBits = 30;
let activeEffect;
const ITERATE_KEY = Symbol("");
const MAP_KEY_ITERATE_KEY = Symbol("");
class ReactiveEffect {
  constructor(fn, scheduler = null, scope) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.active = true;
    this.deps = [];
    this.parent = void 0;
    recordEffectScope(this, scope);
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
    let parent = activeEffect;
    let lastShouldTrack = shouldTrack;
    while (parent) {
      if (parent === this) {
        return;
      }
      parent = parent.parent;
    }
    try {
      this.parent = activeEffect;
      activeEffect = this;
      shouldTrack = true;
      trackOpBit = 1 << ++effectTrackDepth;
      if (effectTrackDepth <= maxMarkerBits) {
        initDepMarkers(this);
      } else {
        cleanupEffect(this);
      }
      return this.fn();
    } finally {
      if (effectTrackDepth <= maxMarkerBits) {
        finalizeDepMarkers(this);
      }
      trackOpBit = 1 << --effectTrackDepth;
      activeEffect = this.parent;
      shouldTrack = lastShouldTrack;
      this.parent = void 0;
      if (this.deferStop) {
        this.stop();
      }
    }
  }
  stop() {
    if (activeEffect === this) {
      this.deferStop = true;
    } else if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}
function cleanupEffect(effect) {
  const { deps } = effect;
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect);
    }
    deps.length = 0;
  }
}
let shouldTrack = true;
const trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function track(target, type, key) {
  if (shouldTrack && activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = createDep());
    }
    trackEffects(dep);
  }
}
function trackEffects(dep, debuggerEventExtraInfo) {
  let shouldTrack2 = false;
  if (effectTrackDepth <= maxMarkerBits) {
    if (!newTracked(dep)) {
      dep.n |= trackOpBit;
      shouldTrack2 = !wasTracked(dep);
    }
  } else {
    shouldTrack2 = !dep.has(activeEffect);
  }
  if (shouldTrack2) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let deps = [];
  if (type === "clear") {
    deps = [...depsMap.values()];
  } else if (key === "length" && isArray$1(target)) {
    const newLength = Number(newValue);
    depsMap.forEach((dep, key2) => {
      if (key2 === "length" || key2 >= newLength) {
        deps.push(dep);
      }
    });
  } else {
    if (key !== void 0) {
      deps.push(depsMap.get(key));
    }
    switch (type) {
      case "add":
        if (!isArray$1(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        } else if (isIntegerKey(key)) {
          deps.push(depsMap.get("length"));
        }
        break;
      case "delete":
        if (!isArray$1(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        }
        break;
      case "set":
        if (isMap(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
        }
        break;
    }
  }
  if (deps.length === 1) {
    if (deps[0]) {
      {
        triggerEffects(deps[0]);
      }
    }
  } else {
    const effects = [];
    for (const dep of deps) {
      if (dep) {
        effects.push(...dep);
      }
    }
    {
      triggerEffects(createDep(effects));
    }
  }
}
function triggerEffects(dep, debuggerEventExtraInfo) {
  const effects = isArray$1(dep) ? dep : [...dep];
  for (const effect of effects) {
    if (effect.computed) {
      triggerEffect(effect);
    }
  }
  for (const effect of effects) {
    if (!effect.computed) {
      triggerEffect(effect);
    }
  }
}
function triggerEffect(effect, debuggerEventExtraInfo) {
  if (effect !== activeEffect || effect.allowRecurse) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}
const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
);
const get$1 = /* @__PURE__ */ createGetter();
const shallowGet = /* @__PURE__ */ createGetter(false, true);
const readonlyGet = /* @__PURE__ */ createGetter(true);
const arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
function createArrayInstrumentations() {
  const instrumentations = {};
  ["includes", "indexOf", "lastIndexOf"].forEach((key) => {
    instrumentations[key] = function(...args) {
      const arr = toRaw(this);
      for (let i = 0, l = this.length; i < l; i++) {
        track(arr, "get", i + "");
      }
      const res = arr[key](...args);
      if (res === -1 || res === false) {
        return arr[key](...args.map(toRaw));
      } else {
        return res;
      }
    };
  });
  ["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
    instrumentations[key] = function(...args) {
      pauseTracking();
      const res = toRaw(this)[key].apply(this, args);
      resetTracking();
      return res;
    };
  });
  return instrumentations;
}
function hasOwnProperty(key) {
  const obj = toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
function createGetter(isReadonly2 = false, shallow = false) {
  return function get3(target, key, receiver) {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return shallow;
    } else if (key === "__v_raw" && receiver === (isReadonly2 ? shallow ? shallowReadonlyMap : readonlyMap : shallow ? shallowReactiveMap : reactiveMap).get(target)) {
      return target;
    }
    const targetIsArray = isArray$1(target);
    if (!isReadonly2) {
      if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }
      if (key === "hasOwnProperty") {
        return hasOwnProperty;
      }
    }
    const res = Reflect.get(target, key, receiver);
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (shallow) {
      return res;
    }
    if (isRef(res)) {
      return targetIsArray && isIntegerKey(key) ? res : res.value;
    }
    if (isObject$1(res)) {
      return isReadonly2 ? readonly(res) : reactive(res);
    }
    return res;
  };
}
const set$1 = /* @__PURE__ */ createSetter();
const shallowSet = /* @__PURE__ */ createSetter(true);
function createSetter(shallow = false) {
  return function set2(target, key, value, receiver) {
    let oldValue = target[key];
    if (isReadonly(oldValue) && isRef(oldValue) && !isRef(value)) {
      return false;
    }
    if (!shallow) {
      if (!isShallow(value) && !isReadonly(value)) {
        oldValue = toRaw(oldValue);
        value = toRaw(value);
      }
      if (!isArray$1(target) && isRef(oldValue) && !isRef(value)) {
        oldValue.value = value;
        return true;
      }
    }
    const hadKey = isArray$1(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(target, key, value, receiver);
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value);
      }
    }
    return result;
  };
}
function deleteProperty(target, key) {
  const hadKey = hasOwn(target, key);
  target[key];
  const result = Reflect.deleteProperty(target, key);
  if (result && hadKey) {
    trigger(target, "delete", key, void 0);
  }
  return result;
}
function has$1(target, key) {
  const result = Reflect.has(target, key);
  if (!isSymbol(key) || !builtInSymbols.has(key)) {
    track(target, "has", key);
  }
  return result;
}
function ownKeys(target) {
  track(target, "iterate", isArray$1(target) ? "length" : ITERATE_KEY);
  return Reflect.ownKeys(target);
}
const mutableHandlers = {
  get: get$1,
  set: set$1,
  deleteProperty,
  has: has$1,
  ownKeys
};
const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    return true;
  },
  deleteProperty(target, key) {
    return true;
  }
};
const shallowReactiveHandlers = /* @__PURE__ */ extend({}, mutableHandlers, {
  get: shallowGet,
  set: shallowSet
});
const toShallow = (value) => value;
const getProto = (v) => Reflect.getPrototypeOf(v);
function get(target, key, isReadonly2 = false, isShallow2 = false) {
  target = target[
    "__v_raw"
    /* ReactiveFlags.RAW */
  ];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly2) {
    if (key !== rawKey) {
      track(rawTarget, "get", key);
    }
    track(rawTarget, "get", rawKey);
  }
  const { has: has2 } = getProto(rawTarget);
  const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
  if (has2.call(rawTarget, key)) {
    return wrap(target.get(key));
  } else if (has2.call(rawTarget, rawKey)) {
    return wrap(target.get(rawKey));
  } else if (target !== rawTarget) {
    target.get(key);
  }
}
function has(key, isReadonly2 = false) {
  const target = this[
    "__v_raw"
    /* ReactiveFlags.RAW */
  ];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly2) {
    if (key !== rawKey) {
      track(rawTarget, "has", key);
    }
    track(rawTarget, "has", rawKey);
  }
  return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
}
function size(target, isReadonly2 = false) {
  target = target[
    "__v_raw"
    /* ReactiveFlags.RAW */
  ];
  !isReadonly2 && track(toRaw(target), "iterate", ITERATE_KEY);
  return Reflect.get(target, "size", target);
}
function add(value) {
  value = toRaw(value);
  const target = toRaw(this);
  const proto = getProto(target);
  const hadKey = proto.has.call(target, value);
  if (!hadKey) {
    target.add(value);
    trigger(target, "add", value, value);
  }
  return this;
}
function set(key, value) {
  value = toRaw(value);
  const target = toRaw(this);
  const { has: has2, get: get3 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  }
  const oldValue = get3.call(target, key);
  target.set(key, value);
  if (!hadKey) {
    trigger(target, "add", key, value);
  } else if (hasChanged(value, oldValue)) {
    trigger(target, "set", key, value);
  }
  return this;
}
function deleteEntry(key) {
  const target = toRaw(this);
  const { has: has2, get: get3 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  }
  get3 ? get3.call(target, key) : void 0;
  const result = target.delete(key);
  if (hadKey) {
    trigger(target, "delete", key, void 0);
  }
  return result;
}
function clear() {
  const target = toRaw(this);
  const hadItems = target.size !== 0;
  const result = target.clear();
  if (hadItems) {
    trigger(target, "clear", void 0, void 0);
  }
  return result;
}
function createForEach(isReadonly2, isShallow2) {
  return function forEach(callback, thisArg) {
    const observed = this;
    const target = observed[
      "__v_raw"
      /* ReactiveFlags.RAW */
    ];
    const rawTarget = toRaw(target);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(rawTarget, "iterate", ITERATE_KEY);
    return target.forEach((value, key) => {
      return callback.call(thisArg, wrap(value), wrap(key), observed);
    });
  };
}
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this[
      "__v_raw"
      /* ReactiveFlags.RAW */
    ];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
    return {
      // iterator protocol
      next() {
        const { value, done } = innerIterator.next();
        return done ? { value, done } : {
          value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
          done
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    return type === "delete" ? false : this;
  };
}
function createInstrumentations() {
  const mutableInstrumentations2 = {
    get(key) {
      return get(this, key);
    },
    get size() {
      return size(this);
    },
    has,
    add,
    set,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, false)
  };
  const shallowInstrumentations2 = {
    get(key) {
      return get(this, key, false, true);
    },
    get size() {
      return size(this);
    },
    has,
    add,
    set,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, true)
  };
  const readonlyInstrumentations2 = {
    get(key) {
      return get(this, key, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has.call(this, key, true);
    },
    add: createReadonlyMethod(
      "add"
      /* TriggerOpTypes.ADD */
    ),
    set: createReadonlyMethod(
      "set"
      /* TriggerOpTypes.SET */
    ),
    delete: createReadonlyMethod(
      "delete"
      /* TriggerOpTypes.DELETE */
    ),
    clear: createReadonlyMethod(
      "clear"
      /* TriggerOpTypes.CLEAR */
    ),
    forEach: createForEach(true, false)
  };
  const shallowReadonlyInstrumentations2 = {
    get(key) {
      return get(this, key, true, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has.call(this, key, true);
    },
    add: createReadonlyMethod(
      "add"
      /* TriggerOpTypes.ADD */
    ),
    set: createReadonlyMethod(
      "set"
      /* TriggerOpTypes.SET */
    ),
    delete: createReadonlyMethod(
      "delete"
      /* TriggerOpTypes.DELETE */
    ),
    clear: createReadonlyMethod(
      "clear"
      /* TriggerOpTypes.CLEAR */
    ),
    forEach: createForEach(true, true)
  };
  const iteratorMethods = ["keys", "values", "entries", Symbol.iterator];
  iteratorMethods.forEach((method) => {
    mutableInstrumentations2[method] = createIterableMethod(method, false, false);
    readonlyInstrumentations2[method] = createIterableMethod(method, true, false);
    shallowInstrumentations2[method] = createIterableMethod(method, false, true);
    shallowReadonlyInstrumentations2[method] = createIterableMethod(method, true, true);
  });
  return [
    mutableInstrumentations2,
    readonlyInstrumentations2,
    shallowInstrumentations2,
    shallowReadonlyInstrumentations2
  ];
}
const [mutableInstrumentations, readonlyInstrumentations, shallowInstrumentations, shallowReadonlyInstrumentations] = /* @__PURE__ */ createInstrumentations();
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = shallow ? isReadonly2 ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly2 ? readonlyInstrumentations : mutableInstrumentations;
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(hasOwn(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
  };
}
const mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
const reactiveMap = /* @__PURE__ */ new WeakMap();
const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
const readonlyMap = /* @__PURE__ */ new WeakMap();
const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function getTargetType(value) {
  return value[
    "__v_skip"
    /* ReactiveFlags.SKIP */
  ] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
function reactive(target) {
  if (isReadonly(target)) {
    return target;
  }
  return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
function shallowReactive(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
}
function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject$1(target)) {
    return target;
  }
  if (target[
    "__v_raw"
    /* ReactiveFlags.RAW */
  ] && !(isReadonly2 && target[
    "__v_isReactive"
    /* ReactiveFlags.IS_REACTIVE */
  ])) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = getTargetType(target);
  if (targetType === 0) {
    return target;
  }
  const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
  proxyMap.set(target, proxy);
  return proxy;
}
function isReactive(value) {
  if (isReadonly(value)) {
    return isReactive(value[
      "__v_raw"
      /* ReactiveFlags.RAW */
    ]);
  }
  return !!(value && value[
    "__v_isReactive"
    /* ReactiveFlags.IS_REACTIVE */
  ]);
}
function isReadonly(value) {
  return !!(value && value[
    "__v_isReadonly"
    /* ReactiveFlags.IS_READONLY */
  ]);
}
function isShallow(value) {
  return !!(value && value[
    "__v_isShallow"
    /* ReactiveFlags.IS_SHALLOW */
  ]);
}
function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
function toRaw(observed) {
  const raw = observed && observed[
    "__v_raw"
    /* ReactiveFlags.RAW */
  ];
  return raw ? toRaw(raw) : observed;
}
function markRaw(value) {
  def(value, "__v_skip", true);
  return value;
}
const toReactive = (value) => isObject$1(value) ? reactive(value) : value;
const toReadonly = (value) => isObject$1(value) ? readonly(value) : value;
function trackRefValue(ref2) {
  if (shouldTrack && activeEffect) {
    ref2 = toRaw(ref2);
    {
      trackEffects(ref2.dep || (ref2.dep = createDep()));
    }
  }
}
function triggerRefValue(ref2, newVal) {
  ref2 = toRaw(ref2);
  const dep = ref2.dep;
  if (dep) {
    {
      triggerEffects(dep);
    }
  }
}
function isRef(r) {
  return !!(r && r.__v_isRef === true);
}
function ref(value) {
  return createRef(value, false);
}
function shallowRef(value) {
  return createRef(value, true);
}
function createRef(rawValue, shallow) {
  if (isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}
class RefImpl {
  constructor(value, __v_isShallow) {
    this.__v_isShallow = __v_isShallow;
    this.dep = void 0;
    this.__v_isRef = true;
    this._rawValue = __v_isShallow ? value : toRaw(value);
    this._value = __v_isShallow ? value : toReactive(value);
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newVal) {
    const useDirectValue = this.__v_isShallow || isShallow(newVal) || isReadonly(newVal);
    newVal = useDirectValue ? newVal : toRaw(newVal);
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal;
      this._value = useDirectValue ? newVal : toReactive(newVal);
      triggerRefValue(this);
    }
  }
}
function unref(ref2) {
  return isRef(ref2) ? ref2.value : ref2;
}
const shallowUnwrapHandlers = {
  get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }
};
function proxyRefs(objectWithRefs) {
  return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
var _a$1;
class ComputedRefImpl {
  constructor(getter, _setter, isReadonly2, isSSR) {
    this._setter = _setter;
    this.dep = void 0;
    this.__v_isRef = true;
    this[_a$1] = false;
    this._dirty = true;
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
        triggerRefValue(this);
      }
    });
    this.effect.computed = this;
    this.effect.active = this._cacheable = !isSSR;
    this[
      "__v_isReadonly"
      /* ReactiveFlags.IS_READONLY */
    ] = isReadonly2;
  }
  get value() {
    const self2 = toRaw(this);
    trackRefValue(self2);
    if (self2._dirty || !self2._cacheable) {
      self2._dirty = false;
      self2._value = self2.effect.run();
    }
    return self2._value;
  }
  set value(newValue) {
    this._setter(newValue);
  }
}
_a$1 = "__v_isReadonly";
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
  let getter;
  let setter;
  const onlyGetter = isFunction(getterOrOptions);
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = NOOP;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR);
  return cRef;
}
function warn(msg, ...args) {
  return;
}
function callWithErrorHandling(fn, instance, type, args) {
  let res;
  try {
    res = args ? fn(...args) : fn();
  } catch (err) {
    handleError(err, instance, type);
  }
  return res;
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
  if (isFunction(fn)) {
    const res = callWithErrorHandling(fn, instance, type, args);
    if (res && isPromise$1(res)) {
      res.catch((err) => {
        handleError(err, instance, type);
      });
    }
    return res;
  }
  const values = [];
  for (let i = 0; i < fn.length; i++) {
    values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
  }
  return values;
}
function handleError(err, instance, type, throwInDev = true) {
  const contextVNode = instance ? instance.vnode : null;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy;
    const errorInfo = type;
    while (cur) {
      const errorCapturedHooks = cur.ec;
      if (errorCapturedHooks) {
        for (let i = 0; i < errorCapturedHooks.length; i++) {
          if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
            return;
          }
        }
      }
      cur = cur.parent;
    }
    const appErrorHandler = instance.appContext.config.errorHandler;
    if (appErrorHandler) {
      callWithErrorHandling(appErrorHandler, null, 10, [err, exposedInstance, errorInfo]);
      return;
    }
  }
  logError(err, type, contextVNode, throwInDev);
}
function logError(err, type, contextVNode, throwInDev = true) {
  {
    console.error(err);
  }
}
let isFlushing = false;
let isFlushPending = false;
const queue = [];
let flushIndex = 0;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /* @__PURE__ */ Promise.resolve();
let currentFlushPromise = null;
function nextTick(fn) {
  const p2 = currentFlushPromise || resolvedPromise;
  return fn ? p2.then(this ? fn.bind(this) : fn) : p2;
}
function findInsertionIndex(id) {
  let start = flushIndex + 1;
  let end = queue.length;
  while (start < end) {
    const middle = start + end >>> 1;
    const middleJobId = getId(queue[middle]);
    middleJobId < id ? start = middle + 1 : end = middle;
  }
  return start;
}
function queueJob(job) {
  if (!queue.length || !queue.includes(job, isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex)) {
    if (job.id == null) {
      queue.push(job);
    } else {
      queue.splice(findInsertionIndex(job.id), 0, job);
    }
    queueFlush();
  }
}
function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true;
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}
function invalidateJob(job) {
  const i = queue.indexOf(job);
  if (i > flushIndex) {
    queue.splice(i, 1);
  }
}
function queuePostFlushCb(cb) {
  if (!isArray$1(cb)) {
    if (!activePostFlushCbs || !activePostFlushCbs.includes(cb, cb.allowRecurse ? postFlushIndex + 1 : postFlushIndex)) {
      pendingPostFlushCbs.push(cb);
    }
  } else {
    pendingPostFlushCbs.push(...cb);
  }
  queueFlush();
}
function flushPreFlushCbs(seen, i = isFlushing ? flushIndex + 1 : 0) {
  for (; i < queue.length; i++) {
    const cb = queue[i];
    if (cb && cb.pre) {
      queue.splice(i, 1);
      i--;
      cb();
    }
  }
}
function flushPostFlushCbs(seen) {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)];
    pendingPostFlushCbs.length = 0;
    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped);
      return;
    }
    activePostFlushCbs = deduped;
    activePostFlushCbs.sort((a, b) => getId(a) - getId(b));
    for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
      activePostFlushCbs[postFlushIndex]();
    }
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}
const getId = (job) => job.id == null ? Infinity : job.id;
const comparator = (a, b) => {
  const diff = getId(a) - getId(b);
  if (diff === 0) {
    if (a.pre && !b.pre)
      return -1;
    if (b.pre && !a.pre)
      return 1;
  }
  return diff;
};
function flushJobs(seen) {
  isFlushPending = false;
  isFlushing = true;
  queue.sort(comparator);
  const check = NOOP;
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job && job.active !== false) {
        if (false)
          ;
        callWithErrorHandling(
          job,
          null,
          14
          /* ErrorCodes.SCHEDULER */
        );
      }
    }
  } finally {
    flushIndex = 0;
    queue.length = 0;
    flushPostFlushCbs();
    isFlushing = false;
    currentFlushPromise = null;
    if (queue.length || pendingPostFlushCbs.length) {
      flushJobs();
    }
  }
}
function emit(instance, event, ...rawArgs) {
  if (instance.isUnmounted)
    return;
  const props = instance.vnode.props || EMPTY_OBJ;
  let args = rawArgs;
  const isModelListener2 = event.startsWith("update:");
  const modelArg = isModelListener2 && event.slice(7);
  if (modelArg && modelArg in props) {
    const modifiersKey = `${modelArg === "modelValue" ? "model" : modelArg}Modifiers`;
    const { number, trim } = props[modifiersKey] || EMPTY_OBJ;
    if (trim) {
      args = rawArgs.map((a) => isString(a) ? a.trim() : a);
    }
    if (number) {
      args = rawArgs.map(looseToNumber);
    }
  }
  let handlerName;
  let handler = props[handlerName = toHandlerKey(event)] || // also try camelCase event handler (#2249)
  props[handlerName = toHandlerKey(camelize(event))];
  if (!handler && isModelListener2) {
    handler = props[handlerName = toHandlerKey(hyphenate(event))];
  }
  if (handler) {
    callWithAsyncErrorHandling(handler, instance, 6, args);
  }
  const onceHandler = props[handlerName + `Once`];
  if (onceHandler) {
    if (!instance.emitted) {
      instance.emitted = {};
    } else if (instance.emitted[handlerName]) {
      return;
    }
    instance.emitted[handlerName] = true;
    callWithAsyncErrorHandling(onceHandler, instance, 6, args);
  }
}
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
  const cache = appContext.emitsCache;
  const cached = cache.get(comp);
  if (cached !== void 0) {
    return cached;
  }
  const raw = comp.emits;
  let normalized = {};
  let hasExtends = false;
  if (!isFunction(comp)) {
    const extendEmits = (raw2) => {
      const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
      if (normalizedFromExtend) {
        hasExtends = true;
        extend(normalized, normalizedFromExtend);
      }
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendEmits);
    }
    if (comp.extends) {
      extendEmits(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendEmits);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject$1(comp)) {
      cache.set(comp, null);
    }
    return null;
  }
  if (isArray$1(raw)) {
    raw.forEach((key) => normalized[key] = null);
  } else {
    extend(normalized, raw);
  }
  if (isObject$1(comp)) {
    cache.set(comp, normalized);
  }
  return normalized;
}
function isEmitListener(options, key) {
  if (!options || !isOn(key)) {
    return false;
  }
  key = key.slice(2).replace(/Once$/, "");
  return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
}
let currentRenderingInstance = null;
let currentScopeId = null;
function setCurrentRenderingInstance(instance) {
  const prev = currentRenderingInstance;
  currentRenderingInstance = instance;
  currentScopeId = instance && instance.type.__scopeId || null;
  return prev;
}
function pushScopeId(id) {
  currentScopeId = id;
}
function popScopeId() {
  currentScopeId = null;
}
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
  if (!ctx)
    return fn;
  if (fn._n) {
    return fn;
  }
  const renderFnWithContext = (...args) => {
    if (renderFnWithContext._d) {
      setBlockTracking(-1);
    }
    const prevInstance = setCurrentRenderingInstance(ctx);
    let res;
    try {
      res = fn(...args);
    } finally {
      setCurrentRenderingInstance(prevInstance);
      if (renderFnWithContext._d) {
        setBlockTracking(1);
      }
    }
    return res;
  };
  renderFnWithContext._n = true;
  renderFnWithContext._c = true;
  renderFnWithContext._d = true;
  return renderFnWithContext;
}
function markAttrsAccessed() {
}
function renderComponentRoot(instance) {
  const { type: Component, vnode, proxy, withProxy, props, propsOptions: [propsOptions], slots, attrs, emit: emit2, render, renderCache, data, setupState, ctx, inheritAttrs } = instance;
  let result;
  let fallthroughAttrs;
  const prev = setCurrentRenderingInstance(instance);
  try {
    if (vnode.shapeFlag & 4) {
      const proxyToUse = withProxy || proxy;
      result = normalizeVNode(render.call(proxyToUse, proxyToUse, renderCache, props, setupState, data, ctx));
      fallthroughAttrs = attrs;
    } else {
      const render2 = Component;
      if (false)
        ;
      result = normalizeVNode(render2.length > 1 ? render2(props, false ? {
        get attrs() {
          markAttrsAccessed();
          return attrs;
        },
        slots,
        emit: emit2
      } : { attrs, slots, emit: emit2 }) : render2(
        props,
        null
        /* we know it doesn't need it */
      ));
      fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
    }
  } catch (err) {
    blockStack.length = 0;
    handleError(
      err,
      instance,
      1
      /* ErrorCodes.RENDER_FUNCTION */
    );
    result = createVNode(Comment);
  }
  let root = result;
  if (fallthroughAttrs && inheritAttrs !== false) {
    const keys = Object.keys(fallthroughAttrs);
    const { shapeFlag } = root;
    if (keys.length) {
      if (shapeFlag & (1 | 6)) {
        if (propsOptions && keys.some(isModelListener)) {
          fallthroughAttrs = filterModelListeners(fallthroughAttrs, propsOptions);
        }
        root = cloneVNode(root, fallthroughAttrs);
      }
    }
  }
  if (vnode.dirs) {
    root = cloneVNode(root);
    root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
  }
  if (vnode.transition) {
    root.transition = vnode.transition;
  }
  {
    result = root;
  }
  setCurrentRenderingInstance(prev);
  return result;
}
const getFunctionalFallthrough = (attrs) => {
  let res;
  for (const key in attrs) {
    if (key === "class" || key === "style" || isOn(key)) {
      (res || (res = {}))[key] = attrs[key];
    }
  }
  return res;
};
const filterModelListeners = (attrs, props) => {
  const res = {};
  for (const key in attrs) {
    if (!isModelListener(key) || !(key.slice(9) in props)) {
      res[key] = attrs[key];
    }
  }
  return res;
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
  const { props: prevProps, children: prevChildren, component } = prevVNode;
  const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
  const emits = component.emitsOptions;
  if (nextVNode.dirs || nextVNode.transition) {
    return true;
  }
  if (optimized && patchFlag >= 0) {
    if (patchFlag & 1024) {
      return true;
    }
    if (patchFlag & 16) {
      if (!prevProps) {
        return !!nextProps;
      }
      return hasPropsChanged(prevProps, nextProps, emits);
    } else if (patchFlag & 8) {
      const dynamicProps = nextVNode.dynamicProps;
      for (let i = 0; i < dynamicProps.length; i++) {
        const key = dynamicProps[i];
        if (nextProps[key] !== prevProps[key] && !isEmitListener(emits, key)) {
          return true;
        }
      }
    }
  } else {
    if (prevChildren || nextChildren) {
      if (!nextChildren || !nextChildren.$stable) {
        return true;
      }
    }
    if (prevProps === nextProps) {
      return false;
    }
    if (!prevProps) {
      return !!nextProps;
    }
    if (!nextProps) {
      return true;
    }
    return hasPropsChanged(prevProps, nextProps, emits);
  }
  return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
  const nextKeys = Object.keys(nextProps);
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i];
    if (nextProps[key] !== prevProps[key] && !isEmitListener(emitsOptions, key)) {
      return true;
    }
  }
  return false;
}
function updateHOCHostEl({ vnode, parent }, el) {
  while (parent && parent.subTree === vnode) {
    (vnode = parent.vnode).el = el;
    parent = parent.parent;
  }
}
const isSuspense = (type) => type.__isSuspense;
function queueEffectWithSuspense(fn, suspense) {
  if (suspense && suspense.pendingBranch) {
    if (isArray$1(fn)) {
      suspense.effects.push(...fn);
    } else {
      suspense.effects.push(fn);
    }
  } else {
    queuePostFlushCb(fn);
  }
}
function provide(key, value) {
  if (!currentInstance)
    ;
  else {
    let provides = currentInstance.provides;
    const parentProvides = currentInstance.parent && currentInstance.parent.provides;
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = currentInstance || currentRenderingInstance;
  if (instance) {
    const provides = instance.parent == null ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides;
    if (provides && key in provides) {
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance.proxy) : defaultValue;
    } else
      ;
  }
}
const INITIAL_WATCHER_VALUE = {};
function watch(source, cb, options) {
  return doWatch(source, cb, options);
}
function doWatch(source, cb, { immediate, deep, flush, onTrack, onTrigger } = EMPTY_OBJ) {
  const instance = getCurrentScope() === (currentInstance === null || currentInstance === void 0 ? void 0 : currentInstance.scope) ? currentInstance : null;
  let getter;
  let forceTrigger = false;
  let isMultiSource = false;
  if (isRef(source)) {
    getter = () => source.value;
    forceTrigger = isShallow(source);
  } else if (isReactive(source)) {
    getter = () => source;
    deep = true;
  } else if (isArray$1(source)) {
    isMultiSource = true;
    forceTrigger = source.some((s) => isReactive(s) || isShallow(s));
    getter = () => source.map((s) => {
      if (isRef(s)) {
        return s.value;
      } else if (isReactive(s)) {
        return traverse(s);
      } else if (isFunction(s)) {
        return callWithErrorHandling(
          s,
          instance,
          2
          /* ErrorCodes.WATCH_GETTER */
        );
      } else
        ;
    });
  } else if (isFunction(source)) {
    if (cb) {
      getter = () => callWithErrorHandling(
        source,
        instance,
        2
        /* ErrorCodes.WATCH_GETTER */
      );
    } else {
      getter = () => {
        if (instance && instance.isUnmounted) {
          return;
        }
        if (cleanup) {
          cleanup();
        }
        return callWithAsyncErrorHandling(source, instance, 3, [onCleanup]);
      };
    }
  } else {
    getter = NOOP;
  }
  if (cb && deep) {
    const baseGetter = getter;
    getter = () => traverse(baseGetter());
  }
  let cleanup;
  let onCleanup = (fn) => {
    cleanup = effect.onStop = () => {
      callWithErrorHandling(
        fn,
        instance,
        4
        /* ErrorCodes.WATCH_CLEANUP */
      );
    };
  };
  let ssrCleanup;
  if (isInSSRComponentSetup) {
    onCleanup = NOOP;
    if (!cb) {
      getter();
    } else if (immediate) {
      callWithAsyncErrorHandling(cb, instance, 3, [
        getter(),
        isMultiSource ? [] : void 0,
        onCleanup
      ]);
    }
    if (flush === "sync") {
      const ctx = useSSRContext();
      ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
    } else {
      return NOOP;
    }
  }
  let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
  const job = () => {
    if (!effect.active) {
      return;
    }
    if (cb) {
      const newValue = effect.run();
      if (deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue)) || false) {
        if (cleanup) {
          cleanup();
        }
        callWithAsyncErrorHandling(cb, instance, 3, [
          newValue,
          // pass undefined as the old value when it's changed for the first time
          oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
          onCleanup
        ]);
        oldValue = newValue;
      }
    } else {
      effect.run();
    }
  };
  job.allowRecurse = !!cb;
  let scheduler;
  if (flush === "sync") {
    scheduler = job;
  } else if (flush === "post") {
    scheduler = () => queuePostRenderEffect(job, instance && instance.suspense);
  } else {
    job.pre = true;
    if (instance)
      job.id = instance.uid;
    scheduler = () => queueJob(job);
  }
  const effect = new ReactiveEffect(getter, scheduler);
  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect.run();
    }
  } else if (flush === "post") {
    queuePostRenderEffect(effect.run.bind(effect), instance && instance.suspense);
  } else {
    effect.run();
  }
  const unwatch = () => {
    effect.stop();
    if (instance && instance.scope) {
      remove(instance.scope.effects, effect);
    }
  };
  if (ssrCleanup)
    ssrCleanup.push(unwatch);
  return unwatch;
}
function instanceWatch(source, value, options) {
  const publicThis = this.proxy;
  const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
  let cb;
  if (isFunction(value)) {
    cb = value;
  } else {
    cb = value.handler;
    options = value;
  }
  const cur = currentInstance;
  setCurrentInstance(this);
  const res = doWatch(getter, cb.bind(publicThis), options);
  if (cur) {
    setCurrentInstance(cur);
  } else {
    unsetCurrentInstance();
  }
  return res;
}
function createPathGetter(ctx, path) {
  const segments = path.split(".");
  return () => {
    let cur = ctx;
    for (let i = 0; i < segments.length && cur; i++) {
      cur = cur[segments[i]];
    }
    return cur;
  };
}
function traverse(value, seen) {
  if (!isObject$1(value) || value[
    "__v_skip"
    /* ReactiveFlags.SKIP */
  ]) {
    return value;
  }
  seen = seen || /* @__PURE__ */ new Set();
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  if (isRef(value)) {
    traverse(value.value, seen);
  } else if (isArray$1(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v) => {
      traverse(v, seen);
    });
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse(value[key], seen);
    }
  }
  return value;
}
function useTransitionState() {
  const state = {
    isMounted: false,
    isLeaving: false,
    isUnmounting: false,
    leavingVNodes: /* @__PURE__ */ new Map()
  };
  onMounted(() => {
    state.isMounted = true;
  });
  onBeforeUnmount(() => {
    state.isUnmounting = true;
  });
  return state;
}
const TransitionHookValidator = [Function, Array];
const BaseTransitionImpl = {
  name: `BaseTransition`,
  props: {
    mode: String,
    appear: Boolean,
    persisted: Boolean,
    // enter
    onBeforeEnter: TransitionHookValidator,
    onEnter: TransitionHookValidator,
    onAfterEnter: TransitionHookValidator,
    onEnterCancelled: TransitionHookValidator,
    // leave
    onBeforeLeave: TransitionHookValidator,
    onLeave: TransitionHookValidator,
    onAfterLeave: TransitionHookValidator,
    onLeaveCancelled: TransitionHookValidator,
    // appear
    onBeforeAppear: TransitionHookValidator,
    onAppear: TransitionHookValidator,
    onAfterAppear: TransitionHookValidator,
    onAppearCancelled: TransitionHookValidator
  },
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const state = useTransitionState();
    let prevTransitionKey;
    return () => {
      const children = slots.default && getTransitionRawChildren(slots.default(), true);
      if (!children || !children.length) {
        return;
      }
      let child = children[0];
      if (children.length > 1) {
        for (const c of children) {
          if (c.type !== Comment) {
            child = c;
            break;
          }
        }
      }
      const rawProps = toRaw(props);
      const { mode } = rawProps;
      if (state.isLeaving) {
        return emptyPlaceholder(child);
      }
      const innerChild = getKeepAliveChild(child);
      if (!innerChild) {
        return emptyPlaceholder(child);
      }
      const enterHooks = resolveTransitionHooks(innerChild, rawProps, state, instance);
      setTransitionHooks(innerChild, enterHooks);
      const oldChild = instance.subTree;
      const oldInnerChild = oldChild && getKeepAliveChild(oldChild);
      let transitionKeyChanged = false;
      const { getTransitionKey } = innerChild.type;
      if (getTransitionKey) {
        const key = getTransitionKey();
        if (prevTransitionKey === void 0) {
          prevTransitionKey = key;
        } else if (key !== prevTransitionKey) {
          prevTransitionKey = key;
          transitionKeyChanged = true;
        }
      }
      if (oldInnerChild && oldInnerChild.type !== Comment && (!isSameVNodeType(innerChild, oldInnerChild) || transitionKeyChanged)) {
        const leavingHooks = resolveTransitionHooks(oldInnerChild, rawProps, state, instance);
        setTransitionHooks(oldInnerChild, leavingHooks);
        if (mode === "out-in") {
          state.isLeaving = true;
          leavingHooks.afterLeave = () => {
            state.isLeaving = false;
            if (instance.update.active !== false) {
              instance.update();
            }
          };
          return emptyPlaceholder(child);
        } else if (mode === "in-out" && innerChild.type !== Comment) {
          leavingHooks.delayLeave = (el, earlyRemove, delayedLeave) => {
            const leavingVNodesCache = getLeavingNodesForType(state, oldInnerChild);
            leavingVNodesCache[String(oldInnerChild.key)] = oldInnerChild;
            el._leaveCb = () => {
              earlyRemove();
              el._leaveCb = void 0;
              delete enterHooks.delayedLeave;
            };
            enterHooks.delayedLeave = delayedLeave;
          };
        }
      }
      return child;
    };
  }
};
const BaseTransition = BaseTransitionImpl;
function getLeavingNodesForType(state, vnode) {
  const { leavingVNodes } = state;
  let leavingVNodesCache = leavingVNodes.get(vnode.type);
  if (!leavingVNodesCache) {
    leavingVNodesCache = /* @__PURE__ */ Object.create(null);
    leavingVNodes.set(vnode.type, leavingVNodesCache);
  }
  return leavingVNodesCache;
}
function resolveTransitionHooks(vnode, props, state, instance) {
  const { appear, mode, persisted = false, onBeforeEnter, onEnter, onAfterEnter, onEnterCancelled, onBeforeLeave, onLeave, onAfterLeave, onLeaveCancelled, onBeforeAppear, onAppear, onAfterAppear, onAppearCancelled } = props;
  const key = String(vnode.key);
  const leavingVNodesCache = getLeavingNodesForType(state, vnode);
  const callHook2 = (hook, args) => {
    hook && callWithAsyncErrorHandling(hook, instance, 9, args);
  };
  const callAsyncHook = (hook, args) => {
    const done = args[1];
    callHook2(hook, args);
    if (isArray$1(hook)) {
      if (hook.every((hook2) => hook2.length <= 1))
        done();
    } else if (hook.length <= 1) {
      done();
    }
  };
  const hooks = {
    mode,
    persisted,
    beforeEnter(el) {
      let hook = onBeforeEnter;
      if (!state.isMounted) {
        if (appear) {
          hook = onBeforeAppear || onBeforeEnter;
        } else {
          return;
        }
      }
      if (el._leaveCb) {
        el._leaveCb(
          true
          /* cancelled */
        );
      }
      const leavingVNode = leavingVNodesCache[key];
      if (leavingVNode && isSameVNodeType(vnode, leavingVNode) && leavingVNode.el._leaveCb) {
        leavingVNode.el._leaveCb();
      }
      callHook2(hook, [el]);
    },
    enter(el) {
      let hook = onEnter;
      let afterHook = onAfterEnter;
      let cancelHook = onEnterCancelled;
      if (!state.isMounted) {
        if (appear) {
          hook = onAppear || onEnter;
          afterHook = onAfterAppear || onAfterEnter;
          cancelHook = onAppearCancelled || onEnterCancelled;
        } else {
          return;
        }
      }
      let called = false;
      const done = el._enterCb = (cancelled) => {
        if (called)
          return;
        called = true;
        if (cancelled) {
          callHook2(cancelHook, [el]);
        } else {
          callHook2(afterHook, [el]);
        }
        if (hooks.delayedLeave) {
          hooks.delayedLeave();
        }
        el._enterCb = void 0;
      };
      if (hook) {
        callAsyncHook(hook, [el, done]);
      } else {
        done();
      }
    },
    leave(el, remove2) {
      const key2 = String(vnode.key);
      if (el._enterCb) {
        el._enterCb(
          true
          /* cancelled */
        );
      }
      if (state.isUnmounting) {
        return remove2();
      }
      callHook2(onBeforeLeave, [el]);
      let called = false;
      const done = el._leaveCb = (cancelled) => {
        if (called)
          return;
        called = true;
        remove2();
        if (cancelled) {
          callHook2(onLeaveCancelled, [el]);
        } else {
          callHook2(onAfterLeave, [el]);
        }
        el._leaveCb = void 0;
        if (leavingVNodesCache[key2] === vnode) {
          delete leavingVNodesCache[key2];
        }
      };
      leavingVNodesCache[key2] = vnode;
      if (onLeave) {
        callAsyncHook(onLeave, [el, done]);
      } else {
        done();
      }
    },
    clone(vnode2) {
      return resolveTransitionHooks(vnode2, props, state, instance);
    }
  };
  return hooks;
}
function emptyPlaceholder(vnode) {
  if (isKeepAlive(vnode)) {
    vnode = cloneVNode(vnode);
    vnode.children = null;
    return vnode;
  }
}
function getKeepAliveChild(vnode) {
  return isKeepAlive(vnode) ? vnode.children ? vnode.children[0] : void 0 : vnode;
}
function setTransitionHooks(vnode, hooks) {
  if (vnode.shapeFlag & 6 && vnode.component) {
    setTransitionHooks(vnode.component.subTree, hooks);
  } else if (vnode.shapeFlag & 128) {
    vnode.ssContent.transition = hooks.clone(vnode.ssContent);
    vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
  } else {
    vnode.transition = hooks;
  }
}
function getTransitionRawChildren(children, keepComment = false, parentKey) {
  let ret = [];
  let keyedFragmentCount = 0;
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    const key = parentKey == null ? child.key : String(parentKey) + String(child.key != null ? child.key : i);
    if (child.type === Fragment) {
      if (child.patchFlag & 128)
        keyedFragmentCount++;
      ret = ret.concat(getTransitionRawChildren(child.children, keepComment, key));
    } else if (keepComment || child.type !== Comment) {
      ret.push(key != null ? cloneVNode(child, { key }) : child);
    }
  }
  if (keyedFragmentCount > 1) {
    for (let i = 0; i < ret.length; i++) {
      ret[i].patchFlag = -2;
    }
  }
  return ret;
}
function defineComponent(options) {
  return isFunction(options) ? { setup: options, name: options.name } : options;
}
const isAsyncWrapper = (i) => !!i.type.__asyncLoader;
const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
function onActivated(hook, target) {
  registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
  registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
  const wrappedHook = hook.__wdc || (hook.__wdc = () => {
    let current = target;
    while (current) {
      if (current.isDeactivated) {
        return;
      }
      current = current.parent;
    }
    return hook();
  });
  injectHook(type, wrappedHook, target);
  if (target) {
    let current = target.parent;
    while (current && current.parent) {
      if (isKeepAlive(current.parent.vnode)) {
        injectToKeepAliveRoot(wrappedHook, type, target, current);
      }
      current = current.parent;
    }
  }
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
  const injected = injectHook(
    type,
    hook,
    keepAliveRoot,
    true
    /* prepend */
  );
  onUnmounted(() => {
    remove(keepAliveRoot[type], injected);
  }, target);
}
function injectHook(type, hook, target = currentInstance, prepend = false) {
  if (target) {
    const hooks = target[type] || (target[type] = []);
    const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
      if (target.isUnmounted) {
        return;
      }
      pauseTracking();
      setCurrentInstance(target);
      const res = callWithAsyncErrorHandling(hook, target, type, args);
      unsetCurrentInstance();
      resetTracking();
      return res;
    });
    if (prepend) {
      hooks.unshift(wrappedHook);
    } else {
      hooks.push(wrappedHook);
    }
    return wrappedHook;
  }
}
const createHook = (lifecycle) => (hook, target = currentInstance) => (
  // post-create lifecycle registrations are noops during SSR (except for serverPrefetch)
  (!isInSSRComponentSetup || lifecycle === "sp") && injectHook(lifecycle, (...args) => hook(...args), target)
);
const onBeforeMount = createHook(
  "bm"
  /* LifecycleHooks.BEFORE_MOUNT */
);
const onMounted = createHook(
  "m"
  /* LifecycleHooks.MOUNTED */
);
const onBeforeUpdate = createHook(
  "bu"
  /* LifecycleHooks.BEFORE_UPDATE */
);
const onUpdated = createHook(
  "u"
  /* LifecycleHooks.UPDATED */
);
const onBeforeUnmount = createHook(
  "bum"
  /* LifecycleHooks.BEFORE_UNMOUNT */
);
const onUnmounted = createHook(
  "um"
  /* LifecycleHooks.UNMOUNTED */
);
const onServerPrefetch = createHook(
  "sp"
  /* LifecycleHooks.SERVER_PREFETCH */
);
const onRenderTriggered = createHook(
  "rtg"
  /* LifecycleHooks.RENDER_TRIGGERED */
);
const onRenderTracked = createHook(
  "rtc"
  /* LifecycleHooks.RENDER_TRACKED */
);
function onErrorCaptured(hook, target = currentInstance) {
  injectHook("ec", hook, target);
}
function withDirectives(vnode, directives) {
  const internalInstance = currentRenderingInstance;
  if (internalInstance === null) {
    return vnode;
  }
  const instance = getExposeProxy(internalInstance) || internalInstance.proxy;
  const bindings = vnode.dirs || (vnode.dirs = []);
  for (let i = 0; i < directives.length; i++) {
    let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
    if (dir) {
      if (isFunction(dir)) {
        dir = {
          mounted: dir,
          updated: dir
        };
      }
      if (dir.deep) {
        traverse(value);
      }
      bindings.push({
        dir,
        instance,
        value,
        oldValue: void 0,
        arg,
        modifiers
      });
    }
  }
  return vnode;
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
  const bindings = vnode.dirs;
  const oldBindings = prevVNode && prevVNode.dirs;
  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    if (oldBindings) {
      binding.oldValue = oldBindings[i].value;
    }
    let hook = binding.dir[name];
    if (hook) {
      pauseTracking();
      callWithAsyncErrorHandling(hook, instance, 8, [
        vnode.el,
        binding,
        vnode,
        prevVNode
      ]);
      resetTracking();
    }
  }
}
const COMPONENTS = "components";
function resolveComponent(name, maybeSelfReference) {
  return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;
}
const NULL_DYNAMIC_COMPONENT = Symbol();
function resolveAsset(type, name, warnMissing = true, maybeSelfReference = false) {
  const instance = currentRenderingInstance || currentInstance;
  if (instance) {
    const Component = instance.type;
    if (type === COMPONENTS) {
      const selfName = getComponentName(
        Component,
        false
        /* do not include inferred name to avoid breaking existing code */
      );
      if (selfName && (selfName === name || selfName === camelize(name) || selfName === capitalize(camelize(name)))) {
        return Component;
      }
    }
    const res = (
      // local registration
      // check instance[type] first which is resolved for options API
      resolve(instance[type] || Component[type], name) || // global registration
      resolve(instance.appContext[type], name)
    );
    if (!res && maybeSelfReference) {
      return Component;
    }
    return res;
  }
}
function resolve(registry, name) {
  return registry && (registry[name] || registry[camelize(name)] || registry[capitalize(camelize(name))]);
}
function renderList(source, renderItem, cache, index) {
  let ret;
  const cached = cache && cache[index];
  if (isArray$1(source) || isString(source)) {
    ret = new Array(source.length);
    for (let i = 0, l = source.length; i < l; i++) {
      ret[i] = renderItem(source[i], i, void 0, cached && cached[i]);
    }
  } else if (typeof source === "number") {
    ret = new Array(source);
    for (let i = 0; i < source; i++) {
      ret[i] = renderItem(i + 1, i, void 0, cached && cached[i]);
    }
  } else if (isObject$1(source)) {
    if (source[Symbol.iterator]) {
      ret = Array.from(source, (item, i) => renderItem(item, i, void 0, cached && cached[i]));
    } else {
      const keys = Object.keys(source);
      ret = new Array(keys.length);
      for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        ret[i] = renderItem(source[key], key, i, cached && cached[i]);
      }
    }
  } else {
    ret = [];
  }
  if (cache) {
    cache[index] = ret;
  }
  return ret;
}
function renderSlot(slots, name, props = {}, fallback, noSlotted) {
  if (currentRenderingInstance.isCE || currentRenderingInstance.parent && isAsyncWrapper(currentRenderingInstance.parent) && currentRenderingInstance.parent.isCE) {
    if (name !== "default")
      props.name = name;
    return createVNode("slot", props, fallback && fallback());
  }
  let slot = slots[name];
  if (slot && slot._c) {
    slot._d = false;
  }
  openBlock();
  const validSlotContent = slot && ensureValidVNode(slot(props));
  const rendered = createBlock(
    Fragment,
    {
      key: props.key || // slot content array of a dynamic conditional slot may have a branch
      // key attached in the `createSlots` helper, respect that
      validSlotContent && validSlotContent.key || `_${name}`
    },
    validSlotContent || (fallback ? fallback() : []),
    validSlotContent && slots._ === 1 ? 64 : -2
    /* PatchFlags.BAIL */
  );
  if (!noSlotted && rendered.scopeId) {
    rendered.slotScopeIds = [rendered.scopeId + "-s"];
  }
  if (slot && slot._c) {
    slot._d = true;
  }
  return rendered;
}
function ensureValidVNode(vnodes) {
  return vnodes.some((child) => {
    if (!isVNode(child))
      return true;
    if (child.type === Comment)
      return false;
    if (child.type === Fragment && !ensureValidVNode(child.children))
      return false;
    return true;
  }) ? vnodes : null;
}
const getPublicInstance = (i) => {
  if (!i)
    return null;
  if (isStatefulComponent(i))
    return getExposeProxy(i) || i.proxy;
  return getPublicInstance(i.parent);
};
const publicPropertiesMap = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
    $: (i) => i,
    $el: (i) => i.vnode.el,
    $data: (i) => i.data,
    $props: (i) => i.props,
    $attrs: (i) => i.attrs,
    $slots: (i) => i.slots,
    $refs: (i) => i.refs,
    $parent: (i) => getPublicInstance(i.parent),
    $root: (i) => getPublicInstance(i.root),
    $emit: (i) => i.emit,
    $options: (i) => resolveMergedOptions(i),
    $forceUpdate: (i) => i.f || (i.f = () => queueJob(i.update)),
    $nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
    $watch: (i) => instanceWatch.bind(i)
  })
);
const hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
    let normalizedProps;
    if (key[0] !== "$") {
      const n = accessCache[key];
      if (n !== void 0) {
        switch (n) {
          case 1:
            return setupState[key];
          case 2:
            return data[key];
          case 4:
            return ctx[key];
          case 3:
            return props[key];
        }
      } else if (hasSetupBinding(setupState, key)) {
        accessCache[key] = 1;
        return setupState[key];
      } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
        accessCache[key] = 2;
        return data[key];
      } else if (
        // only cache other properties when instance has declared (thus stable)
        // props
        (normalizedProps = instance.propsOptions[0]) && hasOwn(normalizedProps, key)
      ) {
        accessCache[key] = 3;
        return props[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache[key] = 4;
        return ctx[key];
      } else if (shouldCacheAccess) {
        accessCache[key] = 0;
      }
    }
    const publicGetter = publicPropertiesMap[key];
    let cssModule, globalProperties;
    if (publicGetter) {
      if (key === "$attrs") {
        track(instance, "get", key);
      }
      return publicGetter(instance);
    } else if (
      // css module (injected by vue-loader)
      (cssModule = type.__cssModules) && (cssModule = cssModule[key])
    ) {
      return cssModule;
    } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
      accessCache[key] = 4;
      return ctx[key];
    } else if (
      // global properties
      globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)
    ) {
      {
        return globalProperties[key];
      }
    } else
      ;
  },
  set({ _: instance }, key, value) {
    const { data, setupState, ctx } = instance;
    if (hasSetupBinding(setupState, key)) {
      setupState[key] = value;
      return true;
    } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
      data[key] = value;
      return true;
    } else if (hasOwn(instance.props, key)) {
      return false;
    }
    if (key[0] === "$" && key.slice(1) in instance) {
      return false;
    } else {
      {
        ctx[key] = value;
      }
    }
    return true;
  },
  has({ _: { data, setupState, accessCache, ctx, appContext, propsOptions } }, key) {
    let normalizedProps;
    return !!accessCache[key] || data !== EMPTY_OBJ && hasOwn(data, key) || hasSetupBinding(setupState, key) || (normalizedProps = propsOptions[0]) && hasOwn(normalizedProps, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key);
  },
  defineProperty(target, key, descriptor) {
    if (descriptor.get != null) {
      target._.accessCache[key] = 0;
    } else if (hasOwn(descriptor, "value")) {
      this.set(target, key, descriptor.value, null);
    }
    return Reflect.defineProperty(target, key, descriptor);
  }
};
let shouldCacheAccess = true;
function applyOptions(instance) {
  const options = resolveMergedOptions(instance);
  const publicThis = instance.proxy;
  const ctx = instance.ctx;
  shouldCacheAccess = false;
  if (options.beforeCreate) {
    callHook(
      options.beforeCreate,
      instance,
      "bc"
      /* LifecycleHooks.BEFORE_CREATE */
    );
  }
  const {
    // state
    data: dataOptions,
    computed: computedOptions,
    methods,
    watch: watchOptions,
    provide: provideOptions,
    inject: injectOptions,
    // lifecycle
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    activated,
    deactivated,
    beforeDestroy,
    beforeUnmount,
    destroyed,
    unmounted,
    render,
    renderTracked,
    renderTriggered,
    errorCaptured,
    serverPrefetch,
    // public API
    expose,
    inheritAttrs,
    // assets
    components,
    directives,
    filters
  } = options;
  const checkDuplicateProperties = null;
  if (injectOptions) {
    resolveInjections(injectOptions, ctx, checkDuplicateProperties, instance.appContext.config.unwrapInjectedRef);
  }
  if (methods) {
    for (const key in methods) {
      const methodHandler = methods[key];
      if (isFunction(methodHandler)) {
        {
          ctx[key] = methodHandler.bind(publicThis);
        }
      }
    }
  }
  if (dataOptions) {
    const data = dataOptions.call(publicThis, publicThis);
    if (!isObject$1(data))
      ;
    else {
      instance.data = reactive(data);
    }
  }
  shouldCacheAccess = true;
  if (computedOptions) {
    for (const key in computedOptions) {
      const opt = computedOptions[key];
      const get3 = isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
      const set2 = !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : NOOP;
      const c = computed({
        get: get3,
        set: set2
      });
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => c.value,
        set: (v) => c.value = v
      });
    }
  }
  if (watchOptions) {
    for (const key in watchOptions) {
      createWatcher(watchOptions[key], ctx, publicThis, key);
    }
  }
  if (provideOptions) {
    const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
    Reflect.ownKeys(provides).forEach((key) => {
      provide(key, provides[key]);
    });
  }
  if (created) {
    callHook(
      created,
      instance,
      "c"
      /* LifecycleHooks.CREATED */
    );
  }
  function registerLifecycleHook(register2, hook) {
    if (isArray$1(hook)) {
      hook.forEach((_hook) => register2(_hook.bind(publicThis)));
    } else if (hook) {
      register2(hook.bind(publicThis));
    }
  }
  registerLifecycleHook(onBeforeMount, beforeMount);
  registerLifecycleHook(onMounted, mounted);
  registerLifecycleHook(onBeforeUpdate, beforeUpdate);
  registerLifecycleHook(onUpdated, updated);
  registerLifecycleHook(onActivated, activated);
  registerLifecycleHook(onDeactivated, deactivated);
  registerLifecycleHook(onErrorCaptured, errorCaptured);
  registerLifecycleHook(onRenderTracked, renderTracked);
  registerLifecycleHook(onRenderTriggered, renderTriggered);
  registerLifecycleHook(onBeforeUnmount, beforeUnmount);
  registerLifecycleHook(onUnmounted, unmounted);
  registerLifecycleHook(onServerPrefetch, serverPrefetch);
  if (isArray$1(expose)) {
    if (expose.length) {
      const exposed = instance.exposed || (instance.exposed = {});
      expose.forEach((key) => {
        Object.defineProperty(exposed, key, {
          get: () => publicThis[key],
          set: (val) => publicThis[key] = val
        });
      });
    } else if (!instance.exposed) {
      instance.exposed = {};
    }
  }
  if (render && instance.render === NOOP) {
    instance.render = render;
  }
  if (inheritAttrs != null) {
    instance.inheritAttrs = inheritAttrs;
  }
  if (components)
    instance.components = components;
  if (directives)
    instance.directives = directives;
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP, unwrapRef = false) {
  if (isArray$1(injectOptions)) {
    injectOptions = normalizeInject(injectOptions);
  }
  for (const key in injectOptions) {
    const opt = injectOptions[key];
    let injected;
    if (isObject$1(opt)) {
      if ("default" in opt) {
        injected = inject(
          opt.from || key,
          opt.default,
          true
          /* treat default function as factory */
        );
      } else {
        injected = inject(opt.from || key);
      }
    } else {
      injected = inject(opt);
    }
    if (isRef(injected)) {
      if (unwrapRef) {
        Object.defineProperty(ctx, key, {
          enumerable: true,
          configurable: true,
          get: () => injected.value,
          set: (v) => injected.value = v
        });
      } else {
        ctx[key] = injected;
      }
    } else {
      ctx[key] = injected;
    }
  }
}
function callHook(hook, instance, type) {
  callWithAsyncErrorHandling(isArray$1(hook) ? hook.map((h2) => h2.bind(instance.proxy)) : hook.bind(instance.proxy), instance, type);
}
function createWatcher(raw, ctx, publicThis, key) {
  const getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
  if (isString(raw)) {
    const handler = ctx[raw];
    if (isFunction(handler)) {
      watch(getter, handler);
    }
  } else if (isFunction(raw)) {
    watch(getter, raw.bind(publicThis));
  } else if (isObject$1(raw)) {
    if (isArray$1(raw)) {
      raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
    } else {
      const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
      if (isFunction(handler)) {
        watch(getter, handler, raw);
      }
    }
  } else
    ;
}
function resolveMergedOptions(instance) {
  const base = instance.type;
  const { mixins, extends: extendsOptions } = base;
  const { mixins: globalMixins, optionsCache: cache, config: { optionMergeStrategies } } = instance.appContext;
  const cached = cache.get(base);
  let resolved;
  if (cached) {
    resolved = cached;
  } else if (!globalMixins.length && !mixins && !extendsOptions) {
    {
      resolved = base;
    }
  } else {
    resolved = {};
    if (globalMixins.length) {
      globalMixins.forEach((m) => mergeOptions$1(resolved, m, optionMergeStrategies, true));
    }
    mergeOptions$1(resolved, base, optionMergeStrategies);
  }
  if (isObject$1(base)) {
    cache.set(base, resolved);
  }
  return resolved;
}
function mergeOptions$1(to, from, strats, asMixin = false) {
  const { mixins, extends: extendsOptions } = from;
  if (extendsOptions) {
    mergeOptions$1(to, extendsOptions, strats, true);
  }
  if (mixins) {
    mixins.forEach((m) => mergeOptions$1(to, m, strats, true));
  }
  for (const key in from) {
    if (asMixin && key === "expose")
      ;
    else {
      const strat = internalOptionMergeStrats[key] || strats && strats[key];
      to[key] = strat ? strat(to[key], from[key]) : from[key];
    }
  }
  return to;
}
const internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeObjectOptions,
  emits: mergeObjectOptions,
  // objects
  methods: mergeObjectOptions,
  computed: mergeObjectOptions,
  // lifecycle
  beforeCreate: mergeAsArray,
  created: mergeAsArray,
  beforeMount: mergeAsArray,
  mounted: mergeAsArray,
  beforeUpdate: mergeAsArray,
  updated: mergeAsArray,
  beforeDestroy: mergeAsArray,
  beforeUnmount: mergeAsArray,
  destroyed: mergeAsArray,
  unmounted: mergeAsArray,
  activated: mergeAsArray,
  deactivated: mergeAsArray,
  errorCaptured: mergeAsArray,
  serverPrefetch: mergeAsArray,
  // assets
  components: mergeObjectOptions,
  directives: mergeObjectOptions,
  // watch
  watch: mergeWatchOptions,
  // provide / inject
  provide: mergeDataFn,
  inject: mergeInject
};
function mergeDataFn(to, from) {
  if (!from) {
    return to;
  }
  if (!to) {
    return from;
  }
  return function mergedDataFn() {
    return extend(isFunction(to) ? to.call(this, this) : to, isFunction(from) ? from.call(this, this) : from);
  };
}
function mergeInject(to, from) {
  return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
  if (isArray$1(raw)) {
    const res = {};
    for (let i = 0; i < raw.length; i++) {
      res[raw[i]] = raw[i];
    }
    return res;
  }
  return raw;
}
function mergeAsArray(to, from) {
  return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
  return to ? extend(extend(/* @__PURE__ */ Object.create(null), to), from) : from;
}
function mergeWatchOptions(to, from) {
  if (!to)
    return from;
  if (!from)
    return to;
  const merged = extend(/* @__PURE__ */ Object.create(null), to);
  for (const key in from) {
    merged[key] = mergeAsArray(to[key], from[key]);
  }
  return merged;
}
function initProps(instance, rawProps, isStateful, isSSR = false) {
  const props = {};
  const attrs = {};
  def(attrs, InternalObjectKey, 1);
  instance.propsDefaults = /* @__PURE__ */ Object.create(null);
  setFullProps(instance, rawProps, props, attrs);
  for (const key in instance.propsOptions[0]) {
    if (!(key in props)) {
      props[key] = void 0;
    }
  }
  if (isStateful) {
    instance.props = isSSR ? props : shallowReactive(props);
  } else {
    if (!instance.type.props) {
      instance.props = attrs;
    } else {
      instance.props = props;
    }
  }
  instance.attrs = attrs;
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
  const { props, attrs, vnode: { patchFlag } } = instance;
  const rawCurrentProps = toRaw(props);
  const [options] = instance.propsOptions;
  let hasAttrsChanged = false;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (optimized || patchFlag > 0) && !(patchFlag & 16)
  ) {
    if (patchFlag & 8) {
      const propsToUpdate = instance.vnode.dynamicProps;
      for (let i = 0; i < propsToUpdate.length; i++) {
        let key = propsToUpdate[i];
        if (isEmitListener(instance.emitsOptions, key)) {
          continue;
        }
        const value = rawProps[key];
        if (options) {
          if (hasOwn(attrs, key)) {
            if (value !== attrs[key]) {
              attrs[key] = value;
              hasAttrsChanged = true;
            }
          } else {
            const camelizedKey = camelize(key);
            props[camelizedKey] = resolvePropValue(
              options,
              rawCurrentProps,
              camelizedKey,
              value,
              instance,
              false
              /* isAbsent */
            );
          }
        } else {
          if (value !== attrs[key]) {
            attrs[key] = value;
            hasAttrsChanged = true;
          }
        }
      }
    }
  } else {
    if (setFullProps(instance, rawProps, props, attrs)) {
      hasAttrsChanged = true;
    }
    let kebabKey;
    for (const key in rawCurrentProps) {
      if (!rawProps || // for camelCase
      !hasOwn(rawProps, key) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) {
        if (options) {
          if (rawPrevProps && // for camelCase
          (rawPrevProps[key] !== void 0 || // for kebab-case
          rawPrevProps[kebabKey] !== void 0)) {
            props[key] = resolvePropValue(
              options,
              rawCurrentProps,
              key,
              void 0,
              instance,
              true
              /* isAbsent */
            );
          }
        } else {
          delete props[key];
        }
      }
    }
    if (attrs !== rawCurrentProps) {
      for (const key in attrs) {
        if (!rawProps || !hasOwn(rawProps, key) && true) {
          delete attrs[key];
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (hasAttrsChanged) {
    trigger(instance, "set", "$attrs");
  }
}
function setFullProps(instance, rawProps, props, attrs) {
  const [options, needCastKeys] = instance.propsOptions;
  let hasAttrsChanged = false;
  let rawCastValues;
  if (rawProps) {
    for (let key in rawProps) {
      if (isReservedProp(key)) {
        continue;
      }
      const value = rawProps[key];
      let camelKey;
      if (options && hasOwn(options, camelKey = camelize(key))) {
        if (!needCastKeys || !needCastKeys.includes(camelKey)) {
          props[camelKey] = value;
        } else {
          (rawCastValues || (rawCastValues = {}))[camelKey] = value;
        }
      } else if (!isEmitListener(instance.emitsOptions, key)) {
        if (!(key in attrs) || value !== attrs[key]) {
          attrs[key] = value;
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (needCastKeys) {
    const rawCurrentProps = toRaw(props);
    const castValues = rawCastValues || EMPTY_OBJ;
    for (let i = 0; i < needCastKeys.length; i++) {
      const key = needCastKeys[i];
      props[key] = resolvePropValue(options, rawCurrentProps, key, castValues[key], instance, !hasOwn(castValues, key));
    }
  }
  return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
  const opt = options[key];
  if (opt != null) {
    const hasDefault = hasOwn(opt, "default");
    if (hasDefault && value === void 0) {
      const defaultValue = opt.default;
      if (opt.type !== Function && isFunction(defaultValue)) {
        const { propsDefaults } = instance;
        if (key in propsDefaults) {
          value = propsDefaults[key];
        } else {
          setCurrentInstance(instance);
          value = propsDefaults[key] = defaultValue.call(null, props);
          unsetCurrentInstance();
        }
      } else {
        value = defaultValue;
      }
    }
    if (opt[
      0
      /* BooleanFlags.shouldCast */
    ]) {
      if (isAbsent && !hasDefault) {
        value = false;
      } else if (opt[
        1
        /* BooleanFlags.shouldCastTrue */
      ] && (value === "" || value === hyphenate(key))) {
        value = true;
      }
    }
  }
  return value;
}
function normalizePropsOptions(comp, appContext, asMixin = false) {
  const cache = appContext.propsCache;
  const cached = cache.get(comp);
  if (cached) {
    return cached;
  }
  const raw = comp.props;
  const normalized = {};
  const needCastKeys = [];
  let hasExtends = false;
  if (!isFunction(comp)) {
    const extendProps = (raw2) => {
      hasExtends = true;
      const [props, keys] = normalizePropsOptions(raw2, appContext, true);
      extend(normalized, props);
      if (keys)
        needCastKeys.push(...keys);
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendProps);
    }
    if (comp.extends) {
      extendProps(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendProps);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject$1(comp)) {
      cache.set(comp, EMPTY_ARR);
    }
    return EMPTY_ARR;
  }
  if (isArray$1(raw)) {
    for (let i = 0; i < raw.length; i++) {
      const normalizedKey = camelize(raw[i]);
      if (validatePropName(normalizedKey)) {
        normalized[normalizedKey] = EMPTY_OBJ;
      }
    }
  } else if (raw) {
    for (const key in raw) {
      const normalizedKey = camelize(key);
      if (validatePropName(normalizedKey)) {
        const opt = raw[key];
        const prop = normalized[normalizedKey] = isArray$1(opt) || isFunction(opt) ? { type: opt } : Object.assign({}, opt);
        if (prop) {
          const booleanIndex = getTypeIndex(Boolean, prop.type);
          const stringIndex = getTypeIndex(String, prop.type);
          prop[
            0
            /* BooleanFlags.shouldCast */
          ] = booleanIndex > -1;
          prop[
            1
            /* BooleanFlags.shouldCastTrue */
          ] = stringIndex < 0 || booleanIndex < stringIndex;
          if (booleanIndex > -1 || hasOwn(prop, "default")) {
            needCastKeys.push(normalizedKey);
          }
        }
      }
    }
  }
  const res = [normalized, needCastKeys];
  if (isObject$1(comp)) {
    cache.set(comp, res);
  }
  return res;
}
function validatePropName(key) {
  if (key[0] !== "$") {
    return true;
  }
  return false;
}
function getType(ctor) {
  const match = ctor && ctor.toString().match(/^\s*(function|class) (\w+)/);
  return match ? match[2] : ctor === null ? "null" : "";
}
function isSameType(a, b) {
  return getType(a) === getType(b);
}
function getTypeIndex(type, expectedTypes) {
  if (isArray$1(expectedTypes)) {
    return expectedTypes.findIndex((t) => isSameType(t, type));
  } else if (isFunction(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1;
  }
  return -1;
}
const isInternalKey = (key) => key[0] === "_" || key === "$stable";
const normalizeSlotValue = (value) => isArray$1(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
const normalizeSlot$1 = (key, rawSlot, ctx) => {
  if (rawSlot._n) {
    return rawSlot;
  }
  const normalized = withCtx((...args) => {
    if (false)
      ;
    return normalizeSlotValue(rawSlot(...args));
  }, ctx);
  normalized._c = false;
  return normalized;
};
const normalizeObjectSlots = (rawSlots, slots, instance) => {
  const ctx = rawSlots._ctx;
  for (const key in rawSlots) {
    if (isInternalKey(key))
      continue;
    const value = rawSlots[key];
    if (isFunction(value)) {
      slots[key] = normalizeSlot$1(key, value, ctx);
    } else if (value != null) {
      const normalized = normalizeSlotValue(value);
      slots[key] = () => normalized;
    }
  }
};
const normalizeVNodeSlots = (instance, children) => {
  const normalized = normalizeSlotValue(children);
  instance.slots.default = () => normalized;
};
const initSlots = (instance, children) => {
  if (instance.vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      instance.slots = toRaw(children);
      def(children, "_", type);
    } else {
      normalizeObjectSlots(children, instance.slots = {});
    }
  } else {
    instance.slots = {};
    if (children) {
      normalizeVNodeSlots(instance, children);
    }
  }
  def(instance.slots, InternalObjectKey, 1);
};
const updateSlots = (instance, children, optimized) => {
  const { vnode, slots } = instance;
  let needDeletionCheck = true;
  let deletionComparisonTarget = EMPTY_OBJ;
  if (vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      if (optimized && type === 1) {
        needDeletionCheck = false;
      } else {
        extend(slots, children);
        if (!optimized && type === 1) {
          delete slots._;
        }
      }
    } else {
      needDeletionCheck = !children.$stable;
      normalizeObjectSlots(children, slots);
    }
    deletionComparisonTarget = children;
  } else if (children) {
    normalizeVNodeSlots(instance, children);
    deletionComparisonTarget = { default: 1 };
  }
  if (needDeletionCheck) {
    for (const key in slots) {
      if (!isInternalKey(key) && !(key in deletionComparisonTarget)) {
        delete slots[key];
      }
    }
  }
};
function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let uid$1 = 0;
function createAppAPI(render, hydrate) {
  return function createApp2(rootComponent, rootProps = null) {
    if (!isFunction(rootComponent)) {
      rootComponent = Object.assign({}, rootComponent);
    }
    if (rootProps != null && !isObject$1(rootProps)) {
      rootProps = null;
    }
    const context = createAppContext();
    const installedPlugins = /* @__PURE__ */ new Set();
    let isMounted = false;
    const app = context.app = {
      _uid: uid$1++,
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      _context: context,
      _instance: null,
      version,
      get config() {
        return context.config;
      },
      set config(v) {
      },
      use(plugin, ...options) {
        if (installedPlugins.has(plugin))
          ;
        else if (plugin && isFunction(plugin.install)) {
          installedPlugins.add(plugin);
          plugin.install(app, ...options);
        } else if (isFunction(plugin)) {
          installedPlugins.add(plugin);
          plugin(app, ...options);
        } else
          ;
        return app;
      },
      mixin(mixin) {
        {
          if (!context.mixins.includes(mixin)) {
            context.mixins.push(mixin);
          }
        }
        return app;
      },
      component(name, component) {
        if (!component) {
          return context.components[name];
        }
        context.components[name] = component;
        return app;
      },
      directive(name, directive) {
        if (!directive) {
          return context.directives[name];
        }
        context.directives[name] = directive;
        return app;
      },
      mount(rootContainer, isHydrate, isSVG) {
        if (!isMounted) {
          const vnode = createVNode(rootComponent, rootProps);
          vnode.appContext = context;
          if (isHydrate && hydrate) {
            hydrate(vnode, rootContainer);
          } else {
            render(vnode, rootContainer, isSVG);
          }
          isMounted = true;
          app._container = rootContainer;
          rootContainer.__vue_app__ = app;
          return getExposeProxy(vnode.component) || vnode.component.proxy;
        }
      },
      unmount() {
        if (isMounted) {
          render(null, app._container);
          delete app._container.__vue_app__;
        }
      },
      provide(key, value) {
        context.provides[key] = value;
        return app;
      }
    };
    return app;
  };
}
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
  if (isArray$1(rawRef)) {
    rawRef.forEach((r, i) => setRef(r, oldRawRef && (isArray$1(oldRawRef) ? oldRawRef[i] : oldRawRef), parentSuspense, vnode, isUnmount));
    return;
  }
  if (isAsyncWrapper(vnode) && !isUnmount) {
    return;
  }
  const refValue = vnode.shapeFlag & 4 ? getExposeProxy(vnode.component) || vnode.component.proxy : vnode.el;
  const value = isUnmount ? null : refValue;
  const { i: owner, r: ref2 } = rawRef;
  const oldRef = oldRawRef && oldRawRef.r;
  const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
  const setupState = owner.setupState;
  if (oldRef != null && oldRef !== ref2) {
    if (isString(oldRef)) {
      refs[oldRef] = null;
      if (hasOwn(setupState, oldRef)) {
        setupState[oldRef] = null;
      }
    } else if (isRef(oldRef)) {
      oldRef.value = null;
    }
  }
  if (isFunction(ref2)) {
    callWithErrorHandling(ref2, owner, 12, [value, refs]);
  } else {
    const _isString = isString(ref2);
    const _isRef = isRef(ref2);
    if (_isString || _isRef) {
      const doSet = () => {
        if (rawRef.f) {
          const existing = _isString ? hasOwn(setupState, ref2) ? setupState[ref2] : refs[ref2] : ref2.value;
          if (isUnmount) {
            isArray$1(existing) && remove(existing, refValue);
          } else {
            if (!isArray$1(existing)) {
              if (_isString) {
                refs[ref2] = [refValue];
                if (hasOwn(setupState, ref2)) {
                  setupState[ref2] = refs[ref2];
                }
              } else {
                ref2.value = [refValue];
                if (rawRef.k)
                  refs[rawRef.k] = ref2.value;
              }
            } else if (!existing.includes(refValue)) {
              existing.push(refValue);
            }
          }
        } else if (_isString) {
          refs[ref2] = value;
          if (hasOwn(setupState, ref2)) {
            setupState[ref2] = value;
          }
        } else if (_isRef) {
          ref2.value = value;
          if (rawRef.k)
            refs[rawRef.k] = value;
        } else
          ;
      };
      if (value) {
        doSet.id = -1;
        queuePostRenderEffect(doSet, parentSuspense);
      } else {
        doSet();
      }
    }
  }
}
const queuePostRenderEffect = queueEffectWithSuspense;
function createRenderer(options) {
  return baseCreateRenderer(options);
}
function baseCreateRenderer(options, createHydrationFns) {
  const target = getGlobalThis();
  target.__VUE__ = true;
  const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, setScopeId: hostSetScopeId = NOOP, insertStaticContent: hostInsertStaticContent } = options;
  const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, isSVG = false, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
    if (n1 === n2) {
      return;
    }
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1);
      unmount(n1, parentComponent, parentSuspense, true);
      n1 = null;
    }
    if (n2.patchFlag === -2) {
      optimized = false;
      n2.dynamicChildren = null;
    }
    const { type, ref: ref2, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container, anchor);
        break;
      case Comment:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Static:
        if (n1 == null) {
          mountStaticNode(n2, container, anchor, isSVG);
        }
        break;
      case Fragment:
        processFragment(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        break;
      default:
        if (shapeFlag & 1) {
          processElement(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        } else if (shapeFlag & 6) {
          processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        } else if (shapeFlag & 64) {
          type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals);
        } else if (shapeFlag & 128) {
          type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals);
        } else
          ;
    }
    if (ref2 != null && parentComponent) {
      setRef(ref2, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
    }
  };
  const processText = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(n2.el = hostCreateText(n2.children), container, anchor);
    } else {
      const el = n2.el = n1.el;
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children);
      }
    }
  };
  const processCommentNode = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(n2.el = hostCreateComment(n2.children || ""), container, anchor);
    } else {
      n2.el = n1.el;
    }
  };
  const mountStaticNode = (n2, container, anchor, isSVG) => {
    [n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, isSVG, n2.el, n2.anchor);
  };
  const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostInsert(el, container, nextSibling);
      el = next;
    }
    hostInsert(anchor, container, nextSibling);
  };
  const removeStaticNode = ({ el, anchor }) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostRemove(el);
      el = next;
    }
    hostRemove(anchor);
  };
  const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    isSVG = isSVG || n2.type === "svg";
    if (n1 == null) {
      mountElement(n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    } else {
      patchElement(n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    }
  };
  const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    let el;
    let vnodeHook;
    const { type, props, shapeFlag, transition, dirs } = vnode;
    el = vnode.el = hostCreateElement(vnode.type, isSVG, props && props.is, props);
    if (shapeFlag & 8) {
      hostSetElementText(el, vnode.children);
    } else if (shapeFlag & 16) {
      mountChildren(vnode.children, el, null, parentComponent, parentSuspense, isSVG && type !== "foreignObject", slotScopeIds, optimized);
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "created");
    }
    setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
    if (props) {
      for (const key in props) {
        if (key !== "value" && !isReservedProp(key)) {
          hostPatchProp(el, key, null, props[key], isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
        }
      }
      if ("value" in props) {
        hostPatchProp(el, "value", null, props.value);
      }
      if (vnodeHook = props.onVnodeBeforeMount) {
        invokeVNodeHook(vnodeHook, parentComponent, vnode);
      }
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
    }
    const needCallTransitionHooks = (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
    if (needCallTransitionHooks) {
      transition.beforeEnter(el);
    }
    hostInsert(el, container, anchor);
    if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        needCallTransitionHooks && transition.enter(el);
        dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
      }, parentSuspense);
    }
  };
  const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
    if (scopeId) {
      hostSetScopeId(el, scopeId);
    }
    if (slotScopeIds) {
      for (let i = 0; i < slotScopeIds.length; i++) {
        hostSetScopeId(el, slotScopeIds[i]);
      }
    }
    if (parentComponent) {
      let subTree = parentComponent.subTree;
      if (vnode === subTree) {
        const parentVNode = parentComponent.vnode;
        setScopeId(el, parentVNode, parentVNode.scopeId, parentVNode.slotScopeIds, parentComponent.parent);
      }
    }
  };
  const mountChildren = (children, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, start = 0) => {
    for (let i = start; i < children.length; i++) {
      const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]);
      patch(null, child, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    }
  };
  const patchElement = (n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    const el = n2.el = n1.el;
    let { patchFlag, dynamicChildren, dirs } = n2;
    patchFlag |= n1.patchFlag & 16;
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    let vnodeHook;
    parentComponent && toggleRecurse(parentComponent, false);
    if (vnodeHook = newProps.onVnodeBeforeUpdate) {
      invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
    }
    if (dirs) {
      invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
    }
    parentComponent && toggleRecurse(parentComponent, true);
    const areChildrenSVG = isSVG && n2.type !== "foreignObject";
    if (dynamicChildren) {
      patchBlockChildren(n1.dynamicChildren, dynamicChildren, el, parentComponent, parentSuspense, areChildrenSVG, slotScopeIds);
    } else if (!optimized) {
      patchChildren(n1, n2, el, null, parentComponent, parentSuspense, areChildrenSVG, slotScopeIds, false);
    }
    if (patchFlag > 0) {
      if (patchFlag & 16) {
        patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
      } else {
        if (patchFlag & 2) {
          if (oldProps.class !== newProps.class) {
            hostPatchProp(el, "class", null, newProps.class, isSVG);
          }
        }
        if (patchFlag & 4) {
          hostPatchProp(el, "style", oldProps.style, newProps.style, isSVG);
        }
        if (patchFlag & 8) {
          const propsToUpdate = n2.dynamicProps;
          for (let i = 0; i < propsToUpdate.length; i++) {
            const key = propsToUpdate[i];
            const prev = oldProps[key];
            const next = newProps[key];
            if (next !== prev || key === "value") {
              hostPatchProp(el, key, prev, next, isSVG, n1.children, parentComponent, parentSuspense, unmountChildren);
            }
          }
        }
      }
      if (patchFlag & 1) {
        if (n1.children !== n2.children) {
          hostSetElementText(el, n2.children);
        }
      }
    } else if (!optimized && dynamicChildren == null) {
      patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
    }
    if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
        dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
      }, parentSuspense);
    }
  };
  const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, isSVG, slotScopeIds) => {
    for (let i = 0; i < newChildren.length; i++) {
      const oldVNode = oldChildren[i];
      const newVNode = newChildren[i];
      const container = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        oldVNode.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (oldVNode.type === Fragment || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !isSameVNodeType(oldVNode, newVNode) || // - In the case of a component, it could contain anything.
        oldVNode.shapeFlag & (6 | 64)) ? hostParentNode(oldVNode.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          fallbackContainer
        )
      );
      patch(oldVNode, newVNode, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, true);
    }
  };
  const patchProps = (el, vnode, oldProps, newProps, parentComponent, parentSuspense, isSVG) => {
    if (oldProps !== newProps) {
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!isReservedProp(key) && !(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null, isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
          }
        }
      }
      for (const key in newProps) {
        if (isReservedProp(key))
          continue;
        const next = newProps[key];
        const prev = oldProps[key];
        if (next !== prev && key !== "value") {
          hostPatchProp(el, key, prev, next, isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
        }
      }
      if ("value" in newProps) {
        hostPatchProp(el, "value", oldProps.value, newProps.value);
      }
    }
  };
  const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
    const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
    let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
    if (fragmentSlotScopeIds) {
      slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    }
    if (n1 == null) {
      hostInsert(fragmentStartAnchor, container, anchor);
      hostInsert(fragmentEndAnchor, container, anchor);
      mountChildren(n2.children, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    } else {
      if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && // #2715 the previous fragment could've been a BAILed one as a result
      // of renderSlot() with no valid children
      n1.dynamicChildren) {
        patchBlockChildren(n1.dynamicChildren, dynamicChildren, container, parentComponent, parentSuspense, isSVG, slotScopeIds);
        if (
          // #2080 if the stable fragment has a key, it's a <template v-for> that may
          //  get moved around. Make sure all root level vnodes inherit el.
          // #2134 or if it's a component root, it may also get moved around
          // as the component is being moved.
          n2.key != null || parentComponent && n2 === parentComponent.subTree
        ) {
          traverseStaticChildren(
            n1,
            n2,
            true
            /* shallow */
          );
        }
      } else {
        patchChildren(n1, n2, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
      }
    }
  };
  const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    n2.slotScopeIds = slotScopeIds;
    if (n1 == null) {
      if (n2.shapeFlag & 512) {
        parentComponent.ctx.activate(n2, container, anchor, isSVG, optimized);
      } else {
        mountComponent(n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized);
      }
    } else {
      updateComponent(n1, n2, optimized);
    }
  };
  const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
    const instance = initialVNode.component = createComponentInstance(initialVNode, parentComponent, parentSuspense);
    if (isKeepAlive(initialVNode)) {
      instance.ctx.renderer = internals;
    }
    {
      setupComponent(instance);
    }
    if (instance.asyncDep) {
      parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect);
      if (!initialVNode.el) {
        const placeholder = instance.subTree = createVNode(Comment);
        processCommentNode(null, placeholder, container, anchor);
      }
      return;
    }
    setupRenderEffect(instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized);
  };
  const updateComponent = (n1, n2, optimized) => {
    const instance = n2.component = n1.component;
    if (shouldUpdateComponent(n1, n2, optimized)) {
      if (instance.asyncDep && !instance.asyncResolved) {
        updateComponentPreRender(instance, n2, optimized);
        return;
      } else {
        instance.next = n2;
        invalidateJob(instance.update);
        instance.update();
      }
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  };
  const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        let vnodeHook;
        const { el, props } = initialVNode;
        const { bm, m, parent } = instance;
        const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
        toggleRecurse(instance, false);
        if (bm) {
          invokeArrayFns(bm);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) {
          invokeVNodeHook(vnodeHook, parent, initialVNode);
        }
        toggleRecurse(instance, true);
        if (el && hydrateNode) {
          const hydrateSubTree = () => {
            instance.subTree = renderComponentRoot(instance);
            hydrateNode(el, instance.subTree, instance, parentSuspense, null);
          };
          if (isAsyncWrapperVNode) {
            initialVNode.type.__asyncLoader().then(
              // note: we are moving the render call into an async callback,
              // which means it won't track dependencies - but it's ok because
              // a server-rendered async wrapper is already in resolved state
              // and it will never need to change.
              () => !instance.isUnmounted && hydrateSubTree()
            );
          } else {
            hydrateSubTree();
          }
        } else {
          const subTree = instance.subTree = renderComponentRoot(instance);
          patch(null, subTree, container, anchor, instance, parentSuspense, isSVG);
          initialVNode.el = subTree.el;
        }
        if (m) {
          queuePostRenderEffect(m, parentSuspense);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
          const scopedInitialVNode = initialVNode;
          queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode), parentSuspense);
        }
        if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) {
          instance.a && queuePostRenderEffect(instance.a, parentSuspense);
        }
        instance.isMounted = true;
        initialVNode = container = anchor = null;
      } else {
        let { next, bu, u, parent, vnode } = instance;
        let originNext = next;
        let vnodeHook;
        toggleRecurse(instance, false);
        if (next) {
          next.el = vnode.el;
          updateComponentPreRender(instance, next, optimized);
        } else {
          next = vnode;
        }
        if (bu) {
          invokeArrayFns(bu);
        }
        if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) {
          invokeVNodeHook(vnodeHook, parent, next, vnode);
        }
        toggleRecurse(instance, true);
        const nextTree = renderComponentRoot(instance);
        const prevTree = instance.subTree;
        instance.subTree = nextTree;
        patch(
          prevTree,
          nextTree,
          // parent may have changed if it's in a teleport
          hostParentNode(prevTree.el),
          // anchor may have changed if it's in a fragment
          getNextHostNode(prevTree),
          instance,
          parentSuspense,
          isSVG
        );
        next.el = nextTree.el;
        if (originNext === null) {
          updateHOCHostEl(instance, nextTree.el);
        }
        if (u) {
          queuePostRenderEffect(u, parentSuspense);
        }
        if (vnodeHook = next.props && next.props.onVnodeUpdated) {
          queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, next, vnode), parentSuspense);
        }
      }
    };
    const effect = instance.effect = new ReactiveEffect(
      componentUpdateFn,
      () => queueJob(update3),
      instance.scope
      // track it in component's effect scope
    );
    const update3 = instance.update = () => effect.run();
    update3.id = instance.uid;
    toggleRecurse(instance, true);
    update3();
  };
  const updateComponentPreRender = (instance, nextVNode, optimized) => {
    nextVNode.component = instance;
    const prevProps = instance.vnode.props;
    instance.vnode = nextVNode;
    instance.next = null;
    updateProps(instance, nextVNode.props, prevProps, optimized);
    updateSlots(instance, nextVNode.children, optimized);
    pauseTracking();
    flushPreFlushCbs();
    resetTracking();
  };
  const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized = false) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2.children;
    const { patchFlag, shapeFlag } = n2;
    if (patchFlag > 0) {
      if (patchFlag & 128) {
        patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        return;
      } else if (patchFlag & 256) {
        patchUnkeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        return;
      }
    }
    if (shapeFlag & 8) {
      if (prevShapeFlag & 16) {
        unmountChildren(c1, parentComponent, parentSuspense);
      }
      if (c2 !== c1) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & 16) {
        if (shapeFlag & 16) {
          patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        } else {
          unmountChildren(c1, parentComponent, parentSuspense, true);
        }
      } else {
        if (prevShapeFlag & 8) {
          hostSetElementText(container, "");
        }
        if (shapeFlag & 16) {
          mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
      }
    }
  };
  const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    c1 = c1 || EMPTY_ARR;
    c2 = c2 || EMPTY_ARR;
    const oldLength = c1.length;
    const newLength = c2.length;
    const commonLength = Math.min(oldLength, newLength);
    let i;
    for (i = 0; i < commonLength; i++) {
      const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      patch(c1[i], nextChild, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    }
    if (oldLength > newLength) {
      unmountChildren(c1, parentComponent, parentSuspense, true, false, commonLength);
    } else {
      mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, commonLength);
    }
  };
  const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
        while (i <= e2) {
          patch(null, c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]), container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i], parentComponent, parentSuspense, true);
        i++;
      }
    } else {
      const s1 = i;
      const s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (i = s2; i <= e2; i++) {
        const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
        if (nextChild.key != null) {
          keyToNewIndexMap.set(nextChild.key, i);
        }
      }
      let j;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      let moved = false;
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i = 0; i < toBePatched; i++)
        newIndexToOldIndexMap[i] = 0;
      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          unmount(prevChild, parentComponent, parentSuspense, true);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (j = s2; j <= e2; j++) {
            if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === void 0) {
          unmount(prevChild, parentComponent, parentSuspense, true);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          patch(prevChild, c2[newIndex], container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
          patched++;
        }
      }
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
      j = increasingNewIndexSequence.length - 1;
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(
              nextChild,
              container,
              anchor,
              2
              /* MoveType.REORDER */
            );
          } else {
            j--;
          }
        }
      }
    }
  };
  const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
    const { el, type, transition, children, shapeFlag } = vnode;
    if (shapeFlag & 6) {
      move(vnode.component.subTree, container, anchor, moveType);
      return;
    }
    if (shapeFlag & 128) {
      vnode.suspense.move(container, anchor, moveType);
      return;
    }
    if (shapeFlag & 64) {
      type.move(vnode, container, anchor, internals);
      return;
    }
    if (type === Fragment) {
      hostInsert(el, container, anchor);
      for (let i = 0; i < children.length; i++) {
        move(children[i], container, anchor, moveType);
      }
      hostInsert(vnode.anchor, container, anchor);
      return;
    }
    if (type === Static) {
      moveStaticNode(vnode, container, anchor);
      return;
    }
    const needTransition = moveType !== 2 && shapeFlag & 1 && transition;
    if (needTransition) {
      if (moveType === 0) {
        transition.beforeEnter(el);
        hostInsert(el, container, anchor);
        queuePostRenderEffect(() => transition.enter(el), parentSuspense);
      } else {
        const { leave, delayLeave, afterLeave } = transition;
        const remove3 = () => hostInsert(el, container, anchor);
        const performLeave = () => {
          leave(el, () => {
            remove3();
            afterLeave && afterLeave();
          });
        };
        if (delayLeave) {
          delayLeave(el, remove3, performLeave);
        } else {
          performLeave();
        }
      }
    } else {
      hostInsert(el, container, anchor);
    }
  };
  const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
    const { type, props, ref: ref2, children, dynamicChildren, shapeFlag, patchFlag, dirs } = vnode;
    if (ref2 != null) {
      setRef(ref2, null, parentSuspense, vnode, true);
    }
    if (shapeFlag & 256) {
      parentComponent.ctx.deactivate(vnode);
      return;
    }
    const shouldInvokeDirs = shapeFlag & 1 && dirs;
    const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
    let vnodeHook;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) {
      invokeVNodeHook(vnodeHook, parentComponent, vnode);
    }
    if (shapeFlag & 6) {
      unmountComponent(vnode.component, parentSuspense, doRemove);
    } else {
      if (shapeFlag & 128) {
        vnode.suspense.unmount(parentSuspense, doRemove);
        return;
      }
      if (shouldInvokeDirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
      }
      if (shapeFlag & 64) {
        vnode.type.remove(vnode, parentComponent, parentSuspense, optimized, internals, doRemove);
      } else if (dynamicChildren && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (type !== Fragment || patchFlag > 0 && patchFlag & 64)) {
        unmountChildren(dynamicChildren, parentComponent, parentSuspense, false, true);
      } else if (type === Fragment && patchFlag & (128 | 256) || !optimized && shapeFlag & 16) {
        unmountChildren(children, parentComponent, parentSuspense);
      }
      if (doRemove) {
        remove2(vnode);
      }
    }
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
      }, parentSuspense);
    }
  };
  const remove2 = (vnode) => {
    const { type, el, anchor, transition } = vnode;
    if (type === Fragment) {
      {
        removeFragment(el, anchor);
      }
      return;
    }
    if (type === Static) {
      removeStaticNode(vnode);
      return;
    }
    const performRemove = () => {
      hostRemove(el);
      if (transition && !transition.persisted && transition.afterLeave) {
        transition.afterLeave();
      }
    };
    if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
      const { leave, delayLeave } = transition;
      const performLeave = () => leave(el, performRemove);
      if (delayLeave) {
        delayLeave(vnode.el, performRemove, performLeave);
      } else {
        performLeave();
      }
    } else {
      performRemove();
    }
  };
  const removeFragment = (cur, end) => {
    let next;
    while (cur !== end) {
      next = hostNextSibling(cur);
      hostRemove(cur);
      cur = next;
    }
    hostRemove(end);
  };
  const unmountComponent = (instance, parentSuspense, doRemove) => {
    const { bum, scope, update: update3, subTree, um } = instance;
    if (bum) {
      invokeArrayFns(bum);
    }
    scope.stop();
    if (update3) {
      update3.active = false;
      unmount(subTree, instance, parentSuspense, doRemove);
    }
    if (um) {
      queuePostRenderEffect(um, parentSuspense);
    }
    queuePostRenderEffect(() => {
      instance.isUnmounted = true;
    }, parentSuspense);
    if (parentSuspense && parentSuspense.pendingBranch && !parentSuspense.isUnmounted && instance.asyncDep && !instance.asyncResolved && instance.suspenseId === parentSuspense.pendingId) {
      parentSuspense.deps--;
      if (parentSuspense.deps === 0) {
        parentSuspense.resolve();
      }
    }
  };
  const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
    for (let i = start; i < children.length; i++) {
      unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
    }
  };
  const getNextHostNode = (vnode) => {
    if (vnode.shapeFlag & 6) {
      return getNextHostNode(vnode.component.subTree);
    }
    if (vnode.shapeFlag & 128) {
      return vnode.suspense.next();
    }
    return hostNextSibling(vnode.anchor || vnode.el);
  };
  const render = (vnode, container, isSVG) => {
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode, null, null, true);
      }
    } else {
      patch(container._vnode || null, vnode, container, null, null, null, isSVG);
    }
    flushPreFlushCbs();
    flushPostFlushCbs();
    container._vnode = vnode;
  };
  const internals = {
    p: patch,
    um: unmount,
    m: move,
    r: remove2,
    mt: mountComponent,
    mc: mountChildren,
    pc: patchChildren,
    pbc: patchBlockChildren,
    n: getNextHostNode,
    o: options
  };
  let hydrate;
  let hydrateNode;
  if (createHydrationFns) {
    [hydrate, hydrateNode] = createHydrationFns(internals);
  }
  return {
    render,
    hydrate,
    createApp: createAppAPI(render, hydrate)
  };
}
function toggleRecurse({ effect, update: update3 }, allowed) {
  effect.allowRecurse = update3.allowRecurse = allowed;
}
function traverseStaticChildren(n1, n2, shallow = false) {
  const ch1 = n1.children;
  const ch2 = n2.children;
  if (isArray$1(ch1) && isArray$1(ch2)) {
    for (let i = 0; i < ch1.length; i++) {
      const c1 = ch1[i];
      let c2 = ch2[i];
      if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
        if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
          c2 = ch2[i] = cloneIfMounted(ch2[i]);
          c2.el = c1.el;
        }
        if (!shallow)
          traverseStaticChildren(c1, c2);
      }
      if (c2.type === Text) {
        c2.el = c1.el;
      }
    }
  }
}
function getSequence(arr) {
  const p2 = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p2[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = u + v >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p2[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p2[v];
  }
  return result;
}
const isTeleport = (type) => type.__isTeleport;
const Fragment = Symbol(void 0);
const Text = Symbol(void 0);
const Comment = Symbol(void 0);
const Static = Symbol(void 0);
const blockStack = [];
let currentBlock = null;
function openBlock(disableTracking = false) {
  blockStack.push(currentBlock = disableTracking ? null : []);
}
function closeBlock() {
  blockStack.pop();
  currentBlock = blockStack[blockStack.length - 1] || null;
}
let isBlockTreeEnabled = 1;
function setBlockTracking(value) {
  isBlockTreeEnabled += value;
}
function setupBlock(vnode) {
  vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
  closeBlock();
  if (isBlockTreeEnabled > 0 && currentBlock) {
    currentBlock.push(vnode);
  }
  return vnode;
}
function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
  return setupBlock(createBaseVNode(
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
    shapeFlag,
    true
    /* isBlock */
  ));
}
function createBlock(type, props, children, patchFlag, dynamicProps) {
  return setupBlock(createVNode(
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
    true
    /* isBlock: prevent a block from tracking itself */
  ));
}
function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
const InternalObjectKey = `__vInternal`;
const normalizeKey = ({ key }) => key != null ? key : null;
const normalizeRef = ({ ref: ref2, ref_key, ref_for }) => {
  return ref2 != null ? isString(ref2) || isRef(ref2) || isFunction(ref2) ? { i: currentRenderingInstance, r: ref2, k: ref_key, f: !!ref_for } : ref2 : null;
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null,
    ctx: currentRenderingInstance
  };
  if (needFullChildrenNormalization) {
    normalizeChildren(vnode, children);
    if (shapeFlag & 128) {
      type.normalize(vnode);
    }
  } else if (children) {
    vnode.shapeFlag |= isString(children) ? 8 : 16;
  }
  if (isBlockTreeEnabled > 0 && // avoid a block node from tracking itself
  !isBlockNode && // has current parent block
  currentBlock && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (vnode.patchFlag > 0 || shapeFlag & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  vnode.patchFlag !== 32) {
    currentBlock.push(vnode);
  }
  return vnode;
}
const createVNode = _createVNode;
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
  if (!type || type === NULL_DYNAMIC_COMPONENT) {
    type = Comment;
  }
  if (isVNode(type)) {
    const cloned = cloneVNode(
      type,
      props,
      true
      /* mergeRef: true */
    );
    if (children) {
      normalizeChildren(cloned, children);
    }
    if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
      if (cloned.shapeFlag & 6) {
        currentBlock[currentBlock.indexOf(type)] = cloned;
      } else {
        currentBlock.push(cloned);
      }
    }
    cloned.patchFlag |= -2;
    return cloned;
  }
  if (isClassComponent(type)) {
    type = type.__vccOpts;
  }
  if (props) {
    props = guardReactiveProps(props);
    let { class: klass, style: style2 } = props;
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass);
    }
    if (isObject$1(style2)) {
      if (isProxy(style2) && !isArray$1(style2)) {
        style2 = extend({}, style2);
      }
      props.style = normalizeStyle(style2);
    }
  }
  const shapeFlag = isString(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject$1(type) ? 4 : isFunction(type) ? 2 : 0;
  return createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, isBlockNode, true);
}
function guardReactiveProps(props) {
  if (!props)
    return null;
  return isProxy(props) || InternalObjectKey in props ? extend({}, props) : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false) {
  const { props, ref: ref2, patchFlag, children } = vnode;
  const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
  const cloned = {
    __v_isVNode: true,
    __v_skip: true,
    type: vnode.type,
    props: mergedProps,
    key: mergedProps && normalizeKey(mergedProps),
    ref: extraProps && extraProps.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      mergeRef && ref2 ? isArray$1(ref2) ? ref2.concat(normalizeRef(extraProps)) : [ref2, normalizeRef(extraProps)] : normalizeRef(extraProps)
    ) : ref2,
    scopeId: vnode.scopeId,
    slotScopeIds: vnode.slotScopeIds,
    children,
    target: vnode.target,
    targetAnchor: vnode.targetAnchor,
    staticCount: vnode.staticCount,
    shapeFlag: vnode.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
    dynamicProps: vnode.dynamicProps,
    dynamicChildren: vnode.dynamicChildren,
    appContext: vnode.appContext,
    dirs: vnode.dirs,
    transition: vnode.transition,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: vnode.component,
    suspense: vnode.suspense,
    ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
    ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
    el: vnode.el,
    anchor: vnode.anchor,
    ctx: vnode.ctx,
    ce: vnode.ce
  };
  return cloned;
}
function createTextVNode(text = " ", flag = 0) {
  return createVNode(Text, null, text, flag);
}
function createCommentVNode(text = "", asBlock = false) {
  return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
}
function normalizeVNode(child) {
  if (child == null || typeof child === "boolean") {
    return createVNode(Comment);
  } else if (isArray$1(child)) {
    return createVNode(
      Fragment,
      null,
      // #3666, avoid reference pollution when reusing vnode
      child.slice()
    );
  } else if (typeof child === "object") {
    return cloneIfMounted(child);
  } else {
    return createVNode(Text, null, String(child));
  }
}
function cloneIfMounted(child) {
  return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
  let type = 0;
  const { shapeFlag } = vnode;
  if (children == null) {
    children = null;
  } else if (isArray$1(children)) {
    type = 16;
  } else if (typeof children === "object") {
    if (shapeFlag & (1 | 64)) {
      const slot = children.default;
      if (slot) {
        slot._c && (slot._d = false);
        normalizeChildren(vnode, slot());
        slot._c && (slot._d = true);
      }
      return;
    } else {
      type = 32;
      const slotFlag = children._;
      if (!slotFlag && !(InternalObjectKey in children)) {
        children._ctx = currentRenderingInstance;
      } else if (slotFlag === 3 && currentRenderingInstance) {
        if (currentRenderingInstance.slots._ === 1) {
          children._ = 1;
        } else {
          children._ = 2;
          vnode.patchFlag |= 1024;
        }
      }
    }
  } else if (isFunction(children)) {
    children = { default: children, _ctx: currentRenderingInstance };
    type = 32;
  } else {
    children = String(children);
    if (shapeFlag & 64) {
      type = 16;
      children = [createTextVNode(children)];
    } else {
      type = 8;
    }
  }
  vnode.children = children;
  vnode.shapeFlag |= type;
}
function mergeProps(...args) {
  const ret = {};
  for (let i = 0; i < args.length; i++) {
    const toMerge = args[i];
    for (const key in toMerge) {
      if (key === "class") {
        if (ret.class !== toMerge.class) {
          ret.class = normalizeClass([ret.class, toMerge.class]);
        }
      } else if (key === "style") {
        ret.style = normalizeStyle([ret.style, toMerge.style]);
      } else if (isOn(key)) {
        const existing = ret[key];
        const incoming = toMerge[key];
        if (incoming && existing !== incoming && !(isArray$1(existing) && existing.includes(incoming))) {
          ret[key] = existing ? [].concat(existing, incoming) : incoming;
        }
      } else if (key !== "") {
        ret[key] = toMerge[key];
      }
    }
  }
  return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
  callWithAsyncErrorHandling(hook, instance, 7, [
    vnode,
    prevVNode
  ]);
}
const emptyAppContext = createAppContext();
let uid = 0;
function createComponentInstance(vnode, parent, suspense) {
  const type = vnode.type;
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
  const instance = {
    uid: uid++,
    vnode,
    type,
    parent,
    appContext,
    root: null,
    next: null,
    subTree: null,
    effect: null,
    update: null,
    scope: new EffectScope(
      true
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: parent ? parent.provides : Object.create(appContext.provides),
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: normalizePropsOptions(type, appContext),
    emitsOptions: normalizeEmitsOptions(type, appContext),
    // emit
    emit: null,
    emitted: null,
    // props default value
    propsDefaults: EMPTY_OBJ,
    // inheritAttrs
    inheritAttrs: type.inheritAttrs,
    // state
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,
    // suspense related
    suspense,
    suspenseId: suspense ? suspense.pendingId : 0,
    asyncDep: null,
    asyncResolved: false,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  {
    instance.ctx = { _: instance };
  }
  instance.root = parent ? parent.root : instance;
  instance.emit = emit.bind(null, instance);
  if (vnode.ce) {
    vnode.ce(instance);
  }
  return instance;
}
let currentInstance = null;
const getCurrentInstance = () => currentInstance || currentRenderingInstance;
const setCurrentInstance = (instance) => {
  currentInstance = instance;
  instance.scope.on();
};
const unsetCurrentInstance = () => {
  currentInstance && currentInstance.scope.off();
  currentInstance = null;
};
function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & 4;
}
let isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false) {
  isInSSRComponentSetup = isSSR;
  const { props, children } = instance.vnode;
  const isStateful = isStatefulComponent(instance);
  initProps(instance, props, isStateful, isSSR);
  initSlots(instance, children);
  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
  isInSSRComponentSetup = false;
  return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
  const Component = instance.type;
  instance.accessCache = /* @__PURE__ */ Object.create(null);
  instance.proxy = markRaw(new Proxy(instance.ctx, PublicInstanceProxyHandlers));
  const { setup } = Component;
  if (setup) {
    const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
    setCurrentInstance(instance);
    pauseTracking();
    const setupResult = callWithErrorHandling(setup, instance, 0, [instance.props, setupContext]);
    resetTracking();
    unsetCurrentInstance();
    if (isPromise$1(setupResult)) {
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
      if (isSSR) {
        return setupResult.then((resolvedResult) => {
          handleSetupResult(instance, resolvedResult, isSSR);
        }).catch((e) => {
          handleError(
            e,
            instance,
            0
            /* ErrorCodes.SETUP_FUNCTION */
          );
        });
      } else {
        instance.asyncDep = setupResult;
      }
    } else {
      handleSetupResult(instance, setupResult, isSSR);
    }
  } else {
    finishComponentSetup(instance, isSSR);
  }
}
function handleSetupResult(instance, setupResult, isSSR) {
  if (isFunction(setupResult)) {
    if (instance.type.__ssrInlineRender) {
      instance.ssrRender = setupResult;
    } else {
      instance.render = setupResult;
    }
  } else if (isObject$1(setupResult)) {
    instance.setupState = proxyRefs(setupResult);
  } else
    ;
  finishComponentSetup(instance, isSSR);
}
let compile;
function finishComponentSetup(instance, isSSR, skipOptions) {
  const Component = instance.type;
  if (!instance.render) {
    if (!isSSR && compile && !Component.render) {
      const template = Component.template || resolveMergedOptions(instance).template;
      if (template) {
        const { isCustomElement, compilerOptions } = instance.appContext.config;
        const { delimiters, compilerOptions: componentCompilerOptions } = Component;
        const finalCompilerOptions = extend(extend({
          isCustomElement,
          delimiters
        }, compilerOptions), componentCompilerOptions);
        Component.render = compile(template, finalCompilerOptions);
      }
    }
    instance.render = Component.render || NOOP;
  }
  {
    setCurrentInstance(instance);
    pauseTracking();
    applyOptions(instance);
    resetTracking();
    unsetCurrentInstance();
  }
}
function createAttrsProxy(instance) {
  return new Proxy(instance.attrs, {
    get(target, key) {
      track(instance, "get", "$attrs");
      return target[key];
    }
  });
}
function createSetupContext(instance) {
  const expose = (exposed) => {
    instance.exposed = exposed || {};
  };
  let attrs;
  {
    return {
      get attrs() {
        return attrs || (attrs = createAttrsProxy(instance));
      },
      slots: instance.slots,
      emit: instance.emit,
      expose
    };
  }
}
function getExposeProxy(instance) {
  if (instance.exposed) {
    return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
      get(target, key) {
        if (key in target) {
          return target[key];
        } else if (key in publicPropertiesMap) {
          return publicPropertiesMap[key](instance);
        }
      },
      has(target, key) {
        return key in target || key in publicPropertiesMap;
      }
    }));
  }
}
function getComponentName(Component, includeInferred = true) {
  return isFunction(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
}
function isClassComponent(value) {
  return isFunction(value) && "__vccOpts" in value;
}
const computed = (getterOrOptions, debugOptions) => {
  return computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
};
function h(type, propsOrChildren, children) {
  const l = arguments.length;
  if (l === 2) {
    if (isObject$1(propsOrChildren) && !isArray$1(propsOrChildren)) {
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren]);
      }
      return createVNode(type, propsOrChildren);
    } else {
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    if (l > 3) {
      children = Array.prototype.slice.call(arguments, 2);
    } else if (l === 3 && isVNode(children)) {
      children = [children];
    }
    return createVNode(type, propsOrChildren, children);
  }
}
const ssrContextKey = Symbol(``);
const useSSRContext = () => {
  {
    const ctx = inject(ssrContextKey);
    return ctx;
  }
};
const version = "3.2.47";
const svgNS = "http://www.w3.org/2000/svg";
const doc = typeof document !== "undefined" ? document : null;
const templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
const nodeOps = {
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null);
  },
  remove: (child) => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  createElement: (tag, isSVG, is, props) => {
    const el = isSVG ? doc.createElementNS(svgNS, tag) : doc.createElement(tag, is ? { is } : void 0);
    if (tag === "select" && props && props.multiple != null) {
      el.setAttribute("multiple", props.multiple);
    }
    return el;
  },
  createText: (text) => doc.createTextNode(text),
  createComment: (text) => doc.createComment(text),
  setText: (node, text) => {
    node.nodeValue = text;
  },
  setElementText: (el, text) => {
    el.textContent = text;
  },
  parentNode: (node) => node.parentNode,
  nextSibling: (node) => node.nextSibling,
  querySelector: (selector) => doc.querySelector(selector),
  setScopeId(el, id) {
    el.setAttribute(id, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(content, parent, anchor, isSVG, start, end) {
    const before = anchor ? anchor.previousSibling : parent.lastChild;
    if (start && (start === end || start.nextSibling)) {
      while (true) {
        parent.insertBefore(start.cloneNode(true), anchor);
        if (start === end || !(start = start.nextSibling))
          break;
      }
    } else {
      templateContainer.innerHTML = isSVG ? `<svg>${content}</svg>` : content;
      const template = templateContainer.content;
      if (isSVG) {
        const wrapper = template.firstChild;
        while (wrapper.firstChild) {
          template.appendChild(wrapper.firstChild);
        }
        template.removeChild(wrapper);
      }
      parent.insertBefore(template, anchor);
    }
    return [
      // first
      before ? before.nextSibling : parent.firstChild,
      // last
      anchor ? anchor.previousSibling : parent.lastChild
    ];
  }
};
function patchClass(el, value, isSVG) {
  const transitionClasses = el._vtc;
  if (transitionClasses) {
    value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
  }
  if (value == null) {
    el.removeAttribute("class");
  } else if (isSVG) {
    el.setAttribute("class", value);
  } else {
    el.className = value;
  }
}
function patchStyle(el, prev, next) {
  const style2 = el.style;
  const isCssString = isString(next);
  if (next && !isCssString) {
    if (prev && !isString(prev)) {
      for (const key in prev) {
        if (next[key] == null) {
          setStyle(style2, key, "");
        }
      }
    }
    for (const key in next) {
      setStyle(style2, key, next[key]);
    }
  } else {
    const currentDisplay = style2.display;
    if (isCssString) {
      if (prev !== next) {
        style2.cssText = next;
      }
    } else if (prev) {
      el.removeAttribute("style");
    }
    if ("_vod" in el) {
      style2.display = currentDisplay;
    }
  }
}
const importantRE = /\s*!important$/;
function setStyle(style2, name, val) {
  if (isArray$1(val)) {
    val.forEach((v) => setStyle(style2, name, v));
  } else {
    if (val == null)
      val = "";
    if (name.startsWith("--")) {
      style2.setProperty(name, val);
    } else {
      const prefixed = autoPrefix(style2, name);
      if (importantRE.test(val)) {
        style2.setProperty(hyphenate(prefixed), val.replace(importantRE, ""), "important");
      } else {
        style2[prefixed] = val;
      }
    }
  }
}
const prefixes = ["Webkit", "Moz", "ms"];
const prefixCache = {};
function autoPrefix(style2, rawName) {
  const cached = prefixCache[rawName];
  if (cached) {
    return cached;
  }
  let name = camelize(rawName);
  if (name !== "filter" && name in style2) {
    return prefixCache[rawName] = name;
  }
  name = capitalize(name);
  for (let i = 0; i < prefixes.length; i++) {
    const prefixed = prefixes[i] + name;
    if (prefixed in style2) {
      return prefixCache[rawName] = prefixed;
    }
  }
  return rawName;
}
const xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(el, key, value, isSVG, instance) {
  if (isSVG && key.startsWith("xlink:")) {
    if (value == null) {
      el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    const isBoolean = isSpecialBooleanAttr(key);
    if (value == null || isBoolean && !includeBooleanAttr(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, isBoolean ? "" : value);
    }
  }
}
function patchDOMProp(el, key, value, prevChildren, parentComponent, parentSuspense, unmountChildren) {
  if (key === "innerHTML" || key === "textContent") {
    if (prevChildren) {
      unmountChildren(prevChildren, parentComponent, parentSuspense);
    }
    el[key] = value == null ? "" : value;
    return;
  }
  if (key === "value" && el.tagName !== "PROGRESS" && // custom elements may use _value internally
  !el.tagName.includes("-")) {
    el._value = value;
    const newValue = value == null ? "" : value;
    if (el.value !== newValue || // #4956: always set for OPTION elements because its value falls back to
    // textContent if no value attribute is present. And setting .value for
    // OPTION has no side effect
    el.tagName === "OPTION") {
      el.value = newValue;
    }
    if (value == null) {
      el.removeAttribute(key);
    }
    return;
  }
  let needRemove = false;
  if (value === "" || value == null) {
    const type = typeof el[key];
    if (type === "boolean") {
      value = includeBooleanAttr(value);
    } else if (value == null && type === "string") {
      value = "";
      needRemove = true;
    } else if (type === "number") {
      value = 0;
      needRemove = true;
    }
  }
  try {
    el[key] = value;
  } catch (e) {
  }
  needRemove && el.removeAttribute(key);
}
function addEventListener(el, event, handler, options) {
  el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
  el.removeEventListener(event, handler, options);
}
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
  const invokers = el._vei || (el._vei = {});
  const existingInvoker = invokers[rawName];
  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue;
  } else {
    const [name, options] = parseName(rawName);
    if (nextValue) {
      const invoker = invokers[rawName] = createInvoker(nextValue, instance);
      addEventListener(el, name, invoker, options);
    } else if (existingInvoker) {
      removeEventListener(el, name, existingInvoker, options);
      invokers[rawName] = void 0;
    }
  }
}
const optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseName(name) {
  let options;
  if (optionsModifierRE.test(name)) {
    options = {};
    let m;
    while (m = name.match(optionsModifierRE)) {
      name = name.slice(0, name.length - m[0].length);
      options[m[0].toLowerCase()] = true;
    }
  }
  const event = name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2));
  return [event, options];
}
let cachedNow = 0;
const p = /* @__PURE__ */ Promise.resolve();
const getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now());
function createInvoker(initialValue, instance) {
  const invoker = (e) => {
    if (!e._vts) {
      e._vts = Date.now();
    } else if (e._vts <= invoker.attached) {
      return;
    }
    callWithAsyncErrorHandling(patchStopImmediatePropagation(e, invoker.value), instance, 5, [e]);
  };
  invoker.value = initialValue;
  invoker.attached = getNow();
  return invoker;
}
function patchStopImmediatePropagation(e, value) {
  if (isArray$1(value)) {
    const originalStop = e.stopImmediatePropagation;
    e.stopImmediatePropagation = () => {
      originalStop.call(e);
      e._stopped = true;
    };
    return value.map((fn) => (e2) => !e2._stopped && fn && fn(e2));
  } else {
    return value;
  }
}
const nativeOnRE = /^on[a-z]/;
const patchProp = (el, key, prevValue, nextValue, isSVG = false, prevChildren, parentComponent, parentSuspense, unmountChildren) => {
  if (key === "class") {
    patchClass(el, nextValue, isSVG);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  } else if (isOn(key)) {
    if (!isModelListener(key)) {
      patchEvent(el, key, prevValue, nextValue, parentComponent);
    }
  } else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
    patchDOMProp(el, key, nextValue, prevChildren, parentComponent, parentSuspense, unmountChildren);
  } else {
    if (key === "true-value") {
      el._trueValue = nextValue;
    } else if (key === "false-value") {
      el._falseValue = nextValue;
    }
    patchAttr(el, key, nextValue, isSVG);
  }
};
function shouldSetAsProp(el, key, value, isSVG) {
  if (isSVG) {
    if (key === "innerHTML" || key === "textContent") {
      return true;
    }
    if (key in el && nativeOnRE.test(key) && isFunction(value)) {
      return true;
    }
    return false;
  }
  if (key === "spellcheck" || key === "draggable" || key === "translate") {
    return false;
  }
  if (key === "form") {
    return false;
  }
  if (key === "list" && el.tagName === "INPUT") {
    return false;
  }
  if (key === "type" && el.tagName === "TEXTAREA") {
    return false;
  }
  if (nativeOnRE.test(key) && isString(value)) {
    return false;
  }
  return key in el;
}
const DOMTransitionPropsValidators = {
  name: String,
  type: String,
  css: {
    type: Boolean,
    default: true
  },
  duration: [String, Number, Object],
  enterFromClass: String,
  enterActiveClass: String,
  enterToClass: String,
  appearFromClass: String,
  appearActiveClass: String,
  appearToClass: String,
  leaveFromClass: String,
  leaveActiveClass: String,
  leaveToClass: String
};
/* @__PURE__ */ extend({}, BaseTransition.props, DOMTransitionPropsValidators);
const getModelAssigner = (vnode) => {
  const fn = vnode.props["onUpdate:modelValue"] || false;
  return isArray$1(fn) ? (value) => invokeArrayFns(fn, value) : fn;
};
function onCompositionStart(e) {
  e.target.composing = true;
}
function onCompositionEnd(e) {
  const target = e.target;
  if (target.composing) {
    target.composing = false;
    target.dispatchEvent(new Event("input"));
  }
}
const vModelText = {
  created(el, { modifiers: { lazy, trim, number } }, vnode) {
    el._assign = getModelAssigner(vnode);
    const castToNumber = number || vnode.props && vnode.props.type === "number";
    addEventListener(el, lazy ? "change" : "input", (e) => {
      if (e.target.composing)
        return;
      let domValue = el.value;
      if (trim) {
        domValue = domValue.trim();
      }
      if (castToNumber) {
        domValue = looseToNumber(domValue);
      }
      el._assign(domValue);
    });
    if (trim) {
      addEventListener(el, "change", () => {
        el.value = el.value.trim();
      });
    }
    if (!lazy) {
      addEventListener(el, "compositionstart", onCompositionStart);
      addEventListener(el, "compositionend", onCompositionEnd);
      addEventListener(el, "change", onCompositionEnd);
    }
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(el, { value }) {
    el.value = value == null ? "" : value;
  },
  beforeUpdate(el, { value, modifiers: { lazy, trim, number } }, vnode) {
    el._assign = getModelAssigner(vnode);
    if (el.composing)
      return;
    if (document.activeElement === el && el.type !== "range") {
      if (lazy) {
        return;
      }
      if (trim && el.value.trim() === value) {
        return;
      }
      if ((number || el.type === "number") && looseToNumber(el.value) === value) {
        return;
      }
    }
    const newValue = value == null ? "" : value;
    if (el.value !== newValue) {
      el.value = newValue;
    }
  }
};
const vModelRadio = {
  created(el, { value }, vnode) {
    el.checked = looseEqual(value, vnode.props.value);
    el._assign = getModelAssigner(vnode);
    addEventListener(el, "change", () => {
      el._assign(getValue(el));
    });
  },
  beforeUpdate(el, { value, oldValue }, vnode) {
    el._assign = getModelAssigner(vnode);
    if (value !== oldValue) {
      el.checked = looseEqual(value, vnode.props.value);
    }
  }
};
function getValue(el) {
  return "_value" in el ? el._value : el.value;
}
const systemModifiers = ["ctrl", "shift", "alt", "meta"];
const modifierGuards = {
  stop: (e) => e.stopPropagation(),
  prevent: (e) => e.preventDefault(),
  self: (e) => e.target !== e.currentTarget,
  ctrl: (e) => !e.ctrlKey,
  shift: (e) => !e.shiftKey,
  alt: (e) => !e.altKey,
  meta: (e) => !e.metaKey,
  left: (e) => "button" in e && e.button !== 0,
  middle: (e) => "button" in e && e.button !== 1,
  right: (e) => "button" in e && e.button !== 2,
  exact: (e, modifiers) => systemModifiers.some((m) => e[`${m}Key`] && !modifiers.includes(m))
};
const withModifiers = (fn, modifiers) => {
  return (event, ...args) => {
    for (let i = 0; i < modifiers.length; i++) {
      const guard = modifierGuards[modifiers[i]];
      if (guard && guard(event, modifiers))
        return;
    }
    return fn(event, ...args);
  };
};
const rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps);
let renderer;
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}
const createApp = (...args) => {
  const app = ensureRenderer().createApp(...args);
  const { mount } = app;
  app.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (!container)
      return;
    const component = app._component;
    if (!isFunction(component) && !component.render && !component.template) {
      component.template = container.innerHTML;
    }
    container.innerHTML = "";
    const proxy = mount(container, false, container instanceof SVGElement);
    if (container instanceof Element) {
      container.removeAttribute("v-cloak");
      container.setAttribute("data-v-app", "");
    }
    return proxy;
  };
  return app;
};
function normalizeContainer(container) {
  if (isString(container)) {
    const res = document.querySelector(container);
    return res;
  }
  return container;
}
const style = "";
function getDevtoolsGlobalHook() {
  return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
}
function getTarget() {
  return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
}
const isProxyAvailable = typeof Proxy === "function";
const HOOK_SETUP = "devtools-plugin:setup";
const HOOK_PLUGIN_SETTINGS_SET = "plugin:settings:set";
let supported;
let perf;
function isPerformanceSupported() {
  var _a;
  if (supported !== void 0) {
    return supported;
  }
  if (typeof window !== "undefined" && window.performance) {
    supported = true;
    perf = window.performance;
  } else if (typeof global !== "undefined" && ((_a = global.perf_hooks) === null || _a === void 0 ? void 0 : _a.performance)) {
    supported = true;
    perf = global.perf_hooks.performance;
  } else {
    supported = false;
  }
  return supported;
}
function now() {
  return isPerformanceSupported() ? perf.now() : Date.now();
}
class ApiProxy {
  constructor(plugin, hook) {
    this.target = null;
    this.targetQueue = [];
    this.onQueue = [];
    this.plugin = plugin;
    this.hook = hook;
    const defaultSettings = {};
    if (plugin.settings) {
      for (const id in plugin.settings) {
        const item = plugin.settings[id];
        defaultSettings[id] = item.defaultValue;
      }
    }
    const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
    let currentSettings = Object.assign({}, defaultSettings);
    try {
      const raw = localStorage.getItem(localSettingsSaveId);
      const data = JSON.parse(raw);
      Object.assign(currentSettings, data);
    } catch (e) {
    }
    this.fallbacks = {
      getSettings() {
        return currentSettings;
      },
      setSettings(value) {
        try {
          localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
        } catch (e) {
        }
        currentSettings = value;
      },
      now() {
        return now();
      }
    };
    if (hook) {
      hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
        if (pluginId === this.plugin.id) {
          this.fallbacks.setSettings(value);
        }
      });
    }
    this.proxiedOn = new Proxy({}, {
      get: (_target, prop) => {
        if (this.target) {
          return this.target.on[prop];
        } else {
          return (...args) => {
            this.onQueue.push({
              method: prop,
              args
            });
          };
        }
      }
    });
    this.proxiedTarget = new Proxy({}, {
      get: (_target, prop) => {
        if (this.target) {
          return this.target[prop];
        } else if (prop === "on") {
          return this.proxiedOn;
        } else if (Object.keys(this.fallbacks).includes(prop)) {
          return (...args) => {
            this.targetQueue.push({
              method: prop,
              args,
              resolve: () => {
              }
            });
            return this.fallbacks[prop](...args);
          };
        } else {
          return (...args) => {
            return new Promise((resolve2) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve: resolve2
              });
            });
          };
        }
      }
    });
  }
  async setRealTarget(target) {
    this.target = target;
    for (const item of this.onQueue) {
      this.target.on[item.method](...item.args);
    }
    for (const item of this.targetQueue) {
      item.resolve(await this.target[item.method](...item.args));
    }
  }
}
function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
  const descriptor = pluginDescriptor;
  const target = getTarget();
  const hook = getDevtoolsGlobalHook();
  const enableProxy = isProxyAvailable && descriptor.enableEarlyProxy;
  if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
    hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
  } else {
    const proxy = enableProxy ? new ApiProxy(descriptor, hook) : null;
    const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
    list.push({
      pluginDescriptor: descriptor,
      setupFn,
      proxy
    });
    if (proxy)
      setupFn(proxy.proxiedTarget);
  }
}
/*!
  * vue-router v4.1.6
  * (c) 2022 Eduardo San Martin Morote
  * @license MIT
  */
const isBrowser = typeof window !== "undefined";
function isESModule(obj) {
  return obj.__esModule || obj[Symbol.toStringTag] === "Module";
}
const assign = Object.assign;
function applyToParams(fn, params) {
  const newParams = {};
  for (const key in params) {
    const value = params[key];
    newParams[key] = isArray(value) ? value.map(fn) : fn(value);
  }
  return newParams;
}
const noop = () => {
};
const isArray = Array.isArray;
const TRAILING_SLASH_RE = /\/$/;
const removeTrailingSlash = (path) => path.replace(TRAILING_SLASH_RE, "");
function parseURL(parseQuery2, location2, currentLocation = "/") {
  let path, query = {}, searchString = "", hash = "";
  const hashPos = location2.indexOf("#");
  let searchPos = location2.indexOf("?");
  if (hashPos < searchPos && hashPos >= 0) {
    searchPos = -1;
  }
  if (searchPos > -1) {
    path = location2.slice(0, searchPos);
    searchString = location2.slice(searchPos + 1, hashPos > -1 ? hashPos : location2.length);
    query = parseQuery2(searchString);
  }
  if (hashPos > -1) {
    path = path || location2.slice(0, hashPos);
    hash = location2.slice(hashPos, location2.length);
  }
  path = resolveRelativePath(path != null ? path : location2, currentLocation);
  return {
    fullPath: path + (searchString && "?") + searchString + hash,
    path,
    query,
    hash
  };
}
function stringifyURL(stringifyQuery2, location2) {
  const query = location2.query ? stringifyQuery2(location2.query) : "";
  return location2.path + (query && "?") + query + (location2.hash || "");
}
function stripBase(pathname, base) {
  if (!base || !pathname.toLowerCase().startsWith(base.toLowerCase()))
    return pathname;
  return pathname.slice(base.length) || "/";
}
function isSameRouteLocation(stringifyQuery2, a, b) {
  const aLastIndex = a.matched.length - 1;
  const bLastIndex = b.matched.length - 1;
  return aLastIndex > -1 && aLastIndex === bLastIndex && isSameRouteRecord(a.matched[aLastIndex], b.matched[bLastIndex]) && isSameRouteLocationParams(a.params, b.params) && stringifyQuery2(a.query) === stringifyQuery2(b.query) && a.hash === b.hash;
}
function isSameRouteRecord(a, b) {
  return (a.aliasOf || a) === (b.aliasOf || b);
}
function isSameRouteLocationParams(a, b) {
  if (Object.keys(a).length !== Object.keys(b).length)
    return false;
  for (const key in a) {
    if (!isSameRouteLocationParamsValue(a[key], b[key]))
      return false;
  }
  return true;
}
function isSameRouteLocationParamsValue(a, b) {
  return isArray(a) ? isEquivalentArray(a, b) : isArray(b) ? isEquivalentArray(b, a) : a === b;
}
function isEquivalentArray(a, b) {
  return isArray(b) ? a.length === b.length && a.every((value, i) => value === b[i]) : a.length === 1 && a[0] === b;
}
function resolveRelativePath(to, from) {
  if (to.startsWith("/"))
    return to;
  if (!to)
    return from;
  const fromSegments = from.split("/");
  const toSegments = to.split("/");
  let position = fromSegments.length - 1;
  let toPosition;
  let segment;
  for (toPosition = 0; toPosition < toSegments.length; toPosition++) {
    segment = toSegments[toPosition];
    if (segment === ".")
      continue;
    if (segment === "..") {
      if (position > 1)
        position--;
    } else
      break;
  }
  return fromSegments.slice(0, position).join("/") + "/" + toSegments.slice(toPosition - (toPosition === toSegments.length ? 1 : 0)).join("/");
}
var NavigationType;
(function(NavigationType2) {
  NavigationType2["pop"] = "pop";
  NavigationType2["push"] = "push";
})(NavigationType || (NavigationType = {}));
var NavigationDirection;
(function(NavigationDirection2) {
  NavigationDirection2["back"] = "back";
  NavigationDirection2["forward"] = "forward";
  NavigationDirection2["unknown"] = "";
})(NavigationDirection || (NavigationDirection = {}));
function normalizeBase(base) {
  if (!base) {
    if (isBrowser) {
      const baseEl = document.querySelector("base");
      base = baseEl && baseEl.getAttribute("href") || "/";
      base = base.replace(/^\w+:\/\/[^\/]+/, "");
    } else {
      base = "/";
    }
  }
  if (base[0] !== "/" && base[0] !== "#")
    base = "/" + base;
  return removeTrailingSlash(base);
}
const BEFORE_HASH_RE = /^[^#]+#/;
function createHref(base, location2) {
  return base.replace(BEFORE_HASH_RE, "#") + location2;
}
function getElementPosition(el, offset) {
  const docRect = document.documentElement.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  return {
    behavior: offset.behavior,
    left: elRect.left - docRect.left - (offset.left || 0),
    top: elRect.top - docRect.top - (offset.top || 0)
  };
}
const computeScrollPosition = () => ({
  left: window.pageXOffset,
  top: window.pageYOffset
});
function scrollToPosition(position) {
  let scrollToOptions;
  if ("el" in position) {
    const positionEl = position.el;
    const isIdSelector = typeof positionEl === "string" && positionEl.startsWith("#");
    const el = typeof positionEl === "string" ? isIdSelector ? document.getElementById(positionEl.slice(1)) : document.querySelector(positionEl) : positionEl;
    if (!el) {
      return;
    }
    scrollToOptions = getElementPosition(el, position);
  } else {
    scrollToOptions = position;
  }
  if ("scrollBehavior" in document.documentElement.style)
    window.scrollTo(scrollToOptions);
  else {
    window.scrollTo(scrollToOptions.left != null ? scrollToOptions.left : window.pageXOffset, scrollToOptions.top != null ? scrollToOptions.top : window.pageYOffset);
  }
}
function getScrollKey(path, delta) {
  const position = history.state ? history.state.position - delta : -1;
  return position + path;
}
const scrollPositions = /* @__PURE__ */ new Map();
function saveScrollPosition(key, scrollPosition) {
  scrollPositions.set(key, scrollPosition);
}
function getSavedScrollPosition(key) {
  const scroll = scrollPositions.get(key);
  scrollPositions.delete(key);
  return scroll;
}
let createBaseLocation = () => location.protocol + "//" + location.host;
function createCurrentLocation(base, location2) {
  const { pathname, search, hash } = location2;
  const hashPos = base.indexOf("#");
  if (hashPos > -1) {
    let slicePos = hash.includes(base.slice(hashPos)) ? base.slice(hashPos).length : 1;
    let pathFromHash = hash.slice(slicePos);
    if (pathFromHash[0] !== "/")
      pathFromHash = "/" + pathFromHash;
    return stripBase(pathFromHash, "");
  }
  const path = stripBase(pathname, base);
  return path + search + hash;
}
function useHistoryListeners(base, historyState, currentLocation, replace) {
  let listeners = [];
  let teardowns = [];
  let pauseState = null;
  const popStateHandler = ({ state }) => {
    const to = createCurrentLocation(base, location);
    const from = currentLocation.value;
    const fromState = historyState.value;
    let delta = 0;
    if (state) {
      currentLocation.value = to;
      historyState.value = state;
      if (pauseState && pauseState === from) {
        pauseState = null;
        return;
      }
      delta = fromState ? state.position - fromState.position : 0;
    } else {
      replace(to);
    }
    listeners.forEach((listener) => {
      listener(currentLocation.value, from, {
        delta,
        type: NavigationType.pop,
        direction: delta ? delta > 0 ? NavigationDirection.forward : NavigationDirection.back : NavigationDirection.unknown
      });
    });
  };
  function pauseListeners() {
    pauseState = currentLocation.value;
  }
  function listen(callback) {
    listeners.push(callback);
    const teardown = () => {
      const index = listeners.indexOf(callback);
      if (index > -1)
        listeners.splice(index, 1);
    };
    teardowns.push(teardown);
    return teardown;
  }
  function beforeUnloadListener() {
    const { history: history2 } = window;
    if (!history2.state)
      return;
    history2.replaceState(assign({}, history2.state, { scroll: computeScrollPosition() }), "");
  }
  function destroy() {
    for (const teardown of teardowns)
      teardown();
    teardowns = [];
    window.removeEventListener("popstate", popStateHandler);
    window.removeEventListener("beforeunload", beforeUnloadListener);
  }
  window.addEventListener("popstate", popStateHandler);
  window.addEventListener("beforeunload", beforeUnloadListener);
  return {
    pauseListeners,
    listen,
    destroy
  };
}
function buildState(back, current, forward, replaced = false, computeScroll = false) {
  return {
    back,
    current,
    forward,
    replaced,
    position: window.history.length,
    scroll: computeScroll ? computeScrollPosition() : null
  };
}
function useHistoryStateNavigation(base) {
  const { history: history2, location: location2 } = window;
  const currentLocation = {
    value: createCurrentLocation(base, location2)
  };
  const historyState = { value: history2.state };
  if (!historyState.value) {
    changeLocation(currentLocation.value, {
      back: null,
      current: currentLocation.value,
      forward: null,
      // the length is off by one, we need to decrease it
      position: history2.length - 1,
      replaced: true,
      // don't add a scroll as the user may have an anchor, and we want
      // scrollBehavior to be triggered without a saved position
      scroll: null
    }, true);
  }
  function changeLocation(to, state, replace2) {
    const hashIndex = base.indexOf("#");
    const url = hashIndex > -1 ? (location2.host && document.querySelector("base") ? base : base.slice(hashIndex)) + to : createBaseLocation() + base + to;
    try {
      history2[replace2 ? "replaceState" : "pushState"](state, "", url);
      historyState.value = state;
    } catch (err) {
      {
        console.error(err);
      }
      location2[replace2 ? "replace" : "assign"](url);
    }
  }
  function replace(to, data) {
    const state = assign({}, history2.state, buildState(
      historyState.value.back,
      // keep back and forward entries but override current position
      to,
      historyState.value.forward,
      true
    ), data, { position: historyState.value.position });
    changeLocation(to, state, true);
    currentLocation.value = to;
  }
  function push(to, data) {
    const currentState = assign(
      {},
      // use current history state to gracefully handle a wrong call to
      // history.replaceState
      // https://github.com/vuejs/router/issues/366
      historyState.value,
      history2.state,
      {
        forward: to,
        scroll: computeScrollPosition()
      }
    );
    changeLocation(currentState.current, currentState, true);
    const state = assign({}, buildState(currentLocation.value, to, null), { position: currentState.position + 1 }, data);
    changeLocation(to, state, false);
    currentLocation.value = to;
  }
  return {
    location: currentLocation,
    state: historyState,
    push,
    replace
  };
}
function createWebHistory(base) {
  base = normalizeBase(base);
  const historyNavigation = useHistoryStateNavigation(base);
  const historyListeners = useHistoryListeners(base, historyNavigation.state, historyNavigation.location, historyNavigation.replace);
  function go(delta, triggerListeners = true) {
    if (!triggerListeners)
      historyListeners.pauseListeners();
    history.go(delta);
  }
  const routerHistory = assign({
    // it's overridden right after
    location: "",
    base,
    go,
    createHref: createHref.bind(null, base)
  }, historyNavigation, historyListeners);
  Object.defineProperty(routerHistory, "location", {
    enumerable: true,
    get: () => historyNavigation.location.value
  });
  Object.defineProperty(routerHistory, "state", {
    enumerable: true,
    get: () => historyNavigation.state.value
  });
  return routerHistory;
}
function isRouteLocation(route) {
  return typeof route === "string" || route && typeof route === "object";
}
function isRouteName(name) {
  return typeof name === "string" || typeof name === "symbol";
}
const START_LOCATION_NORMALIZED = {
  path: "/",
  name: void 0,
  params: {},
  query: {},
  hash: "",
  fullPath: "/",
  matched: [],
  meta: {},
  redirectedFrom: void 0
};
const NavigationFailureSymbol = Symbol("");
var NavigationFailureType;
(function(NavigationFailureType2) {
  NavigationFailureType2[NavigationFailureType2["aborted"] = 4] = "aborted";
  NavigationFailureType2[NavigationFailureType2["cancelled"] = 8] = "cancelled";
  NavigationFailureType2[NavigationFailureType2["duplicated"] = 16] = "duplicated";
})(NavigationFailureType || (NavigationFailureType = {}));
function createRouterError(type, params) {
  {
    return assign(new Error(), {
      type,
      [NavigationFailureSymbol]: true
    }, params);
  }
}
function isNavigationFailure(error, type) {
  return error instanceof Error && NavigationFailureSymbol in error && (type == null || !!(error.type & type));
}
const BASE_PARAM_PATTERN = "[^/]+?";
const BASE_PATH_PARSER_OPTIONS = {
  sensitive: false,
  strict: false,
  start: true,
  end: true
};
const REGEX_CHARS_RE = /[.+*?^${}()[\]/\\]/g;
function tokensToParser(segments, extraOptions) {
  const options = assign({}, BASE_PATH_PARSER_OPTIONS, extraOptions);
  const score = [];
  let pattern = options.start ? "^" : "";
  const keys = [];
  for (const segment of segments) {
    const segmentScores = segment.length ? [] : [
      90
      /* PathScore.Root */
    ];
    if (options.strict && !segment.length)
      pattern += "/";
    for (let tokenIndex = 0; tokenIndex < segment.length; tokenIndex++) {
      const token = segment[tokenIndex];
      let subSegmentScore = 40 + (options.sensitive ? 0.25 : 0);
      if (token.type === 0) {
        if (!tokenIndex)
          pattern += "/";
        pattern += token.value.replace(REGEX_CHARS_RE, "\\$&");
        subSegmentScore += 40;
      } else if (token.type === 1) {
        const { value, repeatable, optional, regexp } = token;
        keys.push({
          name: value,
          repeatable,
          optional
        });
        const re2 = regexp ? regexp : BASE_PARAM_PATTERN;
        if (re2 !== BASE_PARAM_PATTERN) {
          subSegmentScore += 10;
          try {
            new RegExp(`(${re2})`);
          } catch (err) {
            throw new Error(`Invalid custom RegExp for param "${value}" (${re2}): ` + err.message);
          }
        }
        let subPattern = repeatable ? `((?:${re2})(?:/(?:${re2}))*)` : `(${re2})`;
        if (!tokenIndex)
          subPattern = // avoid an optional / if there are more segments e.g. /:p?-static
          // or /:p?-:p2
          optional && segment.length < 2 ? `(?:/${subPattern})` : "/" + subPattern;
        if (optional)
          subPattern += "?";
        pattern += subPattern;
        subSegmentScore += 20;
        if (optional)
          subSegmentScore += -8;
        if (repeatable)
          subSegmentScore += -20;
        if (re2 === ".*")
          subSegmentScore += -50;
      }
      segmentScores.push(subSegmentScore);
    }
    score.push(segmentScores);
  }
  if (options.strict && options.end) {
    const i = score.length - 1;
    score[i][score[i].length - 1] += 0.7000000000000001;
  }
  if (!options.strict)
    pattern += "/?";
  if (options.end)
    pattern += "$";
  else if (options.strict)
    pattern += "(?:/|$)";
  const re = new RegExp(pattern, options.sensitive ? "" : "i");
  function parse(path) {
    const match = path.match(re);
    const params = {};
    if (!match)
      return null;
    for (let i = 1; i < match.length; i++) {
      const value = match[i] || "";
      const key = keys[i - 1];
      params[key.name] = value && key.repeatable ? value.split("/") : value;
    }
    return params;
  }
  function stringify(params) {
    let path = "";
    let avoidDuplicatedSlash = false;
    for (const segment of segments) {
      if (!avoidDuplicatedSlash || !path.endsWith("/"))
        path += "/";
      avoidDuplicatedSlash = false;
      for (const token of segment) {
        if (token.type === 0) {
          path += token.value;
        } else if (token.type === 1) {
          const { value, repeatable, optional } = token;
          const param = value in params ? params[value] : "";
          if (isArray(param) && !repeatable) {
            throw new Error(`Provided param "${value}" is an array but it is not repeatable (* or + modifiers)`);
          }
          const text = isArray(param) ? param.join("/") : param;
          if (!text) {
            if (optional) {
              if (segment.length < 2) {
                if (path.endsWith("/"))
                  path = path.slice(0, -1);
                else
                  avoidDuplicatedSlash = true;
              }
            } else
              throw new Error(`Missing required param "${value}"`);
          }
          path += text;
        }
      }
    }
    return path || "/";
  }
  return {
    re,
    score,
    keys,
    parse,
    stringify
  };
}
function compareScoreArray(a, b) {
  let i = 0;
  while (i < a.length && i < b.length) {
    const diff = b[i] - a[i];
    if (diff)
      return diff;
    i++;
  }
  if (a.length < b.length) {
    return a.length === 1 && a[0] === 40 + 40 ? -1 : 1;
  } else if (a.length > b.length) {
    return b.length === 1 && b[0] === 40 + 40 ? 1 : -1;
  }
  return 0;
}
function comparePathParserScore(a, b) {
  let i = 0;
  const aScore = a.score;
  const bScore = b.score;
  while (i < aScore.length && i < bScore.length) {
    const comp = compareScoreArray(aScore[i], bScore[i]);
    if (comp)
      return comp;
    i++;
  }
  if (Math.abs(bScore.length - aScore.length) === 1) {
    if (isLastScoreNegative(aScore))
      return 1;
    if (isLastScoreNegative(bScore))
      return -1;
  }
  return bScore.length - aScore.length;
}
function isLastScoreNegative(score) {
  const last = score[score.length - 1];
  return score.length > 0 && last[last.length - 1] < 0;
}
const ROOT_TOKEN = {
  type: 0,
  value: ""
};
const VALID_PARAM_RE = /[a-zA-Z0-9_]/;
function tokenizePath(path) {
  if (!path)
    return [[]];
  if (path === "/")
    return [[ROOT_TOKEN]];
  if (!path.startsWith("/")) {
    throw new Error(`Invalid path "${path}"`);
  }
  function crash(message) {
    throw new Error(`ERR (${state})/"${buffer}": ${message}`);
  }
  let state = 0;
  let previousState = state;
  const tokens = [];
  let segment;
  function finalizeSegment() {
    if (segment)
      tokens.push(segment);
    segment = [];
  }
  let i = 0;
  let char;
  let buffer = "";
  let customRe = "";
  function consumeBuffer() {
    if (!buffer)
      return;
    if (state === 0) {
      segment.push({
        type: 0,
        value: buffer
      });
    } else if (state === 1 || state === 2 || state === 3) {
      if (segment.length > 1 && (char === "*" || char === "+"))
        crash(`A repeatable param (${buffer}) must be alone in its segment. eg: '/:ids+.`);
      segment.push({
        type: 1,
        value: buffer,
        regexp: customRe,
        repeatable: char === "*" || char === "+",
        optional: char === "*" || char === "?"
      });
    } else {
      crash("Invalid state to consume buffer");
    }
    buffer = "";
  }
  function addCharToBuffer() {
    buffer += char;
  }
  while (i < path.length) {
    char = path[i++];
    if (char === "\\" && state !== 2) {
      previousState = state;
      state = 4;
      continue;
    }
    switch (state) {
      case 0:
        if (char === "/") {
          if (buffer) {
            consumeBuffer();
          }
          finalizeSegment();
        } else if (char === ":") {
          consumeBuffer();
          state = 1;
        } else {
          addCharToBuffer();
        }
        break;
      case 4:
        addCharToBuffer();
        state = previousState;
        break;
      case 1:
        if (char === "(") {
          state = 2;
        } else if (VALID_PARAM_RE.test(char)) {
          addCharToBuffer();
        } else {
          consumeBuffer();
          state = 0;
          if (char !== "*" && char !== "?" && char !== "+")
            i--;
        }
        break;
      case 2:
        if (char === ")") {
          if (customRe[customRe.length - 1] == "\\")
            customRe = customRe.slice(0, -1) + char;
          else
            state = 3;
        } else {
          customRe += char;
        }
        break;
      case 3:
        consumeBuffer();
        state = 0;
        if (char !== "*" && char !== "?" && char !== "+")
          i--;
        customRe = "";
        break;
      default:
        crash("Unknown state");
        break;
    }
  }
  if (state === 2)
    crash(`Unfinished custom RegExp for param "${buffer}"`);
  consumeBuffer();
  finalizeSegment();
  return tokens;
}
function createRouteRecordMatcher(record, parent, options) {
  const parser = tokensToParser(tokenizePath(record.path), options);
  const matcher = assign(parser, {
    record,
    parent,
    // these needs to be populated by the parent
    children: [],
    alias: []
  });
  if (parent) {
    if (!matcher.record.aliasOf === !parent.record.aliasOf)
      parent.children.push(matcher);
  }
  return matcher;
}
function createRouterMatcher(routes, globalOptions) {
  const matchers = [];
  const matcherMap = /* @__PURE__ */ new Map();
  globalOptions = mergeOptions({ strict: false, end: true, sensitive: false }, globalOptions);
  function getRecordMatcher(name) {
    return matcherMap.get(name);
  }
  function addRoute(record, parent, originalRecord) {
    const isRootAdd = !originalRecord;
    const mainNormalizedRecord = normalizeRouteRecord(record);
    mainNormalizedRecord.aliasOf = originalRecord && originalRecord.record;
    const options = mergeOptions(globalOptions, record);
    const normalizedRecords = [
      mainNormalizedRecord
    ];
    if ("alias" in record) {
      const aliases = typeof record.alias === "string" ? [record.alias] : record.alias;
      for (const alias of aliases) {
        normalizedRecords.push(assign({}, mainNormalizedRecord, {
          // this allows us to hold a copy of the `components` option
          // so that async components cache is hold on the original record
          components: originalRecord ? originalRecord.record.components : mainNormalizedRecord.components,
          path: alias,
          // we might be the child of an alias
          aliasOf: originalRecord ? originalRecord.record : mainNormalizedRecord
          // the aliases are always of the same kind as the original since they
          // are defined on the same record
        }));
      }
    }
    let matcher;
    let originalMatcher;
    for (const normalizedRecord of normalizedRecords) {
      const { path } = normalizedRecord;
      if (parent && path[0] !== "/") {
        const parentPath = parent.record.path;
        const connectingSlash = parentPath[parentPath.length - 1] === "/" ? "" : "/";
        normalizedRecord.path = parent.record.path + (path && connectingSlash + path);
      }
      matcher = createRouteRecordMatcher(normalizedRecord, parent, options);
      if (originalRecord) {
        originalRecord.alias.push(matcher);
      } else {
        originalMatcher = originalMatcher || matcher;
        if (originalMatcher !== matcher)
          originalMatcher.alias.push(matcher);
        if (isRootAdd && record.name && !isAliasRecord(matcher))
          removeRoute(record.name);
      }
      if (mainNormalizedRecord.children) {
        const children = mainNormalizedRecord.children;
        for (let i = 0; i < children.length; i++) {
          addRoute(children[i], matcher, originalRecord && originalRecord.children[i]);
        }
      }
      originalRecord = originalRecord || matcher;
      if (matcher.record.components && Object.keys(matcher.record.components).length || matcher.record.name || matcher.record.redirect) {
        insertMatcher(matcher);
      }
    }
    return originalMatcher ? () => {
      removeRoute(originalMatcher);
    } : noop;
  }
  function removeRoute(matcherRef) {
    if (isRouteName(matcherRef)) {
      const matcher = matcherMap.get(matcherRef);
      if (matcher) {
        matcherMap.delete(matcherRef);
        matchers.splice(matchers.indexOf(matcher), 1);
        matcher.children.forEach(removeRoute);
        matcher.alias.forEach(removeRoute);
      }
    } else {
      const index = matchers.indexOf(matcherRef);
      if (index > -1) {
        matchers.splice(index, 1);
        if (matcherRef.record.name)
          matcherMap.delete(matcherRef.record.name);
        matcherRef.children.forEach(removeRoute);
        matcherRef.alias.forEach(removeRoute);
      }
    }
  }
  function getRoutes() {
    return matchers;
  }
  function insertMatcher(matcher) {
    let i = 0;
    while (i < matchers.length && comparePathParserScore(matcher, matchers[i]) >= 0 && // Adding children with empty path should still appear before the parent
    // https://github.com/vuejs/router/issues/1124
    (matcher.record.path !== matchers[i].record.path || !isRecordChildOf(matcher, matchers[i])))
      i++;
    matchers.splice(i, 0, matcher);
    if (matcher.record.name && !isAliasRecord(matcher))
      matcherMap.set(matcher.record.name, matcher);
  }
  function resolve2(location2, currentLocation) {
    let matcher;
    let params = {};
    let path;
    let name;
    if ("name" in location2 && location2.name) {
      matcher = matcherMap.get(location2.name);
      if (!matcher)
        throw createRouterError(1, {
          location: location2
        });
      name = matcher.record.name;
      params = assign(
        // paramsFromLocation is a new object
        paramsFromLocation(
          currentLocation.params,
          // only keep params that exist in the resolved location
          // TODO: only keep optional params coming from a parent record
          matcher.keys.filter((k) => !k.optional).map((k) => k.name)
        ),
        // discard any existing params in the current location that do not exist here
        // #1497 this ensures better active/exact matching
        location2.params && paramsFromLocation(location2.params, matcher.keys.map((k) => k.name))
      );
      path = matcher.stringify(params);
    } else if ("path" in location2) {
      path = location2.path;
      matcher = matchers.find((m) => m.re.test(path));
      if (matcher) {
        params = matcher.parse(path);
        name = matcher.record.name;
      }
    } else {
      matcher = currentLocation.name ? matcherMap.get(currentLocation.name) : matchers.find((m) => m.re.test(currentLocation.path));
      if (!matcher)
        throw createRouterError(1, {
          location: location2,
          currentLocation
        });
      name = matcher.record.name;
      params = assign({}, currentLocation.params, location2.params);
      path = matcher.stringify(params);
    }
    const matched = [];
    let parentMatcher = matcher;
    while (parentMatcher) {
      matched.unshift(parentMatcher.record);
      parentMatcher = parentMatcher.parent;
    }
    return {
      name,
      path,
      params,
      matched,
      meta: mergeMetaFields(matched)
    };
  }
  routes.forEach((route) => addRoute(route));
  return { addRoute, resolve: resolve2, removeRoute, getRoutes, getRecordMatcher };
}
function paramsFromLocation(params, keys) {
  const newParams = {};
  for (const key of keys) {
    if (key in params)
      newParams[key] = params[key];
  }
  return newParams;
}
function normalizeRouteRecord(record) {
  return {
    path: record.path,
    redirect: record.redirect,
    name: record.name,
    meta: record.meta || {},
    aliasOf: void 0,
    beforeEnter: record.beforeEnter,
    props: normalizeRecordProps(record),
    children: record.children || [],
    instances: {},
    leaveGuards: /* @__PURE__ */ new Set(),
    updateGuards: /* @__PURE__ */ new Set(),
    enterCallbacks: {},
    components: "components" in record ? record.components || null : record.component && { default: record.component }
  };
}
function normalizeRecordProps(record) {
  const propsObject = {};
  const props = record.props || false;
  if ("component" in record) {
    propsObject.default = props;
  } else {
    for (const name in record.components)
      propsObject[name] = typeof props === "boolean" ? props : props[name];
  }
  return propsObject;
}
function isAliasRecord(record) {
  while (record) {
    if (record.record.aliasOf)
      return true;
    record = record.parent;
  }
  return false;
}
function mergeMetaFields(matched) {
  return matched.reduce((meta, record) => assign(meta, record.meta), {});
}
function mergeOptions(defaults, partialOptions) {
  const options = {};
  for (const key in defaults) {
    options[key] = key in partialOptions ? partialOptions[key] : defaults[key];
  }
  return options;
}
function isRecordChildOf(record, parent) {
  return parent.children.some((child) => child === record || isRecordChildOf(record, child));
}
const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
const ENC_BRACKET_OPEN_RE = /%5B/g;
const ENC_BRACKET_CLOSE_RE = /%5D/g;
const ENC_CARET_RE = /%5E/g;
const ENC_BACKTICK_RE = /%60/g;
const ENC_CURLY_OPEN_RE = /%7B/g;
const ENC_PIPE_RE = /%7C/g;
const ENC_CURLY_CLOSE_RE = /%7D/g;
const ENC_SPACE_RE = /%20/g;
function commonEncode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|").replace(ENC_BRACKET_OPEN_RE, "[").replace(ENC_BRACKET_CLOSE_RE, "]");
}
function encodeHash(text) {
  return commonEncode(text).replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
}
function encodeQueryValue(text) {
  return commonEncode(text).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function encodePath(text) {
  return commonEncode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F");
}
function encodeParam(text) {
  return text == null ? "" : encodePath(text).replace(SLASH_RE, "%2F");
}
function decode(text) {
  try {
    return decodeURIComponent("" + text);
  } catch (err) {
  }
  return "" + text;
}
function parseQuery(search) {
  const query = {};
  if (search === "" || search === "?")
    return query;
  const hasLeadingIM = search[0] === "?";
  const searchParams = (hasLeadingIM ? search.slice(1) : search).split("&");
  for (let i = 0; i < searchParams.length; ++i) {
    const searchParam = searchParams[i].replace(PLUS_RE, " ");
    const eqPos = searchParam.indexOf("=");
    const key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos));
    const value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1));
    if (key in query) {
      let currentValue = query[key];
      if (!isArray(currentValue)) {
        currentValue = query[key] = [currentValue];
      }
      currentValue.push(value);
    } else {
      query[key] = value;
    }
  }
  return query;
}
function stringifyQuery(query) {
  let search = "";
  for (let key in query) {
    const value = query[key];
    key = encodeQueryKey(key);
    if (value == null) {
      if (value !== void 0) {
        search += (search.length ? "&" : "") + key;
      }
      continue;
    }
    const values = isArray(value) ? value.map((v) => v && encodeQueryValue(v)) : [value && encodeQueryValue(value)];
    values.forEach((value2) => {
      if (value2 !== void 0) {
        search += (search.length ? "&" : "") + key;
        if (value2 != null)
          search += "=" + value2;
      }
    });
  }
  return search;
}
function normalizeQuery(query) {
  const normalizedQuery = {};
  for (const key in query) {
    const value = query[key];
    if (value !== void 0) {
      normalizedQuery[key] = isArray(value) ? value.map((v) => v == null ? null : "" + v) : value == null ? value : "" + value;
    }
  }
  return normalizedQuery;
}
const matchedRouteKey = Symbol("");
const viewDepthKey = Symbol("");
const routerKey = Symbol("");
const routeLocationKey = Symbol("");
const routerViewLocationKey = Symbol("");
function useCallbacks() {
  let handlers = [];
  function add2(handler) {
    handlers.push(handler);
    return () => {
      const i = handlers.indexOf(handler);
      if (i > -1)
        handlers.splice(i, 1);
    };
  }
  function reset() {
    handlers = [];
  }
  return {
    add: add2,
    list: () => handlers,
    reset
  };
}
function guardToPromiseFn(guard, to, from, record, name) {
  const enterCallbackArray = record && // name is defined if record is because of the function overload
  (record.enterCallbacks[name] = record.enterCallbacks[name] || []);
  return () => new Promise((resolve2, reject) => {
    const next = (valid) => {
      if (valid === false) {
        reject(createRouterError(4, {
          from,
          to
        }));
      } else if (valid instanceof Error) {
        reject(valid);
      } else if (isRouteLocation(valid)) {
        reject(createRouterError(2, {
          from: to,
          to: valid
        }));
      } else {
        if (enterCallbackArray && // since enterCallbackArray is truthy, both record and name also are
        record.enterCallbacks[name] === enterCallbackArray && typeof valid === "function") {
          enterCallbackArray.push(valid);
        }
        resolve2();
      }
    };
    const guardReturn = guard.call(record && record.instances[name], to, from, next);
    let guardCall = Promise.resolve(guardReturn);
    if (guard.length < 3)
      guardCall = guardCall.then(next);
    guardCall.catch((err) => reject(err));
  });
}
function extractComponentsGuards(matched, guardType, to, from) {
  const guards = [];
  for (const record of matched) {
    for (const name in record.components) {
      let rawComponent = record.components[name];
      if (guardType !== "beforeRouteEnter" && !record.instances[name])
        continue;
      if (isRouteComponent(rawComponent)) {
        const options = rawComponent.__vccOpts || rawComponent;
        const guard = options[guardType];
        guard && guards.push(guardToPromiseFn(guard, to, from, record, name));
      } else {
        let componentPromise = rawComponent();
        guards.push(() => componentPromise.then((resolved) => {
          if (!resolved)
            return Promise.reject(new Error(`Couldn't resolve component "${name}" at "${record.path}"`));
          const resolvedComponent = isESModule(resolved) ? resolved.default : resolved;
          record.components[name] = resolvedComponent;
          const options = resolvedComponent.__vccOpts || resolvedComponent;
          const guard = options[guardType];
          return guard && guardToPromiseFn(guard, to, from, record, name)();
        }));
      }
    }
  }
  return guards;
}
function isRouteComponent(component) {
  return typeof component === "object" || "displayName" in component || "props" in component || "__vccOpts" in component;
}
function useLink(props) {
  const router2 = inject(routerKey);
  const currentRoute = inject(routeLocationKey);
  const route = computed(() => router2.resolve(unref(props.to)));
  const activeRecordIndex = computed(() => {
    const { matched } = route.value;
    const { length } = matched;
    const routeMatched = matched[length - 1];
    const currentMatched = currentRoute.matched;
    if (!routeMatched || !currentMatched.length)
      return -1;
    const index = currentMatched.findIndex(isSameRouteRecord.bind(null, routeMatched));
    if (index > -1)
      return index;
    const parentRecordPath = getOriginalPath(matched[length - 2]);
    return (
      // we are dealing with nested routes
      length > 1 && // if the parent and matched route have the same path, this link is
      // referring to the empty child. Or we currently are on a different
      // child of the same parent
      getOriginalPath(routeMatched) === parentRecordPath && // avoid comparing the child with its parent
      currentMatched[currentMatched.length - 1].path !== parentRecordPath ? currentMatched.findIndex(isSameRouteRecord.bind(null, matched[length - 2])) : index
    );
  });
  const isActive = computed(() => activeRecordIndex.value > -1 && includesParams(currentRoute.params, route.value.params));
  const isExactActive = computed(() => activeRecordIndex.value > -1 && activeRecordIndex.value === currentRoute.matched.length - 1 && isSameRouteLocationParams(currentRoute.params, route.value.params));
  function navigate(e = {}) {
    if (guardEvent(e)) {
      return router2[unref(props.replace) ? "replace" : "push"](
        unref(props.to)
        // avoid uncaught errors are they are logged anyway
      ).catch(noop);
    }
    return Promise.resolve();
  }
  return {
    route,
    href: computed(() => route.value.href),
    isActive,
    isExactActive,
    navigate
  };
}
const RouterLinkImpl = /* @__PURE__ */ defineComponent({
  name: "RouterLink",
  compatConfig: { MODE: 3 },
  props: {
    to: {
      type: [String, Object],
      required: true
    },
    replace: Boolean,
    activeClass: String,
    // inactiveClass: String,
    exactActiveClass: String,
    custom: Boolean,
    ariaCurrentValue: {
      type: String,
      default: "page"
    }
  },
  useLink,
  setup(props, { slots }) {
    const link = reactive(useLink(props));
    const { options } = inject(routerKey);
    const elClass = computed(() => ({
      [getLinkClass(props.activeClass, options.linkActiveClass, "router-link-active")]: link.isActive,
      // [getLinkClass(
      //   props.inactiveClass,
      //   options.linkInactiveClass,
      //   'router-link-inactive'
      // )]: !link.isExactActive,
      [getLinkClass(props.exactActiveClass, options.linkExactActiveClass, "router-link-exact-active")]: link.isExactActive
    }));
    return () => {
      const children = slots.default && slots.default(link);
      return props.custom ? children : h("a", {
        "aria-current": link.isExactActive ? props.ariaCurrentValue : null,
        href: link.href,
        // this would override user added attrs but Vue will still add
        // the listener, so we end up triggering both
        onClick: link.navigate,
        class: elClass.value
      }, children);
    };
  }
});
const RouterLink = RouterLinkImpl;
function guardEvent(e) {
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey)
    return;
  if (e.defaultPrevented)
    return;
  if (e.button !== void 0 && e.button !== 0)
    return;
  if (e.currentTarget && e.currentTarget.getAttribute) {
    const target = e.currentTarget.getAttribute("target");
    if (/\b_blank\b/i.test(target))
      return;
  }
  if (e.preventDefault)
    e.preventDefault();
  return true;
}
function includesParams(outer, inner) {
  for (const key in inner) {
    const innerValue = inner[key];
    const outerValue = outer[key];
    if (typeof innerValue === "string") {
      if (innerValue !== outerValue)
        return false;
    } else {
      if (!isArray(outerValue) || outerValue.length !== innerValue.length || innerValue.some((value, i) => value !== outerValue[i]))
        return false;
    }
  }
  return true;
}
function getOriginalPath(record) {
  return record ? record.aliasOf ? record.aliasOf.path : record.path : "";
}
const getLinkClass = (propClass, globalClass, defaultClass) => propClass != null ? propClass : globalClass != null ? globalClass : defaultClass;
const RouterViewImpl = /* @__PURE__ */ defineComponent({
  name: "RouterView",
  // #674 we manually inherit them
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      default: "default"
    },
    route: Object
  },
  // Better compat for @vue/compat users
  // https://github.com/vuejs/router/issues/1315
  compatConfig: { MODE: 3 },
  setup(props, { attrs, slots }) {
    const injectedRoute = inject(routerViewLocationKey);
    const routeToDisplay = computed(() => props.route || injectedRoute.value);
    const injectedDepth = inject(viewDepthKey, 0);
    const depth = computed(() => {
      let initialDepth = unref(injectedDepth);
      const { matched } = routeToDisplay.value;
      let matchedRoute;
      while ((matchedRoute = matched[initialDepth]) && !matchedRoute.components) {
        initialDepth++;
      }
      return initialDepth;
    });
    const matchedRouteRef = computed(() => routeToDisplay.value.matched[depth.value]);
    provide(viewDepthKey, computed(() => depth.value + 1));
    provide(matchedRouteKey, matchedRouteRef);
    provide(routerViewLocationKey, routeToDisplay);
    const viewRef = ref();
    watch(() => [viewRef.value, matchedRouteRef.value, props.name], ([instance, to, name], [oldInstance, from, oldName]) => {
      if (to) {
        to.instances[name] = instance;
        if (from && from !== to && instance && instance === oldInstance) {
          if (!to.leaveGuards.size) {
            to.leaveGuards = from.leaveGuards;
          }
          if (!to.updateGuards.size) {
            to.updateGuards = from.updateGuards;
          }
        }
      }
      if (instance && to && // if there is no instance but to and from are the same this might be
      // the first visit
      (!from || !isSameRouteRecord(to, from) || !oldInstance)) {
        (to.enterCallbacks[name] || []).forEach((callback) => callback(instance));
      }
    }, { flush: "post" });
    return () => {
      const route = routeToDisplay.value;
      const currentName = props.name;
      const matchedRoute = matchedRouteRef.value;
      const ViewComponent = matchedRoute && matchedRoute.components[currentName];
      if (!ViewComponent) {
        return normalizeSlot(slots.default, { Component: ViewComponent, route });
      }
      const routePropsOption = matchedRoute.props[currentName];
      const routeProps = routePropsOption ? routePropsOption === true ? route.params : typeof routePropsOption === "function" ? routePropsOption(route) : routePropsOption : null;
      const onVnodeUnmounted = (vnode) => {
        if (vnode.component.isUnmounted) {
          matchedRoute.instances[currentName] = null;
        }
      };
      const component = h(ViewComponent, assign({}, routeProps, attrs, {
        onVnodeUnmounted,
        ref: viewRef
      }));
      return (
        // pass the vnode to the slot as a prop.
        // h and <component :is="..."> both accept vnodes
        normalizeSlot(slots.default, { Component: component, route }) || component
      );
    };
  }
});
function normalizeSlot(slot, data) {
  if (!slot)
    return null;
  const slotContent = slot(data);
  return slotContent.length === 1 ? slotContent[0] : slotContent;
}
const RouterView = RouterViewImpl;
function createRouter(options) {
  const matcher = createRouterMatcher(options.routes, options);
  const parseQuery$1 = options.parseQuery || parseQuery;
  const stringifyQuery$1 = options.stringifyQuery || stringifyQuery;
  const routerHistory = options.history;
  const beforeGuards = useCallbacks();
  const beforeResolveGuards = useCallbacks();
  const afterGuards = useCallbacks();
  const currentRoute = shallowRef(START_LOCATION_NORMALIZED);
  let pendingLocation = START_LOCATION_NORMALIZED;
  if (isBrowser && options.scrollBehavior && "scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  const normalizeParams = applyToParams.bind(null, (paramValue) => "" + paramValue);
  const encodeParams = applyToParams.bind(null, encodeParam);
  const decodeParams = (
    // @ts-expect-error: intentionally avoid the type check
    applyToParams.bind(null, decode)
  );
  function addRoute(parentOrRoute, route) {
    let parent;
    let record;
    if (isRouteName(parentOrRoute)) {
      parent = matcher.getRecordMatcher(parentOrRoute);
      record = route;
    } else {
      record = parentOrRoute;
    }
    return matcher.addRoute(record, parent);
  }
  function removeRoute(name) {
    const recordMatcher = matcher.getRecordMatcher(name);
    if (recordMatcher) {
      matcher.removeRoute(recordMatcher);
    }
  }
  function getRoutes() {
    return matcher.getRoutes().map((routeMatcher) => routeMatcher.record);
  }
  function hasRoute(name) {
    return !!matcher.getRecordMatcher(name);
  }
  function resolve2(rawLocation, currentLocation) {
    currentLocation = assign({}, currentLocation || currentRoute.value);
    if (typeof rawLocation === "string") {
      const locationNormalized = parseURL(parseQuery$1, rawLocation, currentLocation.path);
      const matchedRoute2 = matcher.resolve({ path: locationNormalized.path }, currentLocation);
      const href2 = routerHistory.createHref(locationNormalized.fullPath);
      return assign(locationNormalized, matchedRoute2, {
        params: decodeParams(matchedRoute2.params),
        hash: decode(locationNormalized.hash),
        redirectedFrom: void 0,
        href: href2
      });
    }
    let matcherLocation;
    if ("path" in rawLocation) {
      matcherLocation = assign({}, rawLocation, {
        path: parseURL(parseQuery$1, rawLocation.path, currentLocation.path).path
      });
    } else {
      const targetParams = assign({}, rawLocation.params);
      for (const key in targetParams) {
        if (targetParams[key] == null) {
          delete targetParams[key];
        }
      }
      matcherLocation = assign({}, rawLocation, {
        params: encodeParams(rawLocation.params)
      });
      currentLocation.params = encodeParams(currentLocation.params);
    }
    const matchedRoute = matcher.resolve(matcherLocation, currentLocation);
    const hash = rawLocation.hash || "";
    matchedRoute.params = normalizeParams(decodeParams(matchedRoute.params));
    const fullPath = stringifyURL(stringifyQuery$1, assign({}, rawLocation, {
      hash: encodeHash(hash),
      path: matchedRoute.path
    }));
    const href = routerHistory.createHref(fullPath);
    return assign({
      fullPath,
      // keep the hash encoded so fullPath is effectively path + encodedQuery +
      // hash
      hash,
      query: (
        // if the user is using a custom query lib like qs, we might have
        // nested objects, so we keep the query as is, meaning it can contain
        // numbers at `$route.query`, but at the point, the user will have to
        // use their own type anyway.
        // https://github.com/vuejs/router/issues/328#issuecomment-649481567
        stringifyQuery$1 === stringifyQuery ? normalizeQuery(rawLocation.query) : rawLocation.query || {}
      )
    }, matchedRoute, {
      redirectedFrom: void 0,
      href
    });
  }
  function locationAsObject(to) {
    return typeof to === "string" ? parseURL(parseQuery$1, to, currentRoute.value.path) : assign({}, to);
  }
  function checkCanceledNavigation(to, from) {
    if (pendingLocation !== to) {
      return createRouterError(8, {
        from,
        to
      });
    }
  }
  function push(to) {
    return pushWithRedirect(to);
  }
  function replace(to) {
    return push(assign(locationAsObject(to), { replace: true }));
  }
  function handleRedirectRecord(to) {
    const lastMatched = to.matched[to.matched.length - 1];
    if (lastMatched && lastMatched.redirect) {
      const { redirect } = lastMatched;
      let newTargetLocation = typeof redirect === "function" ? redirect(to) : redirect;
      if (typeof newTargetLocation === "string") {
        newTargetLocation = newTargetLocation.includes("?") || newTargetLocation.includes("#") ? newTargetLocation = locationAsObject(newTargetLocation) : (
          // force empty params
          { path: newTargetLocation }
        );
        newTargetLocation.params = {};
      }
      return assign({
        query: to.query,
        hash: to.hash,
        // avoid transferring params if the redirect has a path
        params: "path" in newTargetLocation ? {} : to.params
      }, newTargetLocation);
    }
  }
  function pushWithRedirect(to, redirectedFrom) {
    const targetLocation = pendingLocation = resolve2(to);
    const from = currentRoute.value;
    const data = to.state;
    const force = to.force;
    const replace2 = to.replace === true;
    const shouldRedirect = handleRedirectRecord(targetLocation);
    if (shouldRedirect)
      return pushWithRedirect(
        assign(locationAsObject(shouldRedirect), {
          state: typeof shouldRedirect === "object" ? assign({}, data, shouldRedirect.state) : data,
          force,
          replace: replace2
        }),
        // keep original redirectedFrom if it exists
        redirectedFrom || targetLocation
      );
    const toLocation = targetLocation;
    toLocation.redirectedFrom = redirectedFrom;
    let failure;
    if (!force && isSameRouteLocation(stringifyQuery$1, from, targetLocation)) {
      failure = createRouterError(16, { to: toLocation, from });
      handleScroll(
        from,
        from,
        // this is a push, the only way for it to be triggered from a
        // history.listen is with a redirect, which makes it become a push
        true,
        // This cannot be the first navigation because the initial location
        // cannot be manually navigated to
        false
      );
    }
    return (failure ? Promise.resolve(failure) : navigate(toLocation, from)).catch((error) => isNavigationFailure(error) ? (
      // navigation redirects still mark the router as ready
      isNavigationFailure(
        error,
        2
        /* ErrorTypes.NAVIGATION_GUARD_REDIRECT */
      ) ? error : markAsReady(error)
    ) : (
      // reject any unknown error
      triggerError(error, toLocation, from)
    )).then((failure2) => {
      if (failure2) {
        if (isNavigationFailure(
          failure2,
          2
          /* ErrorTypes.NAVIGATION_GUARD_REDIRECT */
        )) {
          return pushWithRedirect(
            // keep options
            assign({
              // preserve an existing replacement but allow the redirect to override it
              replace: replace2
            }, locationAsObject(failure2.to), {
              state: typeof failure2.to === "object" ? assign({}, data, failure2.to.state) : data,
              force
            }),
            // preserve the original redirectedFrom if any
            redirectedFrom || toLocation
          );
        }
      } else {
        failure2 = finalizeNavigation(toLocation, from, true, replace2, data);
      }
      triggerAfterEach(toLocation, from, failure2);
      return failure2;
    });
  }
  function checkCanceledNavigationAndReject(to, from) {
    const error = checkCanceledNavigation(to, from);
    return error ? Promise.reject(error) : Promise.resolve();
  }
  function navigate(to, from) {
    let guards;
    const [leavingRecords, updatingRecords, enteringRecords] = extractChangingRecords(to, from);
    guards = extractComponentsGuards(leavingRecords.reverse(), "beforeRouteLeave", to, from);
    for (const record of leavingRecords) {
      record.leaveGuards.forEach((guard) => {
        guards.push(guardToPromiseFn(guard, to, from));
      });
    }
    const canceledNavigationCheck = checkCanceledNavigationAndReject.bind(null, to, from);
    guards.push(canceledNavigationCheck);
    return runGuardQueue(guards).then(() => {
      guards = [];
      for (const guard of beforeGuards.list()) {
        guards.push(guardToPromiseFn(guard, to, from));
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = extractComponentsGuards(updatingRecords, "beforeRouteUpdate", to, from);
      for (const record of updatingRecords) {
        record.updateGuards.forEach((guard) => {
          guards.push(guardToPromiseFn(guard, to, from));
        });
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = [];
      for (const record of to.matched) {
        if (record.beforeEnter && !from.matched.includes(record)) {
          if (isArray(record.beforeEnter)) {
            for (const beforeEnter of record.beforeEnter)
              guards.push(guardToPromiseFn(beforeEnter, to, from));
          } else {
            guards.push(guardToPromiseFn(record.beforeEnter, to, from));
          }
        }
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      to.matched.forEach((record) => record.enterCallbacks = {});
      guards = extractComponentsGuards(enteringRecords, "beforeRouteEnter", to, from);
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = [];
      for (const guard of beforeResolveGuards.list()) {
        guards.push(guardToPromiseFn(guard, to, from));
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).catch((err) => isNavigationFailure(
      err,
      8
      /* ErrorTypes.NAVIGATION_CANCELLED */
    ) ? err : Promise.reject(err));
  }
  function triggerAfterEach(to, from, failure) {
    for (const guard of afterGuards.list())
      guard(to, from, failure);
  }
  function finalizeNavigation(toLocation, from, isPush, replace2, data) {
    const error = checkCanceledNavigation(toLocation, from);
    if (error)
      return error;
    const isFirstNavigation = from === START_LOCATION_NORMALIZED;
    const state = !isBrowser ? {} : history.state;
    if (isPush) {
      if (replace2 || isFirstNavigation)
        routerHistory.replace(toLocation.fullPath, assign({
          scroll: isFirstNavigation && state && state.scroll
        }, data));
      else
        routerHistory.push(toLocation.fullPath, data);
    }
    currentRoute.value = toLocation;
    handleScroll(toLocation, from, isPush, isFirstNavigation);
    markAsReady();
  }
  let removeHistoryListener;
  function setupListeners() {
    if (removeHistoryListener)
      return;
    removeHistoryListener = routerHistory.listen((to, _from, info) => {
      if (!router2.listening)
        return;
      const toLocation = resolve2(to);
      const shouldRedirect = handleRedirectRecord(toLocation);
      if (shouldRedirect) {
        pushWithRedirect(assign(shouldRedirect, { replace: true }), toLocation).catch(noop);
        return;
      }
      pendingLocation = toLocation;
      const from = currentRoute.value;
      if (isBrowser) {
        saveScrollPosition(getScrollKey(from.fullPath, info.delta), computeScrollPosition());
      }
      navigate(toLocation, from).catch((error) => {
        if (isNavigationFailure(
          error,
          4 | 8
          /* ErrorTypes.NAVIGATION_CANCELLED */
        )) {
          return error;
        }
        if (isNavigationFailure(
          error,
          2
          /* ErrorTypes.NAVIGATION_GUARD_REDIRECT */
        )) {
          pushWithRedirect(
            error.to,
            toLocation
            // avoid an uncaught rejection, let push call triggerError
          ).then((failure) => {
            if (isNavigationFailure(
              failure,
              4 | 16
              /* ErrorTypes.NAVIGATION_DUPLICATED */
            ) && !info.delta && info.type === NavigationType.pop) {
              routerHistory.go(-1, false);
            }
          }).catch(noop);
          return Promise.reject();
        }
        if (info.delta) {
          routerHistory.go(-info.delta, false);
        }
        return triggerError(error, toLocation, from);
      }).then((failure) => {
        failure = failure || finalizeNavigation(
          // after navigation, all matched components are resolved
          toLocation,
          from,
          false
        );
        if (failure) {
          if (info.delta && // a new navigation has been triggered, so we do not want to revert, that will change the current history
          // entry while a different route is displayed
          !isNavigationFailure(
            failure,
            8
            /* ErrorTypes.NAVIGATION_CANCELLED */
          )) {
            routerHistory.go(-info.delta, false);
          } else if (info.type === NavigationType.pop && isNavigationFailure(
            failure,
            4 | 16
            /* ErrorTypes.NAVIGATION_DUPLICATED */
          )) {
            routerHistory.go(-1, false);
          }
        }
        triggerAfterEach(toLocation, from, failure);
      }).catch(noop);
    });
  }
  let readyHandlers = useCallbacks();
  let errorHandlers = useCallbacks();
  let ready;
  function triggerError(error, to, from) {
    markAsReady(error);
    const list = errorHandlers.list();
    if (list.length) {
      list.forEach((handler) => handler(error, to, from));
    } else {
      console.error(error);
    }
    return Promise.reject(error);
  }
  function isReady() {
    if (ready && currentRoute.value !== START_LOCATION_NORMALIZED)
      return Promise.resolve();
    return new Promise((resolve3, reject) => {
      readyHandlers.add([resolve3, reject]);
    });
  }
  function markAsReady(err) {
    if (!ready) {
      ready = !err;
      setupListeners();
      readyHandlers.list().forEach(([resolve3, reject]) => err ? reject(err) : resolve3());
      readyHandlers.reset();
    }
    return err;
  }
  function handleScroll(to, from, isPush, isFirstNavigation) {
    const { scrollBehavior } = options;
    if (!isBrowser || !scrollBehavior)
      return Promise.resolve();
    const scrollPosition = !isPush && getSavedScrollPosition(getScrollKey(to.fullPath, 0)) || (isFirstNavigation || !isPush) && history.state && history.state.scroll || null;
    return nextTick().then(() => scrollBehavior(to, from, scrollPosition)).then((position) => position && scrollToPosition(position)).catch((err) => triggerError(err, to, from));
  }
  const go = (delta) => routerHistory.go(delta);
  let started;
  const installedApps = /* @__PURE__ */ new Set();
  const router2 = {
    currentRoute,
    listening: true,
    addRoute,
    removeRoute,
    hasRoute,
    getRoutes,
    resolve: resolve2,
    options,
    push,
    replace,
    go,
    back: () => go(-1),
    forward: () => go(1),
    beforeEach: beforeGuards.add,
    beforeResolve: beforeResolveGuards.add,
    afterEach: afterGuards.add,
    onError: errorHandlers.add,
    isReady,
    install(app) {
      const router3 = this;
      app.component("RouterLink", RouterLink);
      app.component("RouterView", RouterView);
      app.config.globalProperties.$router = router3;
      Object.defineProperty(app.config.globalProperties, "$route", {
        enumerable: true,
        get: () => unref(currentRoute)
      });
      if (isBrowser && // used for the initial navigation client side to avoid pushing
      // multiple times when the router is used in multiple apps
      !started && currentRoute.value === START_LOCATION_NORMALIZED) {
        started = true;
        push(routerHistory.location).catch((err) => {
        });
      }
      const reactiveRoute = {};
      for (const key in START_LOCATION_NORMALIZED) {
        reactiveRoute[key] = computed(() => currentRoute.value[key]);
      }
      app.provide(routerKey, router3);
      app.provide(routeLocationKey, reactive(reactiveRoute));
      app.provide(routerViewLocationKey, currentRoute);
      const unmountApp = app.unmount;
      installedApps.add(app);
      app.unmount = function() {
        installedApps.delete(app);
        if (installedApps.size < 1) {
          pendingLocation = START_LOCATION_NORMALIZED;
          removeHistoryListener && removeHistoryListener();
          removeHistoryListener = null;
          currentRoute.value = START_LOCATION_NORMALIZED;
          started = false;
          ready = false;
        }
        unmountApp();
      };
    }
  };
  return router2;
}
function runGuardQueue(guards) {
  return guards.reduce((promise, guard) => promise.then(() => guard()), Promise.resolve());
}
function extractChangingRecords(to, from) {
  const leavingRecords = [];
  const updatingRecords = [];
  const enteringRecords = [];
  const len = Math.max(from.matched.length, to.matched.length);
  for (let i = 0; i < len; i++) {
    const recordFrom = from.matched[i];
    if (recordFrom) {
      if (to.matched.find((record) => isSameRouteRecord(record, recordFrom)))
        updatingRecords.push(recordFrom);
      else
        leavingRecords.push(recordFrom);
    }
    const recordTo = to.matched[i];
    if (recordTo) {
      if (!from.matched.find((record) => isSameRouteRecord(record, recordTo))) {
        enteringRecords.push(recordTo);
      }
    }
  }
  return [leavingRecords, updatingRecords, enteringRecords];
}
function decodeJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace("-", "+").replace("_", "/");
  return JSON.parse(window.atob(base64));
}
/*!
 * vuex v4.0.2
 * (c) 2021 Evan You
 * @license MIT
 */
var storeKey = "store";
function forEachValue(obj, fn) {
  Object.keys(obj).forEach(function(key) {
    return fn(obj[key], key);
  });
}
function isObject(obj) {
  return obj !== null && typeof obj === "object";
}
function isPromise(val) {
  return val && typeof val.then === "function";
}
function partial(fn, arg) {
  return function() {
    return fn(arg);
  };
}
function genericSubscribe(fn, subs, options) {
  if (subs.indexOf(fn) < 0) {
    options && options.prepend ? subs.unshift(fn) : subs.push(fn);
  }
  return function() {
    var i = subs.indexOf(fn);
    if (i > -1) {
      subs.splice(i, 1);
    }
  };
}
function resetStore(store2, hot) {
  store2._actions = /* @__PURE__ */ Object.create(null);
  store2._mutations = /* @__PURE__ */ Object.create(null);
  store2._wrappedGetters = /* @__PURE__ */ Object.create(null);
  store2._modulesNamespaceMap = /* @__PURE__ */ Object.create(null);
  var state = store2.state;
  installModule(store2, state, [], store2._modules.root, true);
  resetStoreState(store2, state, hot);
}
function resetStoreState(store2, state, hot) {
  var oldState = store2._state;
  store2.getters = {};
  store2._makeLocalGettersCache = /* @__PURE__ */ Object.create(null);
  var wrappedGetters = store2._wrappedGetters;
  var computedObj = {};
  forEachValue(wrappedGetters, function(fn, key) {
    computedObj[key] = partial(fn, store2);
    Object.defineProperty(store2.getters, key, {
      // TODO: use `computed` when it's possible. at the moment we can't due to
      // https://github.com/vuejs/vuex/pull/1883
      get: function() {
        return computedObj[key]();
      },
      enumerable: true
      // for local getters
    });
  });
  store2._state = reactive({
    data: state
  });
  if (store2.strict) {
    enableStrictMode(store2);
  }
  if (oldState) {
    if (hot) {
      store2._withCommit(function() {
        oldState.data = null;
      });
    }
  }
}
function installModule(store2, rootState, path, module, hot) {
  var isRoot = !path.length;
  var namespace = store2._modules.getNamespace(path);
  if (module.namespaced) {
    if (store2._modulesNamespaceMap[namespace] && false) {
      console.error("[vuex] duplicate namespace " + namespace + " for the namespaced module " + path.join("/"));
    }
    store2._modulesNamespaceMap[namespace] = module;
  }
  if (!isRoot && !hot) {
    var parentState = getNestedState(rootState, path.slice(0, -1));
    var moduleName = path[path.length - 1];
    store2._withCommit(function() {
      parentState[moduleName] = module.state;
    });
  }
  var local = module.context = makeLocalContext(store2, namespace, path);
  module.forEachMutation(function(mutation, key) {
    var namespacedType = namespace + key;
    registerMutation(store2, namespacedType, mutation, local);
  });
  module.forEachAction(function(action, key) {
    var type = action.root ? key : namespace + key;
    var handler = action.handler || action;
    registerAction(store2, type, handler, local);
  });
  module.forEachGetter(function(getter, key) {
    var namespacedType = namespace + key;
    registerGetter(store2, namespacedType, getter, local);
  });
  module.forEachChild(function(child, key) {
    installModule(store2, rootState, path.concat(key), child, hot);
  });
}
function makeLocalContext(store2, namespace, path) {
  var noNamespace = namespace === "";
  var local = {
    dispatch: noNamespace ? store2.dispatch : function(_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options);
      var payload = args.payload;
      var options = args.options;
      var type = args.type;
      if (!options || !options.root) {
        type = namespace + type;
      }
      return store2.dispatch(type, payload);
    },
    commit: noNamespace ? store2.commit : function(_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options);
      var payload = args.payload;
      var options = args.options;
      var type = args.type;
      if (!options || !options.root) {
        type = namespace + type;
      }
      store2.commit(type, payload, options);
    }
  };
  Object.defineProperties(local, {
    getters: {
      get: noNamespace ? function() {
        return store2.getters;
      } : function() {
        return makeLocalGetters(store2, namespace);
      }
    },
    state: {
      get: function() {
        return getNestedState(store2.state, path);
      }
    }
  });
  return local;
}
function makeLocalGetters(store2, namespace) {
  if (!store2._makeLocalGettersCache[namespace]) {
    var gettersProxy = {};
    var splitPos = namespace.length;
    Object.keys(store2.getters).forEach(function(type) {
      if (type.slice(0, splitPos) !== namespace) {
        return;
      }
      var localType = type.slice(splitPos);
      Object.defineProperty(gettersProxy, localType, {
        get: function() {
          return store2.getters[type];
        },
        enumerable: true
      });
    });
    store2._makeLocalGettersCache[namespace] = gettersProxy;
  }
  return store2._makeLocalGettersCache[namespace];
}
function registerMutation(store2, type, handler, local) {
  var entry = store2._mutations[type] || (store2._mutations[type] = []);
  entry.push(function wrappedMutationHandler(payload) {
    handler.call(store2, local.state, payload);
  });
}
function registerAction(store2, type, handler, local) {
  var entry = store2._actions[type] || (store2._actions[type] = []);
  entry.push(function wrappedActionHandler(payload) {
    var res = handler.call(store2, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store2.getters,
      rootState: store2.state
    }, payload);
    if (!isPromise(res)) {
      res = Promise.resolve(res);
    }
    if (store2._devtoolHook) {
      return res.catch(function(err) {
        store2._devtoolHook.emit("vuex:error", err);
        throw err;
      });
    } else {
      return res;
    }
  });
}
function registerGetter(store2, type, rawGetter, local) {
  if (store2._wrappedGetters[type]) {
    return;
  }
  store2._wrappedGetters[type] = function wrappedGetter(store3) {
    return rawGetter(
      local.state,
      // local state
      local.getters,
      // local getters
      store3.state,
      // root state
      store3.getters
      // root getters
    );
  };
}
function enableStrictMode(store2) {
  watch(function() {
    return store2._state.data;
  }, function() {
  }, { deep: true, flush: "sync" });
}
function getNestedState(state, path) {
  return path.reduce(function(state2, key) {
    return state2[key];
  }, state);
}
function unifyObjectStyle(type, payload, options) {
  if (isObject(type) && type.type) {
    options = payload;
    payload = type;
    type = type.type;
  }
  return { type, payload, options };
}
var LABEL_VUEX_BINDINGS = "vuex bindings";
var MUTATIONS_LAYER_ID = "vuex:mutations";
var ACTIONS_LAYER_ID = "vuex:actions";
var INSPECTOR_ID = "vuex";
var actionId = 0;
function addDevtools(app, store2) {
  setupDevtoolsPlugin(
    {
      id: "org.vuejs.vuex",
      app,
      label: "Vuex",
      homepage: "https://next.vuex.vuejs.org/",
      logo: "https://vuejs.org/images/icons/favicon-96x96.png",
      packageName: "vuex",
      componentStateTypes: [LABEL_VUEX_BINDINGS]
    },
    function(api) {
      api.addTimelineLayer({
        id: MUTATIONS_LAYER_ID,
        label: "Vuex Mutations",
        color: COLOR_LIME_500
      });
      api.addTimelineLayer({
        id: ACTIONS_LAYER_ID,
        label: "Vuex Actions",
        color: COLOR_LIME_500
      });
      api.addInspector({
        id: INSPECTOR_ID,
        label: "Vuex",
        icon: "storage",
        treeFilterPlaceholder: "Filter stores..."
      });
      api.on.getInspectorTree(function(payload) {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          if (payload.filter) {
            var nodes = [];
            flattenStoreForInspectorTree(nodes, store2._modules.root, payload.filter, "");
            payload.rootNodes = nodes;
          } else {
            payload.rootNodes = [
              formatStoreForInspectorTree(store2._modules.root, "")
            ];
          }
        }
      });
      api.on.getInspectorState(function(payload) {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          var modulePath = payload.nodeId;
          makeLocalGetters(store2, modulePath);
          payload.state = formatStoreForInspectorState(
            getStoreModule(store2._modules, modulePath),
            modulePath === "root" ? store2.getters : store2._makeLocalGettersCache,
            modulePath
          );
        }
      });
      api.on.editInspectorState(function(payload) {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          var modulePath = payload.nodeId;
          var path = payload.path;
          if (modulePath !== "root") {
            path = modulePath.split("/").filter(Boolean).concat(path);
          }
          store2._withCommit(function() {
            payload.set(store2._state.data, path, payload.state.value);
          });
        }
      });
      store2.subscribe(function(mutation, state) {
        var data = {};
        if (mutation.payload) {
          data.payload = mutation.payload;
        }
        data.state = state;
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID);
        api.sendInspectorState(INSPECTOR_ID);
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: Date.now(),
            title: mutation.type,
            data
          }
        });
      });
      store2.subscribeAction({
        before: function(action, state) {
          var data = {};
          if (action.payload) {
            data.payload = action.payload;
          }
          action._id = actionId++;
          action._time = Date.now();
          data.state = state;
          api.addTimelineEvent({
            layerId: ACTIONS_LAYER_ID,
            event: {
              time: action._time,
              title: action.type,
              groupId: action._id,
              subtitle: "start",
              data
            }
          });
        },
        after: function(action, state) {
          var data = {};
          var duration = Date.now() - action._time;
          data.duration = {
            _custom: {
              type: "duration",
              display: duration + "ms",
              tooltip: "Action duration",
              value: duration
            }
          };
          if (action.payload) {
            data.payload = action.payload;
          }
          data.state = state;
          api.addTimelineEvent({
            layerId: ACTIONS_LAYER_ID,
            event: {
              time: Date.now(),
              title: action.type,
              groupId: action._id,
              subtitle: "end",
              data
            }
          });
        }
      });
    }
  );
}
var COLOR_LIME_500 = 8702998;
var COLOR_DARK = 6710886;
var COLOR_WHITE = 16777215;
var TAG_NAMESPACED = {
  label: "namespaced",
  textColor: COLOR_WHITE,
  backgroundColor: COLOR_DARK
};
function extractNameFromPath(path) {
  return path && path !== "root" ? path.split("/").slice(-2, -1)[0] : "Root";
}
function formatStoreForInspectorTree(module, path) {
  return {
    id: path || "root",
    // all modules end with a `/`, we want the last segment only
    // cart/ -> cart
    // nested/cart/ -> cart
    label: extractNameFromPath(path),
    tags: module.namespaced ? [TAG_NAMESPACED] : [],
    children: Object.keys(module._children).map(
      function(moduleName) {
        return formatStoreForInspectorTree(
          module._children[moduleName],
          path + moduleName + "/"
        );
      }
    )
  };
}
function flattenStoreForInspectorTree(result, module, filter, path) {
  if (path.includes(filter)) {
    result.push({
      id: path || "root",
      label: path.endsWith("/") ? path.slice(0, path.length - 1) : path || "Root",
      tags: module.namespaced ? [TAG_NAMESPACED] : []
    });
  }
  Object.keys(module._children).forEach(function(moduleName) {
    flattenStoreForInspectorTree(result, module._children[moduleName], filter, path + moduleName + "/");
  });
}
function formatStoreForInspectorState(module, getters, path) {
  getters = path === "root" ? getters : getters[path];
  var gettersKeys = Object.keys(getters);
  var storeState = {
    state: Object.keys(module.state).map(function(key) {
      return {
        key,
        editable: true,
        value: module.state[key]
      };
    })
  };
  if (gettersKeys.length) {
    var tree = transformPathsToObjectTree(getters);
    storeState.getters = Object.keys(tree).map(function(key) {
      return {
        key: key.endsWith("/") ? extractNameFromPath(key) : key,
        editable: false,
        value: canThrow(function() {
          return tree[key];
        })
      };
    });
  }
  return storeState;
}
function transformPathsToObjectTree(getters) {
  var result = {};
  Object.keys(getters).forEach(function(key) {
    var path = key.split("/");
    if (path.length > 1) {
      var target = result;
      var leafKey = path.pop();
      path.forEach(function(p2) {
        if (!target[p2]) {
          target[p2] = {
            _custom: {
              value: {},
              display: p2,
              tooltip: "Module",
              abstract: true
            }
          };
        }
        target = target[p2]._custom.value;
      });
      target[leafKey] = canThrow(function() {
        return getters[key];
      });
    } else {
      result[key] = canThrow(function() {
        return getters[key];
      });
    }
  });
  return result;
}
function getStoreModule(moduleMap, path) {
  var names = path.split("/").filter(function(n) {
    return n;
  });
  return names.reduce(
    function(module, moduleName, i) {
      var child = module[moduleName];
      if (!child) {
        throw new Error('Missing module "' + moduleName + '" for path "' + path + '".');
      }
      return i === names.length - 1 ? child : child._children;
    },
    path === "root" ? moduleMap : moduleMap.root._children
  );
}
function canThrow(cb) {
  try {
    return cb();
  } catch (e) {
    return e;
  }
}
var Module = function Module2(rawModule, runtime) {
  this.runtime = runtime;
  this._children = /* @__PURE__ */ Object.create(null);
  this._rawModule = rawModule;
  var rawState = rawModule.state;
  this.state = (typeof rawState === "function" ? rawState() : rawState) || {};
};
var prototypeAccessors$1 = { namespaced: { configurable: true } };
prototypeAccessors$1.namespaced.get = function() {
  return !!this._rawModule.namespaced;
};
Module.prototype.addChild = function addChild(key, module) {
  this._children[key] = module;
};
Module.prototype.removeChild = function removeChild(key) {
  delete this._children[key];
};
Module.prototype.getChild = function getChild(key) {
  return this._children[key];
};
Module.prototype.hasChild = function hasChild(key) {
  return key in this._children;
};
Module.prototype.update = function update(rawModule) {
  this._rawModule.namespaced = rawModule.namespaced;
  if (rawModule.actions) {
    this._rawModule.actions = rawModule.actions;
  }
  if (rawModule.mutations) {
    this._rawModule.mutations = rawModule.mutations;
  }
  if (rawModule.getters) {
    this._rawModule.getters = rawModule.getters;
  }
};
Module.prototype.forEachChild = function forEachChild(fn) {
  forEachValue(this._children, fn);
};
Module.prototype.forEachGetter = function forEachGetter(fn) {
  if (this._rawModule.getters) {
    forEachValue(this._rawModule.getters, fn);
  }
};
Module.prototype.forEachAction = function forEachAction(fn) {
  if (this._rawModule.actions) {
    forEachValue(this._rawModule.actions, fn);
  }
};
Module.prototype.forEachMutation = function forEachMutation(fn) {
  if (this._rawModule.mutations) {
    forEachValue(this._rawModule.mutations, fn);
  }
};
Object.defineProperties(Module.prototype, prototypeAccessors$1);
var ModuleCollection = function ModuleCollection2(rawRootModule) {
  this.register([], rawRootModule, false);
};
ModuleCollection.prototype.get = function get2(path) {
  return path.reduce(function(module, key) {
    return module.getChild(key);
  }, this.root);
};
ModuleCollection.prototype.getNamespace = function getNamespace(path) {
  var module = this.root;
  return path.reduce(function(namespace, key) {
    module = module.getChild(key);
    return namespace + (module.namespaced ? key + "/" : "");
  }, "");
};
ModuleCollection.prototype.update = function update$1(rawRootModule) {
  update2([], this.root, rawRootModule);
};
ModuleCollection.prototype.register = function register(path, rawModule, runtime) {
  var this$1$1 = this;
  if (runtime === void 0)
    runtime = true;
  var newModule = new Module(rawModule, runtime);
  if (path.length === 0) {
    this.root = newModule;
  } else {
    var parent = this.get(path.slice(0, -1));
    parent.addChild(path[path.length - 1], newModule);
  }
  if (rawModule.modules) {
    forEachValue(rawModule.modules, function(rawChildModule, key) {
      this$1$1.register(path.concat(key), rawChildModule, runtime);
    });
  }
};
ModuleCollection.prototype.unregister = function unregister(path) {
  var parent = this.get(path.slice(0, -1));
  var key = path[path.length - 1];
  var child = parent.getChild(key);
  if (!child) {
    return;
  }
  if (!child.runtime) {
    return;
  }
  parent.removeChild(key);
};
ModuleCollection.prototype.isRegistered = function isRegistered(path) {
  var parent = this.get(path.slice(0, -1));
  var key = path[path.length - 1];
  if (parent) {
    return parent.hasChild(key);
  }
  return false;
};
function update2(path, targetModule, newModule) {
  targetModule.update(newModule);
  if (newModule.modules) {
    for (var key in newModule.modules) {
      if (!targetModule.getChild(key)) {
        return;
      }
      update2(
        path.concat(key),
        targetModule.getChild(key),
        newModule.modules[key]
      );
    }
  }
}
function createStore(options) {
  return new Store(options);
}
var Store = function Store2(options) {
  var this$1$1 = this;
  if (options === void 0)
    options = {};
  var plugins = options.plugins;
  if (plugins === void 0)
    plugins = [];
  var strict = options.strict;
  if (strict === void 0)
    strict = false;
  var devtools = options.devtools;
  this._committing = false;
  this._actions = /* @__PURE__ */ Object.create(null);
  this._actionSubscribers = [];
  this._mutations = /* @__PURE__ */ Object.create(null);
  this._wrappedGetters = /* @__PURE__ */ Object.create(null);
  this._modules = new ModuleCollection(options);
  this._modulesNamespaceMap = /* @__PURE__ */ Object.create(null);
  this._subscribers = [];
  this._makeLocalGettersCache = /* @__PURE__ */ Object.create(null);
  this._devtools = devtools;
  var store2 = this;
  var ref2 = this;
  var dispatch2 = ref2.dispatch;
  var commit2 = ref2.commit;
  this.dispatch = function boundDispatch(type, payload) {
    return dispatch2.call(store2, type, payload);
  };
  this.commit = function boundCommit(type, payload, options2) {
    return commit2.call(store2, type, payload, options2);
  };
  this.strict = strict;
  var state = this._modules.root.state;
  installModule(this, state, [], this._modules.root);
  resetStoreState(this, state);
  plugins.forEach(function(plugin) {
    return plugin(this$1$1);
  });
};
var prototypeAccessors = { state: { configurable: true } };
Store.prototype.install = function install(app, injectKey) {
  app.provide(injectKey || storeKey, this);
  app.config.globalProperties.$store = this;
  var useDevtools = this._devtools !== void 0 ? this._devtools : false;
  if (useDevtools) {
    addDevtools(app, this);
  }
};
prototypeAccessors.state.get = function() {
  return this._state.data;
};
prototypeAccessors.state.set = function(v) {
};
Store.prototype.commit = function commit(_type, _payload, _options) {
  var this$1$1 = this;
  var ref2 = unifyObjectStyle(_type, _payload, _options);
  var type = ref2.type;
  var payload = ref2.payload;
  var mutation = { type, payload };
  var entry = this._mutations[type];
  if (!entry) {
    return;
  }
  this._withCommit(function() {
    entry.forEach(function commitIterator(handler) {
      handler(payload);
    });
  });
  this._subscribers.slice().forEach(function(sub) {
    return sub(mutation, this$1$1.state);
  });
};
Store.prototype.dispatch = function dispatch(_type, _payload) {
  var this$1$1 = this;
  var ref2 = unifyObjectStyle(_type, _payload);
  var type = ref2.type;
  var payload = ref2.payload;
  var action = { type, payload };
  var entry = this._actions[type];
  if (!entry) {
    return;
  }
  try {
    this._actionSubscribers.slice().filter(function(sub) {
      return sub.before;
    }).forEach(function(sub) {
      return sub.before(action, this$1$1.state);
    });
  } catch (e) {
  }
  var result = entry.length > 1 ? Promise.all(entry.map(function(handler) {
    return handler(payload);
  })) : entry[0](payload);
  return new Promise(function(resolve2, reject) {
    result.then(function(res) {
      try {
        this$1$1._actionSubscribers.filter(function(sub) {
          return sub.after;
        }).forEach(function(sub) {
          return sub.after(action, this$1$1.state);
        });
      } catch (e) {
      }
      resolve2(res);
    }, function(error) {
      try {
        this$1$1._actionSubscribers.filter(function(sub) {
          return sub.error;
        }).forEach(function(sub) {
          return sub.error(action, this$1$1.state, error);
        });
      } catch (e) {
      }
      reject(error);
    });
  });
};
Store.prototype.subscribe = function subscribe(fn, options) {
  return genericSubscribe(fn, this._subscribers, options);
};
Store.prototype.subscribeAction = function subscribeAction(fn, options) {
  var subs = typeof fn === "function" ? { before: fn } : fn;
  return genericSubscribe(subs, this._actionSubscribers, options);
};
Store.prototype.watch = function watch$1(getter, cb, options) {
  var this$1$1 = this;
  return watch(function() {
    return getter(this$1$1.state, this$1$1.getters);
  }, cb, Object.assign({}, options));
};
Store.prototype.replaceState = function replaceState(state) {
  var this$1$1 = this;
  this._withCommit(function() {
    this$1$1._state.data = state;
  });
};
Store.prototype.registerModule = function registerModule(path, rawModule, options) {
  if (options === void 0)
    options = {};
  if (typeof path === "string") {
    path = [path];
  }
  this._modules.register(path, rawModule);
  installModule(this, this.state, path, this._modules.get(path), options.preserveState);
  resetStoreState(this, this.state);
};
Store.prototype.unregisterModule = function unregisterModule(path) {
  var this$1$1 = this;
  if (typeof path === "string") {
    path = [path];
  }
  this._modules.unregister(path);
  this._withCommit(function() {
    var parentState = getNestedState(this$1$1.state, path.slice(0, -1));
    delete parentState[path[path.length - 1]];
  });
  resetStore(this);
};
Store.prototype.hasModule = function hasModule(path) {
  if (typeof path === "string") {
    path = [path];
  }
  return this._modules.isRegistered(path);
};
Store.prototype.hotUpdate = function hotUpdate(newOptions) {
  this._modules.update(newOptions);
  resetStore(this, true);
};
Store.prototype._withCommit = function _withCommit(fn) {
  var committing = this._committing;
  this._committing = true;
  fn();
  this._committing = committing;
};
Object.defineProperties(Store.prototype, prototypeAccessors);
const store = createStore({
  state() {
    return {
      token: null,
      uid: null,
      username: null,
      isLoggedIn: false,
      profilePicture: null,
      bannerPicture: null,
      toastVisible: false,
      toastMessage: null,
      aboutMe: null,
      userCache: {}
    };
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
    },
    setUid(state, uid2) {
      state.uid = uid2;
    },
    setUsername(state, username) {
      state.username = username;
    },
    setIsLoggedIn(state, isLoggedIn) {
      state.isLoggedIn = isLoggedIn;
    },
    setProfilePicture(state, profilePicture) {
      state.profilePicture = profilePicture;
    },
    setBannerPicture(state, bannerPicture) {
      state.bannerPicture = bannerPicture;
    },
    setToastHidden(state) {
      state.toastVisible = false;
    },
    setToastMessage(state, message) {
      state.toastMessage = message;
      state.toastVisible = true;
    },
    setAboutMe(state, aboutMe) {
      state.aboutMe = aboutMe;
    },
    addUserToCache(state, user) {
      state.userCache[user.id] = user;
    },
    flushUserCache(state) {
      state.userCache = {};
    }
  },
  actions: {
    setToken({ commit: commit2 }, token) {
      commit2("setToken", token);
    },
    setUid({ commit: commit2 }, uid2) {
      commit2("setUid", uid2);
    },
    setUsername({ commit: commit2 }, username) {
      commit2("setUsername", username);
    },
    setIsLoggedIn({ commit: commit2 }, isLogin) {
      commit2("setIsLoggedIn", isLogin);
    },
    addToast({ commit: commit2 }, message) {
      commit2("setToastMessage", message);
      setTimeout(() => {
        commit2("setToastHidden");
      }, 6e3);
    },
    flushUserCache({ commit: commit2 }) {
      commit2("flushUserCache");
    }
  }
});
class ApiServiceError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = "ApiServiceError";
  }
}
const fetchOperations = {
  baseUrl: "/api",
  async handleResponse(response) {
    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        throw new ApiServiceError("Unauthorized", response.status);
      }
      throw new ApiServiceError(await response.text() || "Bad response from the server", response.status);
    }
    if (response.status === 204) {
      return null;
    }
    const responseData = await response.json();
    return responseData;
  },
  async get(endpoint) {
    try {
      authService.isAuthenticated();
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${store.state.token}`
        }
      });
      return await this.handleResponse(response);
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw error;
      }
      throw new Error("Failed to fetch data.");
    }
  },
  async post(endpoint, data) {
    try {
      authService.isAuthenticated();
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${store.state.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      return await this.handleResponse(response);
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw error;
      }
      throw new Error("Failed to post data.");
    }
  },
  async put(endpoint, data) {
    try {
      authService.isAuthenticated();
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${store.state.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      return await this.handleResponse(response);
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw error;
      }
      throw new Error("Failed to put data.");
    }
  },
  async delete(endpoint) {
    try {
      authService.isAuthenticated();
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${store.state.token}`,
          "Content-Type": "application/json"
        }
      });
      return await this.handleResponse(response);
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw error;
      }
      throw new Error("Failed to delete data.");
    }
  }
};
const apiService = {
  /**
   * Get user info from server if not in cache
   * @param {string} uid
   * @returns {Promise<User>} user info
   * @throws {Error} failed to fetch user info
   */
  async fetchUserInfo(uid2) {
    const cachedUser = store.state.userCache[uid2];
    if (cachedUser) {
      return cachedUser;
    }
    const user = await fetchOperations.get(`/users/${uid2}`);
    store.commit("addUserToCache", user);
    return user;
  },
  /**
   * Fetch users from server
   * @param {int} pageSize The number of users to fetch
   * @param {int} lastUserId The id of the last user fetched
   * @param {string} query Search query
   * @returns {Promise<User[]>} Array of users
   * @throws {Error} failed to fetch users
   */
  async fetchUsers(pageSize, lastUserId = null, query = null) {
    let endpoint = `/users?page_size=${pageSize}`;
    if (lastUserId !== null) {
      endpoint += `&last_id=${lastUserId}`;
    }
    if (query !== null) {
      endpoint += `&query=${query}`;
    }
    return await fetchOperations.get(endpoint);
  },
  /**
   * Fetch posts from server
   * @param {int} pageSize The number of posts to fetch
   * @param {int} lastPostId The id of the last post fetched
   * @param {string} query Search query
   * @param {int} likedBy Filter posts by user id that liked the post
   * @returns {Promise<Post[]>} Array of posts
   * @throws {Error} failed to fetch posts
   */
  async fetchPosts(pageSize, lastPostId = null, query = null, likedBy = null) {
    let endpoint = `/posts?page_size=${pageSize}`;
    if (lastPostId !== null) {
      endpoint += `&last_id=${lastPostId}`;
    }
    if (query !== null) {
      endpoint += `&query=${query}`;
    }
    if (likedBy !== null) {
      endpoint += `&liked_by=${likedBy}`;
    }
    return await fetchOperations.get(endpoint);
  },
  /**
   * Fetch post from server
   * @param {string|int} pid The id of the post to fetch
   * @returns {Promise<Post>} Post
   * @throws {Error} failed to fetch post
   */
  async fetchPost(pid) {
    return await fetchOperations.get(`/posts/${pid}`);
  },
  /**
   * Fetch comments from server
   * @param {string|int} pid The id of the post to fetch comments from
   * @param {int} pageSize The number of comments to fetch
   * @param {int} lastCommentId The id of the last comment fetched
   * @returns {Promise<Comment[]>} Array of comments
   */
  async fetchUserFeedPosts(uid2, pageSize, lastPostId = null) {
    let endpoint = `/users/${uid2}/posts/feed?page_size=${pageSize}`;
    if (lastPostId !== null) {
      endpoint += `&last_id=${lastPostId}`;
    }
    return await fetchOperations.get(endpoint);
  },
  /**
   * Fetch the user's posts from server
   * @param {string|int} uid The id of the user to fetch posts from
   * @param {int} pageSize The number of posts to fetch
   * @param {int} lastPostId The id of the last post fetched
   * @param {boolean} hasImage Filter posts by whether they have an image
   * @returns {Promise<Post[]>} Array of posts
   * @throws {Error} failed to fetch posts
   */
  async fetchUserPosts(uid2, pageSize, lastPostId = null, hasImage = null, descending = true) {
    let endpoint = `/users/${uid2}/posts?page_size=${pageSize}&descending=${descending}`;
    if (lastPostId !== null) {
      endpoint += `&last_id=${lastPostId}`;
    }
    if (hasImage !== null) {
      endpoint += `&has_image=${hasImage}`;
    }
    return await fetchOperations.get(endpoint);
  },
  /**
   * Update user profile picture
   * @param {string|int} uid The id of the user to update
   * @param {File} profilePicture The new profile picture
   * @returns {Promise<{profile_picture: string}>} The new profile picture name
   * @throws {Error} failed to update profile picture
   */
  async updateProfilePicture(uid2, profilePicture) {
    try {
      const fromData = new FormData();
      fromData.append("image", profilePicture);
      const response = await fetch(`/api/users/${uid2}/profile-picture`, {
        method: "PUT",
        body: fromData,
        headers: {
          "Authorization": `Bearer ${store.state.token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to update profile picture. Bad response from server.");
      }
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      throw new Error("Failed to update profile picture.");
    }
  },
  /**
   * Update user banner picture
   * @param {string|int} uid 
   * @param {File} bannerPicture 
   * @returns {Promise<{banner_picture: string}>} The new banner picture name
   * @throws {Error} failed to update banner picture
   */
  async updateBannerPicture(uid2, bannerPicture) {
    try {
      const formData = new FormData();
      formData.append("image", bannerPicture);
      const response = await fetch(`/api/users/${uid2}/banner-picture`, {
        method: "PUT",
        body: formData,
        headers: {
          "Authorization": `Bearer ${store.state.token}`
        }
      });
      if (response.status === 400) {
        throw new Error("Failed to update banner picture. Bad request.");
      }
      if (!response.ok) {
        throw new Error("Failed to update banner picture. Bad response from server.");
      }
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      throw new Error(error.message || "Failed to update banner picture.");
    }
  },
  /**
   * Update user info
   * @param {string|int} uid The id of the user to update
   * @param {Object} userInfo The new user info
   * @returns {Promise<Object>} The new user info
   * @throws {Error} failed to update user info
   */
  async updateUserInfo(uid2, userInfo) {
    try {
      const response = await fetch(`/api/users/${uid2}`, {
        method: "PUT",
        body: JSON.stringify(userInfo),
        headers: {
          "Authorization": `Bearer ${store.state.token}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(await response.text() || "Failed to update user info. Bad response from server.");
      }
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      throw new Error(error.message || "Failed to update user info.");
    }
  },
  /**
   * Create new post
   * @param {string|int} uid The id of the user to create post for
   * @param {NewPost} post The new post
   * @returns {Promise<Post>} The new post
   * @throws {Error} failed to create new post
   */
  async newPost(uid2, post) {
    try {
      const requestForm = new FormData();
      requestForm.append("image", post.image);
      requestForm.append("content", post.content);
      requestForm.append("title", post.title);
      const response = await fetch(`/api/users/${uid2}/posts`, {
        method: "POST",
        body: requestForm,
        headers: {
          "Authorization": `Bearer ${store.state.token}`
        }
      });
      if (!response.ok) {
        throw new Error(await response.text() || "Failed to create new post. Bad response from server.");
      }
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      throw new Error(error.message || "Failed to create new post.");
    }
  },
  /**
   * Delete post
   * @param {string|int} uid The id of the user to delete post for
   * @param {string|int} pid The id of the post to delete
   * @returns {Promise<void>}
   * @throws {Error} failed to delete post
   */
  async deletePost(uid2, pid) {
    await fetchOperations.delete(`/users/${uid2}/posts/${pid}`);
    return;
  },
  /**
   * Follow user
   * @param {string|int} uid The id of the user to follow
   * @param {string|int} followedUid The id of the user to be followed
   * @returns {Promise<string>} Success message
   * @throws {Error} failed to follow user
   */
  async followUser(uid2, followedUid) {
    await fetchOperations.post(`/users/${uid2}/follows/${followedUid}`);
    return "Followed user successfully.";
  },
  /**
   * Check if user is following another user
   * @param {string|int} uid The id of the user to check
   * @param {string|int} followedUid The id of the user to be checked
   * @returns {Promise<boolean>} True if user is following another user, false otherwise
   * @throws {Error} failed to check follow
   */
  async checkFollow(uid2, followedUid) {
    const response = await fetchOperations.get(`/users/${uid2}/follows/${followedUid}`);
    return response.is_following;
  },
  /**
   * Unfollow user
   * @param {string|int} uid The id of the user to unfollow
   * @param {string|int} followedUid The id of the user to be unfollowed
   * @returns {Promise<void>}
   * @throws {Error} failed to unfollow user
   */
  async unfollowUser(uid2, followedUid) {
    await fetchOperations.delete(`/users/${uid2}/follows/${followedUid}`);
    return;
  },
  /**
   * Get user's followers
   * @param {string|int} uid The id of the user to get followers for
   * @param {string|int} lastFollowId The id of the last follow to get
   * @returns {Promise<Follow[]>} The user's followers
   * @throws {Error} failed to get followers
   */
  async getFollowing(uid2, lastFollowId = null) {
    let endpoint = `/users/${uid2}/follows`;
    if (lastFollowId !== null) {
      endpoint += `?last_follow_id=${lastFollowId}`;
    }
    return await fetchOperations.get(endpoint);
  },
  /**
   * Like post
   * @param {string|int} uid The id of the user to like post for
   * @param {string|int} pid The id of the post to like
   * @returns {Promise<void>}
   * @throws {Error} failed to like post
   */
  async likePost(uid2, postId) {
    await fetchOperations.post(`/users/${uid2}/posts/${postId}/likes`);
    return;
  },
  /**
   * Unlike post
   * @param {string|int} uid The id of the user to unlike post for
   * @param {string|int} pid The id of the post to unlike
   * @returns {Promise<void>}
   * @throws {Error} failed to unlike post
   */
  async unlikePost(uid2, postId) {
    await fetchOperations.delete(`/users/${uid2}/posts/${postId}/likes`);
    return;
  },
  /**
   * Check if user has liked a post
   * @param {string|int} uid The id of the user to check
   * @param {string|int} pid The id of the post to be checked
   * @returns {Promise<boolean>} True if user has liked post, false otherwise
   * @throws {Error} failed to check like
   */
  async checkLike(uid2, postId) {
    const response = await fetchOperations.get(`/users/${uid2}/posts/${postId}/likes`);
    return response.is_liked;
  },
  /**
   * Calls the API to add a comment to a post
   * @param {string|int} uid The id of the user to add comment for
   * @param {string|int} pid The id of the post to add comment to
   * @param {string} comment The comment to add
   * @returns {Promise<void>}
   * @throws {Error} failed to add comment
   */
  async addComment(uid2, postId, comment) {
    return await fetchOperations.post(`/users/${uid2}/posts/${postId}/comments`, comment);
  },
  /**
   * Calls the API to fetch comments for a post
   * @param {string|int} postId The id of the post to fetch comments for
   * @param {int} pageSize The number of comments to fetch
   * @param {string|int} lastId The id of the last comment to fetch
   * @returns {Promise<Comment[]>} The comments for the post
   */
  async fetchComments(postId, pageSize = 10, lastId = null) {
    let responseUrl = `/posts/${postId}/comments?page_size=${pageSize}`;
    if (lastId !== null) {
      responseUrl += `&last_id=${lastId}`;
    }
    return await fetchOperations.get(responseUrl);
  },
  /**
   * Calls the API to delete the user's account
   * @param {string|int} uid The id of the user to delete
   * @returns {Promise<void>}
   * @throws {Error} failed to delete account
   */
  async deleteAccount(uid2) {
    await fetchOperations.delete(`/users/${uid2}`);
  }
};
const authService = {
  /**
   * Login user
   * @param {string} username
   * @param {string} password
   * @returns {Promise<void>}
   * @throws {Error} failed to login
   **/
  async login(username, password) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      });
      if (response.status === 401) {
        throw new Error("Login failed. Please check your username and password.");
      }
      if (!response.ok) {
        throw new Error("Failed to login. Bad response from server.");
      }
      const responseData = await response.json();
      await this.authenticateByToken(responseData.access_token);
    } catch (error) {
      throw new Error(error.message || "Failed to login.");
    }
  },
  /**
   * Logout user
   * @returns {void}
   */
  logout() {
    localStorage.removeItem("web_app");
    localStorage.removeItem("userProfilePostsSort");
    store.commit("setToken", null);
    store.commit("setUid", null);
    store.commit("setUsername", null);
    store.commit("setIsLoggedIn", false);
    store.commit("setProfilePicture", null);
    store.commit("setBannerPicture", null);
    store.commit("setAboutMe", null);
    router.push("/login");
  },
  /**
   * Authenticate user by local storage
   * @returns {Promise<void>}
   * @throws {Error} failed to authenticate
   */
  async authenticateByStorage() {
    const storage_content = JSON.parse(localStorage.getItem("web_app"));
    if (!storage_content) {
      throw new Error("No storage content.");
    }
    const { token } = storage_content;
    try {
      await this.authenticateByToken(token);
    } catch (error) {
      localStorage.removeItem("web_app");
      throw error;
    }
  },
  /**
   * Authenticate user by token
   * @returns {Promise<void>}
   * @throws {Error} failed to authenticate
   * @throws {Error} token expired
   */
  async authenticateByToken(token) {
    const decodedToken = decodeJwt(token);
    const exp = decodedToken.exp;
    const uid2 = decodedToken.uid;
    const now2 = Date.now() / 1e3;
    if (exp < now2) {
      this.logout();
      throw new Error("Token expired.");
    }
    try {
      const userInfo = await apiService.fetchUserInfo(uid2);
      const storage_content = {
        token,
        uid: uid2
      };
      localStorage.setItem("web_app", JSON.stringify(storage_content));
      store.commit("setToken", token);
      store.commit("setUid", uid2);
      store.commit("setUsername", userInfo.username);
      store.commit("setIsLoggedIn", true);
      store.commit("setProfilePicture", userInfo.profile_picture);
      store.commit("setBannerPicture", userInfo.banner_picture);
      store.commit("setAboutMe", userInfo.about_me);
    } catch (error) {
      localStorage.removeItem("web_app");
      throw error;
    }
  },
  /**
   * Register user
   * @param {string} username
   * @param {string} password
   * @param {string} email
   * @returns {Promise<void>}
   * @throws {Error} failed to register
   */
  async register(username, password, email) {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password,
          email
        })
      });
      if (!response.ok) {
        throw new Error(await response.text() || "Failed to register.");
      }
      const responseData = await response.json();
      await this.authenticateByToken(responseData.access_token);
    } catch (error) {
      throw new Error(error.message || "Failed to register.");
    }
  },
  /**
   * Check if user is authenticated
   * @returns {boolean}
   * @throws {Error} failed to check authentication
   * @throws {Error} token expired
   */
  isAuthenticated() {
    const token = store.state.token;
    if (!token) {
      return false;
    }
    const decodedToken = decodeJwt(token);
    const exp = decodedToken.exp;
    const now2 = Date.now() / 1e3;
    if (exp < now2) {
      this.logout();
      throw new Error("Token expired.");
    }
    return true;
  }
};
const NavigationHamburger_vue_vue_type_style_index_0_scoped_8e9038f6_lang = "";
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$u = {
  name: "NavigationHamburger",
  data() {
    return {
      open: false
    };
  },
  methods: {
    toggleMenu() {
      this.open = !this.open;
    },
    logout() {
      authService.logout();
    }
  },
  computed: {
    isLoggedIn() {
      return this.$store.state.isLoggedIn;
    }
  }
};
const _withScopeId$g = (n) => (pushScopeId("data-v-8e9038f6"), n = n(), popScopeId(), n);
const _hoisted_1$n = /* @__PURE__ */ _withScopeId$g(() => /* @__PURE__ */ createBaseVNode("svg", {
  viewBox: "0 0 100 80",
  width: "30",
  height: "30"
}, [
  /* @__PURE__ */ createBaseVNode("rect", {
    width: "100",
    height: "15"
  }),
  /* @__PURE__ */ createBaseVNode("rect", {
    y: "30",
    width: "100",
    height: "15"
  }),
  /* @__PURE__ */ createBaseVNode("rect", {
    y: "60",
    width: "100",
    height: "15"
  })
], -1));
const _hoisted_2$m = [
  _hoisted_1$n
];
const _hoisted_3$f = {
  key: 1,
  class: "menu"
};
const _hoisted_4$c = /* @__PURE__ */ _withScopeId$g(() => /* @__PURE__ */ createBaseVNode("i", null, [
  /* @__PURE__ */ createBaseVNode("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    fill: "currentColor",
    class: "bi bi-search",
    viewBox: "0 0 16 16"
  }, [
    /* @__PURE__ */ createBaseVNode("path", { d: "M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" })
  ])
], -1));
const _hoisted_5$c = /* @__PURE__ */ _withScopeId$g(() => /* @__PURE__ */ createBaseVNode("i", null, [
  /* @__PURE__ */ createBaseVNode("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    fill: "currentColor",
    class: "bi bi-house",
    viewBox: "0 0 16 16"
  }, [
    /* @__PURE__ */ createBaseVNode("path", { d: "M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z" })
  ])
], -1));
const _hoisted_6$c = /* @__PURE__ */ _withScopeId$g(() => /* @__PURE__ */ createBaseVNode("i", null, [
  /* @__PURE__ */ createBaseVNode("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    fill: "currentColor",
    class: "bi bi-door-open",
    viewBox: "0 0 16 16"
  }, [
    /* @__PURE__ */ createBaseVNode("path", { d: "M8.5 10c-.276 0-.5-.448-.5-1s.224-1 .5-1 .5.448.5 1-.224 1-.5 1z" }),
    /* @__PURE__ */ createBaseVNode("path", { d: "M10.828.122A.5.5 0 0 1 11 .5V1h.5A1.5 1.5 0 0 1 13 2.5V15h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V1.5a.5.5 0 0 1 .43-.495l7-1a.5.5 0 0 1 .398.117zM11.5 2H11v13h1V2.5a.5.5 0 0 0-.5-.5zM4 1.934V15h6V1.077l-6 .857z" })
  ])
], -1));
const _hoisted_7$c = /* @__PURE__ */ _withScopeId$g(() => /* @__PURE__ */ createBaseVNode("i", null, [
  /* @__PURE__ */ createBaseVNode("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    fill: "currentColor",
    class: "bi bi-pencil-square",
    viewBox: "0 0 16 16"
  }, [
    /* @__PURE__ */ createBaseVNode("path", { d: "M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" }),
    /* @__PURE__ */ createBaseVNode("path", {
      "fill-rule": "evenodd",
      d: "M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
    })
  ])
], -1));
const _hoisted_8$b = /* @__PURE__ */ _withScopeId$g(() => /* @__PURE__ */ createBaseVNode("i", null, [
  /* @__PURE__ */ createBaseVNode("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    fill: "currentColor",
    class: "bi bi-person",
    viewBox: "0 0 16 16"
  }, [
    /* @__PURE__ */ createBaseVNode("path", { d: "M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z" })
  ])
], -1));
const _hoisted_9$9 = /* @__PURE__ */ _withScopeId$g(() => /* @__PURE__ */ createBaseVNode("i", null, [
  /* @__PURE__ */ createBaseVNode("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    fill: "currentColor",
    class: "bi bi-gear",
    viewBox: "0 0 16 16"
  }, [
    /* @__PURE__ */ createBaseVNode("path", { d: "M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" }),
    /* @__PURE__ */ createBaseVNode("path", { d: "M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" })
  ])
], -1));
const _hoisted_10$8 = /* @__PURE__ */ _withScopeId$g(() => /* @__PURE__ */ createBaseVNode("i", null, [
  /* @__PURE__ */ createBaseVNode("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    fill: "currentColor",
    class: "bi bi-box-arrow-left",
    viewBox: "0 0 16 16"
  }, [
    /* @__PURE__ */ createBaseVNode("path", {
      "fill-rule": "evenodd",
      d: "M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0v2z"
    }),
    /* @__PURE__ */ createBaseVNode("path", {
      "fill-rule": "evenodd",
      d: "M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3z"
    })
  ])
], -1));
function _sfc_render$u(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_router_link = resolveComponent("router-link");
  return openBlock(), createElementBlock(Fragment, null, [
    !$data.open ? (openBlock(), createElementBlock("button", {
      key: 0,
      class: "hamburger",
      onClick: _cache[0] || (_cache[0] = (...args) => $options.toggleMenu && $options.toggleMenu(...args))
    }, _hoisted_2$m)) : createCommentVNode("", true),
    $data.open ? (openBlock(), createElementBlock("nav", _hoisted_3$f, [
      $options.isLoggedIn ? (openBlock(), createBlock(_component_router_link, {
        key: 0,
        to: "/search",
        onClick: $options.toggleMenu
      }, {
        default: withCtx(() => [
          _hoisted_4$c,
          createTextVNode(" Search ")
        ]),
        _: 1
      }, 8, ["onClick"])) : createCommentVNode("", true),
      $options.isLoggedIn ? (openBlock(), createBlock(_component_router_link, {
        key: 1,
        to: "/new-post",
        onClick: $options.toggleMenu
      }, {
        default: withCtx(() => [
          createTextVNode("New post")
        ]),
        _: 1
      }, 8, ["onClick"])) : createCommentVNode("", true),
      createVNode(_component_router_link, {
        to: "/",
        onClick: $options.toggleMenu
      }, {
        default: withCtx(() => [
          _hoisted_5$c,
          createTextVNode(" Home")
        ]),
        _: 1
      }, 8, ["onClick"]),
      !$options.isLoggedIn ? (openBlock(), createBlock(_component_router_link, {
        key: 2,
        to: "/login",
        onClick: $options.toggleMenu
      }, {
        default: withCtx(() => [
          _hoisted_6$c,
          createTextVNode(" Login")
        ]),
        _: 1
      }, 8, ["onClick"])) : createCommentVNode("", true),
      !$options.isLoggedIn ? (openBlock(), createBlock(_component_router_link, {
        key: 3,
        to: "/register",
        onClick: $options.toggleMenu
      }, {
        default: withCtx(() => [
          _hoisted_7$c,
          createTextVNode(" Register")
        ]),
        _: 1
      }, 8, ["onClick"])) : createCommentVNode("", true),
      $options.isLoggedIn ? (openBlock(), createBlock(_component_router_link, {
        key: 4,
        to: "/user/" + this.$store.state.uid,
        onClick: $options.toggleMenu
      }, {
        default: withCtx(() => [
          _hoisted_8$b,
          createTextVNode(" Profile")
        ]),
        _: 1
      }, 8, ["to", "onClick"])) : createCommentVNode("", true),
      $options.isLoggedIn ? (openBlock(), createBlock(_component_router_link, {
        key: 5,
        to: "/settings",
        onClick: $options.toggleMenu
      }, {
        default: withCtx(() => [
          _hoisted_9$9,
          createTextVNode(" Settings")
        ]),
        _: 1
      }, 8, ["onClick"])) : createCommentVNode("", true),
      $options.isLoggedIn ? (openBlock(), createElementBlock("button", {
        key: 6,
        onClick: _cache[1] || (_cache[1] = (...args) => $options.logout && $options.logout(...args))
      }, [
        _hoisted_10$8,
        createTextVNode(" Logout")
      ])) : createCommentVNode("", true),
      createBaseVNode("button", {
        onClick: _cache[2] || (_cache[2] = (...args) => $options.toggleMenu && $options.toggleMenu(...args))
      }, "Close")
    ])) : createCommentVNode("", true)
  ], 64);
}
const NavigationHamburger = /* @__PURE__ */ _export_sfc(_sfc_main$u, [["render", _sfc_render$u], ["__scopeId", "data-v-8e9038f6"]]);
const NavigationBar_vue_vue_type_style_index_0_scoped_ed1cb75a_lang = "";
const _sfc_main$t = {
  name: "NavigationBar",
  data() {
    return {
      profileDropdownOpen: false,
      scrollTimer: null,
      isNavbarHidden: false,
      prevPos: 0,
      isScrolled: false
    };
  },
  methods: {
    logout() {
      authService.logout();
    },
    handleScroll() {
      clearTimeout(this.scrollTimer);
      this.isScrolled = window.scrollY !== 0;
      const crntPos = window.scrollY;
      const isScrollingDown = crntPos > this.prevPos;
      if (isScrollingDown && this.isScrolled) {
        this.isNavbarHidden = true;
      } else {
        this.isNavbarHidden = false;
      }
      this.prevPos = crntPos;
      this.scrollTimer = setTimeout(() => {
      }, 50);
    }
  },
  computed: {
    isLoggedIn() {
      return this.$store.state.isLoggedIn;
    },
    profilePicture() {
      return `http://localhost:5000/images/users/${this.$store.state.profilePicture}`;
    },
    isTransparent() {
      let path = this.$route.path;
      path = path.split("/")[1];
      if (path === "user" && !this.isScrolled) {
        return true;
      }
      return false;
    }
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }
};
const _withScopeId$f = (n) => (pushScopeId("data-v-ed1cb75a"), n = n(), popScopeId(), n);
const _hoisted_1$m = /* @__PURE__ */ _withScopeId$f(() => /* @__PURE__ */ createBaseVNode("div", { class: "logo-wrapper" }, [
  /* @__PURE__ */ createBaseVNode("img", {
    src: "http://localhost:5000/images/icons/logo-pixian.png",
    alt: "logo"
  })
], -1));
const _hoisted_2$l = { class: "quick-access" };
const _hoisted_3$e = { class: "links" };
const _hoisted_4$b = {
  key: 0,
  class: "auth"
};
const _hoisted_5$b = {
  key: 1,
  class: "auth"
};
const _hoisted_6$b = /* @__PURE__ */ _withScopeId$f(() => /* @__PURE__ */ createBaseVNode("path", {
  d: "M6.34317 7.75732L4.92896 9.17154L12 16.2426L19.0711 9.17157L17.6569 7.75735L12 13.4142L6.34317 7.75732Z",
  fill: "currentColor"
}, null, -1));
const _hoisted_7$b = [
  _hoisted_6$b
];
const _hoisted_8$a = ["src"];
function _sfc_render$t(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_router_link = resolveComponent("router-link");
  return openBlock(), createElementBlock("div", {
    id: "navbar",
    class: normalizeClass({
      hidden: $data.isNavbarHidden,
      transparent: $options.isTransparent
    }),
    onMouseleave: _cache[4] || (_cache[4] = ($event) => $data.profileDropdownOpen = false)
  }, [
    _hoisted_1$m,
    createBaseVNode("nav", _hoisted_2$l, [
      createBaseVNode("div", _hoisted_3$e, [
        $options.isLoggedIn ? (openBlock(), createBlock(_component_router_link, {
          key: 0,
          to: "/"
        }, {
          default: withCtx(() => [
            createTextVNode("Home")
          ]),
          _: 1
        })) : createCommentVNode("", true),
        $options.isLoggedIn ? (openBlock(), createBlock(_component_router_link, {
          key: 1,
          to: "/search"
        }, {
          default: withCtx(() => [
            createTextVNode("Search")
          ]),
          _: 1
        })) : createCommentVNode("", true),
        $options.isLoggedIn ? (openBlock(), createBlock(_component_router_link, {
          key: 2,
          to: "/new-post"
        }, {
          default: withCtx(() => [
            createTextVNode("New post")
          ]),
          _: 1
        })) : createCommentVNode("", true)
      ]),
      !$options.isLoggedIn ? (openBlock(), createElementBlock("div", _hoisted_4$b, [
        createVNode(_component_router_link, {
          to: "/login",
          class: "login"
        }, {
          default: withCtx(() => [
            createTextVNode("Login")
          ]),
          _: 1
        }),
        createVNode(_component_router_link, {
          to: "/register",
          class: "register"
        }, {
          default: withCtx(() => [
            createTextVNode("Register")
          ]),
          _: 1
        })
      ])) : createCommentVNode("", true),
      $options.isLoggedIn ? (openBlock(), createElementBlock("div", _hoisted_5$b, [
        createBaseVNode("div", null, [
          (openBlock(), createElementBlock("svg", {
            width: "24",
            height: "24",
            viewBox: "0 0 24 24",
            xmlns: "http://www.w3.org/2000/svg",
            onMouseover: _cache[0] || (_cache[0] = ($event) => $data.profileDropdownOpen = true),
            fill: "currentColor",
            class: normalizeClass({ active: $data.profileDropdownOpen })
          }, _hoisted_7$b, 34))
        ]),
        createBaseVNode("img", {
          src: $options.profilePicture,
          alt: "profile",
          onMouseover: _cache[1] || (_cache[1] = ($event) => $data.profileDropdownOpen = true)
        }, null, 40, _hoisted_8$a),
        $data.profileDropdownOpen ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: "profile-dropdown",
          onMouseleave: _cache[2] || (_cache[2] = ($event) => $data.profileDropdownOpen = false)
        }, [
          createVNode(_component_router_link, {
            to: "/user/" + _ctx.$store.state.uid
          }, {
            default: withCtx(() => [
              createTextVNode("Profile")
            ]),
            _: 1
          }, 8, ["to"]),
          createVNode(_component_router_link, { to: "/settings" }, {
            default: withCtx(() => [
              createTextVNode("Settings")
            ]),
            _: 1
          })
        ], 32)) : createCommentVNode("", true),
        createBaseVNode("button", {
          onClick: _cache[3] || (_cache[3] = (...args) => $options.logout && $options.logout(...args))
        }, "Logout")
      ])) : createCommentVNode("", true)
    ])
  ], 34);
}
const NavigationBar = /* @__PURE__ */ _export_sfc(_sfc_main$t, [["render", _sfc_render$t], ["__scopeId", "data-v-ed1cb75a"]]);
const _sfc_main$s = {
  name: "NavigationMenu",
  components: {
    NavigationBar,
    NavigationHamburger
  },
  data() {
    return {
      windowSize: {
        width: 0,
        height: 0
      }
    };
  },
  created() {
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    handleResize() {
      this.windowSize.width = window.innerWidth;
      this.windowSize.height = window.innerHeight;
    }
  },
  computed: {
    isCollapsed() {
      return this.windowSize.width <= 800;
    }
  }
};
function _sfc_render$s(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_NavigationBar = resolveComponent("NavigationBar");
  const _component_NavigationHamburger = resolveComponent("NavigationHamburger");
  return openBlock(), createElementBlock(Fragment, null, [
    !$options.isCollapsed ? (openBlock(), createBlock(_component_NavigationBar, { key: 0 })) : createCommentVNode("", true),
    $options.isCollapsed ? (openBlock(), createBlock(_component_NavigationHamburger, { key: 1 })) : createCommentVNode("", true)
  ], 64);
}
const NavigationMenu = /* @__PURE__ */ _export_sfc(_sfc_main$s, [["render", _sfc_render$s]]);
const ToastNotifier_vue_vue_type_style_index_0_scoped_877bdcc0_lang = "";
const _sfc_main$r = {
  name: "ToastNotifier",
  computed: {
    visible() {
      return this.$store.state.toastVisible;
    },
    message() {
      return this.$store.state.toastMessage;
    }
  }
};
const _withScopeId$e = (n) => (pushScopeId("data-v-877bdcc0"), n = n(), popScopeId(), n);
const _hoisted_1$l = {
  key: 0,
  xmlns: "http://www.w3.org/2000/svg",
  width: "16",
  height: "16",
  class: "bi bi-exclamation-circle",
  viewBox: "0 0 16 16",
  fill: "currentColor"
};
const _hoisted_2$k = /* @__PURE__ */ _withScopeId$e(() => /* @__PURE__ */ createBaseVNode("path", { d: "M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" }, null, -1));
const _hoisted_3$d = /* @__PURE__ */ _withScopeId$e(() => /* @__PURE__ */ createBaseVNode("path", { d: "M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" }, null, -1));
const _hoisted_4$a = [
  _hoisted_2$k,
  _hoisted_3$d
];
const _hoisted_5$a = {
  key: 1,
  xmlns: "http://www.w3.org/2000/svg",
  width: "16",
  height: "16",
  fill: "currentColor",
  class: "bi bi-check",
  viewBox: "0 0 16 16"
};
const _hoisted_6$a = /* @__PURE__ */ _withScopeId$e(() => /* @__PURE__ */ createBaseVNode("path", { d: "M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" }, null, -1));
const _hoisted_7$a = [
  _hoisted_6$a
];
const _hoisted_8$9 = /* @__PURE__ */ _withScopeId$e(() => /* @__PURE__ */ createBaseVNode("i", null, [
  /* @__PURE__ */ createBaseVNode("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    fill: "currentColor",
    class: "bi bi-x-lg",
    viewBox: "0 0 16 16"
  }, [
    /* @__PURE__ */ createBaseVNode("path", { d: "M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" })
  ])
], -1));
const _hoisted_9$8 = [
  _hoisted_8$9
];
function _sfc_render$r(_ctx, _cache, $props, $setup, $data, $options) {
  return $options.visible ? (openBlock(), createElementBlock("div", {
    key: 0,
    class: normalizeClass(["toast", $options.message.type])
  }, [
    $options.message.type === "error" ? (openBlock(), createElementBlock("svg", _hoisted_1$l, _hoisted_4$a)) : createCommentVNode("", true),
    $options.message.type === "success" ? (openBlock(), createElementBlock("svg", _hoisted_5$a, _hoisted_7$a)) : createCommentVNode("", true),
    createBaseVNode("p", null, [
      createTextVNode(toDisplayString($options.message.message) + " ", 1),
      createBaseVNode("span", {
        class: "close",
        onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$store.commit("setToastHidden"))
      }, _hoisted_9$8)
    ])
  ], 2)) : createCommentVNode("", true);
}
const ToastNotifier = /* @__PURE__ */ _export_sfc(_sfc_main$r, [["render", _sfc_render$r], ["__scopeId", "data-v-877bdcc0"]]);
const _sfc_main$q = {
  components: {
    RouterView,
    NavigationMenu,
    ToastNotifier
  },
  data() {
    return {
      finishedLoading: false
    };
  },
  async mounted() {
    try {
      await authService.authenticateByStorage();
    } catch (error) {
    }
    if (this.$store.state.token) {
      try {
        await apiService.fetchUserInfo(this.$store.state.uid);
      } catch (error) {
        this.$store.dispatch("addToast", {
          type: "error",
          message: "Unable to fetch user info"
        });
      }
    }
    this.finishedLoading = true;
  }
};
function _sfc_render$q(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_NavigationMenu = resolveComponent("NavigationMenu");
  const _component_router_view = resolveComponent("router-view");
  const _component_ToastNotifier = resolveComponent("ToastNotifier");
  return openBlock(), createElementBlock(Fragment, null, [
    $data.finishedLoading ? (openBlock(), createBlock(_component_NavigationMenu, { key: 0 })) : createCommentVNode("", true),
    $data.finishedLoading ? (openBlock(), createBlock(_component_router_view, { key: 1 })) : createCommentVNode("", true),
    createVNode(_component_ToastNotifier)
  ], 64);
}
const App = /* @__PURE__ */ _export_sfc(_sfc_main$q, [["render", _sfc_render$q]]);
const PostCompact_vue_vue_type_style_index_0_scoped_1fcdcea9_lang = "";
const _sfc_main$p = {
  name: "PostCompact",
  data() {
    return {
      loading: true,
      userProfilePicture: "",
      username: ""
    };
  },
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  computed: {
    hasImage() {
      return this.post.image !== null;
    },
    profilePictureSrc() {
      return `http://localhost:5000/images/users/${this.userProfilePicture}`;
    },
    imageSrc() {
      return `http://localhost:5000/images/posts/${this.post.image}`;
    }
  },
  async mounted() {
    try {
      const response = await apiService.fetchUserInfo(this.post.uid);
      this.userProfilePicture = response.profile_picture;
      this.username = response.username;
      this.loading = false;
    } catch (error) {
      this.$store.dispatch("addToast", {
        message: error.message,
        type: "error"
      });
    }
  }
};
const _withScopeId$d = (n) => (pushScopeId("data-v-1fcdcea9"), n = n(), popScopeId(), n);
const _hoisted_1$k = { class: "header" };
const _hoisted_2$j = { class: "title" };
const _hoisted_3$c = { class: "body read-more" };
const _hoisted_4$9 = ["src"];
const _hoisted_5$9 = { class: "footer" };
const _hoisted_6$9 = /* @__PURE__ */ _withScopeId$d(() => /* @__PURE__ */ createBaseVNode("i", null, [
  /* @__PURE__ */ createBaseVNode("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    fill: "currentColor",
    class: "bi bi-chat",
    viewBox: "0 0 16 16"
  }, [
    /* @__PURE__ */ createBaseVNode("path", { d: "M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z" })
  ])
], -1));
const _hoisted_7$9 = /* @__PURE__ */ _withScopeId$d(() => /* @__PURE__ */ createBaseVNode("i", null, [
  /* @__PURE__ */ createBaseVNode("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    fill: "currentColor",
    class: "bi bi-hand-thumbs-up",
    viewBox: "0 0 16 16"
  }, [
    /* @__PURE__ */ createBaseVNode("path", { d: "M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z" })
  ])
], -1));
function _sfc_render$p(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_router_link = resolveComponent("router-link");
  return openBlock(), createElementBlock("div", {
    class: "result",
    onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$router.push(`/post/${$props.post.id}`))
  }, [
    createBaseVNode("div", _hoisted_1$k, [
      createVNode(_component_router_link, {
        to: "/user/" + $props.post.uid,
        style: normalizeStyle({ backgroundImage: `url(${$options.profilePictureSrc})` }),
        class: "avatar"
      }, null, 8, ["to", "style"]),
      createVNode(_component_router_link, {
        to: "/user/" + $props.post.uid,
        class: "name"
      }, {
        default: withCtx(() => [
          createTextVNode(toDisplayString(this.username), 1)
        ]),
        _: 1
      }, 8, ["to"])
    ]),
    createBaseVNode("h3", _hoisted_2$j, toDisplayString($props.post.title), 1),
    createBaseVNode("div", _hoisted_3$c, [
      $options.hasImage ? (openBlock(), createElementBlock("img", {
        key: 0,
        src: $options.imageSrc,
        class: "preview-image"
      }, null, 8, _hoisted_4$9)) : createCommentVNode("", true),
      createBaseVNode("p", null, toDisplayString($props.post.content), 1)
    ]),
    createBaseVNode("div", _hoisted_5$9, [
      createBaseVNode("span", null, [
        _hoisted_6$9,
        createTextVNode(" " + toDisplayString($props.post.comment_count), 1)
      ]),
      createBaseVNode("span", null, [
        _hoisted_7$9,
        createTextVNode(" " + toDisplayString($props.post.like_count), 1)
      ])
    ])
  ]);
}
const PostCompact = /* @__PURE__ */ _export_sfc(_sfc_main$p, [["render", _sfc_render$p], ["__scopeId", "data-v-1fcdcea9"]]);
const UserResult_vue_vue_type_style_index_0_scoped_e2e2a1e1_lang = "";
const _sfc_main$o = {
  name: "UserResult",
  components: {
    RouterLink
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  computed: {
    profilePictureSrc() {
      return `http://localhost:5000/images/users/${this.user.profile_picture}`;
    }
  }
};
function _sfc_render$o(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_router_link = resolveComponent("router-link");
  return openBlock(), createElementBlock("div", {
    class: "result user-result",
    onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$router.push(`/user/${$props.user.id}`))
  }, [
    createVNode(_component_router_link, {
      to: "/user/" + $props.user.id,
      style: normalizeStyle({ backgroundImage: `url(${$options.profilePictureSrc})` }),
      class: "avatar"
    }, null, 8, ["to", "style"]),
    createVNode(_component_router_link, {
      to: "/user/" + $props.user.id,
      class: "username"
    }, {
      default: withCtx(() => [
        createTextVNode(toDisplayString($props.user.username), 1)
      ]),
      _: 1
    }, 8, ["to"])
  ]);
}
const UserResult = /* @__PURE__ */ _export_sfc(_sfc_main$o, [["render", _sfc_render$o], ["__scopeId", "data-v-e2e2a1e1"]]);
const SearchView_vue_vue_type_style_index_0_scoped_a9a2127a_lang = "";
const _sfc_main$n = {
  name: "SearchView",
  data() {
    return {
      searchQuery: "",
      searchTimeout: null,
      loadMoreTimeout: null,
      posts: [],
      users: []
    };
  },
  components: {
    PostCompact,
    UserResult
  },
  computed: {
    type() {
      if (this.$route.query.type === void 0) {
        return "post";
      }
      return this.$route.query.type;
    },
    lastPostId() {
      if (this.posts.length === 0) {
        return null;
      }
      return this.posts[this.posts.length - 1].id;
    },
    lastUserId() {
      if (this.users.length === 0) {
        return null;
      }
      return this.users[this.users.length - 1].id;
    }
  },
  methods: {
    async searchPosts() {
      try {
        const response = await apiService.fetchPosts(10, null, this.searchQuery);
        this.posts = response;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async searchUsers() {
      try {
        const response = await apiService.fetchUsers(10, null, this.searchQuery);
        this.users = response;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async search() {
      clearTimeout(this.searchTimeout);
      if (this.searchQuery === "") {
        this.posts = [];
        this.users = [];
        return;
      }
      this.searchTimeout = setTimeout(async () => {
        if (this.type === "post") {
          await this.searchPosts();
        } else {
          await this.searchUsers();
        }
      }, 500);
    },
    async loadMorePosts() {
      try {
        const response = await apiService.fetchPosts(10, this.lastPostId, this.searchQuery);
        this.posts.push(...response);
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async loadMoreUsers() {
      try {
        const response = await apiService.fetchUsers(10, this.lastUserId, this.searchQuery);
        this.users.push(...response);
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    handleScroll() {
      clearTimeout(this.loadMoreTimeout);
      const loadAhead = 100;
      const pageHeight = document.documentElement.offsetHeight - window.innerHeight;
      const crntScroll = window.scrollY + loadAhead;
      if (crntScroll < pageHeight) {
        return;
      }
      if (this.type === "post") {
        this.loadMoreTimeout = setTimeout(this.loadMorePosts.bind(this), 1e3);
      } else {
        this.loadMoreTimeout = setTimeout(this.loadMoreUsers.bind(this), 1e3);
      }
    }
  },
  watch: {
    type(newType, oldType) {
      if (oldType === newType) {
        return;
      }
      clearTimeout(this.searchTimeout);
      clearTimeout(this.loadMoreTimeout);
      if (newType === "post") {
        this.users = [];
        this.searchQuery = "";
      } else {
        this.posts = [];
        this.searchQuery = "";
      }
    }
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    this.$store.dispatch("flushUserCache");
  }
};
const _withScopeId$c = (n) => (pushScopeId("data-v-a9a2127a"), n = n(), popScopeId(), n);
const _hoisted_1$j = { class: "container" };
const _hoisted_2$i = { class: "inner" };
const _hoisted_3$b = { class: "filters" };
const _hoisted_4$8 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("button", { class: "btn btn-primary" }, "New Post", -1));
const _hoisted_5$8 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("p", null, "Type", -1));
const _hoisted_6$8 = { key: 0 };
const _hoisted_7$8 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: "16",
  height: "16",
  fill: "currentColor",
  class: "bi bi-check",
  viewBox: "0 0 16 16"
}, [
  /* @__PURE__ */ createBaseVNode("path", { d: "M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" })
], -1));
const _hoisted_8$8 = [
  _hoisted_7$8
];
const _hoisted_9$7 = { key: 0 };
const _hoisted_10$7 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: "16",
  height: "16",
  fill: "currentColor",
  class: "bi bi-check",
  viewBox: "0 0 16 16"
}, [
  /* @__PURE__ */ createBaseVNode("path", { d: "M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" })
], -1));
const _hoisted_11$5 = [
  _hoisted_10$7
];
const _hoisted_12$4 = { class: "search-wrapper" };
const _hoisted_13$3 = { class: "search-input" };
const _hoisted_14$3 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("span", null, [
  /* @__PURE__ */ createBaseVNode("i", null, [
    /* @__PURE__ */ createBaseVNode("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      width: "16",
      height: "16",
      fill: "currentColor",
      class: "bi bi-search",
      viewBox: "0 0 16 16"
    }, [
      /* @__PURE__ */ createBaseVNode("path", { d: "M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" })
    ])
  ])
], -1));
const _hoisted_15$2 = { class: "search-results" };
function _sfc_render$n(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_router_link = resolveComponent("router-link");
  const _component_post_compact = resolveComponent("post-compact");
  const _component_user_result = resolveComponent("user-result");
  return openBlock(), createElementBlock("div", _hoisted_1$j, [
    createBaseVNode("div", _hoisted_2$i, [
      createBaseVNode("div", _hoisted_3$b, [
        createVNode(_component_router_link, {
          to: "/new-post",
          style: { "padding-left": "0", "margin-top": "0" }
        }, {
          default: withCtx(() => [
            _hoisted_4$8
          ]),
          _: 1
        }),
        _hoisted_5$8,
        createVNode(_component_router_link, {
          to: "/search",
          class: normalizeClass({ active: $options.type === "post" })
        }, {
          default: withCtx(() => [
            $options.type === "post" ? (openBlock(), createElementBlock("i", _hoisted_6$8, _hoisted_8$8)) : createCommentVNode("", true),
            createTextVNode(" Posts")
          ]),
          _: 1
        }, 8, ["class"]),
        createVNode(_component_router_link, {
          to: "/search?type=user",
          class: normalizeClass({ active: $options.type === "user" })
        }, {
          default: withCtx(() => [
            $options.type === "user" ? (openBlock(), createElementBlock("i", _hoisted_9$7, _hoisted_11$5)) : createCommentVNode("", true),
            createTextVNode(" Users")
          ]),
          _: 1
        }, 8, ["class"])
      ]),
      createBaseVNode("div", _hoisted_12$4, [
        createBaseVNode("div", _hoisted_13$3, [
          _hoisted_14$3,
          withDirectives(createBaseVNode("input", {
            type: "text",
            placeholder: "Search...",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.searchQuery = $event),
            onInput: _cache[1] || (_cache[1] = (...args) => $options.search && $options.search(...args))
          }, null, 544), [
            [vModelText, $data.searchQuery]
          ])
        ]),
        createBaseVNode("div", _hoisted_15$2, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(this.posts, (post) => {
            return openBlock(), createBlock(_component_post_compact, {
              key: post.id,
              post
            }, null, 8, ["post"]);
          }), 128)),
          (openBlock(true), createElementBlock(Fragment, null, renderList(this.users, (user) => {
            return openBlock(), createBlock(_component_user_result, {
              key: user.id,
              user
            }, null, 8, ["user"]);
          }), 128))
        ])
      ])
    ])
  ]);
}
const SearchView = /* @__PURE__ */ _export_sfc(_sfc_main$n, [["render", _sfc_render$n], ["__scopeId", "data-v-a9a2127a"]]);
const SettingsView_vue_vue_type_style_index_0_scoped_e8f09780_lang = "";
const _sfc_main$m = {
  name: "SettingsView",
  components: {
    RouterView
  },
  computed: {
    currentRoute() {
      return this.$route.path;
    }
  }
};
const _hoisted_1$i = { class: "container" };
const _hoisted_2$h = { class: "inner" };
function _sfc_render$m(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_router_link = resolveComponent("router-link");
  const _component_router_view = resolveComponent("router-view");
  return openBlock(), createElementBlock("div", _hoisted_1$i, [
    createBaseVNode("div", _hoisted_2$h, [
      createBaseVNode("nav", null, [
        createVNode(_component_router_link, {
          to: "/settings",
          class: normalizeClass({ active: $options.currentRoute === "/settings" })
        }, {
          default: withCtx(() => [
            createTextVNode("Profile")
          ]),
          _: 1
        }, 8, ["class"]),
        createVNode(_component_router_link, {
          to: "/settings/account",
          class: normalizeClass({ active: $options.currentRoute === "/settings/account" })
        }, {
          default: withCtx(() => [
            createTextVNode("Account")
          ]),
          _: 1
        }, 8, ["class"])
      ]),
      createVNode(_component_router_view)
    ])
  ]);
}
const SettingsView = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["render", _sfc_render$m], ["__scopeId", "data-v-e8f09780"]]);
const FormFileInput_vue_vue_type_style_index_0_scoped_06349a16_lang = "";
const _sfc_main$l = {
  name: "FormFileInput",
  props: {
    placeholderMsg: {
      type: String,
      required: true
    },
    handler: {
      type: Function,
      required: false
    },
    allowedFileTypes: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: false
    }
  },
  methods: {
    handleUpload(event) {
      this.handler(event);
    }
  }
};
const _hoisted_1$h = { class: "upload-wrapper" };
const _hoisted_2$g = ["name", "accept"];
function _sfc_render$l(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", _hoisted_1$h, [
    createBaseVNode("input", {
      type: "file",
      name: $props.name,
      onChange: _cache[0] || (_cache[0] = (...args) => $options.handleUpload && $options.handleUpload(...args)),
      accept: $props.allowedFileTypes
    }, null, 40, _hoisted_2$g),
    createBaseVNode("p", null, toDisplayString($props.placeholderMsg), 1)
  ]);
}
const FormFileInput = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$l], ["__scopeId", "data-v-06349a16"]]);
const TextareaField_vue_vue_type_style_index_0_scoped_804b93f4_lang = "";
const _sfc_main$k = {
  name: "TextareaField",
  expose: ["blurHandler"],
  emits: ["update:modelValue", "onValidityChange"],
  inheritAttrs: false,
  data() {
    return {
      fieldHasError: false
    };
  },
  props: {
    modelValue: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      required: true
    },
    maxLength: {
      type: Number,
      required: true
    },
    validateFunc: {
      type: Function,
      required: true
    },
    errorMessage: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: false
    },
    id: {
      type: String,
      required: false
    },
    style: {
      type: String,
      required: false
    }
  },
  methods: {
    blurHandler(event) {
      const isValid = this.validateFunc(event.target.value);
      this.fieldHasError = !isValid;
      this.$emit("onValidityChange", isValid);
    },
    updateValue(event) {
      const isValid = this.validateFunc(event.target.value);
      this.$emit("update:modelValue", event.target.value);
      this.$emit("onValidityChange", isValid);
      if (this.fieldHasError) {
        this.fieldHasError = !this.validateFunc(event.target.value);
      }
    }
  },
  computed: {
    letterCount() {
      return this.modelValue.length;
    }
  }
};
const _hoisted_1$g = ["name", "id", "placeholder", "value"];
const _hoisted_2$f = { class: "letter-count" };
const _hoisted_3$a = {
  key: 0,
  class: "error-text"
};
function _sfc_render$k(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock(Fragment, null, [
    createBaseVNode("div", {
      class: "text-area",
      style: normalizeStyle($props.style)
    }, [
      createBaseVNode("textarea", {
        name: $props.name,
        id: $props.id,
        placeholder: $props.placeholder,
        value: $props.modelValue,
        class: normalizeClass({ error: this.fieldHasError }),
        onBlur: _cache[0] || (_cache[0] = (...args) => $options.blurHandler && $options.blurHandler(...args)),
        onInput: _cache[1] || (_cache[1] = (event) => $options.updateValue(event))
      }, null, 42, _hoisted_1$g),
      createBaseVNode("p", _hoisted_2$f, toDisplayString($options.letterCount) + "/" + toDisplayString($props.maxLength), 1)
    ], 4),
    this.fieldHasError && $props.errorMessage ? (openBlock(), createElementBlock("p", _hoisted_3$a, toDisplayString($props.errorMessage), 1)) : createCommentVNode("", true)
  ], 64);
}
const TextareaField = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["render", _sfc_render$k], ["__scopeId", "data-v-804b93f4"]]);
const ProfileSettings_vue_vue_type_style_index_0_scoped_77c698d5_lang = "";
const _sfc_main$j = {
  name: "ProfileSettings",
  data() {
    return {
      about: this.$store.state.aboutMe
    };
  },
  components: {
    FormFileInput,
    TextareaField
  },
  methods: {
    async changeAvatar(event) {
      const file = event.target.files[0];
      try {
        const response = await apiService.updateProfilePicture(this.$store.state.uid, file);
        this.$store.commit("setProfilePicture", response.profile_picture);
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async changeBanner(event) {
      const file = event.target.files[0];
      try {
        const response = await apiService.updateBannerPicture(this.$store.state.uid, file);
        this.$store.commit("setBannerPicture", response.banner_picture);
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async updateAboutMe() {
      const userInfo = {
        about_me: this.about
      };
      try {
        const response = await apiService.updateUserInfo(this.$store.state.uid, userInfo);
        this.$store.commit("setAboutMe", response.about_me);
        this.$store.dispatch("addToast", {
          message: "About me updated",
          type: "success"
        });
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    validateAboutMe(about) {
      return about.length > 0 && about.length <= 200;
    }
  },
  computed: {
    profilePicture() {
      return `http://localhost:5000/images/users/${this.$store.state.profilePicture}`;
    },
    bannerPicture() {
      return `http://localhost:5000/images/users/${this.$store.state.bannerPicture}`;
    },
    letterCount() {
      return this.about.length;
    },
    aboutHasError() {
      return this.letterCount >= 200;
    },
    aboutIsInvalid() {
      return this.aboutHasError || this.about.length === 0;
    }
  }
};
const _withScopeId$b = (n) => (pushScopeId("data-v-77c698d5"), n = n(), popScopeId(), n);
const _hoisted_1$f = /* @__PURE__ */ _withScopeId$b(() => /* @__PURE__ */ createBaseVNode("h1", null, "Profile settings", -1));
const _hoisted_2$e = { class: "container" };
const _hoisted_3$9 = { class: "section" };
const _hoisted_4$7 = /* @__PURE__ */ _withScopeId$b(() => /* @__PURE__ */ createBaseVNode("h2", null, "About me", -1));
const _hoisted_5$7 = ["disabled"];
const _hoisted_6$7 = { class: "section" };
const _hoisted_7$7 = /* @__PURE__ */ _withScopeId$b(() => /* @__PURE__ */ createBaseVNode("h2", null, "Avatar", -1));
const _hoisted_8$7 = ["src"];
const _hoisted_9$6 = { class: "section" };
const _hoisted_10$6 = /* @__PURE__ */ _withScopeId$b(() => /* @__PURE__ */ createBaseVNode("h2", null, " Profile banner ", -1));
function _sfc_render$j(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_textarea_field = resolveComponent("textarea-field");
  const _component_FormFileInput = resolveComponent("FormFileInput");
  return openBlock(), createElementBlock(Fragment, null, [
    _hoisted_1$f,
    createBaseVNode("div", _hoisted_2$e, [
      createBaseVNode("div", _hoisted_3$9, [
        _hoisted_4$7,
        createBaseVNode("form", {
          onSubmit: _cache[1] || (_cache[1] = withModifiers((...args) => $options.updateAboutMe && $options.updateAboutMe(...args), ["prevent"]))
        }, [
          createVNode(_component_textarea_field, {
            modelValue: $data.about,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.about = $event),
            "max-length": 200,
            placeholder: "Tell us about yourself",
            style: { "width": "100vw", "max-width": "500px" },
            "validate-func": $options.validateAboutMe
          }, null, 8, ["modelValue", "validate-func"]),
          createBaseVNode("button", {
            type: "submit",
            class: "btn btn-primary",
            disabled: $options.aboutIsInvalid
          }, "Save", 8, _hoisted_5$7)
        ], 32)
      ]),
      createBaseVNode("div", _hoisted_6$7, [
        _hoisted_7$7,
        createBaseVNode("form", {
          onSubmit: _cache[2] || (_cache[2] = withModifiers((...args) => $options.changeAvatar && $options.changeAvatar(...args), ["prevent"]))
        }, [
          createBaseVNode("img", {
            src: $options.profilePicture,
            alt: "profile",
            class: "avtar-img"
          }, null, 8, _hoisted_8$7),
          createVNode(_component_FormFileInput, {
            type: "file",
            "placeholder-msg": "Click or drop here to change avatar",
            handler: $options.changeAvatar,
            allowedFileTypes: "image/gif, image/jpeg, image/png"
          }, null, 8, ["handler"])
        ], 32)
      ]),
      createBaseVNode("div", _hoisted_9$6, [
        _hoisted_10$6,
        createBaseVNode("form", {
          onSubmit: _cache[3] || (_cache[3] = withModifiers((...args) => $options.changeBanner && $options.changeBanner(...args), ["prevent"]))
        }, [
          createBaseVNode("div", {
            class: "banner-img",
            style: normalizeStyle({ backgroundImage: "url(" + $options.bannerPicture + ")" })
          }, null, 4),
          createVNode(_component_FormFileInput, {
            type: "file",
            "placeholder-msg": "Click or drop here to change banner",
            handler: $options.changeBanner,
            allowedFileTypes: "image/jpeg, image/png"
          }, null, 8, ["handler"])
        ], 32)
      ])
    ])
  ], 64);
}
const ProfileSettings = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$j], ["__scopeId", "data-v-77c698d5"]]);
const FormField_vue_vue_type_style_index_0_scoped_7a93109d_lang = "";
const _sfc_main$i = {
  expose: ["blurHandler"],
  emits: ["update:modelValue", "onValidityChange"],
  data() {
    return {
      fieldHasError: false,
      fieldIsValid: false
    };
  },
  props: {
    type: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      required: true
    },
    modelValue: {
      type: String,
      required: true
    },
    validateFunc: {
      type: Function,
      required: true
    },
    errorMessage: {
      type: String,
      required: true
    },
    style: {
      type: String,
      required: false
    }
  },
  methods: {
    blurHandler() {
      const isValid = this.validateFunc(this.modelValue);
      this.fieldIsValid = isValid;
      this.fieldHasError = !isValid;
      this.$emit("onValidityChange", isValid);
    },
    updateValue(event) {
      this.$emit("update:modelValue", event.target.value);
      const isValid = this.validateFunc(event.target.value);
      this.fieldIsValid = isValid;
      this.$emit("onValidityChange", isValid);
      if (this.fieldHasError) {
        this.fieldHasError = !isValid;
      }
    }
  },
  watch: {
    value(value) {
      this.hasError = !this.validateFunc(value);
    }
  }
};
const _hoisted_1$e = ["type", "placeholder", "value"];
const _hoisted_2$d = {
  key: 0,
  class: "error-text"
};
function _sfc_render$i(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock(Fragment, null, [
    createBaseVNode("input", {
      type: $props.type,
      class: normalizeClass([{ error: $data.fieldHasError }]),
      placeholder: $props.placeholder,
      value: $props.modelValue,
      onBlur: _cache[0] || (_cache[0] = (...args) => $options.blurHandler && $options.blurHandler(...args)),
      onInput: _cache[1] || (_cache[1] = (event) => $options.updateValue(event)),
      style: normalizeStyle($props.style)
    }, null, 46, _hoisted_1$e),
    $data.fieldHasError ? (openBlock(), createElementBlock("p", _hoisted_2$d, toDisplayString($props.errorMessage), 1)) : createCommentVNode("", true)
  ], 64);
}
const FormField = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$i], ["__scopeId", "data-v-7a93109d"]]);
function validateGeneriLength(value, min, max) {
  if (!value) {
    return false;
  }
  if (value.length < min || value.length > max) {
    return false;
  }
  return true;
}
const validationService = {
  /**
   * Validate username
   * @param {string} username
   * @returns {boolean} true if username is valid
   */
  validateUsername(username) {
    if (!username) {
      return false;
    }
    if (/\s/.test(username)) {
      return false;
    }
    return validateGeneriLength(username, 3, 50);
  },
  /**
   * Validate email
   * @param {string} email
   * @returns {boolean} true if email is valid
   */
  validateEmail(email) {
    const re = "^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$";
    if (!email.match(re)) {
      return false;
    }
    return true;
  },
  /**
   * Validate password
   * @param {string} password
   * @returns {boolean} true if password is valid
   */
  validatePassword(password) {
    return validateGeneriLength(password, 8, 128);
  },
  /**
   * Validate post content
   * @param {string} content 
   * @returns 
   */
  validatePostContent(content) {
    return validateGeneriLength(content, 1, 200);
  },
  /**
   * Validate post title
   * @param {string} title
   * @returns {boolean} true if title is valid
   */
  validatePostTitle(title) {
    return validateGeneriLength(title, 1, 50);
  },
  /**
   * Validate comment content
   * @param {string} content
   * @returns {boolean} true if content is valid
   */
  validateCommentContent(content) {
    if (content.trim() == "") {
      return false;
    }
    return validateGeneriLength(content, 1, 100);
  }
};
const AccountSettings_vue_vue_type_style_index_0_scoped_8a375ccd_lang = "";
const _sfc_main$h = {
  name: "AccountSettings",
  components: {
    FormField
  },
  data() {
    return {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      email: "",
      username: this.$store.state.username,
      oldPasswordIsValid: false,
      newPasswordIsValid: false,
      confirmPasswordIsValid: false,
      emailIsValid: false,
      usernameIsValid: false
    };
  },
  methods: {
    validatePassword(password) {
      return validationService.validatePassword(password);
    },
    validateConfirmPassword(confirmPassword) {
      return confirmPassword === this.newPassword;
    },
    validateEmail(email) {
      return validationService.validateEmail(email);
    },
    validateUsername(username) {
      return validationService.validateUsername(username);
    },
    async submitNewPassword() {
      const formVaild = this.oldPasswordIsValid && this.newPasswordIsValid && this.confirmPasswordIsValid;
      if (!formVaild) {
        this.$refs.oldPasswordField.blurHandler();
        this.$refs.newPasswordField.blurHandler();
        this.$refs.confirmPasswordField.blurHandler();
        return;
      }
      try {
        const userInfo = {
          old_password: this.oldPassword,
          new_password: this.newPassword
        };
        await apiService.updateUserInfo(this.$store.state.uid, userInfo);
        this.$store.dispatch("addToast", {
          message: "Successfully updated password",
          type: "success"
        });
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async submitNewEmail() {
      const formVaild = this.emailIsValid;
      if (!formVaild) {
        this.$refs.emailField.blurHandler();
        return;
      }
      try {
        const userInfo = {
          email: this.email
        };
        await apiService.updateUserInfo(this.$store.state.uid, userInfo);
      } catch (error) {
        this.$store.dispatch("addToast", error.message);
      }
    },
    async submitNewUsername() {
      const formVaild = this.usernameIsValid;
      if (!formVaild) {
        this.$refs.usernameField.blurHandler();
        return;
      }
      if (this.username === this.$store.state.username) {
        this.$store.dispatch("addToast", {
          message: "Username is the same",
          type: "error"
        });
        return;
      }
      try {
        const userInfo = {
          username: this.username
        };
        const response = await apiService.updateUserInfo(this.$store.state.uid, userInfo);
        this.$store.commit("setUsername", response.username);
        this.$store.dispatch("addToast", {
          message: "Username updated",
          type: "success"
        });
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async deleteAccount() {
      try {
        await apiService.deleteAccount(this.$store.state.uid);
        authService.logout();
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    }
  }
};
const _withScopeId$a = (n) => (pushScopeId("data-v-8a375ccd"), n = n(), popScopeId(), n);
const _hoisted_1$d = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("h1", null, "Account settings", -1));
const _hoisted_2$c = { class: "container" };
const _hoisted_3$8 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("h2", null, "Change password", -1));
const _hoisted_4$6 = { class: "field-wrapper" };
const _hoisted_5$6 = { class: "field-wrapper" };
const _hoisted_6$6 = { class: "field-wrapper" };
const _hoisted_7$6 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("br", null, null, -1));
const _hoisted_8$6 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("button", { type: "submit" }, "Save", -1));
const _hoisted_9$5 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("h2", null, "Change email", -1));
const _hoisted_10$5 = { class: "field-wrapper" };
const _hoisted_11$4 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("br", null, null, -1));
const _hoisted_12$3 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("button", { type: "submit" }, "Save", -1));
const _hoisted_13$2 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("h2", null, "Change username", -1));
const _hoisted_14$2 = { class: "field-wrapper" };
const _hoisted_15$1 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("br", null, null, -1));
const _hoisted_16$1 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("button", { type: "submit" }, "Save", -1));
const _hoisted_17$1 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("h2", null, "Delete account", -1));
function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_FormField = resolveComponent("FormField");
  return openBlock(), createElementBlock(Fragment, null, [
    _hoisted_1$d,
    createBaseVNode("div", _hoisted_2$c, [
      createBaseVNode("section", null, [
        _hoisted_3$8,
        createBaseVNode("form", {
          onSubmit: _cache[6] || (_cache[6] = withModifiers((...args) => $options.submitNewPassword && $options.submitNewPassword(...args), ["prevent"]))
        }, [
          createBaseVNode("div", _hoisted_4$6, [
            createVNode(_component_FormField, {
              type: "password",
              placeholder: "Current password",
              "validate-func": $options.validatePassword,
              "model-value": $data.oldPassword,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.oldPassword = $event),
              "error-message": "Password is too short or too long",
              onOnValidityChange: _cache[1] || (_cache[1] = ($event) => $data.oldPasswordIsValid = $event),
              ref: "oldPasswordField"
            }, null, 8, ["validate-func", "model-value"])
          ]),
          createBaseVNode("div", _hoisted_5$6, [
            createVNode(_component_FormField, {
              type: "password",
              placeholder: "New password",
              "validate-func": $options.validatePassword,
              "model-value": $data.newPassword,
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.newPassword = $event),
              "error-message": "Password is too short or too long",
              onOnValidityChange: _cache[3] || (_cache[3] = ($event) => $data.newPasswordIsValid = $event),
              ref: "newPasswordField"
            }, null, 8, ["validate-func", "model-value"])
          ]),
          createBaseVNode("div", _hoisted_6$6, [
            createVNode(_component_FormField, {
              type: "password",
              placeholder: "Confirm new password",
              "validate-func": $options.validateConfirmPassword,
              "model-value": $data.confirmPassword,
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $data.confirmPassword = $event),
              "error-message": "Password doesn't match",
              onOnValidityChange: _cache[5] || (_cache[5] = ($event) => $data.confirmPasswordIsValid = $event),
              ref: "confirmPasswordField"
            }, null, 8, ["validate-func", "model-value"])
          ]),
          _hoisted_7$6,
          _hoisted_8$6
        ], 32)
      ]),
      createBaseVNode("section", null, [
        _hoisted_9$5,
        createBaseVNode("form", {
          onSubmit: _cache[9] || (_cache[9] = withModifiers((...args) => $options.submitNewEmail && $options.submitNewEmail(...args), ["prevent"]))
        }, [
          createBaseVNode("div", _hoisted_10$5, [
            createVNode(_component_FormField, {
              type: "email",
              placeholder: "New email",
              "validate-func": $options.validateEmail,
              "model-value": $data.email,
              "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $data.email = $event),
              "error-message": "Invalid email",
              onOnValidityChange: _cache[8] || (_cache[8] = ($event) => $data.emailIsValid = $event),
              ref: "emailField"
            }, null, 8, ["validate-func", "model-value"])
          ]),
          _hoisted_11$4,
          _hoisted_12$3
        ], 32)
      ]),
      createBaseVNode("section", null, [
        _hoisted_13$2,
        createBaseVNode("form", {
          onSubmit: _cache[12] || (_cache[12] = withModifiers((...args) => $options.submitNewUsername && $options.submitNewUsername(...args), ["prevent"]))
        }, [
          createBaseVNode("div", _hoisted_14$2, [
            createVNode(_component_FormField, {
              type: "text",
              placeholder: "New username",
              "validate-func": $options.validateUsername,
              "model-value": $data.username,
              "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => $data.username = $event),
              "error-message": "Username is of wrong length or contains spaces",
              onOnValidityChange: _cache[11] || (_cache[11] = ($event) => $data.usernameIsValid = $event),
              ref: "usernameField"
            }, null, 8, ["validate-func", "model-value"])
          ]),
          _hoisted_15$1,
          _hoisted_16$1
        ], 32)
      ]),
      createBaseVNode("section", null, [
        _hoisted_17$1,
        createBaseVNode("button", {
          onClick: _cache[13] || (_cache[13] = (...args) => $options.deleteAccount && $options.deleteAccount(...args)),
          class: "delete-btn"
        }, "Delete account")
      ])
    ])
  ], 64);
}
const AccountSettings = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$h], ["__scopeId", "data-v-8a375ccd"]]);
const FormCard_vue_vue_type_style_index_0_scoped_5c04225b_lang = "";
const _sfc_main$g = {};
const _hoisted_1$c = { class: "container" };
const _hoisted_2$b = { class: "inner" };
function _sfc_render$g(_ctx, _cache) {
  return openBlock(), createElementBlock("div", _hoisted_1$c, [
    createBaseVNode("div", _hoisted_2$b, [
      renderSlot(_ctx.$slots, "default", {}, void 0, true)
    ])
  ]);
}
const FormCard = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$g], ["__scopeId", "data-v-5c04225b"]]);
const LoginForm_vue_vue_type_style_index_0_scoped_575dc222_lang = "";
const _sfc_main$f = {
  data() {
    return {
      username: "",
      password: "",
      usernameIsValid: false,
      passwordIsValid: false
    };
  },
  methods: {
    async submit() {
      const fromValid = this.usernameIsValid && this.passwordIsValid;
      if (!fromValid) {
        this.$refs.usernameField.blurHandler();
        this.$refs.passwordField.blurHandler();
        return;
      }
      this.$emit("login", {
        username: this.username,
        password: this.password
      });
    },
    validateUsername(username) {
      return validationService.validateUsername(username);
    },
    validatePassword(password) {
      return validationService.validatePassword(password);
    }
  },
  components: { FormField }
};
const _withScopeId$9 = (n) => (pushScopeId("data-v-575dc222"), n = n(), popScopeId(), n);
const _hoisted_1$b = { class: "field-wrapper" };
const _hoisted_2$a = { class: "field-wrapper" };
const _hoisted_3$7 = /* @__PURE__ */ _withScopeId$9(() => /* @__PURE__ */ createBaseVNode("button", { type: "submit" }, "LOGIN", -1));
function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_FormField = resolveComponent("FormField");
  return openBlock(), createElementBlock("form", {
    onSubmit: _cache[4] || (_cache[4] = withModifiers((...args) => $options.submit && $options.submit(...args), ["prevent"]))
  }, [
    createBaseVNode("div", _hoisted_1$b, [
      createVNode(_component_FormField, {
        type: "text",
        placeholder: "Username",
        modelValue: $data.username,
        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.username = $event),
        validateFunc: $options.validateUsername,
        errorMessage: "Username is of wrong length or contains spaces",
        onOnValidityChange: _cache[1] || (_cache[1] = ($event) => $data.usernameIsValid = $event),
        ref: "usernameField"
      }, null, 8, ["modelValue", "validateFunc"])
    ]),
    createBaseVNode("div", _hoisted_2$a, [
      createVNode(_component_FormField, {
        type: "password",
        placeholder: "Password",
        modelValue: $data.password,
        "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.password = $event),
        validateFunc: $options.validatePassword,
        errorMessage: "Password is too short or too long",
        onOnValidityChange: _cache[3] || (_cache[3] = ($event) => $data.passwordIsValid = $event),
        ref: "passwordField"
      }, null, 8, ["modelValue", "validateFunc"])
    ]),
    _hoisted_3$7
  ], 32);
}
const LoginForm = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$f], ["__scopeId", "data-v-575dc222"]]);
const LoginView_vue_vue_type_style_index_0_scoped_a01cc90c_lang = "";
const _sfc_main$e = {
  components: {
    FormCard,
    LoginForm,
    RouterLink
  },
  name: "LoginView",
  methods: {
    async login(credentials) {
      try {
        const { username, password } = credentials;
        await authService.login(username, password);
        this.$router.push("/");
      } catch (error) {
        this.$store.dispatch(
          "addToast",
          {
            message: error.message,
            type: "error"
          }
        );
      }
    }
  },
  beforeCreate() {
    if (this.$store.state.token) {
      this.$router.push("/");
    }
  }
};
const _withScopeId$8 = (n) => (pushScopeId("data-v-a01cc90c"), n = n(), popScopeId(), n);
const _hoisted_1$a = /* @__PURE__ */ _withScopeId$8(() => /* @__PURE__ */ createBaseVNode("h2", null, "Login", -1));
const _hoisted_2$9 = /* @__PURE__ */ _withScopeId$8(() => /* @__PURE__ */ createBaseVNode("span", { style: { "color": "#707eff" } }, "Register here!", -1));
function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_LoginForm = resolveComponent("LoginForm");
  const _component_router_link = resolveComponent("router-link");
  const _component_FormCard = resolveComponent("FormCard");
  return openBlock(), createBlock(_component_FormCard, null, {
    default: withCtx(() => [
      _hoisted_1$a,
      createVNode(_component_LoginForm, { onLogin: $options.login }, null, 8, ["onLogin"]),
      createBaseVNode("p", null, [
        createVNode(_component_router_link, { to: "/register" }, {
          default: withCtx(() => [
            createTextVNode(" Don't have an account? "),
            _hoisted_2$9
          ]),
          _: 1
        })
      ])
    ]),
    _: 1
  });
}
const LoginView = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$e], ["__scopeId", "data-v-a01cc90c"]]);
const RegisterForm_vue_vue_type_style_index_0_scoped_ee766633_lang = "";
const _sfc_main$d = {
  data() {
    return {
      username: "",
      password: "",
      email: "",
      repeatPassword: "",
      usernameIsValid: false,
      emailIsValid: false,
      passwordIsValid: false,
      repeatPasswordIsValid: false
    };
  },
  methods: {
    async submit() {
      const fromValid = this.usernameIsValid && this.passwordIsValid && this.repeatPasswordIsValid && this.emailIsValid;
      if (!fromValid) {
        this.$refs.usernameField.blurHandler();
        this.$refs.passwordField.blurHandler();
        this.$refs.repeatPassword.blurHandler();
        this.$refs.emailField.blurHandler();
        return;
      }
      this.$emit("register", {
        username: this.username,
        password: this.password,
        email: this.email
      });
    },
    validateUsername(username) {
      return validationService.validateUsername(username);
    },
    validateEmail(email) {
      return validationService.validateEmail(email);
    },
    validatePassword(password) {
      return validationService.validatePassword(password);
    },
    validateRepeatPassword(repeatPassword) {
      return repeatPassword === this.password;
    }
  },
  components: { FormField }
};
const _withScopeId$7 = (n) => (pushScopeId("data-v-ee766633"), n = n(), popScopeId(), n);
const _hoisted_1$9 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("button", { type: "submit" }, "REGISTER", -1));
function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_FormField = resolveComponent("FormField");
  return openBlock(), createElementBlock("form", {
    onSubmit: _cache[8] || (_cache[8] = withModifiers((...args) => $options.submit && $options.submit(...args), ["prevent"]))
  }, [
    createVNode(_component_FormField, {
      type: "text",
      placeholder: "Username",
      modelValue: $data.username,
      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.username = $event),
      validateFunc: $options.validateUsername,
      errorMessage: "Username is of wrong length or contains spaces",
      onOnValidityChange: _cache[1] || (_cache[1] = ($event) => $data.usernameIsValid = $event),
      ref: "usernameField"
    }, null, 8, ["modelValue", "validateFunc"]),
    createVNode(_component_FormField, {
      type: "email",
      placeholder: "Email",
      modelValue: $data.email,
      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.email = $event),
      validateFunc: $options.validateEmail,
      errorMessage: "That is not a valid email",
      onOnValidityChange: _cache[3] || (_cache[3] = ($event) => $data.emailIsValid = $event),
      ref: "emailField"
    }, null, 8, ["modelValue", "validateFunc"]),
    createVNode(_component_FormField, {
      type: "password",
      placeholder: "Password",
      modelValue: $data.password,
      "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $data.password = $event),
      validateFunc: $options.validatePassword,
      errorMessage: "Password is too short or too long",
      onOnValidityChange: _cache[5] || (_cache[5] = ($event) => $data.passwordIsValid = $event),
      ref: "passwordField"
    }, null, 8, ["modelValue", "validateFunc"]),
    createVNode(_component_FormField, {
      type: "password",
      placeholder: "Repeat Password",
      modelValue: $data.repeatPassword,
      "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $data.repeatPassword = $event),
      validateFunc: $options.validateRepeatPassword,
      errorMessage: "Password does not match",
      onOnValidityChange: _cache[7] || (_cache[7] = ($event) => $data.repeatPasswordIsValid = $event),
      ref: "repeatPassword"
    }, null, 8, ["modelValue", "validateFunc"]),
    _hoisted_1$9
  ], 32);
}
const RegisterForm = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$d], ["__scopeId", "data-v-ee766633"]]);
const RegisterView_vue_vue_type_style_index_0_scoped_c58d7982_lang = "";
const _sfc_main$c = {
  components: {
    FormCard,
    RegisterForm,
    RouterLink
  },
  name: "RegisterView",
  methods: {
    async register(credentials) {
      try {
        const { username, password, email } = credentials;
        await authService.register(username, password, email);
        this.$router.push("/");
      } catch (error) {
        this.$store.dispatch(
          "addToast",
          {
            message: error.message,
            type: "error"
          }
        );
      }
    }
  },
  beforeCreate() {
    if (this.$store.state.token) {
      this.$router.push("/");
    }
  }
};
const _withScopeId$6 = (n) => (pushScopeId("data-v-c58d7982"), n = n(), popScopeId(), n);
const _hoisted_1$8 = /* @__PURE__ */ _withScopeId$6(() => /* @__PURE__ */ createBaseVNode("h2", null, "Register", -1));
const _hoisted_2$8 = /* @__PURE__ */ _withScopeId$6(() => /* @__PURE__ */ createBaseVNode("span", { style: { "color": "#707eff" } }, "Login here!", -1));
function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_RegisterForm = resolveComponent("RegisterForm");
  const _component_router_link = resolveComponent("router-link");
  const _component_FormCard = resolveComponent("FormCard");
  return openBlock(), createBlock(_component_FormCard, null, {
    default: withCtx(() => [
      _hoisted_1$8,
      createVNode(_component_RegisterForm, { onRegister: $options.register }, null, 8, ["onRegister"]),
      createBaseVNode("p", null, [
        createVNode(_component_router_link, { to: "/login" }, {
          default: withCtx(() => [
            createTextVNode(" Already have an account? "),
            _hoisted_2$8
          ]),
          _: 1
        })
      ])
    ]),
    _: 1
  });
}
const RegisterView = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$c], ["__scopeId", "data-v-c58d7982"]]);
const NewPostView_vue_vue_type_style_index_0_scoped_7ee034ea_lang = "";
const _sfc_main$b = {
  name: "NewPostView",
  data() {
    return {
      title: "",
      content: "",
      imageSrc: null,
      image: null,
      titleIsValid: false,
      bodyIsValid: false
    };
  },
  components: {
    FormFileInput,
    TextareaField
  },
  methods: {
    async submit() {
      const post = {
        title: this.title,
        content: this.content,
        image: this.image
      };
      if (!this.titleIsValid) {
        this.$store.dispatch("addToast", {
          message: "Title is invalid, must be between 1 and 50 characters",
          type: "error"
        });
        return;
      }
      if (!this.bodyIsValid) {
        this.$store.dispatch("addToast", {
          message: "Content is invalid, must be between 1 and 200 characters",
          type: "error"
        });
        return;
      }
      try {
        const response = await apiService.newPost(this.$store.state.uid, post);
        this.$store.dispatch("addToast", {
          message: "Post uploaded",
          type: "success"
        });
        this.$router.push(`/post/${response.id}`);
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    handleTitleChange() {
      this.titleIsValid = validationService.validatePostTitle(this.title);
    },
    handleImageChange(event) {
      const file = event.target.files[0];
      this.imageSrc = URL.createObjectURL(file);
      this.image = file;
    },
    validatePostContent(content) {
      return validationService.validatePostContent(content);
    }
  }
};
const _withScopeId$5 = (n) => (pushScopeId("data-v-7ee034ea"), n = n(), popScopeId(), n);
const _hoisted_1$7 = { class: "container" };
const _hoisted_2$7 = { class: "inner" };
const _hoisted_3$6 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("h1", null, "New post", -1));
const _hoisted_4$5 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("label", { for: "title" }, "Title", -1));
const _hoisted_5$5 = { class: "title-wrapper" };
const _hoisted_6$5 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("label", { for: "body" }, "Content", -1));
const _hoisted_7$5 = { class: "body-wrapper" };
const _hoisted_8$5 = { class: "image-file-wrapper" };
const _hoisted_9$4 = {
  key: 0,
  class: "image-preview-wrapper"
};
const _hoisted_10$4 = ["src"];
const _hoisted_11$3 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("div", { class: "button-wrapper" }, [
  /* @__PURE__ */ createBaseVNode("button", { type: "submit" }, "Upload")
], -1));
function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_textarea_field = resolveComponent("textarea-field");
  const _component_form_file_input = resolveComponent("form-file-input");
  return openBlock(), createElementBlock("div", _hoisted_1$7, [
    createBaseVNode("div", _hoisted_2$7, [
      _hoisted_3$6,
      createBaseVNode("form", {
        class: "form-wrapper",
        onSubmit: _cache[4] || (_cache[4] = withModifiers((...args) => $options.submit && $options.submit(...args), ["prevent"])),
        enctype: "multipart/form-data"
      }, [
        _hoisted_4$5,
        createBaseVNode("div", _hoisted_5$5, [
          withDirectives(createBaseVNode("input", {
            type: "text",
            placeholder: "Title",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => this.title = $event),
            name: "title",
            id: "title",
            maxlength: "50",
            onChange: _cache[1] || (_cache[1] = (...args) => $options.handleTitleChange && $options.handleTitleChange(...args))
          }, null, 544), [
            [vModelText, this.title]
          ])
        ]),
        _hoisted_6$5,
        createBaseVNode("div", _hoisted_7$5, [
          createVNode(_component_textarea_field, {
            placeholder: "Write your post here...",
            name: "body",
            id: "body",
            modelValue: this.content,
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => this.content = $event),
            validateFunc: $options.validatePostContent,
            onOnValidityChange: _cache[3] || (_cache[3] = ($event) => $data.bodyIsValid = $event),
            "max-length": 200,
            "error-message": "Content must be between 1 and 200 characters"
          }, null, 8, ["modelValue", "validateFunc"])
        ]),
        createBaseVNode("div", _hoisted_8$5, [
          createVNode(_component_form_file_input, {
            placeholderMsg: "Click or drag to include an image",
            name: "image",
            handler: $options.handleImageChange,
            allowedFileTypes: "image/jpeg, image/png"
          }, null, 8, ["handler"]),
          $data.imageSrc ? (openBlock(), createElementBlock("div", _hoisted_9$4, [
            createBaseVNode("img", {
              src: $data.imageSrc,
              alt: "Image preview"
            }, null, 8, _hoisted_10$4)
          ])) : createCommentVNode("", true)
        ]),
        _hoisted_11$3
      ], 32)
    ])
  ]);
}
const NewPostView = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$b], ["__scopeId", "data-v-7ee034ea"]]);
const UserProfileView_vue_vue_type_style_index_0_scoped_20d9c657_lang = "";
const _sfc_main$a = {
  name: "UserProfileView",
  data() {
    return {
      userImage: null,
      username: null,
      profilePicture: null,
      bannerPicture: null,
      loading: true,
      isFollowing: false
    };
  },
  components: {
    RouterView
  },
  methods: {
    async fetchUserInfo() {
      try {
        const response = await apiService.fetchUserInfo(this.uid);
        this.userImage = response.profile_picture;
        this.username = response.username;
        this.profilePicture = response.profile_picture;
        this.bannerPicture = response.banner_picture;
        this.isFollowing = await apiService.checkFollow(
          this.$store.state.uid,
          this.uid
        );
        this.loading = false;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async followUser() {
      try {
        await apiService.followUser(this.$store.state.uid, this.uid);
        this.$store.dispatch("addToast", {
          message: "Successfully followed user",
          type: "success"
        });
        this.isFollowing = true;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async unfollowUser() {
      try {
        await apiService.unfollowUser(this.$store.state.uid, this.uid);
        this.$store.dispatch("addToast", {
          message: "Successfully unfollowed user",
          type: "success"
        });
        this.isFollowing = false;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    }
  },
  computed: {
    profilePictureSrc() {
      return `http://localhost:5000/images/users/${this.profilePicture}`;
    },
    bannerPictureSrc() {
      return `http://localhost:5000/images/users/${this.bannerPicture}`;
    },
    uid() {
      return this.$route.params.uid;
    },
    isCurrentUser() {
      return String(this.$store.state.uid) === this.$route.params.uid;
    },
    activeTab() {
      const tab = this.$route.path.split("/")[3];
      if (tab === void 0) {
        return "posts";
      }
      return tab;
    }
  },
  async mounted() {
    if (this.isCurrentUser) {
      this.username = this.$store.state.username;
      this.profilePicture = this.$store.state.profilePicture;
      this.bannerPicture = this.$store.state.bannerPicture;
      this.loading = false;
      return;
    }
    await this.fetchUserInfo();
  },
  beforeUnmount() {
    this.$store.dispatch("flushUserCache");
  },
  watch: {
    async uid() {
      this.loading = true;
      await this.fetchUserInfo();
    }
  }
};
const _hoisted_1$6 = {
  key: 0,
  class: "container"
};
const _hoisted_2$6 = { class: "banner-info" };
const _hoisted_3$5 = { class: "banner-info-wrapper" };
const _hoisted_4$4 = ["src"];
const _hoisted_5$4 = { class: "banner-name-wrapper" };
const _hoisted_6$4 = { class: "username" };
const _hoisted_7$4 = { class: "navigation-container" };
const _hoisted_8$4 = { class: "navigation-wrapper" };
const _hoisted_9$3 = { class: "content-container" };
const _hoisted_10$3 = { class: "inner" };
function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_router_link = resolveComponent("router-link");
  const _component_router_view = resolveComponent("router-view");
  return !$data.loading ? (openBlock(), createElementBlock("div", _hoisted_1$6, [
    createBaseVNode("div", {
      class: "banner-image",
      style: normalizeStyle({ backgroundImage: `url(${$options.bannerPictureSrc})` })
    }, [
      createBaseVNode("div", _hoisted_2$6, [
        createBaseVNode("div", _hoisted_3$5, [
          createBaseVNode("img", {
            src: $options.profilePictureSrc,
            class: "avatar"
          }, null, 8, _hoisted_4$4),
          createBaseVNode("div", _hoisted_5$4, [
            createBaseVNode("h1", _hoisted_6$4, toDisplayString($data.username), 1)
          ]),
          !$options.isCurrentUser && !$data.isFollowing ? (openBlock(), createElementBlock("button", {
            key: 0,
            onClick: _cache[0] || (_cache[0] = (...args) => $options.followUser && $options.followUser(...args)),
            class: "follow-button"
          }, " Follow ")) : createCommentVNode("", true),
          !$options.isCurrentUser && $data.isFollowing ? (openBlock(), createElementBlock("button", {
            key: 1,
            onClick: _cache[1] || (_cache[1] = (...args) => $options.unfollowUser && $options.unfollowUser(...args)),
            class: "follow-button"
          }, " Unfollow ")) : createCommentVNode("", true)
        ])
      ])
    ], 4),
    createBaseVNode("div", _hoisted_7$4, [
      createBaseVNode("div", _hoisted_8$4, [
        createVNode(_component_router_link, {
          to: "/user/" + $options.uid,
          class: normalizeClass(["nav-link", { active: $options.activeTab === "posts" }])
        }, {
          default: withCtx(() => [
            createTextVNode("Posts")
          ]),
          _: 1
        }, 8, ["to", "class"]),
        createVNode(_component_router_link, {
          to: "/user/" + $options.uid + "/media",
          class: normalizeClass(["nav-link", { active: $options.activeTab === "media" }])
        }, {
          default: withCtx(() => [
            createTextVNode("Media")
          ]),
          _: 1
        }, 8, ["to", "class"]),
        createVNode(_component_router_link, {
          to: "/user/" + $options.uid + "/likes",
          class: normalizeClass(["nav-link", { active: $options.activeTab === "likes" }])
        }, {
          default: withCtx(() => [
            createTextVNode("Liked posts")
          ]),
          _: 1
        }, 8, ["to", "class"]),
        createVNode(_component_router_link, {
          to: "/user/" + $options.uid + "/follows",
          class: normalizeClass(["nav-link", { active: $options.activeTab === "follows" }])
        }, {
          default: withCtx(() => [
            createTextVNode("Follows")
          ]),
          _: 1
        }, 8, ["to", "class"]),
        createVNode(_component_router_link, {
          to: "/user/" + $options.uid + "/about",
          class: normalizeClass(["nav-link", { active: $options.activeTab === "about" }])
        }, {
          default: withCtx(() => [
            createTextVNode("About")
          ]),
          _: 1
        }, 8, ["to", "class"])
      ])
    ]),
    createBaseVNode("div", _hoisted_9$3, [
      createBaseVNode("div", _hoisted_10$3, [
        createVNode(_component_router_view)
      ])
    ])
  ])) : createCommentVNode("", true);
}
const UserProfileView = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$a], ["__scopeId", "data-v-20d9c657"]]);
const _sfc_main$9 = {
  name: "UserProfileFollowers",
  components: {
    UserResult
  },
  data() {
    return {
      followers: [],
      loading: true
    };
  },
  computed: {
    uid() {
      return this.$route.params.uid;
    },
    lastFollowId() {
      if (this.followers.length === 0) {
        return null;
      }
      return this.followers[this.followers.length - 1].id;
    }
  },
  methods: {
    async fetchFollowers() {
      try {
        const response = await apiService.getFollowing(this.uid, null);
        this.followers = response;
        this.loading = false;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async loadMore() {
      try {
        const response = await apiService.getFollowing(this.uid, this.lastFollowId);
        this.posts.push(...response);
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    }
  },
  handleScroll() {
    clearTimeout(this.loadMoreTimeout);
    const loadAhead = 100;
    const pageHeight = document.documentElement.offsetHeight - window.innerHeight;
    const crntScroll = window.scrollY + loadAhead;
    if (crntScroll < pageHeight) {
      return;
    }
    this.loadMoreTimeout = setTimeout(() => {
      this.loadMore();
    }, 500);
  },
  mounted() {
    this.fetchFollowers();
    this.loading = false;
    window.addEventListener("scroll", this.handleScroll);
  }
};
function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_user_result = resolveComponent("user-result");
  return openBlock(true), createElementBlock(Fragment, null, renderList($data.followers, (follower) => {
    return openBlock(), createElementBlock("div", {
      class: "result",
      key: follower.id
    }, [
      createVNode(_component_user_result, { user: follower }, null, 8, ["user"])
    ]);
  }), 128);
}
const UserProfileFollowers = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$9]]);
const UserProfilePosts_vue_vue_type_style_index_0_scoped_ce89ecd5_lang = "";
const _sfc_main$8 = {
  name: "UserProfilePosts",
  components: {
    PostCompact
  },
  data() {
    return {
      posts: [],
      loading: true,
      loadMoreTimeout: null,
      dropDownOpen: false,
      sorting: localStorage.getItem("userProfilePostsSort") || "new"
    };
  },
  computed: {
    uid() {
      return this.$route.params.uid;
    },
    lastPostId() {
      if (this.posts.length === 0) {
        return null;
      }
      return this.posts[this.posts.length - 1].id;
    },
    isDescending() {
      return this.sorting === "new";
    }
  },
  methods: {
    async fetchPosts() {
      try {
        const response = await apiService.fetchUserPosts(this.uid, 10, null, null, this.isDescending);
        this.posts = response;
        this.loading = false;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async loadMore() {
      try {
        const response = await apiService.fetchUserPosts(this.uid, 10, this.lastPostId, null, this.isDescending);
        this.posts.push(...response);
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    handleScroll() {
      clearTimeout(this.loadMoreTimeout);
      const loadAhead = 20;
      const pageHeight = document.documentElement.offsetHeight - window.innerHeight;
      const crntScroll = window.scrollY + loadAhead;
      if (crntScroll < pageHeight) {
        return;
      }
      this.loadMoreTimeout = setTimeout(() => {
        this.loadMore();
      }, 500);
    }
  },
  watch: {
    sorting(newVal) {
      this.loading = true;
      localStorage.setItem("userProfilePostsSort", newVal);
      this.dropDownOpen = false;
      this.posts = [];
      this.fetchPosts();
    }
  },
  mounted() {
    this.fetchPosts();
    this.loading = false;
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    clearTimeout(this.loadMoreTimeout);
  }
};
const _withScopeId$4 = (n) => (pushScopeId("data-v-ce89ecd5"), n = n(), popScopeId(), n);
const _hoisted_1$5 = { class: "drop-down sorting" };
const _hoisted_2$5 = /* @__PURE__ */ _withScopeId$4(() => /* @__PURE__ */ createBaseVNode("path", {
  d: "M6.34317 7.75732L4.92896 9.17154L12 16.2426L19.0711 9.17157L17.6569 7.75735L12 13.4142L6.34317 7.75732Z",
  fill: "currentColor"
}, null, -1));
const _hoisted_3$4 = [
  _hoisted_2$5
];
const _hoisted_4$3 = {
  key: 0,
  class: "body"
};
const _hoisted_5$3 = { class: "item" };
const _hoisted_6$3 = /* @__PURE__ */ _withScopeId$4(() => /* @__PURE__ */ createBaseVNode("label", { for: "sort-new" }, "New", -1));
const _hoisted_7$3 = { class: "item" };
const _hoisted_8$3 = /* @__PURE__ */ _withScopeId$4(() => /* @__PURE__ */ createBaseVNode("label", { for: "sort-old" }, "Old", -1));
function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_post_compact = resolveComponent("post-compact");
  return openBlock(), createElementBlock(Fragment, null, [
    createBaseVNode("div", _hoisted_1$5, [
      createBaseVNode("div", {
        class: "header",
        onClick: _cache[0] || (_cache[0] = ($event) => $data.dropDownOpen = !$data.dropDownOpen)
      }, [
        createBaseVNode("h3", null, [
          createTextVNode("Sort by " + toDisplayString($data.sorting) + " ", 1),
          (openBlock(), createElementBlock("svg", {
            width: "24",
            height: "24",
            viewBox: "0 0 24 24",
            xmlns: "http://www.w3.org/2000/svg",
            class: normalizeClass({ active: $data.dropDownOpen })
          }, _hoisted_3$4, 2))
        ])
      ]),
      $data.dropDownOpen ? (openBlock(), createElementBlock("div", _hoisted_4$3, [
        createBaseVNode("div", _hoisted_5$3, [
          withDirectives(createBaseVNode("input", {
            type: "radio",
            name: "sort",
            id: "sort-new",
            value: "new",
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.sorting = $event)
          }, null, 512), [
            [vModelRadio, $data.sorting]
          ]),
          _hoisted_6$3
        ]),
        createBaseVNode("div", _hoisted_7$3, [
          withDirectives(createBaseVNode("input", {
            type: "radio",
            name: "sort",
            id: "sort-old",
            value: "old",
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.sorting = $event)
          }, null, 512), [
            [vModelRadio, $data.sorting]
          ]),
          _hoisted_8$3
        ])
      ])) : createCommentVNode("", true)
    ]),
    (openBlock(true), createElementBlock(Fragment, null, renderList($data.posts, (post) => {
      return openBlock(), createElementBlock("div", {
        class: "result",
        key: post.id
      }, [
        createVNode(_component_post_compact, { post }, null, 8, ["post"])
      ]);
    }), 128))
  ], 64);
}
const UserProfilePosts = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$8], ["__scopeId", "data-v-ce89ecd5"]]);
const _sfc_main$7 = {
  name: "UserProfileMedia",
  data() {
    return {
      posts: [],
      loading: true,
      loadMoreTimeout: null
    };
  },
  components: {
    PostCompact
  },
  computed: {
    uid() {
      return this.$route.params.uid;
    },
    lastPostId() {
      if (this.posts.length === 0) {
        return null;
      }
      return this.posts[this.posts.length - 1].id;
    }
  },
  methods: {
    async fetchPosts() {
      try {
        const response = await apiService.fetchUserPosts(this.uid, 10, null, true);
        this.posts = response;
        this.loading = false;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async loadMore() {
      try {
        const response = await apiService.fetchUserPosts(this.uid, 10, this.lastPostId, true);
        this.posts.push(...response);
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    handleScroll() {
      clearTimeout(this.loadMoreTimeout);
      const loadAhead = 100;
      const pageHeight = document.documentElement.offsetHeight - window.innerHeight;
      const crntScroll = window.scrollY + loadAhead;
      if (crntScroll < pageHeight) {
        return;
      }
      this.loadMoreTimeout = setTimeout(() => {
        this.loadMore();
      }, 500);
    }
  },
  mounted() {
    this.fetchPosts();
    this.loading = false;
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    clearTimeout(this.loadMoreTimeout);
  }
};
function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_post_compact = resolveComponent("post-compact");
  return openBlock(true), createElementBlock(Fragment, null, renderList($data.posts, (post) => {
    return openBlock(), createElementBlock("div", {
      class: "result",
      key: post.id
    }, [
      createVNode(_component_post_compact, { post }, null, 8, ["post"])
    ]);
  }), 128);
}
const UserProfileMedia = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$7]]);
const _sfc_main$6 = {
  name: "UserProfileLikes",
  data() {
    return {
      posts: [],
      loading: true,
      loadMoreTimeout: null
    };
  },
  components: {
    PostCompact
  },
  computed: {
    uid() {
      return this.$route.params.uid;
    },
    lastPostId() {
      if (this.posts.length === 0) {
        return null;
      }
      return this.posts[this.posts.length - 1].id;
    }
  },
  methods: {
    async fetchPosts() {
      try {
        const response = await apiService.fetchPosts(10, null, null, this.uid);
        this.posts = response;
        this.loading = false;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async loadMore() {
      try {
        const response = await apiService.fetchPosts(10, this.lastPostId, null, this.uid);
        this.posts.push(...response);
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    handleScroll() {
      clearTimeout(this.loadMoreTimeout);
      const loadAhead = 100;
      const pageHeight = document.documentElement.offsetHeight - window.innerHeight;
      const crntScroll = window.scrollY + loadAhead;
      if (crntScroll < pageHeight) {
        return;
      }
      this.loadMoreTimeout = setTimeout(() => {
        this.loadMore();
      }, 500);
    }
  },
  mounted() {
    this.fetchPosts();
    this.loading = false;
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    clearTimeout(this.loadMoreTimeout);
  }
};
function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_post_compact = resolveComponent("post-compact");
  return openBlock(true), createElementBlock(Fragment, null, renderList($data.posts, (post) => {
    return openBlock(), createElementBlock("div", {
      class: "result",
      key: post.id
    }, [
      createVNode(_component_post_compact, { post }, null, 8, ["post"])
    ]);
  }), 128);
}
const UserProfileLikes = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$6]]);
const UserProfileAbout_vue_vue_type_style_index_0_scoped_b0e2296d_lang = "";
const _sfc_main$5 = {
  name: "UserProfileAbout",
  data() {
    return {
      about: "",
      loading: true
    };
  },
  computed: {
    uid() {
      return this.$route.params.uid;
    }
  },
  methods: {
    async fetchAbout() {
      try {
        const response = await apiService.fetchUserInfo(this.uid);
        this.about = response.about_me;
        this.loading = false;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    }
  },
  mounted() {
    this.fetchAbout();
    this.loading = false;
  }
};
const _withScopeId$3 = (n) => (pushScopeId("data-v-b0e2296d"), n = n(), popScopeId(), n);
const _hoisted_1$4 = /* @__PURE__ */ _withScopeId$3(() => /* @__PURE__ */ createBaseVNode("h2", null, "About me", -1));
const _hoisted_2$4 = { class: "about" };
function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock(Fragment, null, [
    _hoisted_1$4,
    createBaseVNode("div", _hoisted_2$4, [
      createBaseVNode("p", null, toDisplayString($data.about), 1)
    ])
  ], 64);
}
const UserProfileAbout = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$5], ["__scopeId", "data-v-b0e2296d"]]);
const PromotionalPage_vue_vue_type_style_index_0_scoped_0212a989_lang = "";
const _sfc_main$4 = {
  name: "PromotionalPage",
  component: { RouterLink },
  mounted() {
    document.documentElement.style.setProperty("--contrast-color", "black");
  },
  beforeUnmount() {
    document.documentElement.style.setProperty("--contrast-color", "#dedede");
  }
};
const _withScopeId$2 = (n) => (pushScopeId("data-v-0212a989"), n = n(), popScopeId(), n);
const _hoisted_1$3 = { class: "promo-grid" };
const _hoisted_2$3 = { class: "promo-cell" };
const _hoisted_3$3 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("h2", { class: "header" }, "Looking for a new social media platform?", -1));
const _hoisted_4$2 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("span", { class: "word" }, "Socialise", -1));
const _hoisted_5$2 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("br", null, null, -1));
const _hoisted_6$2 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("span", { class: "word" }, "Connect", -1));
const _hoisted_7$2 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("br", null, null, -1));
const _hoisted_8$2 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("span", { class: "word" }, "Share", -1));
const _hoisted_9$2 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("br", null, null, -1));
const _hoisted_10$2 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("br", null, null, -1));
const _hoisted_11$2 = { class: "register-wrapper" };
const _hoisted_12$2 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("img", {
  src: "http://localhost:5000/images/icons/logo-text-pixian.png",
  alt: "Shreddit Brand",
  width: "42",
  height: "42"
}, null, -1));
function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_router_link = resolveComponent("router-link");
  return openBlock(), createElementBlock("div", _hoisted_1$3, [
    createBaseVNode("div", _hoisted_2$3, [
      _hoisted_3$3,
      _hoisted_4$2,
      _hoisted_5$2,
      _hoisted_6$2,
      _hoisted_7$2,
      _hoisted_8$2,
      _hoisted_9$2,
      _hoisted_10$2,
      createBaseVNode("div", _hoisted_11$2, [
        _hoisted_12$2,
        createVNode(_component_router_link, {
          to: "/register",
          class: "register-btn"
        }, {
          default: withCtx(() => [
            createTextVNode(" Register")
          ]),
          _: 1
        })
      ])
    ])
  ]);
}
const PromotionalPage = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$4], ["__scopeId", "data-v-0212a989"]]);
const FeedComponent_vue_vue_type_style_index_0_scoped_356662a1_lang = "";
const _sfc_main$3 = {
  name: "FeedComponent",
  components: {
    PostCompact
  },
  data() {
    return {
      posts: [],
      loading: true,
      loadMoreTimeout: null
    };
  },
  computed: {
    type() {
      if (this.$route.query.filter === void 0) {
        return "recent";
      }
      return this.$route.query.filter;
    },
    lastPostId() {
      if (this.posts.length === 0) {
        return null;
      }
      return this.posts[this.posts.length - 1].id;
    }
  },
  methods: {
    async fetchUserFeedPosts() {
      try {
        const response = await apiService.fetchUserFeedPosts(
          this.$store.state.uid,
          10,
          null
        );
        this.posts = response;
        this.loading = false;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async fetchPosts() {
      try {
        const response = await apiService.fetchPosts(10, null, null, null);
        this.posts = response;
        this.loading = false;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async loadPosts() {
      this.loading = true;
      this.posts = [];
      if (this.type === "recent") {
        await this.fetchPosts();
      } else {
        await this.fetchUserFeedPosts();
      }
    },
    async loadMore() {
      let newPosts = [];
      if (this.type === "recent") {
        newPosts = await apiService.fetchPosts(10, this.lastPostId, null, null);
      } else {
        newPosts = await apiService.fetchUserFeedPosts(
          this.$store.state.uid,
          10,
          this.lastPostId
        );
      }
      this.posts.push(...newPosts);
    },
    handleScroll() {
      if (this.loadMoreTimeout) {
        clearTimeout(this.loadMoreTimeout);
      }
      this.loadMoreTimeout = setTimeout(() => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const pageHeight = document.body.offsetHeight;
        if (scrollPosition >= pageHeight) {
          this.loadMore();
        }
      }, 100);
    }
  },
  watch: {
    $route() {
      this.loadPosts();
    }
  },
  mounted() {
    if (this.$store.state.uid === null) {
      this.$router.push("/login");
      return;
    }
    this.loadPosts();
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    this.$store.dispatch("flushUserCache");
  }
};
const _withScopeId$1 = (n) => (pushScopeId("data-v-356662a1"), n = n(), popScopeId(), n);
const _hoisted_1$2 = { class: "container" };
const _hoisted_2$2 = { class: "inner" };
const _hoisted_3$2 = { class: "filters" };
const _hoisted_4$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("button", { class: "btn btn-primary" }, "New Post", -1));
const _hoisted_5$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("p", null, "Filters", -1));
const _hoisted_6$1 = { key: 0 };
const _hoisted_7$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: "16",
  height: "16",
  fill: "currentColor",
  class: "bi bi-check",
  viewBox: "0 0 16 16"
}, [
  /* @__PURE__ */ createBaseVNode("path", { d: "M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" })
], -1));
const _hoisted_8$1 = [
  _hoisted_7$1
];
const _hoisted_9$1 = { key: 0 };
const _hoisted_10$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: "16",
  height: "16",
  fill: "currentColor",
  class: "bi bi-check",
  viewBox: "0 0 16 16"
}, [
  /* @__PURE__ */ createBaseVNode("path", { d: "M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" })
], -1));
const _hoisted_11$1 = [
  _hoisted_10$1
];
const _hoisted_12$1 = { class: "search-wrapper" };
const _hoisted_13$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("h1", null, "Feed", -1));
const _hoisted_14$1 = { class: "search-results" };
function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_router_link = resolveComponent("router-link");
  const _component_post_compact = resolveComponent("post-compact");
  return openBlock(), createElementBlock("div", _hoisted_1$2, [
    createBaseVNode("div", _hoisted_2$2, [
      createBaseVNode("div", _hoisted_3$2, [
        createVNode(_component_router_link, {
          to: "/new-post",
          style: { "padding-left": "0", "margin-top": "0" }
        }, {
          default: withCtx(() => [
            _hoisted_4$1
          ]),
          _: 1
        }),
        _hoisted_5$1,
        createVNode(_component_router_link, {
          to: "/",
          class: normalizeClass({ active: $options.type === "recent" })
        }, {
          default: withCtx(() => [
            $options.type === "recent" ? (openBlock(), createElementBlock("i", _hoisted_6$1, _hoisted_8$1)) : createCommentVNode("", true),
            createTextVNode(" Recent")
          ]),
          _: 1
        }, 8, ["class"]),
        createVNode(_component_router_link, {
          to: "/?filter=followed",
          class: normalizeClass({ active: $options.type === "followed" })
        }, {
          default: withCtx(() => [
            $options.type === "followed" ? (openBlock(), createElementBlock("i", _hoisted_9$1, _hoisted_11$1)) : createCommentVNode("", true),
            createTextVNode(" Followed")
          ]),
          _: 1
        }, 8, ["class"])
      ]),
      createBaseVNode("div", _hoisted_12$1, [
        _hoisted_13$1,
        createBaseVNode("div", _hoisted_14$1, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(this.posts, (post) => {
            return openBlock(), createBlock(_component_post_compact, {
              key: post.id,
              post
            }, null, 8, ["post"]);
          }), 128))
        ])
      ])
    ])
  ]);
}
const FeedView = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$3], ["__scopeId", "data-v-356662a1"]]);
const _sfc_main$2 = {
  name: "HomeView",
  components: {
    FeedView,
    PromotionalPage
  },
  data() {
    return {};
  },
  computed: {
    isLoggedIn() {
      return this.$store.state.isLoggedIn;
    }
  }
};
function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_feed_view = resolveComponent("feed-view");
  const _component_promotional_page = resolveComponent("promotional-page");
  return openBlock(), createElementBlock(Fragment, null, [
    $options.isLoggedIn ? (openBlock(), createBlock(_component_feed_view, { key: 0 })) : createCommentVNode("", true),
    !$options.isLoggedIn ? (openBlock(), createBlock(_component_promotional_page, { key: 1 })) : createCommentVNode("", true)
  ], 64);
}
const HomeView = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$2]]);
const CommentResult_vue_vue_type_style_index_0_scoped_bc2d5e50_lang = "";
const _sfc_main$1 = {
  name: "CommentResult",
  data() {
    return {
      userProfilePicture: "",
      username: "",
      loading: true
    };
  },
  props: {
    comment: {
      type: Object,
      required: true
    }
  },
  computed: {
    profilePictureSrc() {
      return `http://localhost:5000/images/users/${this.userProfilePicture}`;
    }
  },
  methods: {
    async fetchUserInfo() {
      try {
        const response = await apiService.fetchUserInfo(this.comment.uid);
        this.userProfilePicture = response.profile_picture;
        this.username = response.username;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    }
  },
  async mounted() {
    this.fetchUserInfo();
    this.loading = false;
  }
};
const _hoisted_1$1 = {
  key: 0,
  class: "comment-result"
};
const _hoisted_2$1 = { class: "header" };
const _hoisted_3$1 = { class: "comment-content" };
function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_router_link = resolveComponent("router-link");
  return !$data.loading ? (openBlock(), createElementBlock("div", _hoisted_1$1, [
    createBaseVNode("div", _hoisted_2$1, [
      createVNode(_component_router_link, {
        to: "/user/" + $props.comment.uid,
        style: normalizeStyle({ backgroundImage: `url(${$options.profilePictureSrc})` }),
        class: "avatar"
      }, null, 8, ["to", "style"]),
      createVNode(_component_router_link, {
        to: "/user/" + $props.comment.uid,
        class: "name"
      }, {
        default: withCtx(() => [
          createTextVNode(toDisplayString($data.username), 1)
        ]),
        _: 1
      }, 8, ["to"])
    ]),
    createBaseVNode("div", _hoisted_3$1, [
      createBaseVNode("p", null, toDisplayString($props.comment.content), 1)
    ])
  ])) : createCommentVNode("", true);
}
const CommentResult = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render$1], ["__scopeId", "data-v-bc2d5e50"]]);
const PostView_vue_vue_type_style_index_0_scoped_55f4df90_lang = "";
const _sfc_main = {
  name: "PostView",
  data() {
    return {
      post: null,
      loading: true,
      userProfilePicture: "",
      username: "",
      isLiked: false,
      date: "",
      newComment: "",
      newCommentIsValid: false,
      comments: [],
      showOptions: false,
      loadMoreTimeout: null
    };
  },
  components: {
    CommentResult,
    TextareaField
  },
  methods: {
    async fetchPost() {
      try {
        const response = await apiService.fetchPost(this.pid);
        this.post = response;
        this.date = new Date(response.created_at).toLocaleString();
        this.loading = false;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async fetchUserInfo() {
      try {
        const response = await apiService.fetchUserInfo(this.post.uid);
        this.userProfilePicture = response.profile_picture;
        this.username = response.username;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async likePost() {
      try {
        await apiService.likePost(this.$store.state.uid, this.pid);
        this.$store.dispatch("addToast", {
          message: "Successfully liked post",
          type: "success"
        });
        this.post.like_count++;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async unlikePost() {
      try {
        await apiService.unlikePost(this.$store.state.uid, this.pid);
        this.$store.dispatch("addToast", {
          message: "Successfully unliked post",
          type: "success"
        });
        this.post.like_count--;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async handleLike() {
      if (this.isLiked) {
        await this.unlikePost();
      } else {
        await this.likePost();
      }
      await this.fetchLikeStatus();
    },
    async handleDelete() {
      try {
        await apiService.deletePost(this.$store.state.uid, this.pid);
        this.$store.dispatch("addToast", {
          message: "Successfully deleted post",
          type: "success"
        });
        this.$router.push({ path: "/" });
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    handleOptions() {
      this.showOptions = !this.showOptions;
    },
    async fetchLikeStatus() {
      try {
        const response = await apiService.checkLike(this.$store.state.uid, this.pid);
        this.isLiked = response;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async addComment() {
      if (!this.newCommentIsValid) {
        this.$store.dispatch("addToast", {
          message: "Comment must be between 1 and 100 characters",
          type: "error"
        });
        return;
      }
      try {
        const comment = {
          "content": this.newComment
        };
        const responseData = await apiService.addComment(this.$store.state.uid, this.pid, comment);
        this.$store.dispatch("addToast", {
          message: "Successfully added comment",
          type: "success"
        });
        this.post.comment_count++;
        this.newComment = "";
        this.comments.unshift(responseData);
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    async fetchComments() {
      try {
        const response = await apiService.fetchComments(this.pid);
        this.comments = response;
        this.loading = false;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    validateNewComment(comment) {
      return validationService.validateCommentContent(comment);
    },
    async loadMoreComments() {
      try {
        const response = await apiService.fetchComments(this.pid, 10, this.lastCommentId);
        this.comments.push(...response);
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error"
        });
      }
    },
    handleScroll() {
      clearTimeout(this.loadMoreTimeout);
      const loadAhead = 100;
      const pageHeight = document.documentElement.offsetHeight - window.innerHeight;
      const crntScroll = window.scrollY + loadAhead;
      if (crntScroll < pageHeight) {
        return;
      }
      this.loadMoreTimeout = setTimeout(() => {
        this.loadMoreComments();
      }, 500);
    }
  },
  computed: {
    hasImage() {
      return this.post.image !== null;
    },
    postImage() {
      return "http://localhost:5000/images/posts/" + this.post.image;
    },
    pid() {
      return this.$route.params.pid;
    },
    profilePictureSrc() {
      return "http://localhost:5000/images/users/" + this.userProfilePicture;
    },
    likeButtonText() {
      if (this.isLiked) {
        return "Unlike";
      } else {
        return "Like";
      }
    },
    likeButtonClass() {
      if (this.isLiked) {
        return "liked";
      } else {
        return "";
      }
    },
    lastCommentId() {
      if (this.comments.length === 0) {
        return 0;
      }
      return this.comments[this.comments.length - 1].id;
    }
  },
  async mounted() {
    await this.fetchPost();
    await this.fetchUserInfo();
    await this.fetchLikeStatus();
    await this.fetchComments();
    this.loading = false;
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    clearTimeout(this.loadMoreTimeout);
  }
};
const _withScopeId = (n) => (pushScopeId("data-v-55f4df90"), n = n(), popScopeId(), n);
const _hoisted_1 = {
  key: 0,
  class: "container"
};
const _hoisted_2 = { class: "inner" };
const _hoisted_3 = { class: "post" };
const _hoisted_4 = { class: "header" };
const _hoisted_5 = { class: "date" };
const _hoisted_6 = { class: "options" };
const _hoisted_7 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("i", null, [
  /* @__PURE__ */ createBaseVNode("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    fill: "currentColor",
    class: "bi bi-three-dots",
    viewBox: "0 0 16 16"
  }, [
    /* @__PURE__ */ createBaseVNode("path", { d: "M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" })
  ])
], -1));
const _hoisted_8 = [
  _hoisted_7
];
const _hoisted_9 = {
  key: 1,
  class: "options-actions"
};
const _hoisted_10 = { class: "title" };
const _hoisted_11 = { class: "body" };
const _hoisted_12 = { class: "preview-image-wrapper" };
const _hoisted_13 = ["src"];
const _hoisted_14 = { class: "footer" };
const _hoisted_15 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("i", null, [
  /* @__PURE__ */ createBaseVNode("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    fill: "currentColor",
    class: "bi bi-hand-thumbs-up-fill",
    viewBox: "0 0 16 16"
  }, [
    /* @__PURE__ */ createBaseVNode("path", { d: "M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z" })
  ])
], -1));
const _hoisted_16 = { class: "comments" };
const _hoisted_17 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("label", { for: "new-comment" }, "New comment", -1));
const _hoisted_18 = { class: "textarea-wrapper" };
const _hoisted_19 = { class: "results" };
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_router_link = resolveComponent("router-link");
  const _component_textarea_field = resolveComponent("textarea-field");
  const _component_comment_result = resolveComponent("comment-result");
  return !$data.loading ? (openBlock(), createElementBlock("div", _hoisted_1, [
    createBaseVNode("div", _hoisted_2, [
      createBaseVNode("div", _hoisted_3, [
        createBaseVNode("div", _hoisted_4, [
          createVNode(_component_router_link, {
            to: "/user/" + $data.post.uid,
            style: normalizeStyle({ backgroundImage: `url(${$options.profilePictureSrc})` }),
            class: "avatar"
          }, null, 8, ["to", "style"]),
          createVNode(_component_router_link, {
            to: "/user/" + $data.post.uid,
            class: "name"
          }, {
            default: withCtx(() => [
              createTextVNode(toDisplayString($data.username), 1)
            ]),
            _: 1
          }, 8, ["to"]),
          createBaseVNode("div", _hoisted_5, toDisplayString(this.date), 1),
          createBaseVNode("div", _hoisted_6, [
            $data.post.uid === _ctx.$store.state.uid ? (openBlock(), createElementBlock("button", {
              key: 0,
              class: "more-options",
              onClick: _cache[0] || (_cache[0] = (...args) => $options.handleOptions && $options.handleOptions(...args))
            }, _hoisted_8)) : createCommentVNode("", true),
            $data.showOptions ? (openBlock(), createElementBlock("div", _hoisted_9, [
              createBaseVNode("button", {
                class: "delete",
                onClick: _cache[1] || (_cache[1] = (...args) => $options.handleDelete && $options.handleDelete(...args))
              }, "Delete")
            ])) : createCommentVNode("", true)
          ])
        ]),
        createBaseVNode("h1", _hoisted_10, toDisplayString($data.post.title), 1),
        createBaseVNode("div", _hoisted_11, [
          createBaseVNode("p", null, toDisplayString($data.post.content), 1),
          createBaseVNode("div", _hoisted_12, [
            $options.hasImage ? (openBlock(), createElementBlock("img", {
              key: 0,
              src: $options.postImage,
              class: "preview-image"
            }, null, 8, _hoisted_13)) : createCommentVNode("", true)
          ])
        ]),
        createBaseVNode("div", _hoisted_14, [
          createBaseVNode("button", {
            class: normalizeClass(["like-button", $options.likeButtonClass]),
            onClick: _cache[2] || (_cache[2] = (...args) => $options.handleLike && $options.handleLike(...args))
          }, [
            createTextVNode(toDisplayString($data.post.like_count), 1),
            _hoisted_15,
            createTextVNode(toDisplayString($options.likeButtonText), 1)
          ], 2)
        ])
      ]),
      createBaseVNode("h2", null, "Comments " + toDisplayString($data.post.comment_count), 1),
      createBaseVNode("div", _hoisted_16, [
        createBaseVNode("form", {
          class: "new-comment",
          onSubmit: _cache[6] || (_cache[6] = withModifiers((...args) => $options.addComment && $options.addComment(...args), ["prevent"]))
        }, [
          _hoisted_17,
          createBaseVNode("div", _hoisted_18, [
            createVNode(_component_textarea_field, {
              placeholder: "Write your post here...",
              id: "new-comment",
              modelValue: $data.newComment,
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.newComment = $event),
              validateFunc: $options.validateNewComment,
              onOnValidityChange: _cache[4] || (_cache[4] = ($event) => $data.newCommentIsValid = $event),
              "max-length": 100,
              "error-message": "Content must be between 1 and 100 characters"
            }, null, 8, ["modelValue", "validateFunc"])
          ]),
          createBaseVNode("button", {
            type: "submit",
            onClick: _cache[5] || (_cache[5] = withModifiers((...args) => $options.addComment && $options.addComment(...args), ["prevent"]))
          }, "Comment")
        ], 32),
        createBaseVNode("div", _hoisted_19, [
          (openBlock(true), createElementBlock(Fragment, null, renderList($data.comments, (comment) => {
            return openBlock(), createBlock(_component_comment_result, {
              key: comment.id,
              comment
            }, null, 8, ["comment"]);
          }), 128))
        ])
      ])
    ])
  ])) : createCommentVNode("", true);
}
const PostView = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-55f4df90"]]);
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomeView },
    { path: "/login", component: LoginView },
    { path: "/register", component: RegisterView },
    {
      path: "/settings",
      component: SettingsView,
      children: [
        { path: "", component: ProfileSettings },
        { path: "account", component: AccountSettings }
      ]
    },
    { path: "/search", component: SearchView },
    { path: "/new-post", component: NewPostView },
    {
      path: "/user/:uid",
      component: UserProfileView,
      children: [
        { path: "follows", component: UserProfileFollowers },
        { path: "media", component: UserProfileMedia },
        { path: "likes", component: UserProfileLikes },
        { path: "about", component: UserProfileAbout },
        { path: "", component: UserProfilePosts }
      ]
    },
    { path: "/post/:pid", component: PostView }
  ]
});
createApp(App).use(router).use(store).mount("#app");
