/*! Rappid v2.1.0 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2015 client IO

 2017-09-14 


This Source Code Form is subject to the terms of the Rappid Trial License
, v. 2.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_v2.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


// @import app.js

var app = app || {};

$(function() {

    joint.dia.Element.define('qad.Answer', {
        attrs: {
            'rect': {
                fill: '#4b4a67',
                stroke: 'none',
                width: 100,
                height: 60,
                rx: 3,
                ry: 3
            },
            'text': {
                'font-size': 14,
                'ref-x': .5,
                'ref-y': .5,
                'y-alignment': 'middle',
                'x-alignment': 'middle',
                fill: '#f6f6f6',
                'font-family': 'Arial, helvetica, sans-serif'
            }
        }
    }, {
        markup: '<g class="rotatable"><g class="scalable"><rect/></g><text/></g>'
    });

    joint.dia.Element.define('qad.Question', {

        optionHeight: 30,
        questionHeight: 50,
        paddingBottom: 30,
        minWidth: 150,
        ports: {
            groups: {
                'in': {
                    position: 'top',
                    attrs: {
                        circle: {
                            magnet: true,
                            stroke: 'white',
                            fill: '#feb663',
                            r: 14
                        },
                        text: {
                            'pointer-events': 'none',
                            'font-size': 12,
                            fill: 'white'
                        }
                    },
                    label: {
                        position: {
                            name: 'left',
                            args: {
                                x: 5
                            }
                        }
                    }
                },
                out: {
                    position: 'right',
                    attrs: {
                        'circle': {
                            magnet: true,
                            stroke: 'none',
                            fill: '#31d0c6',
                            r: 14
                        }
                    }
                }
            },
            items: [{
                group: 'in',
                attrs: {
                    text: {
                        text: 'in'
                    }
                }
            }]
        },
        attrs: {
            '.': {
                magnet: false
            },
            '.body': {
                width: 150,
                height: 250,
                rx: '1%',
                ry: '2%',
                stroke: 'none',
                fill: {
                    type: 'linearGradient',
                    stops: [{
                        offset: '0%',
                        color: '#FEB663'
                    }, {
                        offset: '100%',
                        color: '#31D0C6'
                    }],
                    // Top-to-bottom gradient.
                    attrs: {
                        x1: '0%',
                        y1: '0%',
                        x2: '0%',
                        y2: '100%'
                    }
                }
            },
            //Add option always sits at the bottom of the body
            '.btn-add-modifier': {
                ref: '.body',
                'ref-x': 10,
                'ref-dy': -22,
                cursor: 'pointer',
                fill: 'white'
            },
            '.btn-add-trigger': {
                ref: '.body',
                refX: 40,
                refDy: -22,
                cursor: 'pointer',
                fill: 'blue'
            },
            '.btn-remove-modifier': {
                'x-alignment': 10,
                'y-alignment': 13,
                cursor: 'pointer',
                fill: 'white'
            },
            '.options': {
                ref: '.body',
                'ref-x': 0
            },

            // Text styling.
            text: {
                'font-family': 'Arial'
            },
            '.option-text': {
                'font-size': 11,
                fill: '#4b4a67',
                'y-alignment': .7,
                'x-alignment': 30
            },
            '.question-text': {
                fill: 'white',
                refX: '50%',
                refY: 15,
                'font-size': 15,
                'text-anchor': 'middle',
                style: {
                    'text-shadow': '1px 1px 0px gray'
                }
            },

            // Options styling.
            '.option-rect': {
                rx: 3,
                ry: 3,
                stroke: 'white',
                'stroke-width': 1,
                'stroke-opacity': .5,
                'fill-opacity': .5,
                fill: 'white',
                ref: '.body',
                'ref-width': 1
            }

        }
    }, {
        markup: $.trim($("#question-template").html()),
        optionMarkup: $.trim($("#option-template").html()),
        initialize: function() {

            joint.dia.Element.prototype.initialize.apply(this, arguments);
            this.on('change:options', this.onChangeOptions, this);
            this.on('change:question', function() {
                this.attr('.question-text/text', this.get('question') || '');
                this.autoresize();
            }, this);

            this.on('change:questionHeight', function() {
                this.attr('.options/ref-y', this.get('questionHeight'), {
                    silent: true
                });
                this.autoresize();
            }, this);

            this.on('change:optionHeight', this.autoresize, this);

            this.attr('.options/ref-y', this.get('questionHeight'), {
                silent: true
            });
            this.attr('.question-text/text', this.get('question'), {
                silent: true
            });
        },

        onChangeOptions: function() {

            var options = this.get('options');
            var optionHeight = this.get('optionHeight');

            // First clean up the previously set attrs for the old options object.
            // We mark every new attribute object with the `dynamic` flag set to `true`.
            // This is how we recognize previously set attributes.
            var attrs = this.get('attrs');
            _.each(attrs, function(attrs, selector) {

                if (attrs.dynamic) {
                    // Remove silently because we're going to update `attrs`
                    // later in this method anyway.
                    this.removeAttr(selector, {
                        silent: true
                    });
                }
            }, this);

            // Collect new attrs for the new options.
            var offsetY = 0;
            var attrsUpdate = {};
            var questionHeight = this.get('questionHeight');

            _.each(options, function(option) {

                var selector = '.option-' + option.id;

                attrsUpdate[selector] = {
                    transform: 'translate(0, ' + offsetY + ')',
                    dynamic: true
                };
                attrsUpdate[selector + ' .option-rect'] = {
                    height: optionHeight,
                    dynamic: true
                };
                attrsUpdate[selector + ' .option-text'] = {
                    text: option.text,
                    dynamic: true
                };

                offsetY += optionHeight;

                var portY = offsetY - optionHeight / 2 + questionHeight;
                if (!this.getPort(option.id)) {
                    this.addPort({
                        group: 'out',
                        id: option.id,
                        args: {
                            y: portY
                        }
                    });
                } else {
                    this.portProp(option.id, 'args/y', portY);
                }
            }, this);

            this.attr(attrsUpdate);
            this.autoresize();
        },
        autoresize: function() {
            var options = this.get('options');
            //var triggers = this.get('triggers');
            var gap = this.get('paddingBottom') || 20;
            var height = options.length * this.get('optionHeight') + this.get('questionHeight') + gap;
            var width = joint.util.measureText(this.get('question'), {
                fontSize: this.attr('.question-text/font-size')
            }).width;
            this.resize(Math.max(this.get('minWidth') || 150, width), height);
        },
        addModifier: function(option) {
            var options = JSON.parse(JSON.stringify(this.get('options')));
            options.push({
                id: _.uniqueId('option-'),
                text: 'Option ' + options.length
            });
            this.set('options', options);
        },
        addTrigger: function() {
            var triggers = JSON.parse(JSON.stringify(this.get('triggers')));
            triggers.push({
                id: _.uniqueId('trigger-'),
                text: 'Trigger' + triggers.length
            });
            this.set('triggers', triggers);
        },
        removeModifier: function(id) {
            var options = JSON.parse(JSON.stringify(this.get('options')));
            this.removePort(id);
            this.set('options', _.without(options, _.findWhere(options, {
                id: id
            })));
        },
        removeTrigger: function(id) {
            var triggers = JSON.parse(JSON.stringify(this.get('triggers')));
            this.removePort(id);
            this.set('options', _.without(options, _.findWhere(options, {
                id: id
            })));
        },
        changeOption: function(id, option) {
            if (!option.id) option.id = id;
            var options = JSON.parse(JSON.stringify(this.get('options')));
            options[_.findIndex(options, {
                id: id
            })] = option;
            this.set('options', options);
        }
    });

    window.appView = new app.AppView;

});
