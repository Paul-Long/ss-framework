import { combineReducers } from 'redux';
import createReducer from './createReducer';
import invariant from 'invariant';

export function buildReducer(options) {
  let reducers = {};
  let reducerGroups = new Map();
  for (let key in options) {
    if (options.hasOwnProperty(key)) {
      let reducer = options[key];
      if (reducer instanceof Array) {
        collectReducers(reducerGroups, reducer);
      } else {
        reducers[key] = reducer;
      }
    }
  }
  for (let [key, reducerGroup] of reducerGroups.entries()) {
    if (reducers.hasOwnProperty(key)) {
      throw Error('Duplicate key ' + key);
    }
    reducers[key] = initialReducerGroup(reducerGroup);
  }
  return combineReducers(reducers);
}

function collectReducers(reducerGroups, reducers) {
  reducers.forEach(reducer => {
    let keys = reducer.key.split('.');
    let [groupKey, ...subKeys] = keys;
    let group = reducerGroups.get(groupKey);
    if (!group) {
      group = new Map();
      reducerGroups.set(groupKey, group);
    }
    if (subKeys.length === 0) {
      reducer.single = true;
    } else {
      reducer.subKeys = subKeys;
    }
    if (group.has(reducer.key) && !reducer.single) {
      throw Error('Duplicate key ' + reducer.key);
    }
    group.set(reducer.key, reducer);
  });
}

export function initialReducerGroup(reducerGroup) {
  const handlers = {};
  let initialState = {};
  for (let reducer of reducerGroup.values()) {
    if (!reducer.resultKey) {
      reducer.resultKey = 'result';
    }
    if (reducer.single) {
      initialState = reducer.initialState || {};
    } else {
      overrideState(initialState, reducer.subKeys, reducer.initialState);
    }
    let reducerAction = reducer.action;
    if (!reducerAction) {
      reducerAction = reducer.key;
    }
    invariant(
      !reducerAction,
      `[reducer.key] reducer key is not empty`,
    );
    handlers[reducerAction] = reducerHandler(reducer, 'loading', (state, action) => {
      return { [reducer.resultKey]: null, payload: action.payload, success: false, loading: true, fromSocket: false };
    });
    handlers[`${reducerAction}_SUCCESS`] = reducerHandler(reducer, 'success', (state, action) => {
      let fromSocket = action.fromSocket;
      if (fromSocket && action.done) {
        return action.result;
      } else {
        return {
          [reducer.resultKey]: action.result,
          payload: action.payload,
          success: true,
          loading: false,
          fromSocket
        };
      }
    });
    handlers[`${reducerAction}_FAIL`] = reducerHandler(reducer, 'fail', (state, action) => {
      return { payload: action.payload, error: action.error, success: false, loading: false, fromSocket: false };
    });
  }
  return createReducer(initialState, handlers);
}

function overrideState(state, keys, value = {}) {
  let length = keys.length;
  if (length === 1) {
    return state[keys[0]] = value;
  }
  let previous = state;
  for (let i = 0; i < length; ++i) {
    if (i === length - 1) {
      previous[keys[i]] = value;
    } else {
      let next = previous[keys[i]];
      if (!next) {
        next = previous[keys[i]] = {};
      }
      previous = next;
    }
  }
}

function reducerHandler(reducer, method, handler) {
  return (state, action) => {
    let result;
    if (reducer[method]) {
      result = reducer[method](state, action);
    } else {
      result = handler(state, action);
    }
    if (reducer.single) {
      state = result;
    } else {
      state = { ...state };
      overrideState(state, reducer.subKeys, result);
    }
    return state;
  };
}
