import * as esprima from 'esprima';

let result;
let lineNumber = 0;

//original parse code function
const parseCode = (codeToParse) => {
    let parsedScript = esprima.parseScript(codeToParse);
    result = []; //new
    recursiveParser(parsedScript);
    printToTable();
    return esprima.parseScript(codeToParse);
};

//main function
function recursiveParser(code){
    //stop condition
    if (code == null || code.type == null) return;
    typeParser1(code);
}

function typeParser1(code){
    if (code.type === 'Program') return typeProgramParser(code);
    else if (code.type === 'FunctionDeclaration') return typeFunctionDeclarationParser(code);
    else if (code.type === 'BlockStatement') return typeBlockStatementParser(code);
    else if (code.type === 'VariableDeclaration') return typeVariableDeclarationParser(code);
    else return typeParser2(code);
}

function typeParser2(code){
    if (code.type === 'VariableDeclarator') return typeVariableDeclaratorParser(code);
    else if (code.type === 'ExpressionStatement') return typeExpressionStatementParser(code);
    else if (code.type === 'AssignmentExpression') return typeAssignmentExpressionParser(code);
    else return typeParser3(code);
}

function typeParser3(code){
    if (code.type === 'WhileStatement') return typeWhileStatementParser(code);
    else if (code.type === 'IfStatement') return typeIfStatementParser(code);
    else if (code.type === 'ReturnStatement') return typeReturnStatementParser(code);
    else return typeReturnValues(code);
}

function typeReturnValues(code){
    if (code.type === 'MemberExpression') return typeMemberExpressionParser(code);
    else if (code.type === 'BinaryExpression') return typeBinaryExpressionParser(code);
    else if (code.type === 'UnaryExpression') return typeUnaryExpressionParser(code);
    else if (code.type === 'Literal') return typeLiteralParser(code);
    return typeIdentifierParser(code);
}

function typeProgramParser(code){
    //ignore parse and continue
    code.body.forEach(function (x) {
        recursiveParser(x);
    });
}

function typeFunctionDeclarationParser(code){
    //add function itself
    addToResult(lineNumber, code.type, typeReturnValues(code.id), null, null);
    //add params
    functionParamsParser(code.params);
    //body
    recursiveParser(code.body);
}

function functionParamsParser(code){
    //one param only
    if (code.constructor !== Array)
        addToResult(lineNumber, code.type, typeReturnValues(code), null, null);
    //few params
    else
        code.forEach(function (x) {
            addToResult(lineNumber, x.type, typeReturnValues(x), null, null);
        });
}

function typeBlockStatementParser(code){
    //ignore parse and continue
    //one
    if (code.body.constructor !== Array)
        recursiveParser(code.body);
    //few
    else
        code.body.forEach(function (x) {
            recursiveParser(x);
        });
}

function typeVariableDeclarationParser(code){
    code.declarations.forEach(function (x) {
        recursiveParser(x);
    });
}

function typeVariableDeclaratorParser(code){
    addToResult(lineNumber, code.type, typeReturnValues(code.id), null, null);
}

function typeExpressionStatementParser(code){
    //ignore and continue
    recursiveParser(code.expression);
}

function typeAssignmentExpressionParser(code){
    addToResult(lineNumber, code.type, typeReturnValues(code.left), null, typeReturnValues(code.right));
}

function typeBinaryExpressionParser(code){
    //return value
    return typeReturnValues(code.left) + ' ' + code.operator + ' ' + typeReturnValues(code.right);
}

function typeWhileStatementParser(code){
    //while itself
    addToResult(lineNumber, code.type, null, typeReturnValues(code.test), null);
    //body
    recursiveParser(code.body);
}

function typeIfStatementParser(code){
    //if itself
    addToResult(lineNumber, code.type, null, typeReturnValues(code.test), null);
    //consequent
    recursiveParser(code.consequent);
    //alternate
    recursiveParser(code.alternate);
}

function typeReturnStatementParser(code){
    addToResult(lineNumber, code.type, null, null, typeReturnValues(code.argument));
}

function typeMemberExpressionParser(code){
    //return value
    return typeReturnValues(code.object) + '[' + typeReturnValues(code.property) + ']';
}

function typeUnaryExpressionParser(code){
    //return value
    return code.operator + typeReturnValues(code.argument);
}

function typeLiteralParser(code){
    //return value
    return code.value;
}

function typeIdentifierParser(code){
    //return value
    return code.name;
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
