function actAirCon1() {
  const REMO_ACCESS_TOKEN = 'g4dtHApmS-YwfsgGCrHwx4fsyzj7dGlP3-ZPmFBhhmw.LwgioaC18wohQqzdiB6u8_dCSJ7KUfzJo5kvMAbtiv4'
  const headers = {
        'Authorization': 'Bearer ' + REMO_ACCESS_TOKEN,
};
const payload1 = {
         //"button" : "",
         "temperature" : "26",
         "button" : ""
         //temp:26 が正解
};


var url = "https://api.nature.global/1/appliances/0d876d8e-97b5-40be-9491-ba6cb2b2ee98/aircon_settings" ;

var options = {
          "method" : "post",
          "headers" : headers,
          "payload" : payload1
};

  var reply = UrlFetchApp.fetch(url, options);

}
