Script {
  type: 'Program',
  body: [
    FunctionDeclaration {
      type: 'FunctionDeclaration',
      id: Identifier { type: 'Identifier', name: 'test_light' },
      params: [],
      body: BlockStatement {
        type: 'BlockStatement',
        body: [
          VariableDeclaration {
            type: 'VariableDeclaration',
            declarations: [
              VariableDeclarator {
                type: 'VariableDeclarator',
                id: Identifier { type: 'Identifier', name: 'url' },
                init: BinaryExpression {
                  type: 'BinaryExpression',
                  operator: '+',
                  left: BinaryExpression {
                    type: 'BinaryExpression',
                    operator: '+',
                    left: Literal {
                      type: 'Literal',
                      value: 'https://api.nature.global/1/appliances/',
                      raw: "'https://api.nature.global/1/appliances/'"
                    },
                    right: Identifier { type: 'Identifier', name: 'light_id' }
                  },
                  right: Literal {
                    type: 'Literal',
                    value: '/light',
                    raw: "'/light'"
                  }
                }
              }
            ],
            kind: 'var'
          },
          VariableDeclaration {
            type: 'VariableDeclaration',
            declarations: [
              VariableDeclarator {
                type: 'VariableDeclarator',
                id: Identifier { type: 'Identifier', name: 'headers' },
                init: ObjectExpression {
                  type: 'ObjectExpression',
                  properties: [
                    Property {
                      type: 'Property',
                      key: Literal {
                        type: 'Literal',
                        value: 'Authorization',
                        raw: "'Authorization'"
                      },
                      computed: false,
                      value: BinaryExpression {
                        type: 'BinaryExpression',
                        operator: '+',
                        left: Literal {
                          type: 'Literal',
                          value: 'Bearer ',
                          raw: "'Bearer '"
                        },
                        right: Identifier {
                          type: 'Identifier',
                          name: 'remo_access_token'
                        }
                      },
                      kind: 'init',
                      method: false,
                      shorthand: false
                    }
                  ]
                }
              }
            ],
            kind: 'var'
          },
          VariableDeclaration {
            type: 'VariableDeclaration',
            declarations: [
              VariableDeclarator {
                type: 'VariableDeclarator',
                id: Identifier { type: 'Identifier', name: 'payload' },
                init: ObjectExpression {
                  type: 'ObjectExpression',
                  properties: [
                    Property {
                      type: 'Property',
                      key: Identifier { type: 'Identifier', name: 'button' },
                      computed: false,
                      value: Literal {
                        type: 'Literal',
                        value: 'on',
                        raw: "'on'"
                      },
                      kind: 'init',
                      method: false,
                      shorthand: false
                    }
                  ]
                }
              }
            ],
            kind: 'var'
          },
          VariableDeclaration {
            type: 'VariableDeclaration',
            declarations: [
              VariableDeclarator {
                type: 'VariableDeclarator',
                id: Identifier { type: 'Identifier', name: 'options' },
                init: ObjectExpression {
                  type: 'ObjectExpression',
                  properties: [
                    Property {
                      type: 'Property',
                      key: Identifier {
                        type: 'Identifier',
                        name: 'muteHttpExceptions'
                      },
                      computed: false,
                      value: Literal {
                        type: 'Literal',
                        value: true,
                        raw: 'true'
                      },
                      kind: 'init',
                      method: false,
                      shorthand: false
                    },
                    Property {
                      type: 'Property',
                      key: Literal {
                        type: 'Literal',
                        value: 'method',
                        raw: "'method'"
                      },
                      computed: false,
                      value: Literal {
                        type: 'Literal',
                        value: 'post',
                        raw: "'post'"
                      },
                      kind: 'init',
                      method: false,
                      shorthand: false
                    },
                    Property {
                      type: 'Property',
                      key: Literal {
                        type: 'Literal',
                        value: 'headers',
                        raw: "'headers'"
                      },
                      computed: false,
                      value: Identifier {
                        type: 'Identifier',
                        name: 'headers'
                      },
                      kind: 'init',
                      method: false,
                      shorthand: false
                    },
                    Property {
                      type: 'Property',
                      key: Literal {
                        type: 'Literal',
                        value: 'payload',
                        raw: "'payload'"
                      },
                      computed: false,
                      value: Identifier {
                        type: 'Identifier',
                        name: 'payload'
                      },
                      kind: 'init',
                      method: false,
                      shorthand: false
                    }
                  ]
                }
              }
            ],
            kind: 'var'
          },
          VariableDeclaration {
            type: 'VariableDeclaration',
            declarations: [
              VariableDeclarator {
                type: 'VariableDeclarator',
                id: Identifier { type: 'Identifier', name: 'loging' },
                init: CallExpression {
                  type: 'CallExpression',
                  callee: StaticMemberExpression {
                    type: 'MemberExpression',
                    computed: false,
                    object: Identifier {
                      type: 'Identifier',
                      name: 'UrlFetchApp'
                    },
                    property: Identifier { type: 'Identifier', name: 'fetch' }
                  },
                  arguments: [
                    Identifier { type: 'Identifier', name: 'url' },
                    Identifier { type: 'Identifier', name: 'options' }
                  ]
                }
              }
            ],
            kind: 'var'
          },
          ExpressionStatement {
            type: 'ExpressionStatement',
            expression: CallExpression {
              type: 'CallExpression',
              callee: StaticMemberExpression {
                type: 'MemberExpression',
                computed: false,
                object: Identifier { type: 'Identifier', name: 'console' },
                property: Identifier { type: 'Identifier', name: 'log' }
              },
              arguments: [
                CallExpression {
                  type: 'CallExpression',
                  callee: StaticMemberExpression {
                    type: 'MemberExpression',
                    computed: false,
                    object: Identifier { type: 'Identifier', name: 'JSON' },
                    property: Identifier { type: 'Identifier', name: 'parse' }
                  },
                  arguments: [ Identifier { type: 'Identifier', name: 'loging' } ]
                }
              ]
            }
          },
          ExpressionStatement {
            type: 'ExpressionStatement',
            expression: CallExpression {
              type: 'CallExpression',
              callee: Identifier { type: 'Identifier', name: 'push' },
              arguments: [
                CallExpression {
                  type: 'CallExpression',
                  callee: Identifier { type: 'Identifier', name: 'String' },
                  arguments: [
                    StaticMemberExpression {
                      type: 'MemberExpression',
                      computed: false,
                      object: Identifier {
                        type: 'Identifier',
                        name: 'payload'
                      },
                      property: Identifier { type: 'Identifier', name: 'button' }
                    }
                  ]
                }
              ]
            }
          }
        ]
      },
      generator: false,
      expression: false,
      async: false
    }
  ],
  sourceType: 'script'
}