//     Ensure.js 0.0.1
//     http://anupbishnoi.github.com/ensure
//     (c) 2012 Anup Bishnoi
//     Ensure.js may be freely distributed under the MIT license.
//
//     Dependencies: [ "underscore" ]

(function (root) {
    'use strict';

    var ensure, getError, moreTypes, stack, types, errorType, fromUnderscore,
        VERSION = "0.0.1";

    types = {};
    fromUnderscore = [
        "null",
        "undefined",
        "empty",
        "string",
        "boolean",
        "array",
        "arguments",
        "function",
        "date"
    ];
    _.each(fromUnderscore, function (type) {
        types[type] = {
            name: type + " (says underscore)",
            check: function (value) {
                return _["is" + (_.str.capitalize(type))](value);
            }
        };
    });
    moreTypes = {
        "defined": {
            name: "defined (neither null nor undefined)",
            check: function (v) {
                return v !== null && v !== void 0;
            }
        },
        "true": {
            name: "true",
            check: function (v) {
                return v === true;
            }
        },
        "false": {
            name: "false",
            check: function (v) {
                return v === false;
            }
        },
        "falsey": {
            name: "falsy",
            check: function (v) {
                return !v;
            }
        },
        "truthy": {
            name: "truthy",
            check: function (v) {
                return !(types.falsey.check(v));
            }
        },
        "non_empty_string": {
            name: "a non-empty string",
            check: function (s) {
                return (types.string.check(s)) && (!_.str.isBlank(s));
            }
        },
        "string_if_defined": {
            name: "a string, if defined",
            check: function (s) {
                return (!types.defined.check(s)) || (types.string.check(s));
            }
        },
        "non_empty_string_if_defined": {
            name: "a non-empty string, if defined",
            check: function (s) {
                return (!types.defined.check(s)) || (types.non_empty_string.check(s));
            }
        },
        "blank": {
            name: "a blank string",
            check: function (s) {
                return (types.string.check(s)) && (_.str.isBlank(s));
            }
        },
        "number": {
            name: "a number",
            check: function (n) {
                return (_.isNumber(n)) && (!_.isNaN(n));
            }
        },
        "integer": {
            name: "an integer",
            check: function (n) {
                return (types.number.check(n)) && ((parseFloat(n)) === (parseInt(n, 10)));
            }
        },
        "decimal": {
            name: "a decimal number",
            check: function (n) {
                return (types.number.check(n)) && !(types.integer.check(n));
            }
        },
        "numeric": {
            name: "a numeric value (can be a string representation)",
            check: function (n) {
                return (!isNaN(parseFloat(n))) && (isFinite(n));
            }
        },
        "positive_number": {
            name: "a positive number",
            check: function (n) {
                return (types.number.check(n)) && (n > 0);
            }
        },
        "negative_number": {
            name: "a negative number",
            check: function (n) {
                return (types.number.check(n)) && (n < 0);
            }
        },
        "positive_integer": {
            name: "a positive integer",
            check: function (n) {
                return (types.integer.check(n)) && (n > 0);
            }
        },
        "negative_integer": {
            name: "a negative integer",
            check: function (n) {
                return (types.integer.check(n)) && (n < 0);
            }
        },
        "boolean_if_defined": {
            name: "a boolean, if defined",
            check: function (b) {
                return (!types.defined.check(b)) || (types.boolean.check(b));
            }
        },
        "object": {
            name: "an object",
            check: function (obj) {
                return (types.defined.check(obj)) && (typeof obj === "object") && !(types.array.check(obj));
            }
        },
        "non_empty_object": {
            name: "a non-empty object",
            check: function (obj) {
                return (types.object.check(obj)) && (!_.isEmpty(obj));
            }
        },
        "type": {
            name: "a value type",
            check: function (type) {
                return (types.string.check(type)) && (types.defined.check(types[type]));
            }
        }
    };

    _.extend(types, moreTypes);
    if (!_.xor) {
        _.mixin({
            xor: function (one, two) {
                if (one && two) {
                    return false;
                }
                if (!one && !two) {
                    return false;
                }
                return true;
            }
        });
    }

    _.str = _.str || {};
    _.str.capitalize = _.str.capitalize || function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
    _.str.isBlank = _.str.isBlank || function (str) {
        return (/^\s*$/).test(str);
    };
    _.str.printable = _.str.printable || function (thing) {
        if (_.isString(thing)) {
            return thing
                .replace(/^\s+/, '')
                .replace(/\s+$/, '')
                .replace(/([a-z\d])([A-Z]+)/g, '$1 $2')
                .replace(/[\-\s]+/g, ' ')
                .toLowerCase()
                .replace(/(?:^|\s)\S/g, function (c) {
                    return c.toUpperCase();
                });
        }
        if (_.isNumber(thing) || _.isBoolean(thing) || !thing) {
            return String(thing);
        }
        if (_.isArray(thing)) {
            return _.map(thing, _.str.printable);
        }
        if (_.isObject(thing)) {
            return _.map(_.keys(thing), function (key) {
                return {
                    field: key,
                    value: _.str.printable(thing[key])
                };
            });
        }
        return "";
    };

    errorType = {};
    _.each(["EnsureError", "AssertError"], function (typeName) {
        errorType[typeName] = function (message) {
            this.name = typeName;
            this.message = message;
        };
        errorType[typeName].prototype = new Error();
        errorType[typeName].prototype.toString = function () {
            return this.name + (this.message ? ": " + this.message : "");
        };
    });
    errorType.TypeError = TypeError;

    getError = function (type, value, inverse, eType) {
        if (!types.defined.check(types[type])) {
            return new errorType.EnsureError(
                "No matching checking type found for: " + _.json(type)
            );
        }
        if (_.xor(inverse !== true, types[type].check(value))) {
            return new errorType[eType]();
        }
    };

    ensure = function (what, value, message, eType, inverse, justChecking) {
        var error, item, messageFunc;
        error = null;
        if (types["function"].check(message)) {
            messageFunc = message;
            eType = eType || "AssertError";
        } else if (types.non_empty_string.check(message)) {
            messageFunc = function () { return message; };
            eType = eType || "AssertError";
        } else if (!types.defined.check(message)) {
            messageFunc = function () {
                return _.json(value) + " is not: " + (_.json(what));
            };
            eType = eType || "TypeError";
        } else {
            error = error || new errorType.EnsureError(
                "Error message needs to be a string or function: " + _.json(message)
            );
        }
        if (!error) {
            if (types.array.check(what)) {
                _.some(what, function (item) {
                    error = error || getError(item, value, inverse, eType);
                    if (!error) {
                        return true;
                    }
                });
            } else if (types.string.check(what)) {
                error = error || getError(what, value, inverse, eType);
            } else {
                error = error || new errorType.EnsureError(
                    "Invalid checking type name: " + _.json(what)
                );
            }
        }
        if (error) {
            if (justChecking === true) {
                return false;
            }
            error.message = messageFunc() + "\n" + _.json(ensure.stack(5));
            throw error;
        }
        return true;
    };
    ensure.not = function (what, value, message, eType) {
        return ensure(what, value, message, eType, true, false);
    };
    ensure.test = function (what, value, inverse) {
        var result;
        result = ensure(what, value, null, null, null, true);
        if (inverse === true) {
            result = !result;
        }
        return result;
    };
    ensure.test.not = function (what, value) {
        return ensure.test(what, value, true);
    };
    ensure.error = function (message) {
        if (types["function"].check(message)) {
            message = message();
        }
        if (types.non_empty_string.check(message)) {
            throw new errorType.AssertError(message + "\n\n" + ensure.stack(2));
        } else {
            throw new errorType.EnsureError(
                "Error message needs to be a string or function: " +
                    _.json(message) + "\n\n" + ensure.stack(2)
            );
        }
    };
    ensure.types = function (type, obj) {
        var check, name;
        ensure("non_empty_string", type, function () {
            return "Type name needs to be a non-empty string: " + _.json(type);
        });
        if (ensure.test("function", obj)) {
            obj = {
                name: _.str.printable(type),
                check: obj
            };
        } else {
            ensure("object", obj, function () {
                return "No valid type definition specified for: " + type;
            });
            if (!obj.name) {
                obj.name = _.str.printable(type);
            }
            ensure("non_empty_string", obj.name, function () {
                return "Type name needs to be a non-empty string: " + obj.name;
            });
            ensure("function", obj.check, function () {
                return "Need a type checking function for type: " + type;
            });
        }
        ensure.not("defined", types[type], function () {
            return "Proposed type already exists: " + type;
        });
        name = obj.name;
        check = obj.check;
        check = _.wrap(check, function (check, v) {
            try {
                return check(v);
            } catch (error) {
                throw new errorType.TypeError(
                    _.json(v) + " is not: " + types[type].name
                );
            }
        });
        types[type] = {
            name: name,
            check: check
        };
        return true;
    };
    stack = [];
    stack.maxSize = 100;
    ensure.inside = function (funcIdentifier, args) {
        var str;
        str = "inside: " + (_.json(funcIdentifier));
        if (types.defined.check(args)) {
            if (!ensure.test("array", args)) {
                args = _.toArray(args);
            }
            str += "\nwith: " + (_.json(args));
        }
        stack = [str].concat(stack);
        if (stack.length > stack.maxSize) {
            stack.length -= 1;
        }
        return true;
    };
    ensure.stack = function (howMany) {
        if (!_.isNumber(howMany)) {
            howMany = 20;
        }
        return stack.slice(0, howMany).join("\n-----\n");
    };
    ensure.stack.size = function (size) {
        if (ensure.test("positive_integer", size)) {
            stack.maxSize = size;
            if (stack.length > stack.maxSize) {
                stack.length = stack.maxSize;
                return true;
            }
        } else {
            return stack.length;
        }
    };
    ensure.stack.forget = function (howMany) {
        if (!_.isNumber(howMany)) {
            howMany = 1;
        }
        stack = stack.slice(howMany);
        return true;
    };
    ensure.stack.empty = function () {
        stack = [];
        return true;
    };

    ensure.VERSION = VERSION;

    // CommonJS module is defined
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            // Export module
            module.exports = ensure;
        }
        exports.ensure = ensure;
    } else if (typeof define === 'function' && define.amd) {
        // Register as a named module with AMD.
        define('ensure', ["underscore"], function () {
            return ensure;
        });
    } else {
        // Put it on the root global
        root.ensure = ensure;
    }

}(this));
