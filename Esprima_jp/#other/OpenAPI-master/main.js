const { Console } = require("console");
const esprima =require("esprima");
const fs = require('fs');

function loadAndParserSrc(){
    const filename = process.argv[2];
    console.log('Loading src file:' + filename);

    const src = loadSrcFile(filename);
    const ast = parseSrc(src);

    return ast;
}


function printObj(obj) {
    console.dir(obj, {depth: 20});
}

function loadSrcFile(filename){
    const src = fs.readFileSync(filename, 'utf-8');
    return src;
}

function parseSrc(src) {
    const ast = esprima.parseScript(src);
    return ast;
  }

function simplify(exp,option,keys,payload) {
  if (exp === null) {
    return null;
  }

  if (exp.type === 'ExpressionStatement') {
    return simplify(exp.expression,option,keys,payload);
  }
  if (exp.type === 'VariableDeclaration') {//代入式
    if(exp.kind === 'var'){
      const name = exp.declarations[0].id.name;
      const val = simplify(exp.declarations[0].init,option,keys,payload);
      if(exp.declarations[0].id.name === 'options'){
        console.log('optionを発見しました');
        option = 1;
        simplify(exp.declarations[0].init,option,keys,payload)
      }
      return ['代入', name, val];
    }
  }
  if (exp.type === 'AssignmentExpression') {//既存の変数に代入
    if (exp.left.type === 'Identifier') {
      const name = exp.left.name;
      const val = simplify(exp.right,option,keys,payload);
      return ['再代入', name, val];
    }
    if (exp.left.type === 'MemberExpression') {//配列再代入
      const name = simplify(exp.left.object,option,keys,payload);
      const prop = simplify(exp.left.property,option,keys,payload)
      const val = simplify(exp.right,option,keys,payload);
      return ['配列再代入', name, prop, val];
    }

  }

  if (exp.type === 'Literal') {//文字・数字
    if(exp.value === 'payload' && option === 1 && keys === 1 && payload === null){
        //console.log('option内でpayloadが'+exp.type+'として定義されています')
        payload = 1;
        simplify(exp,option,keys,payload)
    }
    if(option === 1 && keys === 0 && payload === 1){
      //console.log('payload内で'+exp.value+'は'+exp.type+'として設定されています')
      payload = 0;
      option = 0;
      keys = null;
    }
    return ['リテラル', exp.value, payload];
    }

  if (exp.type === 'Identifier') {//変数
    if(exp.name === 'payload' && option === 1 && keys === 1 && payload === null){
       // console.log('option内でpayloadが'+exp.type+'として定義されています')
        payload = 1;
        simplify(exp,option,keys,payload)
    }if(option === 1 && keys === 0 && payload === 1){
     // console.log('payload内で'+exp.name+'は'+exp.type+'として設定されています')
      payload = 0;
      option = 0;
      keys = null;
    }

    return ['変数', exp.name, payload]
  }
  if (exp.type === 'BinaryExpression') {//+,-などの計算式
    return ['計算', exp.operator, simplify(exp.left,option,keys,payload), simplify(exp.right,option,keys,payload)];
  }

  if (exp.type === 'IfStatement') {//if文
    const condition = simplify(exp.test,option,keys,payload);
    const positive = simplify(exp.consequent,option,keys,payload);
    if (exp.alternate) {
      const negative = simplify(exp.alternate,option,keys,payload);
      return ['条件式','if', condition, positive, 'else',negative];
    }
    return  ['条件式','if', condition, positive];
  }
  if (exp.type === 'BlockStatement') {//複数行の中身
    return makeTree(exp);
  }

  if (exp.type === 'WhileStatement') {//While文
    const condition = simplify(exp.test,option,keys,payload);
    const body = simplify(exp.body,option,keys,payload);
    return ['繰り返し','while', condition,'中身', body];
  }

  if (exp.type === 'ArrayExpression') {//配列
    const astElements = exp.elements;
    let treeElements = [];
    let i = 0;
    while (astElements[i]) {
      treeElements[i] = simplify(astElements[i],option,keys,payload);
      i = i + 1;
    }
    const tree = ['配列'].concat(treeElements);
    return tree;
  }
  if (exp.type === 'MemberExpression') {//配列を参照する
    const name = simplify(exp.object,option,keys,payload);
    const prop = simplify(exp.property,option,keys,payload);
    const tree = ['配列参照', name, prop];
    return tree;
  }
  if (exp.type === 'ObjectExpression') {//ハッシュ作成
    const astProps = exp.properties;
    let treeElements = [];
    let i = 0;
    while (astProps[i]) {
      keys = 1;
      let key = simplify(astProps[i].key,option,keys,payload);
      keys = 0;
      const val = simplify(astProps[i].value,option,keys,key[2]);
      key = simplify(astProps[i].key,option,keys,val[2]);//
      treeElements[i * 2] = key;
      treeElements[i * 2 + 1] = val;
      i = i + 1;
    }
    const tree = ['ハッシュ作成'].concat(treeElements);
    return tree;
  }
  if (exp.type === 'CallExpression') {//関数呼び出し
    if(exp.callee.type === 'MemberExpression'){
      var name = simplify(exp.callee,option,keys,payload);
    }else{
      var name = exp.callee.name
    }
    const astArgs = exp.arguments;

    let i = 0;
    let treeArgs = [];
    while (astArgs[i]) {
      treeArgs[i] = simplify(astArgs[i],option,keys,payload);
      i = i + 1;
    }

    const tree = ['関数呼び出し', name].concat(treeArgs);
    if(option === 1, keys === 0){
     // console.log('payload内は'+exp.type+'として設定されています')
      option = 0;
      keys = null;
    }
    return tree;
  }
  if (exp.type === 'FunctionDeclaration') {//ユーザ関数呼び出し
    const name = exp.id.name;
    const astParams = exp.params;

    let i = 0;
    let treeParams = [];
    while (astParams[i]) {
      treeParams[i] = astParams[i].name;
      i = i + 1;
    }

    const body = simplify(exp.body,option,keys,payload);

    const tree = ['ユーザ定義関数呼出', name, treeParams, body];
    return tree;
  }
  if (exp.type === 'ReturnStatement') {
    return ['return', simplify(exp.argument,option,keys,payload)];
  }
}

function makeTree(ast) {
    var i = 0;
    var exps = [];
    while (ast.body[i]) {
      const opt = 0;
      const key = null;
      const pay = null;
      const line = ast.body[i];
      const exp = simplify(line,opt,key,pay);
      exps[i] = exp;

      i = i + 1;
    }
    if (exps.length === 1) {
        return exps[0];
      }
    const stmts = ['複数行'].concat(exps);
    return stmts;
}

function findurl(ast1,identifername){//開発者が書いたコードのurlを取ってくる
    var i = 0;
    var urlflag = 0;
    let exp = 0
    var cobody = countbody(ast1)
    //console.log(cobody)
    var param = 0

    while(ast1.body[i+cobody-1]){
      const line = ast1.body[i+cobody-1];
      //console.log(exp)
      exp = find(line,urlflag,param);
      //console.log(exp)
      if(exp[1] === 0 || exp[1] === 1){
        param = exp[0]
        urlflag = exp[1]
      }else{
        return exp
      }
      i--
    }


    return exp,identifername;
}

function find(exp,urlflag,param){
  if (exp === null) {
    return null;
  }

  if (exp.type === 'ExpressionStatement') {
    return find(exp.expression,urlflag,param);
  }

  if (exp.type === 'VariableDeclaration') {//代入式
    if(exp.kind === 'var' || exp.kind === 'const' ||exp.kind === 'let'){
      let val = 0;
      //console.log(exp.declarations[0].id.name,param,urlflag)
      if(exp.declarations[0].id.name === param && urlflag === 1){
        //console.log('あ')
        urlflag = 2
        val = find(exp.declarations[0].init,urlflag,param);

        //console.log(val)
        return val
      }
     // urlflag = 0
      val = find(exp.declarations[0].init,urlflag,param)
      //console.log(val)
      return val;
    }
  }

  if (exp.type === 'AssignmentExpression') {//既存の変数に代入
    return null;
  }

  if (exp.type === 'MemberExpression') {//配列再代入
    return null;
  }

  if (exp.type === 'Literal') {//文字・数字
    if(urlflag === 2){
      const val = exp.value;
      return val;
    }
    return null;
    }

  if (exp.type === 'Identifier') {//変数
    if(urlflag === 2){
      if(identifername === 0){
      var val = ('{applianceid}')
      }
      if(identifername === 1){
        var val = ('{signalid}')
      }
      if(identifername === 2){
        var val = ('{homeid}')
         }
      return val;
    }

    return [param,urlflag];
    }

  if (exp.type === 'BinaryExpression') {//+,-などの計算式
   // console.log('あ')
    if(urlflag === 2){
      var valleft = find(exp.left,urlflag)
      var valright = find(exp.right,urlflag)
      var val = valleft + valright;
      return val;
    }
    return [param,urlflag];
  }

  if (exp.type === 'IfStatement') {//if文
      return null;
  }

  if (exp.type === 'BlockStatement') {//複数行の中身
    return findurl(exp,identifername);
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
  if (exp.type === 'ObjectExpression') {//ハッシュ作成
    return [param, urlflag];
  }

  if (exp.type === 'CallExpression') {//関数呼び出し
    if(exp.callee.type === 'MemberExpression'){
      if(exp.callee.object.name === 'UrlFetchApp' && exp.callee.property.name === 'fetch'){
        var param = exp.arguments[0].name
        urlflag = 1
        return [param,urlflag]
      }
    }
    return [param,urlflag];
  }
  if (exp.type === 'FunctionDeclaration') {//ユーザ関数呼び出し
    let body = find(exp.body,urlflag);
    return body;
  }
  if (exp.type === 'ReturnStatement') {
    return null;
  }
}

function matchurl(data,url,){
  for (let key in data.paths) {//jsonファイルに開発者が書いたコードのpathsの中身を検索、表示する。
    if((url.lastIndexOf(key)+key.length===url.length)&&(key.length<=url.length)){// 後方一致のときの処理
      pathsbody = data.paths[key]
      }
  }
  return pathsbody
}


function findparams(data,url){
  let name = null
  for(let key in data.components.schemas){
    if(key === url){
      name = data.components.schemas[url].properties
    }
  }
  if(name === null){
    console.log('パラメータが発見されませんでした')
  }
  return name;
}

function countbody(ast){
  var i = 0
  var count = 0
  while(ast.body[i]){
    count++;
    i++
  }
  return count;
}

function findmethod(ast){//getなのかpostなのかを返す関数
    var i = 0;
    var methodflag = 0;
    let exp = 0
    var cobody = countbody(ast)
    var param = 0
    while(ast.body[i+cobody-1]){
      const line = ast.body[i+cobody-1];
      exp = findmethod2(line,methodflag,param);
      methodflag = exp[1]
      param = exp[0]
      i--
    }
    return exp;
}


function findmethod2(exp,methodflag,param){
  if (exp === null) {
    return null;
  }

  if (exp.type === 'ExpressionStatement') {
    return findmethod2(exp.expression,methodflag,param);
  }

  if (exp.type === 'VariableDeclaration') {//代入式
    if(exp.kind === 'var' || exp.kind === 'const' ||exp.kind === 'let'){
      //console.log(param)
      if(exp.declarations[0].id.name === param && methodflag === 1){
        //console.log('あ')
         methodflag = 2
         let c = findmethod2(exp.declarations[0].init,methodflag,param)
         methodflag = c[1]
         param = c[0]
         return [param,methodflag]
       }
       let a = findmethod2(exp.declarations[0].init,methodflag,param)
       //console.log(a)
      if(a === null){
        return [param,methodflag]
      }
      return a;
    }
  }

  if (exp.type === 'AssignmentExpression') {//既存の変数に代入
    return null;
  }

  if (exp.type === 'MemberExpression') {//配列再代入
    return null;
  }

  if (exp.type === 'Literal') {//文字・数字
    if(methodflag === 2){
      const val = exp.value;
      return val;
    }
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
    return findmethod(exp);
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
  if (exp.type === 'ObjectExpression') {//ハッシュ作成
    const astProps = exp.properties;
    let i = 0;

    if(methodflag === 2){//optionの中身
    while (astProps[i]) {
      if(astProps[i].key.value === 'method'){
        param = astProps[i].value.value//右辺
        methodflag = 3
      }
      i++;
    }
  }
    return [param, methodflag];
  }

  if (exp.type === 'CallExpression') {//関数呼び出し
    if(exp.callee.type === 'MemberExpression'){
      if(exp.callee.object.name === 'UrlFetchApp' && exp.callee.property.name === 'fetch'){
        var param = exp.arguments[1].name
        methodflag = 1
        //console.log(param,methodflag)
        return [param,methodflag]
      }
    }
    return [param,methodflag];
  }
  if (exp.type === 'FunctionDeclaration') {//ユーザ関数呼び出し
    let body = findmethod2(exp.body,methodflag,param);
    return body;
  }
  if (exp.type === 'ReturnStatement') {
    return null;
  }
}


function existpayload(ast){//payloadがあるかを返す関数
  var i = 0;
  var payflag = 0;
  let exp = 0
  var cobody = countbody(ast)
  var param = 0
  while(ast.body[i+cobody-1]){
    const line = ast.body[i+cobody-1];
    exp = existpayload2(line,payflag,param);
    payflag = exp[1]
    param = exp[0]
    //console.log (exp)
    i--
  }
  return exp;//payflagが2ならpayloadは無し、3ならある
}


function existpayload2(exp,payflag,param){
if (exp === null) {
  return null;
}

if (exp.type === 'ExpressionStatement') {
  return existpayload2(exp.expression,payflag,param);
}

if (exp.type === 'VariableDeclaration') {//代入式
  if(exp.kind === 'var' || exp.kind === 'const' ||exp.kind === 'let'){
    //console.log(param)
    if(exp.declarations[0].id.name === param && payflag === 1){
      //console.log('あ')
       payflag = 2
       let c = existpayload2(exp.declarations[0].init,payflag,param)
       payflag = c[1]
       param = c[0]
       return [param,payflag]
     }
     let a = existpayload2(exp.declarations[0].init,payflag,param)
     //console.log(a)
    if(a === null){
      return [param,payflag]
    }
    return a;
  }
}

if (exp.type === 'AssignmentExpression') {//既存の変数に代入
  return null;
}

if (exp.type === 'MemberExpression') {//配列再代入
  return null;
}

if (exp.type === 'Literal') {//文字・数字
  if(payflag === 2){
    const val = exp.value;
    return val;
  }
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
  return existpayload(exp);
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
if (exp.type === 'ObjectExpression') {//ハッシュ作成
  const astProps = exp.properties;
  let i = 0;

  if(payflag === 2){//optionの中身
  while (astProps[i]) {
    if(astProps[i].key.value === 'payload'){
      payflag = 3
    }
    i++;
  }
}
  return [param,payflag];
}

if (exp.type === 'CallExpression') {//関数呼び出し
  if(exp.callee.type === 'MemberExpression'){
    if(exp.callee.object.name === 'UrlFetchApp' && exp.callee.property.name === 'fetch'){
      var param = exp.arguments[1].name
      payflag = 1
      //console.log(param,payflag)
      return [param,payflag]
    }
  }
  return [param,payflag];
}
if (exp.type === 'FunctionDeclaration') {//ユーザ関数呼び出し
  let body = existpayload2(exp.body,payflag,param);
  return body;
}
if (exp.type === 'ReturnStatement') {
  return null;
}
}



function findpayload(ast,jsonurl){//開発者が書いたコード内のpayloadの型を取ってくる
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
    let b = findpay(line,payflag,calleeflag,optflag,param1,param2,jsonurl)
    param1 = b[0];//内容(右辺)
    param2 = b[1];//型(右辺)
    param3 = b[2];
    optflag = param3
    payflag = param3
    i--
  //console.log([param1,param2,param3])
  }
  return [param1,param2,payflag];
}

function findpay(exp,payflag,calleeflag,optflag,param1,param2,jsonurl){
  if (exp === null) {
    return null;
  }

  if (exp.type === 'ExpressionStatement') {
    return findpay(exp.expression,payflag,calleeflag,optflag,param1,param2,jsonurl);
  }

  if (exp.type === 'VariableDeclaration') {//代入式
    if(exp.kind === 'var' || exp.kind === 'const' ||exp.kind === 'let'){
      if(exp.declarations[0].id.name === param1 && optflag === 1){
       // console.log('option内を探索します')
        optflag = 3
        let c = findpay(exp.declarations[0].init,payflag,calleeflag,optflag,param1,param2,jsonurl)
        param1 = c[0]
        param2 = c[1]
        optflag = c[2]
        return [param1,param2,optflag]
      }
      if(exp.declarations[0].id.name === param1 && optflag === 2){
       //console.log('payload内を探索します')
        optflag = 4
        let d = findpay(exp.declarations[0].init,payflag,calleeflag,optflag,param1,param2,jsonurl)
        param1 = d[0]
        param2 = d[1]
        optflag = d[2]
       // console.log(d)
        return [param1,param2,optflag]
      }
      let a = findpay(exp.declarations[0].init,payflag,calleeflag,optflag,param1,param2,jsonurl)
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
    let val = findpayload(exp,jsonurl)
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
      if(jsonurl !== 'EmptyObject' && astProps[i].key.value === 'payload'){
        param1 = astProps[i].value.name//右辺
        param2 = astProps[i].key.type//左辺
        payflag = 2
      }else{
        payflag = 0
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
      //console.log(param1)
    }
    }
    //console.log(param1,param2,payflag)
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
    let body = findpay(exp.body,payflag,calleeflag,optflag,param1,param2,jsonurl);
   //console.log(body)
    return body;
  }
  if (exp.type === 'ReturnStatement') {
    return null;
  }
}

function checkargument(ast,param){//関数の引数にpayloadの値が使用されているかを確認する
  let argument = null
  argument = ast.body[0].params[0].name
  console.log(argument,param)
  if(argument !== null && argument === param){
     return true;
  }else
  return false;
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

}

const ast1 =loadAndParserSrc();
console.log('-- AST ---');
printObj(ast1);
const tree = makeTree(ast1);
console.log('--------------Tree---------------');
printObj(tree);
const data = JSON.parse(fs.readFileSync('C:/Users/unico/Desktop/OpenAPI-master/natureapi.json', 'utf8'));
let identifername = 0
let url = findurl(ast1,identifername);//開発者が書いたコードのurlをjsonのswaggerの形に合わせる
if(url[1] === 1){
  console.log('変数',url[0],'が見つかりませんでした')
}else{
    if(url.match(data.servers[0].url)){//urlの最初の方がマッチするかの条件式
    var pathsbody = null
    matchurl(data,url);

    if(pathsbody === null){
      switch(identifername){
        case 0:
          identifername = 1
          url = findurl(ast1,identifername)
          matchurl(data,url);
          if(pathsbody != null){
            break;
          }
          identifername = 2
          url = findurl(ast1,identifername)
          matchurl(data,url);
          if(pathsbody != null){
            break;
          }
          console.log('あなたが書いたコードのurlはswaggerに記載されていないか間違っています')
      }
    }
    let jsonurl = pathsbody.post.requestBody.content["application/x-www-form-urlencoded"].schema['$ref']
    jsonurl = jsonurl.replace('/', '')
    jsonurl = jsonurl.replace('/', '')
    jsonurl = jsonurl.substr(jsonurl.indexOf('/')+ 1)
    //console.log(jsonurl)
    var findparam = findparams(data,jsonurl)//findparamはjsonに書かれているrequestbodyの中身
    //console.log(findparam)
    let findmethods = findmethod(ast1)//開発者が書いたコードはGETなのかPOSTなのかを取得する関数。メソッドの文字列を取得
    findmethods = findmethods[0]
    let existpayloads = existpayload(ast1)//開発者が書いたコードにpayloadがあるかどうか.2なら無し、3ならあり
    //console.log(jsonurl,existpayloads[1])
    if(jsonurl !== 'EmptyObject' && existpayloads[1] === 3){//requestbodyの中身が空ではなく、かつ開発者の書いたコードにpayloadが含まれているなら。。。
    //以下はpayloadの中身を取得するコード
    let findpayloads = findpayload(ast1,jsonurl)
    if(findpayloads[2] === 1 || findpayloads[2] === 2){
     // console.log(ast1.body[0].params)
      if(ast1.body[0].params != []){
        //console.log('あ')
      let checkarguments  = checkargument(ast1,findpayloads[0])
      if(checkarguments === false){
        console.log('変数',findpayloads[0],'が見つかりませんでした!')
      }else{
        console.log('payloadの値は関数の引数に提示されています')
      }
    }else{

    }
    }else{

      console.log(findpayloads[0],findpayloads[1],findparam)
      //console.log(findpayloads)
      /////////////正しいとき（順当に行ったとき）の処理/////////////
     matchrequestbody(findpayloads[0],findpayloads[1],findparam)
     //console.log(data.components.schemas.LightParams.properties.button.type)
    }
  }else if(jsonurl === 'EmptyObject' && existpayloads[1] === 2){//requestbodyの中身が無く、かつ開発者の書いたコードにpayloadが含まれていなければ。。。
    console.log('このAPIは'+findmethods+'であり、payloadが含まれていません。正しく記述できています')
  }else{
   console.log('このAPIは'+findmethods+'ですが、payloadは含まれていません。')
  }

  }else{
    console.log('urlの記述が間違っています')
  }
}
