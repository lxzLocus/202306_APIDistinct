const esprima = require('esprima');
const fs = require('fs');
const util = require('util');

function loadAndParserSrc() {
  const filename = process.argv[2];
  console.log('Loading src file:' + filename);

  const src = loadSrcFile(filename);
  const ast = parseSrc(src);

  return ast;
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





comp_api(ast1);



// ASTの特定の識別子を置換し、エンドポイントの比較を行う関数
function comp_api(ast) {
  const jsonFilePath = 'E:/Files/workspace/202306/API_json/api_latest.json';
  const jsonString = fs.readFileSync(jsonFilePath, 'utf8');
  const baseJson = JSON.parse(jsonString);


  /*url_recomm.js*/
  const searchFiles = require('D:/WorkSpace/e_drive/202306/Esprima_jp/url_recomm.js');
  const req_folderPath = 'E:/Files/workspace/202306/git-nature-js/#sort_extension/gs';
  const req_searchString = '/light';



  /*URL.fetch()*/
  /*url有無*/
  var url_logic = url_initial(ast, baseJson)
  console.log(url_logic[0], url_logic[1])

  /*url_recomm*/
  searchFiles(req_folderPath, url_logic[1]);
}







/*URL*/
function url_initial(ast, json){
  let logic_flag = [false, 0]

  /*Initialization*/
  var pay_flag = 0
  var callee_flag = 0
  var opt_flag = 0
  var param = ['', '', ''];

  let url_source = null;
  var url_source_split = null;
  var url_json_split = null;
  let cnt = 0;
  let cnt_w = 0;

  /*BlockStatement 要素数カウント*/
  while (undefined != ast.body[0].body.body[cnt]) {
    cnt++;
  }

  for (let i = cnt - 1; i >= 0; i--){
    var tmp = find_url(ast.body[0].body.body[i], pay_flag, callee_flag, opt_flag, param[0], param[1]);

    /*return後*/
    param = [tmp[0], tmp[1], tmp[2]];
    url_source = tmp[0]
    pay_flag = tmp[2];
    opt_flag = tmp[2];

    /*url変数が見つかったときに探索をスキップ*/
    if(opt_flag == undefined){
      break
    }
  }

  /*変数が見つからなかった場合*/
  if(opt_flag == 1){
    console.log('変数', url_source, 'が見つかりませんでした\n')

    return [logic_flag[0], logic_flag[1]]

  }else{

    console.log('URL 変数検出\n')
    console.log(url_source, '\n')

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
          logic_flag[1] = '/' + url_source_split[url_source_split.length - 1]
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

            console.log('ベースURL 誤り\n')

            break;
          } else if (p == server_url_split.length-1){

            console.log('URL 完全一致\n')
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
    let val = find_url(ast);

    return val;
  }

  if (ast.type === 'ExpressionStatement') {
    return find_url(ast.expression, pay_flag, callee_flag, opt_flag, param0, param1);
  }

  if (ast.type === 'VariableDeclaration') { // 代入式
    if (ast.kind === 'var' || ast.kind === 'const' || ast.kind === 'let') {
      const body = find_url(ast.declarations[0].init, pay_flag, callee_flag, opt_flag, param0, param1);

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
    if(ast.callee.type === 'MemberExpression'){
      if(ast.callee.object.name === 'UrlFetchApp' && ast.callee.property.name === 'fetch'){

        callee_flag = 1 // UrlFetchApp.fetchが呼ばれたことを指すフラグ
      }
    }

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
      return [left + ast.operator + right];
    }
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



  /*************

  更に下層にノードがある ast.type はnullではなく
  [param0, param1, opt_flag] ???????

  **************/

  return null;
}

function url_split(url){
  /* / 区切りをする */
  const parts = url.split('/');

  const result = [];

  let inTokenMode = false;

  for (const part of parts) {
    if (part.includes('{') || part.includes('+')) {
      inTokenMode = true;
      result.push('TOKEN');
      continue;
    }

    if (inTokenMode) {
      inTokenMode = false;
    }

    result.push(part);
  }

  return result;
}
