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

    joint.dia.Element.define('qad.Modifier', {
        attrs: {
            '.options': {
                ref: '.body',
                'ref-x': 0
            },
            '.option-text': {
                'font-size': 11,
                fill: '#4b4a67',
                'y-alignment': .7,
                'x-alignment': 30
            },
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
            },
            '.btn-remove-modifier': {
                'x-alignment': 10,
                'y-alignment': 13,
                cursor: 'pointer',
                fill: 'white'
            }
        }
    }, {
        markup: $.trim($("#modifier-template").html())
    });

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
        paddingBottom: 20,
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
            '.btn-remove-trigger': {
                'x-alignment': 10,
                'y-alignment': 13,
                cursor: 'pointer',
                fill: 'white'
            },
            '.triggers': {
                ref: '.body',
                'ref-x': 0
            },
            // Text styling.
            text: {
                'font-family': 'Arial'
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
            '.trigger-bg-rect': {
                rx: 3,
                ry: 3,
                stroke: 'white',
                'stroke-width': 1,
                'stroke-opacity': .5,
                'fill-opacity': .5,
                fill: 'green',
                ref: '.body',
                'ref-width': 1
            }

        }
    }, {

        markup: $.trim($("#question-template").html()),
        optionMarkup: $.trim($("#modifier-template").html()),
        triggerMarkup: $.trim($("#trigger-template").html()),

        initialize: function() {
            joint.dia.Element.prototype.initialize.apply(this, arguments);
            this.on('change:triggers', this.onElementsAdded, this);
            this.on('change:options', this.onElementsAdded, this);
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

        onChangeTriggers: function() {
            //Get values from model to keep code get() free
            var triggers = this.get('triggers');
            var optionHeight = this.get('optionHeight');
            var attrs = this.get('attrs');
            var questionHeight = this.get('questionHeight');
            var offsetY = (this.get('options').length * optionHeight) + ((this.get('options').length > 0) ? 70 : 50);
            var attrsUpdate = {};

            //iterate attributes for each selector
            _.each(attrs, function(attrs, selector) {
                if (attrs.dynamicmodifier) {
                    this.removeAttr(selector, {
                        silent: true
                    });
                }
            }, this);

            // Collect new attrs for the new options - marking them as dynamicmodifier for potential cleanup
            _.each(triggers, function(trigger) {

                var selector = '.trigger-' + trigger.id;

                attrsUpdate[selector] = {
                    transform: 'translate(0, ' + offsetY + ')',
                    dynamicmodifier: true
                };
                attrsUpdate[selector + ' .trigger-bg-rect'] = {
                    height: optionHeight,
                    dynamicmodifier: true
                };
                attrsUpdate[selector + ' .option-text'] = {
                    text: trigger.text,
                    dynamicmodifier: true
                };

                offsetY += optionHeight;
                var portY = offsetY - optionHeight / 2; // + questionHeight;
                if (!this.getPort(trigger.id)) {
                    this.addPort({
                        group: 'out',
                        id: trigger.id,
                        args: {
                            y: portY
                        }
                    });
                } else {
                    this.portProp(trigger.id, 'args/y', portY);
                }

            }, this);

            this.attr(attrsUpdate);
        },

        onElementsAdded: function() {
            this.onChangeOptions();
            this.onChangeTriggers();
            this.autoresize();
        },

        onChangeOptions: function() {

            //Get values from model to keep code get() free
            var options = this.get('options');
            var optionHeight = this.get('optionHeight');
            var attrs = this.get('attrs');
            var questionHeight = this.get('questionHeight');
            var offsetY = 0;
            var attrsUpdate = {};

            //iterate attributes for each selector
            _.each(attrs, function(attrs, selector) {
                if (attrs.dynamicoption) {
                    this.removeAttr(selector, {
                        silent: true
                    });
                }
            }, this);

            // Collect new attrs for the new options - marking them as dynamic for potential cleanup
            _.each(options, function(option) {

                var selector = '.option-' + option.id;

                attrsUpdate[selector] = {
                    transform: 'translate(0, ' + offsetY + ')',
                    dynamicoption: true
                };
                attrsUpdate[selector + ' .option-rect'] = {
                    height: optionHeight,
                    dynamicoption: true
                };
                attrsUpdate[selector + ' .option-text'] = {
                    text: option.text,
                    dynamicoption: true
                };

                offsetY += optionHeight;

            }, this);

            this.attr(attrsUpdate);
        },
        autoresize: function() {
            var options = this.get('options');
            var triggers = this.get('triggers');
            var gap = this.get('paddingBottom') || 20;
            var height = options.length * this.get('optionHeight') + this.get('questionHeight') + gap;
            height += triggers.length * this.get('optionHeight') + (gap * 2);
            var width = joint.util.measureText(this.get('question'), {
                fontSize: this.attr('.question-text/font-size')
            }).width;
            this.resize(Math.max(this.get('minWidth') || 150, width), height);
        },
        addModifier: function(option) {
            this.addElement('options', 'Modifier');
        },
        addTrigger: function() {
            this.addElement('triggers', 'Trigger');
        },
        removeElementById: function(id, storage_key) {
            data_store = this.get(storage_key);
            this.removePort(id);
            return _.without(data_store, _.findWhere(data_store, {
                id: id
            }));
        },
        removeModifier: function(id) {
            this.set('options', this.removeElementById(id, 'options'));
        },
        removeTrigger: function(id) {
            this.set('triggers', this.removeElementById(id, 'triggers'))
        },
        addElement: function(storage_key, placeholder_name) {
            var data_store = JSON.parse(JSON.stringify(this.get(storage_key)));
            data_store.push({
                id: _.uniqueId(storage_key + '-'),
                text: placeholder_name + ' ' + data_store.length
            });
            this.set(storage_key, data_store);
        },
        /*changeOption: function(id, option) {
              if (!option.id) option.id = id;
              var options = JSON.parse(JSON.stringify(this.get('options')));
              options[_.findIndex(options, {
                  id: id
              })] = option;
              this.set('options', options);
          }*/
    });

    window.appView = new app.AppView;

});
