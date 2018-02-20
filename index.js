var code = "Paper 200 Pen 0 Line 10 50 50 10 Line 30 60 60 20"

var compiler = {}
compiler.version = '1.0.0';
compiler.compile = genaretor(transformer(parser(lexer(code))));

document.getElementById('root').innerHTML = compiler.compile;

function lexer(input){
    return input.split(" ")
        .filter(t => t.length)
        .map(t => (isNaN(t) ? {type: 'word', value: t} : {type: 'number', value: t}))
}

function parser(token){
    var AST = {
        type: 'Drawing',
        body: []
    }

    while(token.length){
        var current_token = token.shift();
        if(current_token.type === 'word'){
            switch(current_token.value){
                case 'Paper': {
                    var expression = {
                        type: 'CallExpression',
                        name: 'Paper',
                        arguments: []
                    }
                    var arguments = token.shift();
                    if(arguments.type === 'number'){
                        expression.arguments.push({
                            type: 'NumberLiteral',
                            value: arguments.value
                        })
                    }
                    AST.body.push(expression);
                    break;
                }

                case 'Pen': {
                    var expression = {
                        type: 'CallExpression',
                        name: 'Pen',
                        arguments: []
                    };

                    var arguments = token.shift();
                    if(arguments.type === 'number'){
                        expression.arguments.push({
                            type: 'NumberLiteral',
                            value: arguments.value
                        })
                    }
                    AST.body.push(expression);
                    break;
                }

                case 'Line':{
                    var expression = {
                        type: 'CallExpression',
                        name: 'Line',
                        arguments: []
                    }

                    for (var i = 0; i < 4; i++){
                        var argument = token.shift();
                        if(argument.type === 'number'){
                            expression.arguments.push({
                                name: 'NumberLiterral',
                                value: argument.value
                            })
                        }
                    }
                    AST.body.push(expression);
                    break;
                }
            }
        }
    }
    return AST;    
}

function transformer(ast){
    var svg_ast = {
        tag: 'svg',
        attr: {
            width: 100,
            height: 100
        },
        body: []
    }

    var pen_color = 100;
    while(ast.body.length){
        var node = ast.body.shift();
        switch(node.name){
            case 'Paper':{
                var paper_color = pen_color - node.arguments[0].value
                svg_ast.body.push({
                    tag: 'rect',
                    attr: {
                        width: 100,
                        height: 100,
                        fill: 'rgb('+ paper_color  +'%, '+ paper_color  +'%, '+ paper_color  +'%)'
                    }
                })
                break;
            }

            case 'Pen' :{
                pen_color = pen_color - node.arguments[0].value;
                break;
            }

            case 'Line' :{
                svg_ast.body.push({
                    tag: 'line',
                    attr: {
                        x1: node.arguments[0].value,
                        y1: node.arguments[1].value,
                        x2: node.arguments[2].value,
                        y2: node.arguments[3].value,
                        stroke: 'rgb('+ pen_color  +'%, '+ pen_color  +'%, '+ pen_color  +'%)'
                    }
                })
                break;
            }
        }
    }

    return svg_ast;
}

function genaretor(svg_ast){
    
    var svg_attr = createAttrToString(svg_ast.attr);

    var element = svg_ast.body.map(function(data){
        return '<' + data.tag + ' ' + createAttrToString(data.attr) + '></' + data.tag + '>'
    }).join('');

    function createAttrToString(attr){
        return Object.keys(attr).map(function(data){
            return data + '="' + attr[data] + '"'
        }).join(' ')
    }

    return '<svg ' + svg_attr + '>' + element + '</svg>';
}