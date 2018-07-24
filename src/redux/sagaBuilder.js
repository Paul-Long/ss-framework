import * as effects from 'redux-saga/effects';
import { fork } from 'redux-saga';
import * as Fetch from '../utils/fetch';

export function sagaBuilder(options, onEffect) {
  const sagaArr = [];
  for (let key in options) {
    if (options.hasOwnProperty(key)) {
      let value = options[key];
      if (value instanceof Array) {
        for (let item of value) {
          if (item.url) {
            sagaArr.push(createSaga(item, onEffect));
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

function getEffect(item) {
  return function* baseEffect({ payload }, { fetch, option }) {
    return yield fetch(item.url(payload), option);
  };
}

export function createSaga(item, onEffect) {
  const action = item.action || item.key;
  return function* () {
    let take = item.takeEvery || effects.takeEvery;
    yield take(action, function* (actions) {
      let response;
      const effect = item.effect || getEffect(item);
      let putAction = {
        type: action,
        payload: actions.payload,
      };
      try {
        let type = item.type || 'json';
        let bodyParser = item.body || bodyHandler;
        const option = createOptions(item.method, type, item.headers, bodyParser(actions.payload, type, item.method));
        response = yield effect(actions, { fetch: Fetch.fetch, option }, ...effects, item);
      } catch (error) {
        putAction.success = false;
        putAction.loading = false;
        putAction.result = null;
        putAction.message = error || '请求异常';
        putAction.type = `${putAction.type}_FAIl`;
        yield effects.put(putAction);
      }
      if (response) {
        if (typeof onEffect === 'function') {
          putAction.url = item.url(actions.payload);
          putAction = yield onEffect(putAction, response);
        } else {
          putAction.loading = false;
          putAction.success = response.status === 200;
          putAction.status = response.status;
          putAction.result = yield response.json();
        }
        putAction.type = `${putAction.type}${putAction.success ? '_SUCCESS' : '_FAIL'}`;
        yield effects.put(putAction);
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
