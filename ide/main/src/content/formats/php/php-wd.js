/*
 * Formatter for Selenium 2 / PHP Formatter for PHPUnit_Extentions_Selenium2TestCase client.
 */

if (!this.formatterType) {  // this.formatterType is defined for the new Formatter system
    // This method (the if block) of loading the formatter type is deprecated.
    // For new formatters, simply specify the type in the addPluginProvidedFormatter() and omit this
    // if block in your formatter.
    var subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
    subScriptLoader.loadSubScript('chrome://selenium-ide/content/formats/webdriver.js', this);
}

function testClassName(testName) {
    return testName.split(/[^0-9A-Za-z]+/).map(
            function(x) {
                return capitalize(x);
            }).join('_') + 'Test';
}

function testMethodName(testName) {
    return "test" + testName.split(/[^0-9A-Za-z]+/).map(
            function(x) {
                return capitalize(x);
            }).join('_');
}

function nonBreakingSpace() {
    return "\"\\u00a0\"";
}

function array(value) {
    var str = '[';
    for (var i = 0; i < value.length; i++) {
        str += string(value[i]);
        if (i < value.length - 1)
            str += ", ";
    }
    str += ']';
    return str;
}

notOperator = function() {
    return "!";
};

Equals.prototype.toString = function() {
    return this.e2.toString() + " == " + this.e1.toString();
};

Equals.prototype.assert = function() {
    //return "assert_equal " + this.e1.toString() + ", " + this.e2.toString();
    return "$this->assertEquals(" + this.e1.toString() + ", " + this.e2.toString() + ");";
};

Equals.prototype.verify = function() {
    return verify(this.assert());
};

NotEquals.prototype.toString = function() {
    return this.e1.toString() + " != " + this.e2.toString();
};

NotEquals.prototype.assert = function() {
    // alert('ASSERT');
    // alert(JSON.stringify(this.ref));
    var current_ref = this.ref;
    if(typeof current_ref === 'undefined')
    {
        current_ref = current_base_ref;
    }

    // alert(JSON.stringify(current_ref));

    return current_ref + "->assertNotEquals(" + this.e1.toString() + ", " + this.e2.toString() + ");";
};

NotEquals.prototype.verify = function() {
    return verify(this.assert());
};

function joinExpression(expression) {
    return expression.toString() + ".join(\",\")";
}

function statement(expression) {
    expression.noBraces = true;
    return expression.toString() + ";";
}

function assignToVariable(type, variable, expression) {
    return '${"'+variable + '"} = ' + expression.toString();
}

function ifCondition(expression, callback) {
    return "if " + expression.toString() + "\n" + callback() + "end";
}

function tryCatch(tryStatement, catchStatement, exception) {
    return "try {\n" +
        indents(1) + tryStatement + "\n" +
        "} catch(" + exception + " $e) {\n" +
        indents(1) + catchStatement + "\n" +
        "}";
}

function assertTrue(expression) {
    return "$this->assertTrue(" + expression.toString() + ");";
}

function assertFalse(expression) {
    return "$this->assertFalse(" + expression.invert().toString() + ");";
}

function verify(statement) {
    return "try {\n" +
        indents(1) + statement + "\n" +
        "} catch (PHPUnit_Framework_AssertionFailedError $e) {\n" +
        indents(1) + "array_push($this->verificationErrors, $e->__toString());\n" +
        "}";
}

function verifyTrue(expression) {
    return verify(assertTrue(expression));
}

function verifyFalse(expression) {
    return verify(assertFalse(expression));
}

RegexpMatch.patternAsRegEx = function(pattern) {
    var str = pattern.replace(/\//g, "\\/");
    if (str.match(/\n/)) {
        str = str.replace(/\n/g, '\\n');
        return '/' + str + '/m';
    } else {
        return str = '/' + str + '/';
    }
};

RegexpMatch.prototype.patternAsRegEx = function() {
    return RegexpMatch.patternAsRegEx(this.pattern);
};

RegexpMatch.prototype.toString = function() {
    return "(bool)preg_match('/" + this.pattern.replace(/\//g, "\\/") + "/'," + this.expression + ")";
};

RegexpMatch.prototype.assert = function() {
    return '$this->assertRegExp(' + this.patternAsRegEx() + ', ' + this.expression + ')';
};

RegexpMatch.prototype.verify = function() {
    return verify(this.assert());
};

RegexpNotMatch.prototype.patternAsRegEx = function() {
    return RegexpMatch.patternAsRegEx(this.pattern);
};

RegexpNotMatch.prototype.toString = function() {
    return "!(bool)preg_match('/" + this.pattern.replace(/\//g, "\\/") + "/'," + this.expression + ")";
};

RegexpNotMatch.prototype.assert = function() {
    return '$this->assertNotRegExp( ' + this.patternAsRegEx() + ', ' + this.expression + ')';
};

RegexpNotMatch.prototype.verify = function() {
    return verify(this.assert());
};

function waitFor(expression) {
    return "for ($second = 0; ; $second++) {\n" +
        indent(1) + 'if ($second >= 60) $this->fail("timeout");\n' +
        indent(1) + "try {\n" +
        indent(2) + (expression.setup ? expression.setup() + " " : "") +
        indent(2) + "if (" + expression.toString() + ") break;\n" +
        indent(1) + "} catch (Exception $e) {}\n" +
        indent(1) + "sleep(1);\n" +
        "}\n";
}

function assertOrVerifyFailure(line, isAssert) {
    var message = '"expected failure"';
    var failStatement = "fail(" + message + ");";
    return "try { " + line + " " + failStatement + "} catch (Exception $e) {}";
}

function pause(milliseconds) {
    return "usleep(" + parseInt(milliseconds, 10) + ");";
}

function echo(message) {
    return "print(" + xlateArgument(message) + ");";
}

function formatComment(comment) {
    return comment.comment.replace(/.+/mg, function(str) {
        return "// " + str;
    });
}

function keyVariable(key) {
    return "$" + key;
}

this.sendKeysMaping = {
    BKSP: "backspace",
    BACKSPACE: "backspace",
    TAB: "tab",
    ENTER: "enter",
    SHIFT: "shift",
    CONTROL: "control",
    CTRL: "control",
    ALT: "alt",
    PAUSE: "pause",
    ESCAPE: "escape",
    ESC: "escape",
    SPACE: "space",
    PAGE_UP: "page_up",
    PGUP: "page_up",
    PAGE_DOWN: "page_down",
    PGDN: "page_down",
    END: "end",
    HOME: "home",
    LEFT: "left",
    UP: "up",
    RIGHT: "right",
    DOWN: "down",
    INSERT: "insert",
    INS: "insert",
    DELETE: "delete",
    DEL: "delete",
    SEMICOLON: "semicolon",
    EQUALS: "equals",
    NUMPAD0: "numpad0",
    N0: "numpad0",
    NUMPAD1: "numpad1",
    N1: "numpad1",
    NUMPAD2: "numpad2",
    N2: "numpad2",
    NUMPAD3: "numpad3",
    N3: "numpad3",
    NUMPAD4: "numpad4",
    N4: "numpad4",
    NUMPAD5: "numpad5",
    N5: "numpad5",
    NUMPAD6: "numpad6",
    N6: "numpad6",
    NUMPAD7: "numpad7",
    N7: "numpad7",
    NUMPAD8: "numpad8",
    N8: "numpad8",
    NUMPAD9: "numpad9",
    N9: "numpad9",
    MULTIPLY: "multiply",
    MUL: "multiply",
    ADD: "add",
    PLUS: "add",
    SEPARATOR: "separator",
    SEP: "separator",
    SUBTRACT: "subtract",
    MINUS: "subtract",
    DECIMAL: "decimal",
    PERIOD: "decimal",
    DIVIDE: "divide",
    DIV: "divide",
    F1: "f1",
    F2: "f2",
    F3: "f3",
    F4: "f4",
    F5: "f5",
    F6: "f6",
    F7: "f7",
    F8: "f8",
    F9: "f9",
    F10: "f10",
    F11: "f11",
    F12: "f12",
    META: "meta",
    COMMAND: "command"
};

/**
 * Returns a string representing the suite for this formatter language.
 *
 * @param testSuite  the suite to format
 * @param filename   the file the formatted suite will be saved as
 */
function formatSuite(testSuite, filename) {
    var suiteClass = /^(\w+)/.exec(filename)[1];
    suiteClass = suiteClass[0].toUpperCase() + suiteClass.substring(1);

    var formattedSuite = "<phpunit>\n"
        + indents(1) + "<testsuites>\n"
        + indents(2) + "<testsuite name='" + suiteClass + "'>\n";

    for (var i = 0; i < testSuite.tests.length; ++i) {
        var testClass = testSuite.tests[i].getTitle();
        formattedSuite += indents(3)
            + "<file>" + testClass + "<file>\n";
    }

    formattedSuite += indents(2) + "</testsuite>\n"
        + indents(1) + "</testsuites>\n"
        + "</phpunit>\n";

    return formattedSuite;
}

function defaultExtension() {
    return this.options.defaultExtension;
}

this.options = {
    receiver: "$this",
    showSelenese: 'false',
    header: "<?php\n"
    + "\n"
    + "class ${className} extends ${extendedClass}\n"
    + "{\n"
    + indents(1) + "/**\n"
    + indents(1) + " * Setup\n"
    + indents(1) + " */\n"
    + indents(1) + "public function setUp()\n"
    + indents(1) + "{\n"
    + indents(2) + "\$this->setBrowser('firefox');\n"
    + indents(2) + "\$this->setBrowserUrl('${baseURL}');\n"
    + indents(1) + "}\n"
    + indents(1) + "\n"
    + indents(1) + "/** \n"
    + indents(1) + " * Method ${methodName} \n"
    + indents(1) + " * @test \n"
    + indents(1) + " */ \n"
    + indents(1) + "public function ${methodName}()\n"
    + indents(1) + "{\n",
    footer: indents(1) + "}\n"
    + "\n"
    + "}\n",
    indent: "2",
    initialIndents: "2",
    defaultExtension: "php",
    extendedClass: 'AcceptanceTest',
};

this.configForm =
    '<description>Variable for Selenium instance</description>' +
    '<textbox id="options_receiver" />' +
    '<description>Header</description>' +
    '<textbox id="options_header" multiline="true" flex="1" rows="4"/>' +
    '<description>Footer</description>' +
    '<textbox id="options_footer" multiline="true" flex="1" rows="4"/>' +
    '<description>Indent</description>' +
    '<menulist id="options_indent"><menupopup>' +
    '<menuitem label="Tab" value="tab"/>' +
    '<menuitem label="1 space" value="1"/>' +
    '<menuitem label="2 spaces" value="2"/>' +
    '<menuitem label="3 spaces" value="3"/>' +
    '<menuitem label="4 spaces" value="4"/>' +
    '<menuitem label="5 spaces" value="5"/>' +
    '<menuitem label="6 spaces" value="6"/>' +
    '<menuitem label="7 spaces" value="7"/>' +
    '<menuitem label="8 spaces" value="8"/>' +
    '</menupopup></menulist>' +
    '<checkbox id="options_showSelenese" label="Show Selenese"/>';

this.name = "PHPUnit (Selenium2TestCase)";
this.testcaseExtension = ".php";
this.suiteExtension = ".xml";
this.webdriver = true;

var current_base_ref = null;

WDAPI.Driver = function() {
    this.ref = this.base_ref = options.receiver;

    // alert('INITREF');
    // alert(JSON.stringify(this.base_ref));
    current_base_ref = this.ref;
};

WDAPI.Driver.searchContext = function(locatorType, locator, more) {
    var locatorString = xlateArgument(locator);
    switch (locatorType) {
        case 'xpath':
            return more
                ? '$this->elements($this->using("xpath")->value(' + locatorString + '))'
                : '$this->byXPath(' + locatorString + ')';
        case 'css':
            return more
                ? '$this->elements($this->using("css selector")->value(' + locatorString + '))'
                : '$this->byCssSelector(' + locatorString + ')';
        case 'id':
            return more
                ? '$this->elements($this->using("id")->value(' + locatorString + '))'
                : '$this->byId(' + locatorString + ')';
        case 'link':
            return more
                ? '$this->elements($this->using("link text")->value(' + locatorString + '))'
                : '$this->byLinkText(' + locatorString + ')';
        case 'name':
            return more
                ? '$this->elements($this->using("name")->value(' + locatorString + '))'
                : '$this->byName(' + locatorString + ')';
        case 'tag_name':
            return more
                ? '$this->elements($this->using("tag name")->value(' + locatorString + '))'
                : '$this->by("tag name", ' + locatorString + ')';
        case 'class':
            return more
                ? '$this->elements($this->using("css selector")->value(["class=' + locatorString.replace(/"/g, "\\\"") + '"]))'
                : '$this->byCssSelector("[class=' + locatorString.replace(/"/g, "\\\"") + ']")';
        // DOM locators
        case 'implicit':

                // trim "..." to ...
                var dom_locator_string = locatorString.substr(1, locatorString.length-1);


                // convert dom locator to css
                var dom_locator = dom_locator_string.split('.');

                if(dom_locator.length > 0)
                {
                    if(dom_locator[0] === 'document')
                    {
                        dom_locator.shift();
                    }
                }

                var css_selectors = [];

                for(var i = 0; i < dom_locator.length; i++)
                {
                    var current_dom_selector = dom_locator[i];
                    var selector_name = '';
                    var function_params = '';
                    var array_index = '';

                    // the output of this iteration
                    var current_css = '';
                    var array_index_required = false;

                    // matches test(aa)[bb]
                    var  current_dom_selector_matches = /([a-zA-Z1-9_]*)(?:\((.*?)\))?(?:\[(.*?)\])?/.exec(current_dom_selector);
                    if(current_dom_selector_matches !== null)
                    {
                        selector_name = current_dom_selector_matches[1];
                        function_params = current_dom_selector_matches[2];
                        array_index = current_dom_selector_matches[3];
                        var current_array_index_type = 'nth-child'
                        var array_index_type_required = false;

                        // check if function
                        if(function_params)
                        {
                            switch(selector_name)
                            {
                                case 'getElementById':
                                    current_css = '#'+selector_name;
                                break;
                                case 'getElementsByName':
                                    current_css = '[name="'+selector_name+'"]';
                                break;
                                case 'getElementsByClassName':
                                    current_css = '.'+selector_name+'';
                                break;
                                default:
                                    throw 'Error: DOM Locator: could not parse [' + current_dom_selector + ']  in regex. Function [' + selector_name + '] not implemented! Locator string [' + dom_locator_string + ']';
                                break;
                            }
                        } else {
                            // regular string
                            switch(selector_name)
                            {
                                case 'forms':
                                    current_css = 'form';
                                    current_array_index_type = 'nth-of-type';
                                break;
                                case 'links':
                                    current_css = 'a';
                                    current_array_index_type = 'nth-of-type';
                                break;
                                case 'images':
                                    current_css = 'img';
                                    current_array_index_type = 'nth-of-type';
                                break;
                                case 'body':
                                    if(i > 0)
                                    {
                                        throw 'Error: DOM Locator: could not parse [' + current_dom_selector + ']  in regex. \'body\' only allowed on first selector! Locator string [' + dom_locator_string + ']';
                                    }
                                    current_css = 'body';

                                break;
                                case 'documentElement':
                                    if(i > 0)
                                    {
                                        throw 'Error: DOM Locator: could not parse [' + current_dom_selector + ']  in regex. \'documentElement\' only allowed on first selector! Locator string [' + dom_locator_string + ']';
                                    }
                                    current_css = 'body';
                                break;
                                case 'elements':
                                    array_index_type_required = true;
                                break;
                                case 'childNodes':
                                    // let's hope all text's are in there own nodes, otherwise this ain't gonna do anything
                                    array_index_type_required = true;
                                break;
                                default:
                                    // if anything else it's the name of a form in the document. Select it as such
                                    current_css = 'form[name=\''+selector_name+'\']';
                                break;
                            }
                        }

                        // check if array
                        if(array_index || array_index === '0')
                        {
                            current_css += ':'+current_array_index_type+'(\''+(parseInt(array_index)+1)+'\')';
                        } else {
                            if(array_index_type_required)
                            {
                                throw 'Error: DOM Locator: could not match [' + current_dom_selector + ']  in regex. Array index was expected, but not specified! Locator string [' + dom_locator_string + ']';
                            }
                        }

                    } else {
                        throw 'Error: DOM Locator: could not match [' + current_dom_selector + ']  in regex. locator string [' + dom_locator_string + ']';
                    }


                    css_selectors.push(current_css);
                }

            return more
                ? '$this->elements($this->using("css selector")->value("' + css_selectors.join(" ") + '"))'
                : '$this->byCssSelector("' + css_selectors.join(" ") + '")';
        break;
    }
    throw 'Error: unknown strategy [' + locatorType + '] for locator [' + locator + ']';
};

WDAPI.Driver.prototype.back = function() {
    return this.ref + "->back()";
};

WDAPI.Driver.prototype.close = function() {
    return this.ref + "->close()";
};

WDAPI.Driver.prototype.findElement = function(locatorType, locator) {
    return new WDAPI.Element(WDAPI.Driver.searchContext(locatorType, locator, false));
};

WDAPI.Driver.prototype.findElements = function(locatorType, locator) {
    return new WDAPI.ElementList(WDAPI.Driver.searchContext(locatorType, locator, true));
};

WDAPI.Driver.prototype.getCurrentUrl = function() {
    return this.ref + "->url()";
};

WDAPI.Driver.prototype.get = function(url) {
    if (url.length > 1 && (url.substring(1, 8) === "http://" || url.substring(1, 9) === "https://")) { // url is quoted
        return this.ref + "->url(" + url + ")";
    } else {
        //return this.ref + "->url($this->baseUrl + " + url + ")";
        return this.ref + "->url(" + url + ")";
    }
};

WDAPI.Driver.prototype.getTitle = function() {
    return this.ref + "->title()";
};

WDAPI.Driver.prototype.getAlert = function() {
    return "close_alert_and_get_its_text()";
};

WDAPI.Driver.prototype.selectWindow = function(windowName) {
    return this.ref + "->window("+windowName+")";
};


WDAPI.Driver.prototype.chooseOkOnNextConfirmation = function() {
    return "@accept_next_alert = true";
};

WDAPI.Driver.prototype.chooseCancelOnNextConfirmation = function() {
    return "@accept_next_alert = false";
};

WDAPI.Driver.prototype.refresh = function() {
    return this.ref + "->refresh()";
};

WDAPI.Element = function(ref) {
    // alert('Element');
    // alert(JSON.stringify(ref));

    if (typeof ref === 'undefined') {
        this.ref = this.base_ref;
    } else {
        this.ref = ref;
        // current_ref = this.ref;
    }
};

WDAPI.Element.prototype.clear = function() {
    return this.ref + "->clear()";
};

WDAPI.Element.prototype.click = function() {
    return this.ref + "->click()";
};

WDAPI.Element.prototype.clickAt = function() {
    return this.ref + "->click()";
};

WDAPI.Element.prototype.getAttribute = function(attributeName) {
    return this.ref + "->attribute(" + xlateArgument(attributeName) + ")";
};

WDAPI.Element.prototype.getText = function() {
    return this.ref + "->text()";
};

WDAPI.Element.prototype.isDisplayed = function() {
    return this.ref + "->displayed()";
};

WDAPI.Element.prototype.isSelected = function() {
    return this.ref + "->selected()";
};
/*
 WDAPI.Element.prototype.sendKeys = function(text) {
 return this.ref + "->keys(" + xlateArgument(text, 'args') + ")";
 };
 */
WDAPI.Element.prototype.type = function(text) {
    //return "$this->keys(" + xlateArgument(text) + ")";
    return this.ref+"->value(" + xlateArgument(text) + ")";
};

WDAPI.Element.prototype.sendKeys = function(text) {
    return  "$this->sendKeys("+this.ref+", " + xlateArgument(text) + ")";
};


WDAPI.Element.prototype.submit = function() {
    return this.ref + "->submit()";
};

WDAPI.Element.prototype.select = function(selectLocator) {
//  if (selectLocator.type == 'index') {
//    return "Selenium::WebDriver::Support::Select.new(" + this.ref + ").select_by(:index, " + selectLocator.string + ")";
//  }
//  if (selectLocator.type == 'value') {
//    return "Selenium::WebDriver::Support::Select.new(" + this.ref + ").select_by(:value, " + xlateArgument(selectLocator.string) + ")";
//  }
//  return "Selenium::WebDriver::Support::Select.new(" + this.ref + ").select_by(:text, " + xlateArgument(selectLocator.string) + ")";
    if (selectLocator.type == 'value') {
        return "$this->select(" + this.ref + ")->selectOptionByValue(" + xlateArgument(selectLocator.string) + ")";
    }
    return "$this->select(" + this.ref + ")->selectOptionByLabel(" + xlateArgument(selectLocator.string) + ")";
};

WDAPI.Element.prototype.setValue = function(value) {
    return this.ref + "->value(" + xlateArgument(value) + ")";
};

WDAPI.ElementList = function(ref) {
    // alert('ElementList');
    // alert(JSON.stringify(ref));

    if (typeof ref === 'undefined') {
        this.ref = this.base_ref;
    } else {
        this.ref = ref;
        // current_ref = this.ref;
    }
};

WDAPI.ElementList.prototype.getItem = function(index) {
    return this.ref + "[" + index + "]";
};

WDAPI.ElementList.prototype.getSize = function() {
    //return this.ref + "->size()";
    return 'count(' + this.ref + ')';
};

WDAPI.ElementList.prototype.isEmpty = function() {
    return 'count(' + this.ref + ') == 0';
};


WDAPI.Utils = function() {
};

WDAPI.Utils.isElementPresent = function(how, what) {
    return WDAPI.Driver.searchContext(how, what) + "!=null  ? true : false";
};

WDAPI.Utils.isAlertPresent = function() {
    return "alert_present?";
};

//////////////////////////////////////////////////////////////////////
// overwrite webdriver.js
//////////////////////////////////////////////////////////////////////

/**
 *
 * @returns {bool}
 */
SeleniumWebDriverAdaptor.prototype.getEval = function(param1, param2) {

    var script = this.rawArgs[0];
    return "$this->execute(array( "+
        " 'script' => "+script+","+
        " 'args'   => array() " +
    "))";
};

SeleniumWebDriverAdaptor.prototype.isTextPresent = function() {
    var target = this.rawArgs[0];
    return '(bool)strpos(strip_tags($this->source()), ' + "'" + target + "'" + ')';
};

SeleniumWebDriverAdaptor.prototype.clickAt = function(elementLocator) {
    var locator = this._elementLocator(this.rawArgs[0]);
    var driver = new WDAPI.Driver();
    return driver.findElement(locator.type, locator.string).click();
};

//$this->timeouts()->implicitWait(5000);
SeleniumWebDriverAdaptor.prototype.setSpeed = function() {
    return '$this->timeouts()->implicitWait(' + this.rawArgs[0] + ')';
};
