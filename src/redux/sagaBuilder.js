import * as effects from 'redux-saga/lib/effects';
import { takeEvery } from 'redux-saga';
import * as Fetch from '../utils/fetch';

export function buildRoot(options) {
  const sagaArr = [];
  for (let key in options) {
    if (options.hasOwnProperty(key)) {
      let value = options[key];
      if (value instanceof Array) {
        for (let item of value) {
          sagaArr.push(createSaga(item));
        }
      } else {
        sagaArr.push(value);
      }
    }
  }
  return function* () {
    for (let saga of sagaArr) {
      yield effects.fork(saga);
    }
  };
}

function bodyHandler(data, type, method) {
  if (method !== 'get' && data) {
    if (type === 'json') {
      return JSON.stringify(data);
    } else if (type === 'from') {
      let pairs = [];
      for (let key of data) {
        pairs.push(key + '=' + data[key]);
      }
      return pairs.join('&');
    }
  }
  return data;
}

function getEffect(item, { fetch, option }) {
  return function* baseEffect({ payload }) {
    return fetch(item.url(payload), option);
  };
}

export function createSaga(item) {
  const action = item.action || item.key;
  const effect = item.effect || getEffect(item);
  return function* () {
    let take = item.takeEvery || takeEvery;
    yield take(action, function* (actions) {
      let result = {};
      try {
        let type = item.type || 'json';
        let bodyParser = item.body || bodyHandler;
        const option = createOptions(item.method, type, item.headers, bodyParser(actions.payload, type, item.method));
        result = yield effect(actions, { fetch: Fetch.fetch, option }, ...effects, item);
      } catch (error) {
        result.success = false;
        result.errorMsg = error || '请求异常';
      }
      if (!result) {
        return;
      }
      if (result.success) {
        yield effects.put({ type: `${action}_SUCCESS`, result: result.content, payload });
      } else {
        yield effects.put({ type: `${action}_FAIL`, error: result.errorMsg, payload });
      }
    });
  };
}

function createOptions(method, type, extHeaders, payload) {
  let options = { method };
  options.headers = extHeaders || {
    'Accept': 'application/json',
    'Content-Type': type === 'json' ? 'application/json' : 'application/x-www-form-urlencoded'
  };
  if (method !== 'get') {
    options.body = payload;
  }
  return options;
}
