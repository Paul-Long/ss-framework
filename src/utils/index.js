export const isFunction = o => typeof o === 'function';
export const isString = o => typeof o === 'string';
export const isArray = Array.isArray.bind(Array);

export function isHTMLElement(node) {
  return typeof node === 'object' && node !== null && node.nodeType && node.nodeName;
}

export const onError = (app, onError) => {
  return err => {
    if (err) {
      if (typeof err === 'string') {
        err = new Error(err);
      }
      if (onError && typeof onError === 'function') {
        onError(err, app._store.dispatch);
        throw new Error(err.stack || err);
      }
    }
  };
};
export const onEffect = () => {
};
