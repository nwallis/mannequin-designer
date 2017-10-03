var app = app || {};

$(function() {

    joint.dia.Element.define('qad.Trigger', {
        attrs: {
            '.btn-remove-trigger': {
                'x-alignment': 10,
                'y-alignment': 13,
                cursor: 'pointer',
                fill: 'black'
            },
            '.trigger-rect': {
                fill: '#777777',
                stroke: 'none',
                width: 100,
                height: 60,
            },
            '.trigger-text': {
                'font-size': 11,
                fill: 'white',
                'y-alignment': .7,
                'x-alignment': 40
            }
        }
    }, {
        markup: $.trim($("#trigger-template").html()),
        getTriggerParams: function() {
            return {
                trigger_data: this.get('trigger_data'),
                model_name: this.get('attrs')['.trigger-text'].text
            }
        }
    });

    joint.dia.Element.define('qad.Modifier', {
        attrs: {
            '.btn-remove-modifier': {
                'x-alignment': 10,
                'y-alignment': 13,
                cursor: 'pointer',
                fill: 'black'
            },
            '.option-rect': {
                fill: '#777777',
                stroke: 'none',
                width: 100,
                height: 60,
            },
            '.option-text': {
                'font-size': 11,
                fill: 'white',
                'y-alignment': .7,
                'x-alignment': 40
            }
        }
    }, {
        markup: $.trim($("#modifier-template").html()),
        getModifierParams: function() {
            return {
                modifier_data: this.get('modifier_data'),
                model_name: this.get('attrs')['.option-text'].text
            }
        }
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
            '.options': {
                ref: '.body',
                'ref-x': 0
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

        //refactor this to common class functions
        getStateParams: function() {
            return {
                state_data: this.get('state_data'),
                model_name: this.get('attrs')[".question-text"].text
            };
        },
        disableInitialState: function() {
            var state_data = JSON.parse(JSON.stringify(this.get('state_data')));
            state_data.initial_state = false;
            this.attr('.body', {
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
            });
            this.set('state_data', state_data);
        },
        enableInitialState: function() {
            var state_data = JSON.parse(JSON.stringify(this.get('state_data')));
            state_data.initial_state = true;
            this.attr('.body', {
                width: 150,
                height: 250,
                rx: '1%',
                ry: '2%',
                stroke: 'none',
                fill: {
                    type: 'linearGradient',
                    stops: [{
                        offset: '0%',
                        color: '#000000'
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
            });
            this.set('state_data', state_data);
        },

        markup: $.trim($("#question-template").html()),

        optionMarkup: $.trim($("#modifier-template").html()),

        triggerMarkup: $.trim($("#trigger-template").html()),

        initialize: function() {
            joint.dia.Element.prototype.initialize.apply(this, arguments);
            this.listenTo(this, 'change:options', this.autoresize, this);
            this.listenTo(this, 'change:triggers', this.autoresize, this);
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
            /*var triggers = this.get('triggers');
              var optionHeight = this.get('optionHeight');
              var attrs = this.get('attrs');
              var questionHeight = this.get('questionHeight');
              var offsetY = (this.get('options').length * optionHeight) + ((this.get('options').length > 0) ? 70 : 50);
              var attrsUpdate = {};*/

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

        addModifier: function() {
            var new_modifier = app.Factory.createModifier(_.uniqueId(), "Modifier " + this.get('options').length);
            this.addElementToStore('options', new_modifier);
            this.graph.addCell(new_modifier);
            this.embed(new_modifier);
        },
        addTrigger: function() {
            var new_trigger = app.Factory.createTrigger(_.uniqueId(), "Trigger " + this.get('triggers').length);
            this.addElementToStore('triggers', new_trigger);
            this.graph.addCell(new_trigger);
            this.embed(new_trigger);
        },
        removeElementById: function(id, storage_key) {
            data_store = this.get(storage_key);
            this.removePort(id);
            data_store = _.without(data_store, _.findWhere(data_store, {
                id: id
            }));
            return data_store;
        },
        removeModifier: function(id) {
            this.set('options', this.removeElementById(id, 'options'));
        },
        removeTrigger: function(id) {
            this.set('triggers', this.removeElementById(id, 'triggers'))
        },
        addElementToStore: function(storage_key, item) {
            this.set(storage_key, this.get(storage_key).concat(item));
        }
    });

    window.appView = new app.AppView;

});
