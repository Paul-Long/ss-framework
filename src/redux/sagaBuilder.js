import * as effects from 'redux-saga/effects';
import { fork } from 'redux-saga';
import * as Fetch from '../utils/fetch';

export function sagaBuilder(options) {
  const sagaArr = [];
  for (let key in options) {
    if (options.hasOwnProperty(key)) {
      let value = options[key];
      if (value instanceof Array) {
        for (let item of value) {
          if (item.url) {
            sagaArr.push(createSaga(item));
          }
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
  }
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

function getEffect(item) {
  return function* baseEffect({ payload }, { fetch, option }) {
    return fetch(item.url(payload), option);
  };
}

export function createSaga(item) {
  const action = item.action || item.key;
  return function* () {
    let take = item.takeEvery || effects.takeEvery;
    yield take(action, function* (actions) {
      let result = {};
      const effect = item.effect || getEffect(item);
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
        yield effects.put({ type: `${action}_SUCCESS`, result: result.content, payload: actions.payload });
      } else {
        yield effects.put({ type: `${action}_FAIL`, error: result.errorMsg, payload: actions.payload });
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
