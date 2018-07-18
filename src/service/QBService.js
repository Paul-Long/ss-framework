import isNil from 'lodash/isNil';

const qbApi = (funcName, reqStr, success, failure) => {
  if (window.cefQuery) {
    window.cefQuery({
      request: reqStr,
      onSuccess: success || function (response) {
        console.info(response);
      },
      onFailure: failure || function (errorCode, errorMessage) {
        console.info(funcName + ' : ' + errorMessage);
      }
    });
  }
};

// 判断是否在QB中登录
export const isWrappedInQB = () => (!isNil(window.cefQuery));
// 获取QB登录用户信息
export const getUser = (success, failure) => {
  const reqStr = '["req_cache",[{"data":"UserInfo"}]]';
  qbApi('getUser', reqStr, (res) => {
    let user = JSON.parse(res);
    success({
      id: user.UserId,
      username: user.UserAccount,
      password: user.Password
    });
  }, failure);
};
// 打开QB精简报价
export const openQbQuoteWindow = (bondInfo, success, failure) => {
  const reqStr = `["open_page", [{"name":"bond_short_quote","bondkey":"${bondInfo.bondkey}","listmarket":"${bondInfo.listedmarket}"}]]`;
  qbApi('openQbQuoteWindow', reqStr, (res) => {
    let result = JSON.parse(res);
    success(result);
  }, failure);
};

// 打开QB价格试算
export const openQbCalculateWindow = (bondInfo, success, failure) => {
  const reqStr = `["open_page", [{"name":"bondcalculate","bondkey":"${bondInfo.bondkey}","listmarket":"${bondInfo.listedmarket}"}]]`;
  qbApi('openQbCalculateWindow', reqStr, (res) => {
    let result = JSON.parse(res);
    success(result);
  }, failure);
};

// 查询QB版本
export const getQbVersion = (success, failure) => {
  const reqStr = `["req_cache", [{"data":"Version"}]]`;
  qbApi('getQbVersion', reqStr, (res) => {
    let result = JSON.parse(res);
    success({
      version: result.version
    });
  }, (error_code, error_message) => {
    failure({
      errorCode: error_code,
      errorMessage: error_message
    });
  });
};
// 查询是否可切换至指定债券
export const getChangeBondResult = (bondInfo, success, failure) => {
  const reqStr = `["change_bond", [{"bondkey":"${bondInfo.bondkey}.${bondInfo.listedmarket}"}]]`;
  qbApi('getChangeBondResult', reqStr, (res) => {
    let result = JSON.parse(res);
    success({
      changed: result.changed
    });
  }, (error_code, error_message) => {
    failure({
      errorCode: error_code,
      errorMessage: error_message
    });
  });
};

// 打开新的债券详情tab页
export const openNewBondDetail = (bondInfo, success, failure) => {
  const reqStr = `["open_page", [{"name":"bond_detail","bondkey":"${bondInfo.bondkey}","listmarket":"${bondInfo.listedmarket}"}]]`;
  qbApi('openQbQuoteWindow', reqStr, (res) => {
    let result = JSON.parse(res);
    console.log('调用打开新tab接口：', result);
  }, failure);
};

// 查询当前债券是否存在关注组
export const getBondAttention = (bondInfo, success, failure) => {
  const reqStr = `["req_cache", [{"data":"BondAttention","callback":"handleManageAttention","BondKey":"${bondInfo.bondkey}","ListedMarket":"${bondInfo.listedmarket}","Todo":"Check"}]]`;
  qbApi('getBondAttention', reqStr, (res) => {
    let result = JSON.parse(res);
    success(result);
  }, (error_code, error_message) => {
    failure({
      errorCode: error_code,
      errorMessage: error_message
    });
  });
};

// 管理当前债券关注组
export const modifyBondAttention = (bondInfo, success, failure) => {
  const reqStr = `["req_cache", [{"data":"BondAttention","callback":"handleManageAttention","BondKey":"${bondInfo.bondkey}","ListedMarket":"${bondInfo.listedmarket}","Todo":"Modify"}]]`;
  qbApi('modifyBondAttention', reqStr, (res) => {
    let result = JSON.parse(res);
    success(result);
  }, (error_code, error_message) => {
    failure({
      errorCode: error_code,
      errorMessage: error_message
    });
  });
};
