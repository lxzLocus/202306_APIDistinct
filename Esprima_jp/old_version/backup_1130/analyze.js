const { info } = require('console');
const fs = require('fs');

module.exports = analyze_Prog;


// ASTの特定の識別子を置換し、エンドポイントの比較を行う関数
function analyze_Prog(ast) {
  const jsonFilePath = 'E:/Files/workspace/202306/API_json/API_list.json';
  const jsonString = fs.readFileSync(jsonFilePath, 'utf8');
  const baseJson = JSON.parse(jsonString);

  /*tf, json_num*/
  let url_logic = [false, null];
  /*tf, Ident name*/
  let opt_logic = [false, null];
  /*tf, */
  let param_logic = [false, null, false, false];




  /*URL.fetch()*/
  /*url有無*/
  try{
    url_logic = url_initial(ast, baseJson)
  }catch(e){    /*exception*/
    console.log('catch exception URL_Initial')

    return '100';
  }


  if(url_logic[0] === true){
    /*option有無*/
    opt_logic = opt_initial(ast)
    if(opt_logic[0] === true){


      /*options内 + postData*/
      try{
        param_logic = param_initial(ast, baseJson, url_logic[1])
        console.log('param_logic : %s\n', param_logic)

        return[url_logic[0], url_logic[1], opt_logic[0], opt_logic[1], param_logic[0], param_logic[1], param_logic[2], param_logic[3]];

      }catch(e){
        param_logic = [false, null, false, false]
        console.log('catch exception param_Initial');

        return[url_logic[0], url_logic[1], opt_logic[0], opt_logic[1], param_logic[0], param_logic[1], param_logic[2], param_logic[3]];
      }

    }else{
      console.log('変数 ', opt_logic[1],  ' が検出できず')

      return '200';
    }


  }else{
    /*変数対応しているがurlが一致しない*/
    console.log('対応する変数がない、またはurlが一致しない')

    return '101';
  }
}






/*URL*/
function url_initial(ast, json){
  let logic_flag = [false, 0]

  /*Initialization*/
  var opt_flag = 0

  let url_source = null;
  var url_source_split = null;
  var url_json_split = null;
  let cnt_w = 0;



  let prm = loop_url(ast);
  url_source = prm[0];
  pay_flag = prm[2];
  opt_flag = prm[2];

  /*変数が見つからなかった場合*/
  if(opt_flag == 1){
    console.log('変数', url_source, 'が見つかりませんでした')

    return [logic_flag[0], logic_flag[1]]

  }else{

    console.log('URL 変数検出')
    console.log('URL_Source : ' + url_source)

    url_source_split = url_split(url_source);

    /*一致URLを探す*/
    while (undefined != json.nature_apis.api[cnt_w]) {
      var JsonEndpoint = json.nature_apis.api[cnt_w].endpoint


      url_json_split = url_split(JsonEndpoint);

      const minLength = Math.min(url_source_split.length, url_json_split.length);


      /*配列を後ろから比較*/
      for (let i = 0; i < minLength - 1; i++) {
        if (url_source_split[url_source_split.length - 1 - i] == url_json_split[url_json_split.length - 1 - i]) {
          /*一致*/
          logic_flag[0] = true
          /*jsonの何番目か*/
          logic_flag[1] = cnt_w
        } else {
          logic_flag[0] = false
          break
        }
      }

      if (logic_flag[0] == true) {

        let server_url_split = url_split(json.nature_apis.servers[0].url)

        /*servers.urlが一致するか*/
        for(let p = 0; p < server_url_split.length; p++){
          if (url_source_split[p] != server_url_split[p]){

            console.log('ベースURL 誤り')

            break;
          } else if (p == server_url_split.length-1){

            console.log('URL 完全一致')
          }
        }

        break;
      }


      cnt_w++;
    }

    /*一致の有無, apiリストの何番目か*/
    return [logic_flag[0], logic_flag[1]]
  }
}

function find_url(ast, pay_flag, callee_flag, opt_flag, param0, param1) {
  if (ast === null){

    return null;
  }

  if (ast.type === 'BlockStatement') { // 複数行の中身
    /*url_Initialへ*/
    let val = loop_url(ast, pay_flag, callee_flag, opt_flag, param0, param1);

    return val;
  }

  if (ast.type === 'ExpressionStatement') {
    return find_url(ast.expression, pay_flag, callee_flag, opt_flag, param0, param1);
  }

  if (ast.type === 'VariableDeclaration') { // 代入式
    if (ast.kind === 'var' || ast.kind === 'const' || ast.kind === 'let') {
      if(ast.declarations[0].id.name === param0 && opt_flag === 1){
        /*検出*/
        opt_flag = 3;
        let tmp = find_url(ast.declarations[0].init, pay_flag, callee_flag, opt_flag, param0, param1);

        /*ast.declarations[0].init以下の値を取得する
        BinaryExpressionか様々なやつ*/
        param0 = tmp[0] //内容
        param1 = tmp[1] //型
        opt_flag = tmp[2]

        return [param0, param1, opt_flag];
      }else{
        let tmp = find_url(ast.declarations[0].init, pay_flag, callee_flag, opt_flag, param0, param1);

        if(tmp === null){
          return [param0, param1, opt_flag];
        }

        return tmp;
      }
    }
  }

  if (ast.type === 'CallExpression') { // 関数呼び出し

    if (ast.callee.type === 'StaticMemberExpression'){
      let tmp = loop_url(ast.arguments, pay_flag, callee_flag, opt_flag, param0, param1);

      return tmp;
    }

    if(ast.callee.type === 'MemberExpression'){
      if(ast.callee.object.name === 'UrlFetchApp' && ast.callee.property.name === 'fetch'){

        callee_flag = 1 // UrlFetchApp.fetchが呼ばれたことを指すフラグ

        /*直接値が入っている場合*/
        if(ast.arguments[0].type === 'Literal' ) {
          /*urlを取得*/
          param0 = ast.arguments[0].value
          param1 = undefined;
          opt_flag = undefined;

          /*UrlFetchAppのLiteral value:url をreturn*/
          return [param0, param1, opt_flag];
        }
        
        if(ast.arguments[0].type === 'BinaryExpression'){
         
          let tmp = find_url(ast.arguments[0], pay_flag, callee_flag, opt_flag, param0, param1);

          /*urlを取得*/
          param0 = tmp[0];
          param1 = undefined;
          opt_flag = undefined;

          /*UrlFetchAppのLiteral value:url をreturn*/
          return [param0, param1, opt_flag];
        }
      }
    }

    //urlが変数の場合
    if(callee_flag === 1){
      opt_flag = 1
      callee_flag = 0
      param0 = ast.arguments[0].name
      param1 = ast.arguments[0].type

      /*UrlFetchAppのIdentifer name:url をreturn*/
      return [param0, param1, opt_flag];
    }

    return [param0, param1, opt_flag];
  }

  if (ast.type === 'FunctionDeclaration') { // ユーザ関数呼び出し
    const body = find_url(ast.body, pay_flag, callee_flag, opt_flag, param0, param1);

    return body;
  }


  /*URL*/
  if (ast.type === 'BinaryExpression') { // +,-などの計算式
    const left = find_url(ast.left, pay_flag, callee_flag, opt_flag, param0, param1);
    const right = find_url(ast.right, pay_flag, callee_flag, opt_flag, param0, param1);

    if(left == null || right == null){
      return null;
    }else{
      if (left[1] === undefined && left[2] === undefined) {
        var leftVar = left[0];
        // ここで myVar を使う
      }

      if (right[1] === undefined && right[2] === undefined) {
        var rightVar = right[0];
        // ここで myVar を使う
      }

      return [leftVar + ast.operator + rightVar];
    }
  }

  if (ast.type === 'Literal') { // 文字・数字
    if(opt_flag === 3){
      //return ast.value;

      return [ast.value, undefined, undefined];
    }

    return null;
  }

  if (ast.type === 'Identifier') {
    if(opt_flag === 3){
      return ast.name;
    }

    return null;
  }


  if (ast.type === 'SwitchStatement') {

    return [param0, param1, opt_flag];
  }


  /*if*/
  if (ast.type === 'IfStatement'){
    return [param0, param1, opt_flag];
  }

  /*try*/
  if (ast.type === 'TryStatement') {
    /*url_Initialへ*/
    let val = loop_url(ast.block);

    return val;
  }

  if (ast.type === 'AwaitExpression'){
    const body = find_url(ast.argument, pay_flag, callee_flag, opt_flag, param0, param1);

    return body;
  }

  return null;
}

function loop_url(ast){
  /*Initialization*/
  var pay_flag = 0
  var callee_flag = 0
  var opt_flag = 0
  var param = ['', '', ''];

  let cnt = ast.body.length - 1;
  let i = 0;

  while(ast.body[i + cnt]){
    let line = ast.body[i + cnt];

    var tmp = find_url(line, pay_flag, callee_flag, opt_flag, param[0], param[1]);

    //return後
    if(tmp === undefined){
      param = ['', '', ''];

    }else{
      param = [tmp[0], tmp[1], tmp[2]];
      url_source = tmp[0]
      pay_flag = tmp[2];
      opt_flag = tmp[2];
    }

    //url変数が見つかったときに探索をスキップ
    if(opt_flag == undefined){
      return param;
    }

    i--;

    //url変数が見つからない場合
    if((i + cnt) < 0){
      return param = [tmp[0], tmp[1], 1];
    }
  }
}

function url_split(url) {
  /* / 区切りをする */
  const parts = url.split('/');

  const result = [];

  let inTokenMode = false;
  let dashCount = 0;

  for (const part of parts) {
    if (part.includes('{') || (part[0] === '+' && part[part.length - 1] === '+') || /[^\x00-\x7F]/.test(part) || part === '+undefined') {
      inTokenMode = true;
      result.push('TOKEN');
      continue;
    }

    // '-'のカウント
    dashCount += (part.split('-').length - 1);

    if (inTokenMode) {
      inTokenMode = false;
    }

    if (dashCount === 4) {
      result.push('TOKEN');
      dashCount = 0; // カウントをリセット
    } else if (part[0] === '+') {
      result.push(part.slice(1)); // +を削除してpush
    } else {
      result.push(part);
    }
  }

  return result;
}


/*option*/
function opt_initial(ast){
  let logic_flag = [false, '']

  /*Initialization*/
  var opt_flag = 0
  let opt_source = null;


  let prm = loop_opt(ast);
  opt_source = prm[0]
  pay_flag = prm[2];
  opt_flag = prm[2];


  if(opt_flag == 3){
    logic_flag[0] = true

    console.log( opt_source, '変数検出')

    return [logic_flag[0], logic_flag[1]]
  }else{
    console.log('変数', opt_source, 'が見つかりませんでした')

    return [logic_flag[0], opt_source]
  }
}

function find_opt(ast, pay_flag, callee_flag, opt_flag, param0, param1) {
  if (ast === null){
    return null;
  }


  if (ast.type === 'BlockStatement') { // 複数行の中身
    let val = loop_opt(ast, pay_flag, callee_flag, opt_flag, param0, param1);

    return val;
  }

  if (ast.type === 'ExpressionStatement') {
    return find_opt(ast.expression, pay_flag, callee_flag, opt_flag, param0, param1);
  }

  if (ast.type === 'VariableDeclaration') { // 代入式
    if (ast.kind === 'var' || ast.kind === 'const' || ast.kind === 'let') {
      const body = find_opt(ast.declarations[0].init, pay_flag, callee_flag, opt_flag, param0, param1);

      if(ast.declarations[0].id.name === param0 && opt_flag === 1){
        /*検出*/
        param0 = ast.declarations[0].id.name //内容
        param1 = ast.declarations[0].id.type //型
        opt_flag = 3;

        return [param0, param1, opt_flag];
      }else{
        let tmp = find_opt(ast.declarations[0].init, pay_flag, callee_flag, opt_flag, param0, param1);

        if(tmp === null){
          return [param0, param1, opt_flag];
        }

        return tmp;
      }
    }
  }

  if (ast.type === 'CallExpression') { // 関数呼び出し
    if(ast.callee.type === 'MemberExpression'){
      if(ast.callee.object.name === 'UrlFetchApp' && ast.callee.property.name === 'fetch'){

        callee_flag = 1 // UrlFetchApp.fetchが呼ばれたことを指すフラグ
      }
    }

    if(callee_flag === 1){
      opt_flag = 1
      callee_flag = 0
      param0 = ast.arguments[1].name
      param1 = ast.arguments[1].type

      /*UrlFetchAppのIdentifer name:url をreturn*/
      return [param0, param1, opt_flag];
    }

    return [param0, param1, opt_flag];
  }

  if (ast.type === 'FunctionDeclaration') { // ユーザ関数呼び出し
    const body = find_opt(ast.body, pay_flag, callee_flag, opt_flag, param0, param1);

    return body;
  }


  /*URL*/
  if (ast.type === 'BinaryExpression') { // +,-などの計算式
    return [param0, param1, opt_flag];
  }

  if (ast.type === 'Literal') { // 文字・数字
    if(opt_flag === 3){
      return ast.value;
    }

    return null;
  }

  if (ast.type === 'Identifier') {
    if(opt_flag === 3){
      return ast.name;
    }

    return null;
  }


  if (ast.type === 'SwitchStatement') {

    return [param0, param1, opt_flag];
  }


  /*option*/
  if (ast.type === 'ObjectExpression'){
    for (let i = ast.properties.length -1; i >= 0; i--){
      let tmp = find_opt(ast.properties[i], pay_flag, callee_flag, opt_flag, param0, param1);

      if(tmp === null){
        return [param0, param1, opt_flag];
      }
    }

    return tmp;
  }

  if(ast.type === 'Property' && ast.kind === 'init'){

    return null;
  }

  /*if*/
  if (ast.type === 'IfStatement'){
    return [param0, param1, opt_flag];
  }

  /*try*/
  if (ast.type === 'TryStatement') {
    /*url_Initialへ*/
    let val = loop_opt(ast.block);

    return val;
  }


  return null;
}

function loop_opt(ast){
  /*Initialization*/
  var pay_flag = 0
  var callee_flag = 0
  var opt_flag = 0
  var param = ['', '', ''];

  let cnt = ast.body.length - 1;
  let i = 0;

  while(ast.body[i + cnt]){
    let line = ast.body[i + cnt];

    var tmp = find_opt(line, pay_flag, callee_flag, opt_flag, param[0], param[1]);

    //return後
    if (tmp === undefined) {
      param = ['', '', ''];

    } else {
      param = [tmp[0], tmp[1], tmp[2]];
      opt_source = tmp[0]
      pay_flag = tmp[2];
      opt_flag = tmp[2];
    }
    //url変数が見つかったときに探索をスキップ
    /*option変数が見つかったときに探索をスキップ*/
    if(opt_flag == 3){
      /*深さ情報*/
      return param;
    }

    i--;

    if((i + cnt) < 0){
      return param = [tmp[0], tmp[1], 1];
    }
  }
}

/*param*/
function param_initial(ast, json, json_num){
  /***** Preparation ******/

  /*Get URL from API lists*/
  let json_url = json.nature_apis.servers[0].url + json.nature_apis.api[json_num].endpoint;

  /*Get method from API lists*/
  let json_method = json.nature_apis.api[json_num].method;

  /*Get headers from API lists*/
  let json_headers = json.nature_apis.api[json_num].headers;


  /*Get parameters from API lists*/
  let json_parameter_flag = false;
  let json_parameter = null;

  if(json.nature_apis.api[json_num].parameters == null){
    json_parameter_flag = false;
  }else{
    json_parameter_flag = true;
    json_parameter = json.nature_apis.api[json_num].parameters[0].name;
  }


  /*Get requestBody from API lists*/
  let json_payload_flag = false;
  let json_payload = null;
  let json_payload_schema = null;

  if (json.nature_apis.api[json_num].requestBody == null){
    json_payload_flag = false
  }else{
    json_payload_flag = true
    json_payload = json.nature_apis.api[json_num].requestBody.content['application/x-www-form-urlencoded'].schema['$ref']
    json_payload = json_payload.replace('/', '')
    json_payload = json_payload.replace('/', '')
    json_payload = json_payload.substr(json_payload.indexOf('/') + 1)

    json_payload_schema = json.nature_apis.schemas[json_payload].properties

  }


  /*Get responses from API lists*/
  let json_response_flag = false;
  let json_response = null;

  if (json.nature_apis.api[json_num].responses == null){
    json_response_flag = false
  }else{
    json_response_flag = true
    json_response = json.nature_apis.api[json_num].responses['200'].content['application/json'].schema['$ref']
    json_response = json_response.replace('/', '')
    json_response = json_response.replace('/', '')
    json_response = json_response.substr(json_response.indexOf('/') + 1)
  }


  /**********************/

  /*Initialization*/
  let logic_flag = [false, null, false, false];

  var pay_flag = 0;
  var callee_flag = 0;
  var opt_flag = 0;
  let info_flag = null;
  var param = ['', '', ''];

  let source = null;



  /*BlockStatement 要素数カウント*/

  /*Get method from Source Code*/
  info_flag = 0;

  let prm = loop_param(ast, info_flag);
  source = prm[0]
  pay_flag = prm[2];
  opt_flag = prm[2];

  if(opt_flag === undefined){
    if (json_method.toLowerCase() === source.toLowerCase()){
      console.log('method 一致')
      logic_flag[0] = true;
      logic_flag[1] = source;

      opt_flag = 0;

    }else{
      console.log('method 不一致')
      logic_flag[0] = false;
      logic_flag[1] = false;

      opt_flag = 0;

    }

  }else if (opt_flag === 1) {
    console.log('method 変数未検出')
    logic_flag[0] = false;
    logic_flag[1] = false;

    opt_flag = 0;
  }


  /*????????????????????????????????*/
  /*Get parameters from Source Code*/
  info_flag = 1;


  /*Get payload from Source Code*/
  info_flag = 2;
  try{
    if(json_method === 'POST'){

      prm = loop_param(ast, info_flag);
      source = prm[0];
      pay_flag = prm[2];
      opt_flag = prm[2];



      if(opt_flag === undefined && prm[1] === true){
        let objectNames = Object.keys(json_payload_schema);
        var parts = source.split(',');

        // 前部分を取得
        var firstPart = parts[0];

        // 変数と一致するオブジェクト名があるかどうかを大文字小文字を区別せずに検証
        var isVariableMatched = objectNames.some(function (name) {
          return name.toLowerCase() === firstPart.toLowerCase();
        });

        //一致するかの判定
        if (isVariableMatched){
          console.log('payload 一致')
          logic_flag[3] = true;
        }else{
          console.log('payload 不一致')
          logic_flag[3] = false;
        }
      }else{
        console.log('payload 未検出');
      }

      }
  }catch(e){

    logic_flag[3] = false;
  }

  return logic_flag;
}

function find_param(ast, pay_flag, callee_flag, opt_flag, info_flag, param0, param1) {
  if (ast === null){
    return null;
  }


  if (ast.type === 'BlockStatement') { // 複数行の中身
    let val = loop_param(ast, info_flag);

    return val;
  }

  if (ast.type === 'ExpressionStatement') {
    return find_param(ast.expression, pay_flag, callee_flag, opt_flag, info_flag, param0, param1);
  }

  if (ast.type === 'VariableDeclaration') { // 代入式
    if (ast.kind === 'var' || ast.kind === 'const' || ast.kind === 'let') {

      if(ast.declarations[0].id.name === param0 && opt_flag === 4 && info_flag === 2){
        opt_flag = 5;
      }

      const body = find_param(ast.declarations[0].init, pay_flag, callee_flag, opt_flag, info_flag, param0, param1);

      //////
      param0 = body[0];
      param1 = body[1];
      opt_flag = body[2];

      if(ast.declarations[0].id.name === param0 && opt_flag === 1 ){

        if(body[2] === undefined){
          param0 = body[0]
          param1 = body[1]
          opt_flag = body[2]

          return [param0, param1, opt_flag];
        }

        /*検出*/
        param0 = ast.declarations[0].id.name //内容
        param1 = ast.declarations[0].id.type //型
        opt_flag = 3;


        /*項目探索*/
        let tmp = find_param(ast.declarations[0].init, pay_flag, callee_flag, opt_flag, info_flag, param0, param1);

        if(tmp === null){
          return [param0, param1, opt_flag];
        }

        return [param0, param1, opt_flag];

      }else{

        if(opt_flag === 4 || opt_flag === undefined){
          return [param0, param1, opt_flag];
        }

        let tmp = find_param(ast.declarations[0].init, pay_flag, callee_flag, opt_flag, info_flag, param0, param1);

        if(tmp === null){
          return [param0, param1, opt_flag];
        }

        return tmp;
      }
    }
  }

  if (ast.type === 'CallExpression') { // 関数呼び出し
    if(ast.callee.type === 'MemberExpression'){
      if(ast.callee.object.name === 'UrlFetchApp' && ast.callee.property.name === 'fetch'){

        callee_flag = 1 // UrlFetchApp.fetchが呼ばれたことを指すフラグ
      }
    }

    if(callee_flag === 1){
      opt_flag = 1
      callee_flag = 0
      /*Get 'options' */
      param0 = ast.arguments[1].name
      param1 = ast.arguments[1].type

      /*UrlFetchAppのIdentifer name:options をreturn*/
      return [param0, param1, opt_flag];
    }

    return [param0, param1, opt_flag];
  }

  if (ast.type === 'FunctionDeclaration') { // ユーザ関数呼び出し
    const body = find_param(ast.body, pay_flag, callee_flag, opt_flag, info_flag, param0, param1);

    return body;
  }


  /*URL*/
  if (ast.type === 'BinaryExpression') { // +,-などの計算式
    return [param0, param1, opt_flag];
  }

  if (ast.type === 'Literal'){ // 文字・数字

    if(opt_flag === 3 && info_flag === 2){
      param0 = ast.key.value + ',' + ast.value.value;
      param1 = true;
      opt_flag = undefined;

      return [param0, param1, opt_flag];
    }


    if(opt_flag === 3){
      return ast.value;
    }

    return [param0, param1, opt_flag];
  }

  if (ast.type === 'Identifier' || ast.id === 'Identifier'){
    if(opt_flag === 3){
      if(info_flag === 2){
        opt_flag = 4;

        return [ast.name, param1, opt_flag];
      }
      return ast.name;
    }

    return null;
  }


  if (ast.type === 'SwitchStatement') {

    console.log('')

    for (let i = ast.cases.length - 1; i >= 0; i--) {

      var tmp = find_param(ast.cases[i], pay_flag, callee_flag, opt_flag, info_flag, param0, param1);

    }
    return [param0, param1, opt_flag];
  }


  if (ast.type === 'SwitchCase') {

    console.log('')

    return [param0, param1, opt_flag];
  }


  /*option 項目探索*/
  if (ast.type === 'ObjectExpression'){
    for (let i = ast.properties.length -1; i >= 0; i--){

      var tmp = find_param(ast.properties[i], pay_flag, callee_flag, opt_flag, info_flag, param0, param1);

      if(tmp === null){
        return [param0, param1, opt_flag];
      }

      /*
      スキップするコード追加
      */
      param0 = tmp[0]
      param1 = tmp[1]
      opt_flag = tmp[2]
      /*return後*/
      /*変数が見つかったときに探索をスキップ*/
      if(opt_flag === undefined || opt_flag === 4){
        break
      }
    }



    return [param0, param1, opt_flag];
  }



  if(ast.type === 'Property' && ast.kind === 'init'){

    /*3項目 method, headers, payload*/
    if (ast.key.value === 'method' && info_flag === 0) {

      /*項目見つかった*/
      opt_flag = 3;

      var tmp = find_param(ast.value, pay_flag, callee_flag, opt_flag, info_flag, param0, param1);

      if(tmp === null){

        return [param0, param1, opt_flag];
      }else{
        param0 = tmp;
        param1 = true;
        opt_flag = undefined;

        return [param0, param1, opt_flag];
      }

    }else if(ast.key.value === 'headers' && info_flag === 1) {

      opt_flag = 3;

      var tmp = find_param(ast.value, pay_flag, callee_flag, opt_flag, info_flag, param0, param1);

      if(tmp === null){

        return [param0, param1, opt_flag];
      }else{
        param0 = tmp;
        param1 = true;
        opt_flag = undefined;

        return [param0, param1, opt_flag];
      }

    }else if(ast.key.value === 'payload' && info_flag === 2) {

      opt_flag = 3;

      //(ast.value.typeがIdentifierである場合対応する変数を探しに行く)
      //'payload'が入っている変数名の特定
      var tmp = find_param(ast.value, pay_flag, callee_flag, opt_flag, info_flag, param0, param1);

      if(tmp === null){

        return [param0, param1, opt_flag];

        //変数名を対象に変更
      }else if(tmp[2] === 4){
        param0 = tmp[0];
        param1 = tmp[1];
        opt_flag = tmp[2];


        return [param0, param1, opt_flag];
      }else{
        param0 = tmp[0];
        param1 = true;
        opt_flag = undefined;

        return [param0, param1, opt_flag];
      }

      //changed
    }else{
      if((opt_flag === 5 || opt_flag === 3) && info_flag === 2 ){
        if (ast.value.type === 'Literal' || ast.value.type === 'Identifier'){
          /*
          param0 = ast.key.value;
          param1 = ast.value.value;
          opt_flag = undefined;
          */
          param0 = ast.key.value + ',' + ast.value.value;
          param1 = true;
          opt_flag = undefined;

          return [param0, param1, opt_flag];
        }
      }
    }

    return [param0, param1, opt_flag];
  }

  /*if*/
  if (ast.type === 'IfStatement'){
    return [param0, param1, opt_flag];
  }

  /*try*/
  if (ast.type === 'TryStatement') {
    let val = loop_param(ast.block, info_flag);

    return val;
  }


  return null;
}

function loop_param(ast, info_flag){
  /*Initialization*/
  var pay_flag = 0
  var callee_flag = 0
  var opt_flag = 0
  var param = ['', '', ''];

  let cnt = ast.body.length - 1;
  let i = 0;


  while(ast.body[i + cnt]){
    let line = ast.body[i + cnt];

    var tmp = find_param(line, pay_flag, callee_flag, opt_flag,  info_flag, param[0], param[1]);

    //return後
    if (tmp === undefined) {
      param = ['', '', ''];

    } else {
      param = [tmp[0], tmp[1], tmp[2]];
      source = tmp[0]
      pay_flag = tmp[2];
      opt_flag = tmp[2];
    }
    //url変数が見つかったときに探索をスキップ
    if(opt_flag === undefined && tmp[1] === true){
      return param;
    }

    i--;

    //変数が見つからない場合
    if ((i + cnt) < 0) {
      return param = [tmp[0], false, 1];
    }
  }
}




/*headers*/
function header_initial(ast, json, json_num){}

function find_header(ast, pay_flag, callee_flag, opt_flag, param0, param1){}
