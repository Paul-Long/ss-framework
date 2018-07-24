import fetchApi from 'isomorphic-fetch';

export function fetch(url, options) {
  const finalOptions = Object.assign({ credentials: 'include' }, options);
  return fetchApi(url, finalOptions);
}

