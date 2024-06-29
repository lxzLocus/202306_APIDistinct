const esprima = require('esprima');
const fs = require('fs');
const util = require('util');

module.exports = main;


function loadAndParserSrc(processFile) {
  //const filename = process.argv[2];
  const filename = processFile;
  console.log('Loading src file: %s\n', filename);

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


/*******MAIN_PROGRAMS*******/
function main(path){
  /*create_AST*/
  let ast1;
  try{
    ast1 = loadAndParserSrc(path);

  }catch(e){
    console.log(path);
    console.log('exception creating AST\n');

    return '000';
  }

  /*
  console.log('-- AST ---');
  printObj(ast1);
  */


  /*analyze.js*/
  const analyze_Prog = require('./analyze.js');
  const result = analyze_Prog(ast1);

  //console.log('\n')
  console.log('Response : %s\n', result);

  return result;
}
