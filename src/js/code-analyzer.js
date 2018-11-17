import * as esprima from 'esprima';

let result;
let lineNumber = 0;

//original parse code function
const parseCode = (codeToParse) => {
    let parsedScript = esprima.parseScript(codeToParse, {loc: true});
    result = [];
    recursiveParse(parsedScript.body[0]);
    printToTable();
    return esprima.parseScript(codeToParse);
};

//main function
function recursiveParse(codeToParse) {
    lineNumber++;
    if (codeToParse == null) return;
    statementParser(codeToParse);
    declarationParser(codeToParse);
    if (codeToParse.body == null) return;
    if (codeToParse.body.constructor === Array)
        codeToParse.body.forEach(function (x) {
            recursiveParse(x);
        });
    else
        recursiveParse(codeToParse.body);
}

function statementParser(codeToParse){
    if (codeToParse.type === 'BlockStatement') lineNumber--;
    if (codeToParse.type === 'ExpressionStatement') expressionStatementParser(codeToParse.expression);
    if (codeToParse.type === 'WhileStatement') whileStatementParser(codeToParse);
    if (codeToParse.type === 'ReturnStatement') returnStatementParser(codeToParse);
    if (codeToParse.type === 'IfStatement') ifStatementParser(codeToParse);
}

function declarationParser(codeToParse){
    if (codeToParse.type === 'FunctionDeclaration') functionParser(codeToParse);
    if (codeToParse.type === 'VariableDeclaration') variableDeclarationParser(codeToParse.declarations);
}

//parses functions
function functionParser(functionExpression) {
    // function itself
    addToResult(lineNumber, 'FunctionDeclaration', functionExpression.id.name, null, null);

    // params
    if (functionExpression.params != null)
        functionExpression.params.forEach(function (x) {
            addToResult(lineNumber, x.type, x.name, null, null);
        });
}

//parses variables
function variableDeclarationParser(declarations) {
    declarations.forEach(function (x) {
        addToResult(lineNumber, x.type, x.id.name, null, null);
    });
}

//parses expression statements
function expressionStatementParser(expression){
    if (expression.type === 'AssignmentExpression'){
        let value = null;
        if (expression.right.type === 'Literal')
            value = expression.right.value;
        else if (expression.right.type === 'BinaryExpression')
            value = recursiveExpressionStatementParser(expression.right, 0);
        addToResult(lineNumber, expression.type, expression.left.name, null, value);
    }
}

//parses while statements
function whileStatementParser(whileStatement){
    // while itself
    addToResult(lineNumber, whileStatement.type, null, recursiveExpressionStatementParser(whileStatement.test, 0), null);
}

//parses if statements
function ifStatementParser(ifStatement) {
    // if itself
    addToResult(lineNumber, ifStatement.type, null, recursiveExpressionStatementParser(ifStatement.test, 0), null);
    // consequent
    recursiveParse(ifStatement.consequent);
    // alternate
    recursiveParse(ifStatement.alternate);
}

//recursive expressions parser
function recursiveExpressionStatementParser(expression, recursionLevel){
    // stop condition
    if (expression.type === 'Identifier')
        return expression.name;
    else if (expression.type === 'Literal')
        return expression.value;
    else if (expression.type === 'MemberExpression')
        return recursiveExpressionStatementParser(expression.object, 0) + '[' + recursiveExpressionStatementParser(expression.property, 0) + ']';
    else if (expression.type === 'UnaryExpression')
        return expression.operator + recursiveExpressionStatementParser(expression.argument, 0);
    else
    {
        recursionLevel++;
        if (recursionLevel > 1)
            return '(' + recursiveExpressionStatementParser(expression.left, recursionLevel) + ' ' + expression.operator + ' ' + recursiveExpressionStatementParser(expression.right, recursionLevel) + ')';
        else
            return recursiveExpressionStatementParser(expression.left, recursionLevel) + ' ' + expression.operator + ' ' + recursiveExpressionStatementParser(expression.right, recursionLevel);
    }
}

//parses return statements
function returnStatementParser(returnStatement){
    addToResult(lineNumber, returnStatement.type, null, null, recursiveExpressionStatementParser(returnStatement.argument, 0));
}

//adding to result array
function addToResult(line, type, name, condition, value) {
    let json = {
        'line': line,
        'type': type,
        'name': name,
        'condition': condition,
        'value': value
    };
    result.push(json);
}

//print all content to table
function printToTable(){
    if (document == null)
        return;
    let table = document.getElementById('resultTable');
    result.forEach(function (x) {
        let row = table.insertRow(table.rows.length);

        let lineCell = row.insertCell(0);
        let typeCell = row.insertCell(1);
        let nameCell = row.insertCell(2);
        let conditionCell = row.insertCell(3);
        let valueCell = row.insertCell(4);

        lineCell.innerHTML = x.line;
        typeCell.innerHTML = x.type;
        nameCell.innerHTML = x.name;
        conditionCell.innerHTML = x.condition;
        valueCell.innerHTML = x.value;
    });
}

export {parseCode};
