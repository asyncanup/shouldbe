(function () {
    if (typeof _ === "undefined") {
        try {
            _ = require("underscore");
        } catch (e) {
            throw new Error("Underscore library not found. " + 
                "Please download from: http://underscorejs.org");
        }
    }
    
    function shouldbe(typeStr) {
        var rest = _.toArray(arguments).slice(1),
            checker;

        if (!rest.length) {
            rest = [typeStr];
            typeStr = "true";
            checker = function (arg) { return !!arg; };
        } else {
            checker = _["is" + _type(typeStr)];
        }
        
        if (!_.isFunction(checker)) {
            throw new Error("No known type for " + typeStr);
        }

        if (true !== checker.apply(_, rest)) {
            throw new Error("Not " + typeStr + ": " + stringify(rest));
        }

        return true;
    }
    
    function stringify(arr) {
        if (arr.length <= 1) {
            return String(arr[0]);
        }
        
        return arr.map(function (val) { return String(val); });
    }

    function _type(typeStr) {
        var type = typeStr == null ? '' : String(typeStr);
        type = type.charAt(0).toUpperCase() + type.slice(1);
        type = type.trim().replace(/(\w)\-(\w)/g, function(match, c1, c2){
            return c1 + c2.toUpperCase();
        });
        return type;
    }
    
    if (typeof module !== "undefined" && module.exports) {
        exports = module.exports = shouldbe;
    } else {
        window.shouldbe = shouldbe;
    }
    
    if (typeof define === "function") {
        // TODO: find a way to put underscore explicitly as a dependency
        define("shouldbe", [], function () {
            return shouldbe;
        });
    }

}());
