/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

/* global jqUnit */

"use strict";

// TODO: None of the contents of this file possess any test cases of their own

/*******************************************
 * Browser-dependent jqUnit test functions *
 *******************************************/

jqUnit.isVisible = function (msg, selector) {
    jqUnit.okWithPrefix($(selector).is(":visible"), msg);
};

jqUnit.notVisible = function (msg, selector) {
    jqUnit.okWithPrefix($(selector).is(":hidden"), msg);
};

jqUnit.assertNodeExists = function (msg, selector) {
    jqUnit.okWithPrefix($(selector)[0], msg);
};

jqUnit.assertNodeNotExists = function (msg, selector) {
    jqUnit.okWithPrefix(!$(selector)[0], msg);
};

// Overrides jQuery's animation routines to be synchronous. Careful!
jqUnit.subvertAnimations = function () {
    $.fn.fadeIn = function (speed, callback) {
        this.show();
        if (callback) {
            callback();
        }
    };

    $.fn.fadeOut = function (speed, callback) {
        this.hide();
        if (callback) {
            callback();
        }
    };
};


/*
 * A number of utility functions for creating "duck-type" events for testing various key
 * stroke combinations.
 */

jqUnit.bindKeySimulator = function (keyLookup, targetNamespace) {
    var tn = fluid.registerNamespace(targetNamespace);
    tn.keyEvent = function (keyCode, target) {
        return {
            keyCode: keyLookup[keyCode],
            target: fluid.unwrap(target),
            preventDefault: function () {},
            stopPropagation: function () {}
        };
    };

    tn.ctrlKeyEvent = function (keyCode, target) {
        return tn.modKeyEvent("CTRL", keyCode, target);
    };


    tn.modKeyEvent = function (modifier, keyCode, target) {
        var togo = tn.keyEvent(keyCode, target);
        modifier = jQuery.makeArray(modifier);
        for (var i = 0; i < modifier.length; ++i) {
            var mod = modifier[i];
            if (mod === "CTRL") {
                togo.ctrlKey = true;
            }
            else if (mod === "SHIFT") {
                togo.shiftKey = true;
            }
            else if (mod === "ALT") {
                togo.altKey = true;
            }
        }
        return togo;
    };
};

// Canonicalise a list of DOM elements (or a jQuery) by converting elements to their ids (allocated if necessary)
jqUnit.canonicaliseDom = function (list) {
    return fluid.transform(list, function (element) {
        return fluid.allocateSimpleId(element);
    });
};

// Compare two lists of DOM elements (or jQueries) for being equal by virtue of containing the same DOM elements
jqUnit.assertDomEquals = function (message, expected, actual) {
    return jqUnit.assertCanoniseEqual(message, expected, actual, jqUnit.canonicaliseDom);
};

/* Condense a DOM node into a plain Javascript object, to facilitate testing against
 * a trial, with the use of assertDeepEq or similar
 */
jqUnit.assertNode = function (message, expected, node) {
    if (!node.nodeType) { // Some types of DOM nodes (e.g. select) have a valid "length" property
        if (node.length === 1 && expected.length === undefined) {
            node = node[0];
        }
        else if (node.length !== undefined) {
            jqUnit.assertEquals(message + ": Expected number of nodes ", expected.length, node.length);
            for (var i = 0; i < node.length; ++i) {
                jqUnit.assertNode(message + ": node " + i + ": ", expected[i], node[i]);
            }
            return;
        }
    }
    for (var key in expected) {
        // mustn't use DOM getAttribute because of numerous bugs (in particular http://www.quirksmode.org/bugreports/archives/2007/03/getAttributefor_is_always_null_in_Internet_Explore.html )
        var attr = jQuery.attr(node, key);
        var messageExt = " - attribute " + key + "";
        if (key === "nodeName") {
            attr = node.tagName.toLowerCase();
            messageExt = " - node name";
        }
        else if (key === "nodeText") {
            attr = node.innerText.trim();
        }
        else if (key === "nodeHTML") {
            attr = $(node).html();
        }
        var evalue = expected[key];
        var pass = evalue === attr;
        if (attr === false || attr === true) { // support for IE refusing to honour XHTML values
            pass = !!evalue === attr;
        }
        if (key !== "children") {
            jqUnit.assertTrue(message + messageExt + " expected value: " + evalue + " actual: " + attr, pass);
        }
        else {
            var children = $("> *", node);
            jqUnit.assertNode("> " + message, evalue, children);
        }
    }
};
