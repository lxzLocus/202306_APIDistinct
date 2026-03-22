/*post nature API*/
function test_light() {
  var url = 'https://api.nature.global/1/appliances/' + light_id + '/light';

  var headers = {
    'Authorization': 'Bearer ' + remo_access_token,
  };

  var payload = {
    'button':'on'
  };

  var options = {
    muteHttpExceptions : true,
    'method' : 'post',
    'headers' : headers,
    'payload' : payload
  };

  var loging = UrlFetchApp.fetch(url, options);

  console.log(JSON.parse(loging));
  push(String(payload.button));
}
