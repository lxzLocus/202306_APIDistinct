
/*function post_aircon(postData) {　　
  var url = 'https://api.nature.global/1/appliances/' + aircon_id + '/aircon_settings';
  var headers = {
    'Authorization': 'Bearer ' + remo_access_token,
  };

  var options = {
    muteHttpExceptions : true,
    'method' : 'post',
    'headers' : headers,
    'payload' : postData
  };

  var loging = UrlFetchApp.fetch(url, options);

  console.log(JSON.parse(loging));
  
  push('AC:' + String(postData.button));
}*/

/*function post_ac_reserve() {
  var postData = SpreadsheetApp.openById(spreadsheet_id).getSheetByName('reserve').getRange(2, 2).getValue();

  deleteTriggers('post_ac_reserve');

  var url = 'https://api.nature.global/1/appliances/' + aircon_id + '/aircon_settings';
  var headers = {
    'Authorization': 'Bearer ' + remo_access_token,
  };

  var options = {
    muteHttpExceptions : true,
    'method' : 'post',
    'headers' : headers,
    'payload' : postData
  };

  var loging = UrlFetchApp.fetch(url, options);
  
  console.log(JSON.parse(loging));
  
  push('AC:' + String(postData.button));
}*/


/*function post_light(postData) {
  var url = 'https://api.nature.global/1/appliances/' + light_id + '/light';
  var headers = {
    'Authorization': 'Bearer ' + remo_access_token,
  };

  var options = {
    muteHttpExceptions : true,
    'method' : 'post',
    'headers' : headers,
    'payload' : postData
  };

  var loging = UrlFetchApp.fetch(url, options);
  
  console.log(JSON.parse(loging));
  
  push('Light:' + String(postData.button));
}*/

/*function light() {　　
  var url = 'https://api.nature.global/1/appliancessssss/' + light_id + '/light';
  var headers = {
    'Authorization': 'Bearer ' + remo_access_token,
  };

  var payload = {
    'button':'on'
  };

  var option = {
    muteHttpExceptions : true,
    'method' : 'post',
    'headers' : headers,
    'payload' : payload
  };
  
  var loging = UrlFetchApp.fetch(url, option);

  console.log(JSON.parse(loging));
  push(String(payload.button));
}*/

function post_fan(signal_id) {
  var url = 'https://api.nature.global/1/signals/' + signal_id + '/send';
  var headers = {
    'Authorization': 'Bearer ' + remo_access_token,
  };


  var options = {
    muteHttpExceptions : true,
    'method' : 'post',
    'headers' : headers,  
    };

  var loging = UrlFetchApp.fetch(url, options);
  
  console.log(JSON.parse(loging));
  
  push('Fan:' + signal_id);
}