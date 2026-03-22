
const ast1 =loadAndParserSrc();
console.log('-- AST ---');
printObj(ast1);
const tree = makeTree(ast1);
console.log('--------------Tree---------------');
printObj(tree);

function findpayload(ast){//開発者が書いたコード内のpayloadの型を取ってくる
  var i = 0
  var payflag = 0
  var calleeflag = 0
  var optflag = 0
  var param1 = 0　//payloadの中身を格納する
  var param2 = 0//payloadの型を格納する
  var param3 = 0
  var cobody = countbody(ast)//ast.bodyが何個あるかを数える
  //console.log(cobody)
  while (ast.body[i+cobody-1]) {//開発者が書いたコードの後ろからoptionを検索する
    const line = ast.body[i+cobody-1]
    let b = findpay(line,payflag,calleeflag,optflag,param1,param2)

    param1 = b[0];//内容(右辺)
    param2 = b[1];//型(右辺)
    param3 = b[2];
    optflag = param3
    payflag = param3
    i--
  //console.log([param1,param2,param3])
  }
  return [param1,param2,optflag];
}

function findpay(exp,payflag,calleeflag,optflag,param1,param2){
  if (exp === null) {
    return null;
  }

  if (exp.type === 'ExpressionStatement') {
    return findpay(exp.expression,payflag,calleeflag,optflag,param1,param2);
  }

  if (exp.type === 'VariableDeclaration') {//代入式
    if(exp.kind === 'var' || exp.kind === 'const' ||exp.kind === 'let'){

      if(exp.declarations[0].id.name === param1 && optflag === 1){
       // console.log('option内を探索します')
        optflag = 3
        let c = findpay(exp.declarations[0].init,payflag,calleeflag,optflag,param1,param2)
        param1 = c[0]
        param2 = c[1]
        optflag = c[2]
        return [param1,param2,optflag]
      }
      if(exp.declarations[0].id.name === param1 && optflag === 2){
       //console.log('payload内を探索します')
        optflag = 4
        let d = findpay(exp.declarations[0].init,payflag,calleeflag,optflag,param1,param2)
        param1 = d[0]
        param2 = d[1]
        optflag = d[2]
       // console.log(d)
        return [param1,param2,optflag]
      }

      let a = findpay(exp.declarations[0].init,payflag,calleeflag,optflag,param1,param2)
      if(a === null){
        return [param1,param2,optflag]
      }

      return a;

    }
  }

  if (exp.type === 'AssignmentExpression') {//既存の変数に代入
    return null;
  }

  if (exp.type === 'Literal') {//文字・数字
    return null;
    }

  if (exp.type === 'Identifier') {//変数
    return null;
    }

  if (exp.type === 'BinaryExpression') {//+,-などの計算式
    return null;
  }

  if (exp.type === 'IfStatement') {//if文
      return null;
  }

  if (exp.type === 'BlockStatement') {//複数行の中身
    let val = findpayload(exp)
    //console.log(val)
    return val
  }

  if (exp.type === 'WhileStatement') {//While文
    return null;
  }

  if (exp.type === 'ArrayExpression') {//配列
    return null;
  }
  if (exp.type === 'MemberExpression') {//配列を参照する
    return null;
  }



  if (exp.type === 'ObjectExpression') {//ハッシュ
    const astProps = exp.properties;
    let i = 0;

    if(optflag === 3){//optionの中身
      while (astProps[i]) {
        if(astProps[i].key.value === 'payload'){
          param1 = astProps[i].value.name//右辺
          param2 = astProps[i].key.type//左辺
          payflag = 2
        }
        i++;
      }
    }
    if(optflag === 4){//payloadの中身
      while (astProps[i]) {
        if(astProps[i].key.type === 'Literal'){
          param1 = astProps[i].key.value//右辺
        }else if(astProps[i].key.type === 'Identifer'){
          param1 = astProps[i].key.name//右辺
        }

        param2 = astProps[i].key.type//左辺
        payflag = 0
        i++;
        console.log(param1)
      }
    }
    return [param1, param2,payflag];
  }

  if (exp.type === 'CallExpression') {//関数呼び出し
    if(exp.callee.type === 'MemberExpression'){
      if(exp.callee.object.name === 'UrlFetchApp' && exp.callee.property.name === 'fetch'){
        calleeflag = 1 // UrlFetchApp.fetchが呼ばれたことを指すフラグ
      }
    }
    if(calleeflag === 1){
      optflag = 1
      calleeflag = 0
      param1 = exp.arguments[1].name
      param2 = exp.arguments[1].type
      return [param1,param2,optflag]
    }
    return [param1,param2,optflag];
  }

  if (exp.type === 'FunctionDeclaration') {//ユーザ関数呼び出し
    let body = findpay(exp.body,payflag,calleeflag,optflag,param1,param2);
   //console.log(body)
    return body;
  }

  if (exp.type === 'ReturnStatement') {
    return null;
  }
}

function matchrequestbody(name,type,param){
  var functionList = new Array()
  functionList.button = function(){
    var type1 = data.components.schemas.LightParams.properties.button.type
    if(type1 === 'string'){
      type1 = 'Literal'
    }
    if(type === type1){
      console.log('あなたが定義したpayloadの型はSwaggerに記載されている型と一致しました')
    }else{
      console.log('あなたが定義したpayloadの型は'+type+'ですが、Swaggerには'+type1+'と記載されています')
    }
  }

  var NextAction = name
  functionList[NextAction]()
  //console.log(data.components.schemas.LightParams.properties)
}


const data = JSON.parse(fs.readFileSync('C:/Users/8ymgs/Documents/javascripttest/natureapi.json', 'utf8'));
let url = findurl(ast1);//開発者が書いたコードのurlをjsonのswaggerの形に合わせる

if(url[1] === 1){
  console.log('変数',url[0],'が見つかりませんでした')
}else{
  console.log(url)
  if(url.match(data.servers[0].url)){//urlがマッチするかの条件式
    var pathsbody = null
    for (let key in data.paths) {//jsonファイルに開発者が書いたコードのpathsの中身を検索、表示する。
      if((url.lastIndexOf(key)+key.length===url.length)&&(key.length<=url.length)){// 後方一致のときの処理
        pathsbody = data.paths[key]
        //console.log(pathsbody)
        }
    }
    if(pathsbody === null){
      console.log('あなたが書いたコードのurlはswaggerに記載されていないか間違っています')
    }else{
      var jsonurl = pathsbody.post.requestBody.content["application/x-www-form-urlencoded"].schema['$ref']
      //console.log(jsonurl)
      jsonurl = jsonurl.replace('/', '')
      jsonurl = jsonurl.replace('/', '')
      jsonurl = jsonurl.substr(jsonurl.indexOf('/')+ 1)
      //console.log(jsonurl)
      var findparam = findparams(data,jsonurl)
      //console.log(findparam)//findparamはjsonに書かれているrequestbodyの中身

      //以下はpayloadの中身を取得するコード

      let findpayloads = findpayload(ast1)
      if(findpayloads[2] === 1 || findpayloads[2] === 2){
        console.log('変数',findpayloads[0],'が見つかりませんでした')
      }else {
        console.log(findpayloads[0],findpayloads[1])
        /////////////正しいとき（順当に行ったとき）の処理/////////////
       var match = matchrequestbody(findpayloads[0],findpayloads[1],findparam)
       //console.log(data.components.schemas.LightParams.properties.button.type)
      }
    }
  }else{
    console.log('urlの記述が間違っています')
  }
}

























/*origin*/
function findpayload(ast){//開発者が書いたコード内のpayloadの型を取ってくる
  var i = 0
  var payflag = 0
  var calleeflag = 0
  var optflag = 0
  var param1 = 0　//payloadの中身を格納する
  var param2 = 0//payloadの型を格納する
  var param3 = 0
  var cobody = countbody(ast)//ast.bodyが何個あるかを数える
  //console.log(cobody)
  while (ast.body[i+cobody-1]) {//開発者が書いたコードの後ろからoptionを検索する
    const line = ast.body[i+cobody-1]
    let b = findpay(line,payflag,calleeflag,optflag,param1,param2)
    param1 = b[0];//内容(右辺)
    param2 = b[1];//型(右辺)
    param3 = b[2];
    optflag = param3
    payflag = param3
    i--
  //console.log([param1,param2,param3])
  }
  return [param1,param2,optflag];
}

function findpay(exp,payflag,calleeflag,optflag,param1,param2){
  if (exp === null) {
    return null;
  }

  if (exp.type === 'ExpressionStatement') {
    return findpay(exp.expression,payflag,calleeflag,optflag,param1,param2);
  }

  if (exp.type === 'VariableDeclaration') {//代入式
    if(exp.kind === 'var' || exp.kind === 'const' ||exp.kind === 'let'){
      if(exp.declarations[0].id.name === param1 && optflag === 1){
       // console.log('option内を探索します')
        optflag = 3
        let c = findpay(exp.declarations[0].init,payflag,calleeflag,optflag,param1,param2)
        param1 = c[0]
        param2 = c[1]
        optflag = c[2]
        return [param1,param2,optflag]
      }
      if(exp.declarations[0].id.name === param1 && optflag === 2){
       //console.log('payload内を探索します')
        optflag = 4
        let d = findpay(exp.declarations[0].init,payflag,calleeflag,optflag,param1,param2)
        param1 = d[0]
        param2 = d[1]
        optflag = d[2]
       // console.log(d)
        return [param1,param2,optflag]
      }
      let a = findpay(exp.declarations[0].init,payflag,calleeflag,optflag,param1,param2)
      if(a === null){
        return [param1,param2,optflag]
      }
      return a;
    }
  }

  if (exp.type === 'AssignmentExpression') {//既存の変数に代入
    return null;
  }

  if (exp.type === 'Literal') {//文字・数字
    return null;
    }

  if (exp.type === 'Identifier') {//変数
    return null;
    }

  if (exp.type === 'BinaryExpression') {//+,-などの計算式
    return null;
  }

  if (exp.type === 'IfStatement') {//if文
      return null;
  }

  if (exp.type === 'BlockStatement') {//複数行の中身
    let val = findpayload(exp)
    //console.log(val)
    return val
  }

  if (exp.type === 'WhileStatement') {//While文
    return null;
  }

  if (exp.type === 'ArrayExpression') {//配列
    return null;
  }
  if (exp.type === 'MemberExpression') {//配列を参照する
    return null;
  }
  if (exp.type === 'ObjectExpression') {//ハッシュ
    const astProps = exp.properties;
    let i = 0;

    if(optflag === 3){//optionの中身
    while (astProps[i]) {
      if(astProps[i].key.value === 'payload'){
        param1 = astProps[i].value.name//右辺
        param2 = astProps[i].key.type//左辺
        payflag = 2
      }
      i++;
    }
  }
  if(optflag === 4){//payloadの中身
    while (astProps[i]) {
      if(astProps[i].key.type === 'Literal'){
      param1 = astProps[i].key.value//右辺
      }else if(astProps[i].key.type === 'Identifer'){
      param1 = astProps[i].key.name//右辺
      }
      param2 = astProps[i].key.type//左辺
      payflag = 0
      i++;
      console.log(param1)
    }
    }
    return [param1, param2,payflag];
  }

  if (exp.type === 'CallExpression') {//関数呼び出し
    if(exp.callee.type === 'MemberExpression'){
      if(exp.callee.object.name === 'UrlFetchApp' && exp.callee.property.name === 'fetch'){
        calleeflag = 1 // UrlFetchApp.fetchが呼ばれたことを指すフラグ
      }
    }
    if(calleeflag === 1){
      optflag = 1
      calleeflag = 0
      param1 = exp.arguments[1].name
      param2 = exp.arguments[1].type
      return [param1,param2,optflag]
    }
    return [param1,param2,optflag];
  }

  if (exp.type === 'FunctionDeclaration') {//ユーザ関数呼び出し
    let body = findpay(exp.body,payflag,calleeflag,optflag,param1,param2);
   //console.log(body)
    return body;
  }
  if (exp.type === 'ReturnStatement') {
    return null;
  }
}

function matchrequestbody(name,type,param){
  var functionList = new Array()
  functionList.button = function(){
    var type1 = data.components.schemas.LightParams.properties.button.type
    if(type1 === 'string'){
      type1 = 'Literal'
    }
    if(type === type1){
      console.log('あなたが定義したpayloadの型はSwaggerに記載されている型と一致しました')
    }else{
      console.log('あなたが定義したpayloadの型は'+type+'ですが、Swaggerには'+type1+'と記載されています')
    }
  }

  var NextAction = name
  functionList[NextAction]()
  //console.log(data.components.schemas.LightParams.properties)
}

const ast1 =loadAndParserSrc();
console.log('-- AST ---');
printObj(ast1);
const tree = makeTree(ast1);
console.log('--------------Tree---------------');
printObj(tree);

const data = JSON.parse(fs.readFileSync('C:/Users/8ymgs/Documents/javascripttest/natureapi.json', 'utf8'));
let url = findurl(ast1);//開発者が書いたコードのurlをjsonのswaggerの形に合わせる

if(url[1] === 1){
  console.log('変数',url[0],'が見つかりませんでした')
}else{
    console.log(url)
    if(url.match(data.servers[0].url)){//urlがマッチするかの条件式
    var pathsbody = null

    for (let key in data.paths) {//jsonファイルに開発者が書いたコードのpathsの中身を検索、表示する。
      if((url.lastIndexOf(key)+key.length===url.length)&&(key.length<=url.length)){// 後方一致のときの処理
        pathsbody = data.paths[key]
        //console.log(pathsbody)
        }
    }

    if(pathsbody === null){
      console.log('あなたが書いたコードのurlはswaggerに記載されていないか間違っています')
    }else{
      var jsonurl = pathsbody.post.requestBody.content["application/x-www-form-urlencoded"].schema['$ref']
      //console.log(jsonurl)
      jsonurl = jsonurl.replace('/', '')
      jsonurl = jsonurl.replace('/', '')
      jsonurl = jsonurl.substr(jsonurl.indexOf('/')+ 1)
      //console.log(jsonurl)
      var findparam = findparams(data,jsonurl)
      //console.log(findparam)//findparamはjsonに書かれているrequestbodyの中身

      //以下はpayloadの中身を取得するコード

      let findpayloads = findpayload(ast1)
      if(findpayloads[2] === 1 || findpayloads[2] === 2){
        console.log('変数',findpayloads[0],'が見つかりませんでした')
      }else {
        console.log(findpayloads[0],findpayloads[1])
        /////////////正しいとき（順当に行ったとき）の処理/////////////
       var match = matchrequestbody(findpayloads[0],findpayloads[1],findparam)
       //console.log(data.components.schemas.LightParams.properties.button.type)
      }
    }
  }else{
    console.log('urlの記述が間違っています')
  }
}
