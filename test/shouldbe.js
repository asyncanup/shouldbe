var assert = require("assert");

var shouldbe = require("../");

describe('shouldbe', function (){
    it("should delegate to underscore for type-checking", function () {
        assert.doesNotThrow(function () {
            shouldbe("string", "some string");
            shouldbe("date", new Date());
            shouldbe("object", {});
            shouldbe("array", []);
            shouldbe("function", function () {});
            shouldbe("NaN", NaN);
        });
    });
    
    it("should throw up if underscore does not validate the type", function () {
        assert.throws(function () {
            shouldbe("date", {});
        }, /Not date/);
        
        assert.throws(function () {
            shouldbe("finite", -Infinity);
        }, /Not finite/)
    });
    
    it("should throw up if a type is not found", function () {
        assert.throws(function () {
            shouldbe("not-a-known-type", 42);
        }, /No known type/);
    });
    
    it("should convert dasherized type to capitalized camel-case when possible", function () {
        assert.doesNotThrow(function () {
            shouldbe("reg-exp", /regular expression/);
        });
    });
    
    it("should allow adding more types by enhancing underscore", function () {
        function checkEvenValue() {
            shouldbe("even-value", 4);
        }
        
        assert.throws(checkEvenValue);
        _.mixin({
            isEvenValue: function (val) { return !(val % 2); }
        });
        assert.doesNotThrow(checkEvenValue);
    });

});
