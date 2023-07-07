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

fluid.registerNamespace("fluid.dom");

fluid.dom.getDocumentHeight = function (dokkument) {
    var body = $("body", dokkument)[0];
    return body.offsetHeight;
};

/*******************************************************
 * Separated Panel Preferences Editor Top Level Driver *
 *******************************************************/

fluid.defaults("fluid.prefs.separatedPanel", {
    gradeNames: ["fluid.prefs.prefsEditorLoader", "fluid.contextAware"],
    events: {
        afterRender: null,
        onReady: null,
        onCreateSlidingPanelReady: {
            events: {
                iframeRendered: "afterRender",
                onPrefsEditorMessagesLoaded: "onPrefsEditorMessagesLoaded"
            }
        },
        templatesAndIframeReady: {
            events: {
                iframeReady: "afterRender",
                templatesLoaded: "onPrefsEditorTemplatesLoaded",
                messagesLoaded: "onPrefsEditorMessagesLoaded"
            }
        }
    },
    lazyLoad: false,
    contextAwareness: {
        lazyLoad: {
            checks: {
                lazyLoad: {
                    contextValue: "{fluid.prefs.separatedPanel}.options.lazyLoad",
                    gradeNames: "fluid.prefs.separatedPanel.lazyLoad"
                }
            }
        }
    },
    selectors: {
        reset: ".flc-prefsEditor-reset",
        iframe: ".flc-prefsEditor-iframe"
    },
    listeners: {
        "onReady.bindEvents": {
            listener: "fluid.prefs.separatedPanel.bindEvents",
            args: ["{separatedPanel}.prefsEditor", "{iframeRenderer}.iframeEnhancer", "{separatedPanel}"]
        },
        "onCreate.hideReset": {
            listener: "fluid.prefs.separatedPanel.hideReset",
            args: ["{separatedPanel}"]
        }
    },
    components: {
        slidingPanel: {
            type: "fluid.slidingPanel",
            container: "{separatedPanel}.container",
            createOnEvent: "onCreateSlidingPanelReady",
            options: {
                gradeNames: ["fluid.prefs.msgLookup"],
                strings: {
                    showText: "{that}.msgLookup.slidingPanelShowText",
                    hideText: "{that}.msgLookup.slidingPanelHideText",
                    showTextAriaLabel: "{that}.msgLookup.showTextAriaLabel",
                    hideTextAriaLabel: "{that}.msgLookup.hideTextAriaLabel",
                    panelLabel: "{that}.msgLookup.slidingPanelPanelLabel"
                },
                invokers: {
                    operateShow: {
                        funcName: "fluid.prefs.separatedPanel.showPanel",
                        args: ["{that}.dom.panel", "{that}.events.afterPanelShow.fire"],
                        // override default implementation
                        "this": null,
                        "method": null
                    },
                    operateHide: {
                        funcName: "fluid.prefs.separatedPanel.hidePanel",
                        args: ["{that}.dom.panel", "{iframeRenderer}.iframe", "{that}.events.afterPanelHide.fire"],
                        // override default implementation
                        "this": null,
                        "method": null
                    }
                },
                components: {
                    msgResolver: {
                        type: "fluid.messageResolver",
                        options: {
                            messageBase: "{messageLoader}.resources.prefsEditor.parsed"
                        }
                    }
                }
            }
        },
        iframeRenderer: {
            type: "fluid.prefs.separatedPanel.renderIframe",
            container: "{separatedPanel}.dom.iframe",
            options: {
                events: {
                    afterRender: "{separatedPanel}.events.afterRender"
                },
                components: {
                    iframeEnhancer: {
                        type: "fluid.uiEnhancer",
                        container: "{iframeRenderer}.renderPrefsEditorContainer",
                        createOnEvent: "afterRender",
                        options: {
                            gradeNames: ["{pageEnhancer}.uiEnhancer.options.userGrades"],
                            jQuery: "{iframeRenderer}.jQuery",
                            tocTemplate: "{pageEnhancer}.uiEnhancer.options.tocTemplate",
                            inSeparatedPanel: true
                        }
                    }
                }
            }
        },
        prefsEditor: {
            createOnEvent: "templatesAndIframeReady",
            container: "{iframeRenderer}.renderPrefsEditorContainer",
            options: {
                gradeNames: ["fluid.prefs.uiEnhancerRelay", "fluid.prefs.arrowScrolling"],
                // ensure that model and applier are available to users at top level
                model: {
                    preferences: "{separatedPanel}.model.preferences"
                    // The `local` model path is used by the `fluid.remoteModelComponent` grade
                    // for persisting and synchronizing model values with remotely stored data.
                    // local: {}
                },
                autoSave: true,
                events: {
                    onSignificantDOMChange: null,
                    updateEnhancerModel: "{that}.events.modelChanged"
                },
                listeners: {
                    "onCreate.bindReset": {
                        "this": "{separatedPanel}.dom.reset",
                        method: "on",
                        args: ["click", "{that}.reset"]
                    },
                    "afterReset.applyChanges": "{that}.applyChanges"
                }
            }
        }
    },
    outerEnhancerOptions: "{originalEnhancerOptions}.options.originalUserOptions",
    distributeOptions: {
        "separatedPanel.slidingPanel": {
            source: "{that}.options.slidingPanel",
            removeSource: true,
            target: "{that > slidingPanel}.options"
        },
        "separatedPanel.iframeRenderer": {
            source: "{that}.options.iframeRenderer",
            removeSource: true,
            target: "{that > iframeRenderer}.options"
        },
        "separatedPanel.iframeRendered.terms": {
            source: "{that}.options.terms",
            target: "{that > iframeRenderer}.options.terms"
        },
        "separatedPanel.selectors.iframe": {
            source: "{that}.options.iframe",
            removeSource: true,
            target: "{that}.options.selectors.iframe"
        },
        "separatedPanel.iframeEnhancer.outerEnhancerOptions": {
            source: "{that}.options.outerEnhancerOptions",
            removeSource: true,
            target: "{that iframeEnhancer}.options"
        }
    }
});

fluid.prefs.separatedPanel.hideReset = function (separatedPanel) {
    separatedPanel.locate("reset").hide();
};

/*****************************************
 * fluid.prefs.separatedPanel.renderIframe *
 *****************************************/

fluid.defaults("fluid.prefs.separatedPanel.renderIframe", {
    gradeNames: ["fluid.viewComponent"],
    events: {
        afterRender: null
    },
    styles: {
        container: "fl-prefsEditor-separatedPanel-iframe"
    },
    terms: {
        templatePrefix: "."
    },
    markupProps: {
        "class": "flc-iframe",
        src: "%templatePrefix/SeparatedPanelPrefsEditorFrame.html"
    },
    listeners: {
        "onCreate.startLoadingIframe": "fluid.prefs.separatedPanel.renderIframe.startLoadingIframe"
    }
});

fluid.prefs.separatedPanel.renderIframe.startLoadingIframe = function (that) {
    var styles = that.options.styles;
    // TODO: get earlier access to templateLoader,
    var markupProps = fluid.copy(that.options.markupProps);
    markupProps.src = fluid.stringTemplate(markupProps.src, that.options.terms);
    that.iframeSrc = that.options.markupProps.src;

    // Create iframe and append to container
    that.iframe = $("<iframe/>");
    that.iframe.on("load", function () {
        var iframeWindow = that.iframe[0].contentWindow;
        that.iframeDocument = iframeWindow.document;
        // The iframe should prefer its own version of jQuery if a separate
        // one is loaded
        that.jQuery = iframeWindow.jQuery || $;

        that.renderPrefsEditorContainer = that.jQuery("body", that.iframeDocument);
        that.jQuery(that.iframeDocument).ready(that.events.afterRender.fire);
    });
    that.iframe.attr(markupProps);

    that.iframe.addClass(styles.container);
    that.iframe.hide();

    that.iframe.appendTo(that.container);
};

fluid.prefs.separatedPanel.updateView = function (prefsEditor) {
    prefsEditor.events.onPrefsEditorRefresh.fire();
    prefsEditor.events.onSignificantDOMChange.fire();
};


fluid.prefs.separatedPanel.bindEvents = function (prefsEditor, iframeEnhancer, separatedPanel) {
    // FLUID-5740: This binding should be done declaratively - needs ginger world in order to bind onto slidingPanel
    // which is a child of this component

    var separatedPanelId = separatedPanel.slidingPanel.panelId;
    separatedPanel.locate("reset").attr({
        "aria-controls": separatedPanelId,
        "role": "button"
    });

    separatedPanel.slidingPanel.events.afterPanelShow.addListener(function () {
        fluid.prefs.separatedPanel.updateView(prefsEditor);
    }, "updateView", "after:openPanel");

    prefsEditor.events.onPrefsEditorRefresh.addListener(function () {
        iframeEnhancer.updateModel(prefsEditor.model.preferences);
    }, "updateModel");
    prefsEditor.events.afterReset.addListener(function (prefsEditor) {
        fluid.prefs.separatedPanel.updateView(prefsEditor);
    }, "updateView");
    prefsEditor.events.onSignificantDOMChange.addListener(function () {
        // ensure that the panel is open before trying to adjust its height
        if ( fluid.get(separatedPanel, "slidingPanel.model.isShowing") ) {
            var dokkument = prefsEditor.container[0].ownerDocument;
            var height = fluid.dom.getDocumentHeight(dokkument);
            var iframe = separatedPanel.iframeRenderer.iframe;
            var attrs = {height: height};
            var panel = separatedPanel.slidingPanel.locate("panel");
            panel.css({height: ""});
            iframe.clearQueue();
            iframe.animate(attrs, 400);
        }
    }, "adjustHeight");

    separatedPanel.slidingPanel.events.afterPanelHide.addListener(function () {
        separatedPanel.iframeRenderer.iframe.height(0);

        // Prevent the hidden Preferences Editorpanel from being keyboard and screen reader accessible
        separatedPanel.iframeRenderer.iframe.hide();
    }, "collapseFrame");
    separatedPanel.slidingPanel.events.afterPanelShow.addListener(function () {
        separatedPanel.iframeRenderer.iframe.show();

        // FLUID-6183: Required for bug in MS EDGE that clips off the bottom of adjusters
        // The height needs to be recalculated in order for the panel to show up completely
        separatedPanel.iframeRenderer.iframe.height();
        separatedPanel.locate("reset").show();
    }, "openPanel");
    separatedPanel.slidingPanel.events.onPanelHide.addListener(function () {
        separatedPanel.locate("reset").hide();
    }, "hideReset");
};

// Replace the standard animator since we don't want the panel to become hidden
// (potential cause of jumping)
fluid.prefs.separatedPanel.hidePanel = function (panel, iframe, callback) {
    iframe.clearQueue(); // FLUID-5334: clear the animation queue
    $(panel).animate({height: 0}, {duration: 400, complete: callback});
};

// no activity - the kickback to the updateView listener will automatically trigger the
// DOMChangeListener above. This ordering is preferable to avoid causing the animation to
// jump by refreshing the view inside the iframe
fluid.prefs.separatedPanel.showPanel = function (panel, callback) {
    // A bizarre race condition has emerged under FF where the iframe held within the panel does not
    // react synchronously to being shown
    fluid.invokeLater(callback);
};

/**
 * FLUID-5926: Some of our users have asked for ways to improve the initial page load
 * performance when using the separated panel prefs editor / UI Options. One option,
 * provided here, is to implement a scheme for lazy loading the instantiation of the
 * prefs editor, only instantiating enough of the workflow to allow display the
 * sliding panel tab.
 *
 * fluid.prefs.separatedPanel.lazyLoad modifies the typical separatedPanel workflow
 * by delaying the instantiation and loading of resources for the prefs editor until
 * the first time it is opened.
 *
 * Lazy Load Workflow:
 *
 * - On instantiation of the prefsEditorLoader only the messageLoader and slidingPanel are instantiated
 * - On instantiation, the messageLoader only loads preLoadResources, these are the messages required by
 *   the slidingPanel. The remaining message bundles will not be loaded until the "onLazyLoad" event is fired.
 * - After the preLoadResources have been loaded, the onPrefsEditorMessagesPreloaded event is fired, and triggers the
 *   sliding panel to instantiate.
 * - When a user opens the separated panel prefs editor / UI Options, it checks to see if the prefs editor has been
 *   instantiated. If it hasn't, a listener is temporarily bound to the onReady event, which gets fired
 *   after the prefs editor is ready. This is used to continue the process of opening the sliding panel for the first time.
 *   Additionally the onLazyLoad event is fired, which kicks off the remainder of the instantiation process.
 * - onLazyLoad triggers the templateLoader to fetch all of the templates and the messageLoader to fetch the remaining
 *   message bundles. From here the standard instantiation workflow takes place.
 */
fluid.defaults("fluid.prefs.separatedPanel.lazyLoad", {
    events: {
        onLazyLoad: null,
        onPrefsEditorMessagesPreloaded: null,
        onCreateSlidingPanelReady: {
            events: {
                onPrefsEditorMessagesLoaded: "onPrefsEditorMessagesPreloaded"
            }
        },
        templatesAndIframeReady: {
            events: {
                onLazyLoad: "onLazyLoad"
            }
        }
    },
    components: {
        templateLoader: {
            createOnEvent: "onLazyLoad"
        },
        messageLoader: {
            options: {
                events: {
                    onResourcesPreloaded: "{separatedPanel}.events.onPrefsEditorMessagesPreloaded"
                },
                preloadResources: "prefsEditor",
                listeners: {
                    "onCreate.loadResources": { // Override of framework's definition
                        listener: "fluid.prefs.separatedPanel.lazyLoad.preloadResources",
                        args: ["{that}", "{that}.options.preloadResources"]
                    },
                    "{separatedPanel}.events.onLazyLoad": {
                        listener: "{that}.resourceFetcher.fetchAll"
                    }
                }
            }
        },
        slidingPanel: {
            options: {
                invokers: {
                    operateShow: {
                        funcName: "fluid.prefs.separatedPanel.lazyLoad.showPanel",
                        args: ["{separatedPanel}", "{that}.events.afterPanelShow.fire"]
                    }
                }
            }
        }
    }
});

fluid.prefs.separatedPanel.lazyLoad.showPanel = function (separatedPanel, callback) {
    if (separatedPanel.prefsEditor) {
        fluid.invokeLater(callback);
    } else {
        separatedPanel.events.onReady.addListener(function (that) {
            that.events.onReady.removeListener("showPanelCallBack");
            fluid.invokeLater(callback);
        }, "showPanelCallBack");
        separatedPanel.events.onLazyLoad.fire();
    }

};

/**
 * Used to override the standard "onCreate.loadResources" listener for fluid.resourceLoader component,
 * allowing for pre-loading of a subset of resources. This is required for the lazyLoading workflow
 * for the "fluid.prefs.separatedPanel.lazyLoad".
 *
 * @param {fluid.resourceLoader} that - the resourceLoader, augmented with the preload workflow
 * @param {String|String[]} toPreload - a String or an String[]s corresponding to the names
 *                                   of the resources, supplied in the resource argument, that
 *                                   should be loaded. Only these resources will be loaded.
 */
fluid.prefs.separatedPanel.lazyLoad.preloadResources = function (that, toPreload) {
    toPreload = fluid.makeArray(toPreload);
    var resourceFetcher = that.resourceFetcher;
    var preloadPromises = toPreload.map(function (onePreload) {
        return fluid.fetchResources.fetchOneResource(resourceFetcher.resourceSpecs[onePreload], resourceFetcher);
    });
    var preloadAllPromise = fluid.promise.sequence(preloadPromises);
    preloadAllPromise.then(function () {
        that.events.onResourcesPreloaded.fire(that.resources);
    });
};
