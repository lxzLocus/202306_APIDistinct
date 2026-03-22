function getNatureRemoData(endpoint) {
  const REMO_ACCESS_TOKEN = '7g4dtHApmS-YwfsgGCrHwx4fsyzj7dGlP3-ZPmFBhhmw.LwgioaC18wohQqzdiB6u8_dCSJ7KUfzJo5kvMAbtiv4'
  const headers = {
    "Content-Type" : "application/json;",
    'Authorization': 'Bearer ' + REMO_ACCESS_TOKEN,
  };

  const options = {
    "method" : "get",
    "headers" : headers,
  };

  return JSON.parse(UrlFetchApp.fetch("https://api.nature.global/1/" + endpoint, options));
}
