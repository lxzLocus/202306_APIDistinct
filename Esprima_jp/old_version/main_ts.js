const esprima = require("esprima");
const fs = require('fs');
const util = require('util');

function loadAndParserSrc() {
  const filename = process.argv[2];
  console.log('Loading src file:' + filename);

  const src = loadSrcFile(filename);
  const ast = parseSrc(src);

  return ast;
}


function printObj(obj) {
  console.dir(obj, { depth: 10 });

}

function loadSrcFile(filename) {
  const src = fs.readFileSync(filename, 'utf-8');
  return src;
}

function parseSrc(src) {
  const tokens = esprima.tokenize(src);
  const ast = esprima.parseScript(src);
  attachTokensToAST(ast, tokens);

  return ast;
}

function attachTokensToAST(ast, tokens) {
  let tokenIndex = 0;

  function walk(node) {
    if (Array.isArray(node)) {
      node.forEach(walk);
    } else if (node && typeof node == 'object') {
      for (const key in node) {
        if (node.hasOwnProperty(key)) {
          const child = node[key];
          if (child && typeof child == 'object') {
            if (child.type == 'Identifier' || child.type == 'Literal') {
              const token = tokens[tokenIndex++];
              child.start = token.start;
              child.end = token.end;
            }
            walk(child);
          }
        }
      }
    }
  }

  walk(ast);
}

function simplify(exp, option, keys, payload) {
  if (exp === null) {
    return null;
  }

  if (exp.type === 'ExpressionStatement') {
    return simplify(exp.expression, option, keys, payload);
  }
  if (exp.type === 'VariableDeclaration') {//代入式
    if (exp.kind === 'var') {
      const name = exp.declarations[0].id.name;
      const val = simplify(exp.declarations[0].init, option, keys, payload);
      if (exp.declarations[0].id.name === 'options') {
        console.log('optionを発見しました');
        option = 1;
        simplify(exp.declarations[0].init, option, keys, payload)
      }
      return ['代入', name, val];
    }
  }
  if (exp.type === 'AssignmentExpression') {//既存の変数に代入
    if (exp.left.type === 'Identifier') {
      const name = exp.left.name;
      const val = simplify(exp.right, option, keys, payload);
      return ['再代入', name, val];
    }
    if (exp.left.type === 'MemberExpression') {//配列再代入
      const name = simplify(exp.left.object, option, keys, payload);
      const prop = simplify(exp.left.property, option, keys, payload)
      const val = simplify(exp.right, option, keys, payload);
      return ['配列再代入', name, prop, val];
    }

  }

  if (exp.type === 'Literal') {//文字・数字
    if (exp.value === 'payload' && option === 1 && keys === 1 && payload === null) {
      console.log('option内でpayloadが' + exp.type + 'として定義されています')
      payload = 1;
      simplify(exp, option, keys, payload)
    }
    if (option === 1 && keys === 0 && payload === 1) {
      console.log('payload内で' + exp.value + 'は' + exp.type + 'として設定されています')
      payload = 0;
      option = 0;
      keys = null;
    }
    return ['リテラル', exp.value, payload];
  }

  if (exp.type === 'Identifier') {//変数
    if (exp.name === 'payload' && option === 1 && keys === 1 && payload === null) {
      console.log('option内でpayloadが' + exp.type + 'として定義されています')
      payload = 1;
      simplify(exp, option, keys, payload)
    } if (option === 1 && keys === 0 && payload === 1) {
      console.log('payload内で' + exp.name + 'は' + exp.type + 'として設定されています')
      payload = 0;
      option = 0;
      keys = null;
    }

    return ['変数', exp.name, payload]
  }
  if (exp.type === 'BinaryExpression') {//+,-などの計算式
    return ['計算', exp.operator, simplify(exp.left, option, keys, payload), simplify(exp.right, option, keys, payload)];
  }

  if (exp.type === 'IfStatement') {//if文
    const condition = simplify(exp.test, option, keys, payload);
    const positive = simplify(exp.consequent, option, keys, payload);
    if (exp.alternate) {
      const negative = simplify(exp.alternate, option, keys, payload);
      return ['条件式', 'if', condition, positive, 'else', negative];
    }
    return ['条件式', 'if', condition, positive];
  }
  if (exp.type === 'BlockStatement') {//複数行の中身
    return makeTree(exp);
  }

  if (exp.type === 'WhileStatement') {//While文
    const condition = simplify(exp.test, option, keys, payload);
    const body = simplify(exp.body, option, keys, payload);
    return ['繰り返し', 'while', condition, '中身', body];
  }

  if (exp.type === 'ArrayExpression') {//配列
    const astElements = exp.elements;
    let treeElements = [];
    let i = 0;
    while (astElements[i]) {
      treeElements[i] = simplify(astElements[i], option, keys, payload);
      i = i + 1;
    }
    const tree = ['配列'].concat(treeElements);
    return tree;
  }
  if (exp.type === 'MemberExpression') {//配列を参照する
    const name = simplify(exp.object, option, keys, payload);
    const prop = simplify(exp.property, option, keys, payload);
    const tree = ['配列参照', name, prop];
    return tree;
  }
  if (exp.type === 'ObjectExpression') {//ハッシュ作成
    const astProps = exp.properties;
    let treeElements = [];
    let i = 0;
    while (astProps[i]) {
      keys = 1;
      let key = simplify(astProps[i].key, option, keys, payload);
      keys = 0;
      const val = simplify(astProps[i].value, option, keys, key[2]);
      key = simplify(astProps[i].key, option, keys, val[2]);//
      treeElements[i * 2] = key;
      treeElements[i * 2 + 1] = val;
      i = i + 1;
    }
    const tree = ['ハッシュ作成'].concat(treeElements);
    return tree;
  }
  if (exp.type === 'CallExpression') {//関数呼び出し
    if (exp.callee.type === 'MemberExpression') {
      var name = simplify(exp.callee, option, keys, payload);
    } else {
      var name = exp.callee.name
    }
    const astArgs = exp.arguments;

    let i = 0;
    let treeArgs = [];
    while (astArgs[i]) {
      treeArgs[i] = simplify(astArgs[i], option, keys, payload);
      i = i + 1;
    }

    const tree = ['関数呼び出し', name].concat(treeArgs);
    if (option === 1, keys === 0) {
      console.log('payload内は' + exp.type + 'として設定されています')
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

    const body = simplify(exp.body, option, keys, payload);

    const tree = ['ユーザ定義関数呼出', name, treeParams, body];
    return tree;
  }
  if (exp.type === 'ReturnStatement') {
    return ['return', simplify(exp.argument, option, keys, payload)];
  }
}

function makeTree(ast) {
  var i = 0;
  var asts = [];
  while (ast.body[i]) {
    const opt = 0;
    const key = null;
    const pay = null;
    const line = ast.body[i];
    const exp = simplify(line, opt, key, pay);
    asts[i] = exp;

    i = i + 1;
  }
  if (asts.length == 1) {
    return asts[0];
  }
  const stmts = ['複数行'].concat(asts);
  return stmts;
}

const ast1 = loadAndParserSrc();
console.log('-- AST ---');
printObj(ast1);



/*
Path = 'C:/Users/unico/Desktop'
const fileNameWithExtension = process.argv[2].split('\\').pop();
const fileName = fileNameWithExtension.split('.')[0];

Absolute_path = Path + '/' + fileName + '.txt';


const textData = util.inspect(ast1, {depth: 10});
fs.writeFileSync(Absolute_path, textData);
*/









comp_api(ast1);

// ASTの特定の識別子を置換し、エンドポイントの比較を行う関数
function comp_api(ast) {
  const jsonFilePath = 'E:/Files/workspace/202306/nature_sort.json';
  const jsonString = fs.readFileSync(jsonFilePath, 'utf8');
  const baseJson = JSON.parse(jsonString);

  var tmp = 0;
  var url = [0, 1];

  while(undefined != baseJson.nature_apis[tmp]){
    var JsonEndpoint = baseJson.nature_apis[tmp].endpoint
    /*
    if(url[0] === JsonEndpoint){

    }else{
      url[1] = 1;
    }
    */
    tmp++;
  }

  if(url[1] === 1){
    console.log('変数', url[0], 'が見つかりませんでした')
  }else{

    console.log(url)
    if (url.match(data.servers[0].url)) {//urlがマッチするかの条件式
      var pathsbody = null

      for (let key in data.paths) {//jsonファイルに開発者が書いたコードのpathsの中身を検索、表示する。
        if ((url.lastIndexOf(key) + key.length === url.length) && (key.length <= url.length)) {// 後方一致のときの処理
          pathsbody = data.paths[key]
          //console.log(pathsbody)
        }
      }

      if (pathsbody === null) {
        console.log('あなたが書いたコードのurlはswaggerに記載されていないか間違っています')
      } else {
        var jsonurl = pathsbody.post.requestBody.content["application/x-www-form-urlencoded"].schema['$ref']
        //console.log(jsonurl)
        jsonurl = jsonurl.replace('/', '')
        jsonurl = jsonurl.replace('/', '')
        jsonurl = jsonurl.substr(jsonurl.indexOf('/') + 1)
        //console.log(jsonurl)
        var findparam = findparams(data, jsonurl)
        //console.log(findparam)//findparamはjsonに書かれているrequestbodyの中身

        let find_payload = find_url(ast);

        if(find_payload[2] === 1 || find_payload[2] === 2){
          console.log('変数', find_payload[0], 'が見つかりませんでした')
        } else {
          console.log(find_payload[0], find_payload[1])

          //var match = match_reqbody(find_payload[0], find_payload[1], find_param)
        }
      }
    }else{
      console.log('urlの記述が間違っています')
    }
  }
}

function find_url(ast) {
  /*Initialization*/
  var pay_flag = 0
  var callee_flag = 0
  var opt_flag = 0
  var param = [0, 0, 0];

  let cnt = 0;

  /*BlockStatement 要素数カウント*/
  while (undefined != ast.body[0].body.body[cnt]) {
    cnt++;
  }

  for (let i = cnt - 1; i >= 0; i--){
    var tmp = find_loop(ast.body[0].body.body[i], pay_flag, callee_flag, opt_flag, param[0], param[1]);

    /*return後*/
    param = [tmp[0], tmp[1], tmp[2]];
    pay_flag = tmp[2];
    opt_flag = tmp[2];
  }

  return [param[0], param[1], opt_flag];
}

function find_loop(ast, pay_flag, callee_flag, opt_flag, param0, param1) {
  if (ast === null) {
    return null;
  }

  if (ast.type === 'ExpressionStatement') {
    return find_loop(ast.expression, pay_flag, callee_flag, opt_flag, param0, param1);
  }

  if (ast.type === 'VariableDeclaration') { // 代入式
    if (ast.kind === 'var' || ast.kind === 'const' || ast.kind === 'let') {
      const body = find_loop(ast.declarations[0].init, pay_flag, callee_flag, opt_flag, param0, param1);


      if(ast.declarations[0].id.name === param0 && opt_flag === 1){
        /*option内の探索*/
        opt_flag = 3;
        let tmp = find_loop(ast.declarations[0].init, pay_flag, callee_flag, opt_flag, param0, param1);

        param0 = tmp[0]
        param1 = tmp[1]
        opt_flag = tmp[2]

        return [param0, param1, opt_flag];
      }else if(ast.declarations[0].id.name === param0 && opt_flag === 2){
        /*payload内の探索*/
        opt_flag = 4;
        let tmp = find_loop(ast.declarations[0].init, pay_flag, callee_flag, opt_flag, param0, param1);

        param0 = tmp[0]
        param1 = tmp[1]
        opt_flag = tmp[2]

        return [param0, param1, opt_flag];
      }else{
        let tmp = find_loop(ast.declarations[0].init, pay_flag, callee_flag, opt_flag, param0, param1);

        if(tmp === null){
          return [param0, param1, opt_flag];
        }

        return tmp;
      }
    }
  }

  if (ast.type === 'AssignmentExpression') { // 既存の変数に代入
    return null;
  }

  if (ast.type === 'Literal') { // 文字・数字
    return null;
  }

  if (ast.type === 'Identifier') { // 変数
    return null;
  }

  if (ast.type === 'BinaryExpression') { // +,-などの計算式
    return null;
  }

  if (ast.type === 'IfStatement') { // if文
    return null;
  }

  if (ast.type === 'BlockStatement') { // 複数行の中身
    let val = find_url(ast);

    return val;
  }

  if (ast.type === 'WhileStatement') { // While文
    return null;
  }

  if (ast.type === 'ArrayExpression') { // 配列
    return null;
  }

  if (ast.type === 'MemberExpression') { // 配列を参照する
    return null;
  }

  if (ast.type === 'ObjectExpression') { // ハッシュ作成
    const props = ast.properties;
    let i = 0;

    if(opt_flag === 3){//optionの中身
      while (props[i]) {
        if(props[i].key.value === 'payload'){
          param0 = props[i].value.name//右辺
          param1 = props[i].key.type//左辺
          pay_flag = 2
        }
        i++;
      }
    }

    if(opt_flag === 4){//payloadの中身
      while (props[i]) {
        if(props[i].key.type === 'Literal'){
          param0 = props[i].key.value//右辺

        }else if(props[i].key.type === 'Identifer'){
          param0 = props[i].key.name//右辺

        }

        param1 = props[i].key.type//左辺
        pay_flag = 0
        i++;
        console.log(param0)
      }
    }

    return [param0, param1, opt_flag];
  }

  if (ast.type === 'CallExpression') { // 関数呼び出し
    if(ast.callee.type === 'MemberExpression'){
      if(ast.callee.object.name === 'UrlFetchApp' && ast.callee.property.name === 'fetch'){

        callee_flag = 1 // UrlFetchApp.fetchが呼ばれたことを指すフラグ
      }
    }

    if(callee_flag === 1){
      optflag = 1
      callee_flag = 0
      param0 = ast.arguments[1].name
      param1 = ast.arguments[1].type

      return [param0, param1, opt_flag];
    }

    return [param0, param1, opt_flag];
  }

  if (ast.type === 'FunctionDeclaration') { // ユーザ関数呼び出し
    const body = find_loop(ast.body, pay_flag, callee_flag, opt_flag, param0, param1);

    return body;
  }


  if (ast.type === 'ReturnStatement') {
    return null;
  }

  // 追加の分岐をここに追加する



  return null;
}

function match_reqbody(name,type,param){
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
