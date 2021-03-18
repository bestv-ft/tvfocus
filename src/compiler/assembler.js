var Layout = require('../layout');
var uuid = require('../utils/uuid');
var $OUT = '$out';
/**
 * 拼装器，根据各种token，拼装完整的渲染函数(代码字符串)
 */

function buildNodeAttr(name_, value_, type_) {
    if ('String' == type_) {
        return name_+':\'' + value_ + '\'';
    }
    else {
        return name_+':' + value_;
    }
}

function buildDomAttr(name_, value_, type_) {
    if ('String' == type_) {
        return name_+'="' + value_ + '"';
    }
    else {
        return name_+'="\'+' + value_ + '+\'"';
    }
}

function buildStyle(attrs_) {
    var _style = [], attr_;
    for (var name_ in attrs_) {
        attr_ = attrs_[name_];
        if ('cssTextV' == name_) {
            _style.push('\'' + attr_.value + '\'');
        }
        else if ('String' == attr_.type) {
            _style.push(name_+':' + attr_.value + (attr_.unit||''));
        }
        else {
            _style.push(name_+':\'+(' + attr_.value + '||0)+\'' + (attr_.unit||''));
        }
    }
    return _style.join(';');
}

function Assembler(context_) {
    this.context = context_;
    this.$CHILD_FUNCS = {};
}

Assembler.prototype.build = function (context_) {
    context_ = context_ || this.context;
    var _len = context_.tokens.length, _t, _output = '', _catch;
    if ('Each' === context_.type || 'FocusEach' === context_.type) {
        var _variables = [context_.variables[0], context_.variables[1]];
        _output = 'function(' + _variables.join(',') + '){\ntry {';
    }
    else if ('Focus' === context_.type) {
        _output = 'function($data){\nvar ' + $OUT + '=\'\';\nvar _thisnode=this;\ntry {';
    }
    for(var i = 0; i < _len; i++) {
        _t = context_.tokens[i];
        switch (_t.type) {
            case 'String':
                _output += this.outputString(_t.code);
                break;
            case 'Statement':
                _output += this.outputStatement(_t);
                break;
            case 'Expression':
                _output += this.outputExpression(_t.code);
                break;
            case 'Focus':
                if ('closeFocus' == _t.name) {
                    _output +='';
                }
                else {
                    _output += this.outputFocus(_t);
                }
                break;
            default:
                break;
        }
    }
    _catch = '\n}catch (e) {throw $Runtime.error(e, ' + context_.start + ', ' + context_.end + ')}';
    if ('If' === context_.type) {
        _output += '}';
    }
    else if ('Focus' === context_.type) {
        _output += _catch + '\nreturn '+$OUT+';\n}';
    }
    else if ('Each' === context_.type || 'FocusEach' === context_.type) {
        _output += _catch + '});';
    }
    return _output;
}

Assembler.prototype.outputString = function(code_) {
    var _ret = [];
    code_.split(/\r\n|\n/).forEach(function(str_) {
        if (0 < str_.length) {
            _ret.push($OUT + ' += \'' + str_.replace(/'/g, "\\'") + '\';');
        }
    });
    return '\n' + _ret.join('\n');
}

Assembler.prototype.outputStatement = function(token_) {
    if (token_.subspace) {
        return '\n' + token_.code + this.build(token_.subspace);
    }
    else {
        return '\n' + token_.code;
    }
}

Assembler.prototype.outputExpression = function(code_) {
    return '\n' + $OUT + ' += ' + code_ + ';';
}

Assembler.prototype.outputFocus = function(token_) {
    var _s = token_.subspace,
        _tag = [], 
        _dom_attr = [],    //DOM所需的属性
        _node_attr=[],     //Focus节点的属性
        _layout_attr=[],   //Focus节点的布局属性
        _ext_attr=[],      //Focus节点的扩展数据属性
        _attr, _name, _style, _scroll;
    _name = _s.attributes['name'].value;
    for (var i in _s.attributes) {
        _attr = _s.attributes[i];
        if ('name' == i || 'id' == i) { //字符串类属性
            _node_attr.push(buildNodeAttr(i, _attr.value, _attr.type));
        }
        else if ('data' == i) {
            _node_attr.push(buildNodeAttr(i, _attr.value));
        }
        else if ('cache' == i) {
            if (_name) {
                _cache_key = uuid();
            }
            _node_attr.push('cache:\'' + _cache_key + '\'' );
        }
        else if ('scroll' == i) {
            if ('y' == _attr.dir) {
                _scroll = [0, _attr.value];
                _node_attr.push('scrollY:' + _attr.value);
            }
            else if ('x' == _attr.dir) {
                _scroll = [_attr.value, 0];
                _node_attr.push('scrollX:' + _attr.value);
            }
            else {
                _scroll = [0];
            }
        }
        else if ('layout' == i) {
            if (undefined !== _attr.value) {
                for (var l in _attr.value) {
                    //开始解析布局属性
                    _layout_attr.push(buildNodeAttr(l, _attr.value[l].value, 'Variable'));
                }
            }
        }
        else if ('disabled' == i) {
            if ('false' === _attr.value) {
                _node_attr.push('disabled:false');
            }
            else if ('Variable' == _attr.type) {
                _node_attr.push('disabled:' + _attr.value);
            }
            else {
                _node_attr.push('disabled:true');
            }
        }
        else if ('style' != i) {
            if ('data-' == i.substr(0,5)) {
                _ext_attr.push(buildNodeAttr(i.substr(5), _attr.value, _attr.type));
            }
            else {
                _dom_attr.push(buildDomAttr(i, _attr.value, _attr.type));
            }
        }
    }
    _style = _s.attributes['style'];
    if (0 < _layout_attr.length) {
        _node_attr.push('layout:{' + _layout_attr.join(',') + '}');
    }
    if (0 < _ext_attr.length) {
        _node_attr.push('ext_data:{' + _ext_attr.join(',') + '}');
    }
    this.$CHILD_FUNCS[_name] = this.build(_s);
    _tag.push('\nvar _f=$Runtime.createNode({' + _node_attr.join(',') + '},\'' + _name + '\');\n_thisnode.addChild(_f);');
    if (undefined !== _scroll) {
        _style.value['position'] = {type:'String', value:'relative'};
        _style.value['overflow'] = {type:'String', value:'hidden'};
        _dom_attr.push(buildDomAttr('style', buildStyle(_style.value), 'String'));
        _tag.push($OUT + ' += \'<div ' + _dom_attr.join(' ') + ' id="\'+_f.fingerprint+\'">\';');
        if (1 == _scroll.length) { //动态判断是否需要滑动
            _tag.push('if (undefined !== _f.scrollX || undefined !== _f.scrollY) {');
        }
        _tag.push($OUT + ' += \'<div style="position:absolute;width:inherit;' + Layout.buildPostStypeString(_scroll[0], _scroll[1]) + '">\';');
        _tag.push($OUT + ' += _f.render();');
        _tag.push($OUT + ' += \'</div>\'');
        if (1 == _scroll.length) { //动态判断是否需要滑动
            _tag.push('} else {');
            _tag.push($OUT + ' += _f.render();');
            _tag.push('}');
        }
        _tag.push($OUT + ' += \'</div>\'');
    }
    else {
        _style = buildStyle(_style.value);
        if (_style) {
            _dom_attr.push(buildDomAttr('style', _style, 'String'));
        }
        _tag.push($OUT + ' += \'<div ' + _dom_attr.join(' ') + ' id="\'+_f.fingerprint+\'">\';');
        _tag.push($OUT + ' += _f.render();');
        _tag.push($OUT + ' += \'</div>\'');
    }
    return _tag.join('\n') + ';';
}

module.exports = {
    build: function (context_) {
        var ass = new Assembler(context_);
        return [ass.build(), ass.$CHILD_FUNCS];
    }
}
