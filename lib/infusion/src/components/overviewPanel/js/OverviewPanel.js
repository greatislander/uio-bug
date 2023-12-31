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


"use strict";

fluid.registerNamespace("fluid.overviewPanel");

fluid.overviewPanel.makeBooleanListener = function (that, selector, method, path, value) {
    var elem = that.locate(selector);
    elem.on(method, function (evt) {
        that.applier.change(path, value === "toggle" ? !that.model[path] : value);
        evt.preventDefault();
    });
};

fluid.defaults("fluid.overviewPanel", {
    gradeNames: ["fluid.rendererComponent", "fluid.resourceLoader"],
    renderOnInit: true,
    resources: {
        template: {
            url: "../html/overviewPanelTemplate.html"
        }
    },
    listeners: {
        "onCreate.setVisibility": "{that}.setVisibility",
        "afterRender.registerToggleListener": {
            "funcName": "fluid.overviewPanel.makeBooleanListener",
            "args": ["{that}", "toggleControl", "click", "showPanel", "toggle"]
        },
        "afterRender.registerCloseListener": {
            "funcName": "fluid.overviewPanel.makeBooleanListener",
            "args": ["{that}", "closeControl", "click", "showPanel", false]
        },
        "afterRender.setLinkHrefs": {
            "funcName": "fluid.overviewPanel.setLinkHrefs",
            "args": ["{that}", "{that}.options.links"]
        },
        "afterRender.setToggleControlAria": {
            "this": "{that}.dom.toggleControl",
            "method": "attr",
            "args": {
                "role": "button",
                "aria-controls": "{that}.containerId"
            }
        },
        "afterRender.setCloseControlAria": {
            "this": "{that}.dom.closeControl",
            "method": "attr",
            "args": {
                "role": "button",
                "aria-label": "{that}.options.strings.closePanelLabel",
                "aria-controls": "{that}.containerId"
            }
        },
        "afterRender.setAriaStates": "{that}.setAriaStates"
    },
    model: {
        showPanel: true
    },
    modelListeners: {
        "setVisibility": {
            path: "showPanel",
            func: "{that}.setVisibility"
        },
        "setAriaStates": {
            path: "showPanel",
            func: "{that}.setAriaStates"
        }
    },
    members: {
        containerId: {
            expander: {
                // create an id for that.container, if it does not have one already,
                // and set that.containerId to the id value
                funcName: "fluid.allocateSimpleId",
                args: "{that}.container"
            }
        }
    },
    invokers: {
        setVisibility: {
            funcName: "fluid.overviewPanel.setVisibility",
            args: ["{that}", "{that}.model.showPanel"]
        },
        setAriaStates: {
            funcName: "fluid.overviewPanel.setAriaStates",
            args: ["{that}", "{that}.model.showPanel"]
        }
    },
    selectors: {
        toggleControl: ".flc-overviewPanel-toggleControl",
        titleBegin: ".flc-overviewPanel-title-begin",
        titleLink: ".flc-overviewPanel-titleLink",
        titleLinkText: ".flc-overviewPanel-title-linkText",
        titleEnd: ".flc-overviewPanel-title-end",
        componentName: ".flc-overviewPanel-componentName",
        description: ".flc-overviewPanel-description",
        instructionsHeading: ".flc-overviewPanel-instructionsHeading",
        instructions: ".flc-overviewPanel-instructions",
        demoCodeLink: ".flc-overviewPanel-demoCodeLink",
        demoCodeLinkText: ".flc-overviewPanel-demoCodeLinkText",
        infusionCodeLink: ".flc-overviewPanel-infusionCodeLink",
        infusionCodeLinkText: ".flc-overviewPanel-infusionCodeLinkText",
        apiLink: ".flc-overviewPanel-apiLink",
        apiLinkText: ".flc-overviewPanel-apiLinkText",
        designLink: ".flc-overviewPanel-designLink",
        designLinkText: ".flc-overviewPanel-designLinkText",
        feedbackText: ".flc-overviewPanel-feedbackText",
        feedbackLink: ".flc-overviewPanel-feedbackLink",
        feedbackLinkText: ".flc-overviewPanel-feedbackLinkText",
        closeControl: ".flc-overviewPanel-closeControl",
        closeText: ".flc-overviewPanel-closeText"
    },
    selectorsToIgnore: ["toggleControl", "titleLink", "demoCodeLink", "infusionCodeLink", "apiLink", "designLink", "feedbackLink", "closeControl"],
    protoTree: {
        titleBegin: {messagekey: "titleBegin"},
        titleLinkText: {messagekey: "titleLinkText"},
        titleEnd: {messagekey: "titleEnd"},
        componentName: {messagekey: "componentName"},
        description: {markup: "${{that}.options.markup.description}"},
        instructionsHeading: {messagekey: "instructionsHeading"},
        instructions: {markup: "${{that}.options.markup.instructions}"},
        demoCodeLinkText: {messagekey: "demoCodeLinkText"},
        infusionCodeLinkText: {messagekey: "infusionCodeLinkText"},
        apiLinkText: {messagekey: "apiLinkText"},
        designLinkText: {messagekey: "designLinkText"},
        feedbackText: {messagekey: "feedbackText"},
        feedbackLinkText: {messagekey: "feedbackLinkText"},
        closeText: {messagekey: "closeText"}
    },
    styles: {
        hidden: "fl-overviewPanel-hidden"
    },
    strings: {
        titleBegin: "An",
        titleLinkText: "Infusion",
        titleEnd: "component demo",
        componentName: "Component Name",
        instructionsHeading: "Instructions",
        demoCodeLinkText: "demo code",
        infusionCodeLinkText: "get Infusion",
        apiLinkText: "API",
        designLinkText: "design",
        feedbackText: "Found a bug? Have a question?",
        feedbackLinkText: "Let us know!",
        closeText: "close",
        openPanelLabel: "Open the overview panel",
        closePanelLabel: "Close the overview panel"
    },
    markup: {
        description: "A description of the component should appear here. It should say: <ul><li>What the component does.</li><li>Why it is interesting / useful.</li></ul>",
        instructions: "<p>Do this to do this. Do that to do that.</p>"
    },
    links: {
        titleLink: "http://fluidproject.org/infusion.html",
        demoCodeLink: "#",
        infusionCodeLink: "https://github.com/fluid-project/infusion/",
        apiLink: "#",
        designLink: "#",
        feedbackLink: "#"
    }
});

fluid.overviewPanel.setVisibility = function (that, showPanel) {
    that.container.toggleClass(that.options.styles.hidden, !showPanel);
};

fluid.overviewPanel.setLinkHrefs = function (that, linkMap) {
    fluid.each(linkMap, function (linkHref, selector) {
        that.locate(selector).attr("href", linkHref);
    });
};

fluid.overviewPanel.setAriaStates = function (that, showPanel) {
    that.locate("toggleControl").attr("aria-pressed", !showPanel);
    that.locate("toggleControl").attr("aria-expanded", showPanel);
    that.locate("closeControl").attr("aria-expanded", showPanel);
    if (showPanel) {
        that.locate("toggleControl").attr("aria-label", that.options.strings.closePanelLabel);
    } else {
        that.locate("toggleControl").attr("aria-label", that.options.strings.openPanelLabel);
    }
};
