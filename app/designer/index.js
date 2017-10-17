var app = window.app = {};
var qad = window.qad || {};

app.helpers = {
    export_to_scenario_json: function(graph) {

        var export_data = {
            "starting_state": "not_yet_set",
            "states": {}
        };

        //Get list of links for lookup when adding triggers
        var graph_links = graph.getLinks();
        var link_lookup = {};

        for (var link_count = 0; link_count < graph_links.length; link_count++) {
            var link = graph_links[link_count];
            link_lookup[link.get('source').id] = link.get('target').id;
        }

        var state_cells = app.helpers.get_states(graph);
        for (var state_count = 0; state_count < state_cells.length; state_count++) {

            var state = state_cells[state_count];
            export_data.states[state.id] = {
                "obs": state.getStateParams().state_data.obs,
                "triggers": {},
                "modifiers": {}
            };

            //Store the id of the starting state
            if (state.getStateParams().state_data.initial_state) export_data.starting_state = state.id;

            var state_triggers = state.get('triggers');
            for (var trigger_count = 0; trigger_count < state_triggers.length; trigger_count++) {
                var trigger = graph.getCell(state_triggers[trigger_count]);
                var trigger_data = trigger.getTriggerParams().trigger_data;
                if (link_lookup[trigger.id]) trigger_data.params["linked_state"] = link_lookup[trigger.id];
                export_data.states[state.id].triggers[trigger.id] = trigger_data;
            }

            var state_modifiers = state.get('options');
            for (var modifier_count = 0; modifier_count < state_modifiers.length; modifier_count++) {
                var modifier = graph.getCell(state_modifiers[modifier_count]);
                var modifier_data = modifier.getModifierParams().modifier_data;
                export_data.states[state.id].modifiers[modifier.id] = modifier_data;
            }

        }

        return export_data;

    },

    get_states: function(graph) {
        var state_cells = [];
        var graph_cells = graph.getCells();
        for (var cell_count = 0; cell_count < graph_cells.length; cell_count++) {
            var state = graph_cells[cell_count];
            if (state.get('type') == 'qad.Question') {
                state_cells.push(state);
            }

        }
        return state_cells;
    }
}

app.Factory = {

    createStateFromParams: function(params) {
        var state = {
            obs: {},
            initial_state: false
        }
        return state;
    },

    createModifierFromParams: function(type, params) {
        var modifier = {
            type: type || '',
            params: params || {}
        }
        return modifier;
    },

    createModifierTypeOb: function(time_limit, transition_type, start_time, end_time, relative_amount) {
        return this.createModifierFromParams("Ob", {
            "time_limit": time_limit || 10,
            "transition_type": transition_type || "linear",
            "start_time": start_time || 0,
            "end_time": end_time || 10,
            "relative_amount": relative_amount || 0,
        });
    },

    createTriggerFromParams: function(type, params) {
        var trigger = {
            type: type || '',
            params: params || {}
        }
        return trigger;
    },

    createTriggerTypeTimeLimit: function(time_limit, linked_state) {
        return this.createTriggerFromParams("TimeLimit", {
            "time_limit": time_limit || 10,
            "linked_state": linked_state || ''
        });
    },

    createTriggerTypeGiveDrug: function(comparison, drug, dose, dose_unit, linked_state) {
        return this.createTriggerFromParams("GiveDrug", {
            "comparison": comparison || '',
            "drug": drug || '',
            "dose": dose || 0,
            "dose_unit": dose_unit || '',
            "linked_state": linked_state || ''
        });
    },

    createTrigger: function(id, name) {
        return {
            id: 'trigger-' + id,
            attrs: {
                '.trigger-text': {
                    text: name
                }
            },
            ports: {
                groups: {
                    'out': {
                        position: 'right',
                        attrs: {
                            circle: {
                                magnet: true,
                                fill: '#feb663',
                                r: 14
                            }
                        }
                    }
                },
                items: [{
                    id: 'trigger-port-' + id,
                    group: 'out',
                    args: {},
                }]
            },
            trigger_data: app.Factory.createTriggerFromParams()
        };
    },

    createModifier: function(id, name) {
        return {
            id: 'option-' + id,
            attrs: {
                '.option-text': {
                    text: name
                }
            },
            modifier_data: app.Factory.createModifierFromParams()
        };
    },

    createQuestion: function(text) {
        var q = new joint.shapes.qad.Question({
            position: {
                x: 400 - 50,
                y: 30
            },
            size: {
                width: 100,
                height: 70
            },
            question: text,
            inPorts: [{
                id: 'in',
                label: 'In'
            }],
            options: [],
            triggers: [],
            state_data: app.Factory.createStateFromParams(text)
        });
        return q;
    },

    createLink: function(source, target) {

        return new joint.dia.Link({
            source: {
                id: source
            },
            target: {
                id: target
            },
            attrs: {
                '.marker-target': {
                    d: 'M 10 0 L 0 5 L 10 10 z',
                    fill: '#6a6c8a',
                    stroke: '#6a6c8a'
                },
                '.connection': {
                    stroke: '#6a6c8a',
                    'stroke-width': 2
                }
            }
        });
    },

};

app.Selection = Backbone.Collection.extend();
app.SelectionView = Backbone.View.extend({

    initialize: function(options) {
        this.options = options;
        _.bindAll(this, 'render');
        this.listenTo(this.model, 'add reset change', this.render);
        this.listenTo(this.model, 'remove', this.remove);
    },

    render: function() {

        var paper = this.options.paper;

        var boxTemplate = V('rect', {
            fill: 'none',
            'stroke': '#C6C7E2',
            'stroke-width': 1,
            'pointer-events': 'none'
        });

        //remove any existing boxes
        _.invoke(this.boxes, 'remove');
        this.boxes = [];

        this.model.each(function(element) {
            var box = boxTemplate.clone();
            var p = 3; // Box padding.
            box.attr(g.rect(_.extend({}, element.get('position'), element.get('size'))).moveAndExpand({
                x: -p,
                y: -p,
                width: 2 * p,
                height: 2 * p
            }));
            V(paper.viewport).append(box);
            this.boxes.push(box);
        }, this);

        return this;
    }
});

app.dictionary = {
    "ob_names": {
        "heart_rate": "Heart rate",
        "foot_smell": "Foot smell",
        "hair_loss": "Hair loss",
    }
}

app.AppView = Backbone.View.extend({

    el: '#app-container',

    events: {
        'click #add-state': 'addState',
        'click #save-scenario': 'saveScenario',
    },

    initialize: function() {
        this.initializePaper();
        this.initializeSelection();
        //this.initializeHalo();
        //this.initializeInlineTextEditor();
        this.initializeTooltips();
    },

    initializeTooltips: function() {

        new joint.ui.Tooltip({
            rootTarget: '#paper',
            target: '.element',
            content: _.bind(function(element) {

                var cellView = this.paper.findView(element);
                var cell = cellView.model;

                var t = '- Double-click to edit text inline.';
                if (cell.get('type') === 'qad.Question') {
                    t += '<br/><br/>- Connect a port with another Question or an Answer.';
                }

                return t;

            }, this),
            direction: 'right',
            right: '#paper',
            padding: 20
        });
    },

    initializeHalo: function() {

        this.paper.on('cell:pointerup', function(cellView, evt) {

            if (cellView.model instanceof joint.dia.Link) return;

            var halo = new joint.ui.Halo({
                graph: this.graph,
                paper: this.paper,
                cellView: cellView,
                useModelGeometry: true,
                type: 'toolbar'
            });

            // As we're using the FreeTransform plugin, there is no need for an extra resize tool in Halo.
            // Therefore, remove the resize tool handle and reposition the clone tool handle to make the
            // handles nicely spread around the elements.
            halo.removeHandle('resize');
            halo.removeHandle('rotate');
            halo.removeHandle('fork');
            halo.removeHandle('link');
            //halo.changeHandle('clone', { position: 'se' });

            halo.on('action:remove:pointerdown', function() {
                this.selection.reset();
            }, this);

            halo.render();

        }, this);
    },

    initializeSelection: function() {

        var selection = this.selection = new app.Selection;

        new app.SelectionView({
            model: selection,
            paper: this.paper
        });

        this.listenTo(this.paper, 'cell:pointerup', function(cellView) {
            if (!cellView.model.isLink()) {
                selection.reset([cellView.model]);
            }
        });

        this.listenTo(this.paper, 'blank:pointerdown', function() {
            selection.reset([]);
        });

        this.listenTo(selection, 'add reset', this.onSelectionChange);

        /* my editor view */
        app.editor = {
            triggers: {},
            modifiers: {},
        };

        app.editor.StateView = Backbone.View.extend({
            el: "#element-type",
            initialize: function() {
                this.template = require('templates/state_parameters.jade');
                this.render();
            },
            events: {
                "keyup .ob-value": "onObValueChange",
                "change #ob-select": "onObChange",
                "keyup #state-name": "onTriggerNameChange",
                "click #initial-state-check": "onInitialStateClicked",
            },
            onInitialStateClicked: function(evt) {
                var state_cells = app.helpers.get_states(this.model.graph);
                state_cells.forEach(function(state) {
                    state.disableInitialState();
                });
                if ($(evt.currentTarget).is(':checked')) this.model.enableInitialState();
            },
            onObValueChange: function(evt) {
                var current_obs = this.model.getStateParams().state_data.obs;
                var edited_ob_key = $(evt.currentTarget).data('obKey');
                var enteredValue = evt.currentTarget.value;
                var newValue = isNaN(parseInt(enteredValue)) ? enteredValue : parseInt(enteredValue);
                current_obs[edited_ob_key] = newValue;
            },
            onObChange: function(evt) {
                var current_obs = this.model.getStateParams().state_data.obs;
                var selected_ob = $(evt.currentTarget.selectedOptions[0]);
                var selected_ob_key = evt.currentTarget.value;

                if (current_obs[selected_ob_key]) {
                    $("#ob-value-" + selected_ob_key).focus();
                } else {
                    current_obs[selected_ob_key] = selected_ob.data('defaultValue');
                    this.render();
                }

            },
            onTriggerNameChange: function(evt) {
                this.model.attr(".question-text", {
                    text: evt.currentTarget.value
                });
            },
            render: function() {
                this.$el.html(this.template(this.model.getStateParams()));
            },
            remove: function() {
                this.$el.empty().off();
                this.stopListening();
                return this;
            }
        });

        app.editor.ModifierView = Backbone.View.extend({
            el: "#element-type",
            events: {
                "change #modifier-type": "onModifierTypeChange",
                "change #modifier-name": "onModifierNameChange",
                "keyup #modifier-name": "onModifierNameChange",
            },
            onModifierNameChange: function(evt) {
                this.model.attr(".option-text", {
                    text: evt.currentTarget.value
                });
            },
            onModifierTypeChange: function(evt) {
                if (evt.currentTarget.value != '') {
                    var new_data = window.app.Factory["createModifierType" + evt.currentTarget.value]();
                    this.model.set('modifier_data', new_data);
                    this.createParametersView();
                }
            },
            createParametersView: function(type) {
                if (this.parameterView) this.parameterView.remove();
                this.parameterView = new window.app.editor.modifiers[this.model.getModifierParams().modifier_data.type + "View"]({
                    model: this.model.getModifierParams()
                });
            },
            initialize: function() {
                this.template = require('templates/modifier_type.jade');
                this.render();
            },
            render: function() {
                this.$el.html(this.template(this.model.getModifierParams()));
                if (this.model.getModifierParams().modifier_data.type != '') this.createParametersView();
            },
            remove: function() {
                this.$el.empty().off();
                this.stopListening();
                return this;
            }
        });

        app.editor.EditableModifierView = Backbone.View.extend({
            storeChangedValue: function(evt) {
                var enteredValue = evt.currentTarget.value;
                var newValue = isNaN(parseInt(enteredValue)) ? enteredValue : parseInt(enteredValue);
                this.model.modifier_data.params[evt.currentTarget.id] = newValue;
            },
        });

        app.editor.modifiers.ObView = app.editor.EditableModifierView.extend({
            el: "#modifier-parameters",
            events: {
                "change .select-value-change": "storeChangedValue",
                "keyup .keypress-value-change": "storeChangedValue",
            },
            initialize: function() {
                this.template = require('templates/modifier_type_ob.jade');
                this.render();
            },
            render: function() {
                this.$el.html(this.template(this.model));
            },
            remove: function() {
                this.$el.empty().off();
                this.stopListening();
                return this;
            }
        });

        app.editor.TriggerView = Backbone.View.extend({
            el: "#element-type",
            events: {
                "change #trigger-type": "onTriggerTypeChange",
                "change #trigger-name": "onTriggerNameChange",
                "keyup #trigger-name": "onTriggerNameChange",
            },
            initialize: function() {
                this.template = require('templates/trigger_type.jade');
                this.render();
            },
            render: function() {
                this.$el.html(this.template(this.model.getTriggerParams()));
                if (this.model.getTriggerParams().trigger_data.type != '') this.createParametersView();
            },
            createParametersView: function(type) {
                if (this.parameterView) this.parameterView.remove();
                this.parameterView = new window["app"]["editor"]["triggers"][this.model.getTriggerParams().trigger_data.type + "View"]({
                    model: this.model.getTriggerParams()
                });
            },
            onTriggerTypeChange: function(evt) {
                if (evt.currentTarget.value != '') {
                    var new_data = window["app"]["Factory"]["createTriggerType" + evt.currentTarget.value]();
                    this.model.set('trigger_data', new_data);
                    this.createParametersView();
                }
            },
            onTriggerNameChange: function(evt) {
                this.model.attr(".trigger-text", {
                    text: evt.currentTarget.value
                });
            },
            remove: function() {
                this.$el.empty().off();
                this.stopListening();
                return this;
            }
        });


        //Trigger classes
        app.editor.EditableTriggerView = Backbone.View.extend({
            storeChangedValue: function(evt) {
                var enteredValue = evt.currentTarget.value;
                var newValue = isNaN(parseInt(enteredValue)) ? enteredValue : parseInt(enteredValue);
                this.model.trigger_data.params[evt.currentTarget.id] = newValue;
            },
        });

        app.editor.triggers.TimeLimitView = app.editor.EditableTriggerView.extend({
            el: "#trigger-parameters",
            events: {
                "keyup #time_limit": "storeChangedValue",
            },
            initialize: function() {
                this.template = require('templates/trigger_type_time_limit.jade');
                this.render();
            },
            render: function() {
                this.$el.html(this.template(this.model));
            },
            remove: function() {
                this.$el.empty().off();
                this.stopListening();
                return this;
            }
        });

        app.editor.triggers.GiveDrugView = app.editor.EditableTriggerView.extend({
            el: "#trigger-parameters",
            events: {
                "change #drug": "storeChangedValue",
                "change #dose_unit": "storeChangedValue",
                "change #comparison": "storeChangedValue",
                "keyup #dose": "storeChangedValue",
            },
            initialize: function() {
                this.template = require('templates/trigger_type_give_drug.jade');
                this.render();
            },
            render: function() {
                this.$el.html(this.template(this.model));
            },
            remove: function() {
                this.$el.empty().off();
                this.stopListening();
                return this;
            }
        });


    },

    //Each trigger, modifier or whatever is going to have its own logic when it comes to how it manipulates the 
    //data model of the selected element, therefore, each one will live in its own separate view
    onSelectionChange: function(collection) {
        var cell = collection.first();
        if (cell) {
            var view_type_class;
            switch (cell.get('type')) {
                case 'qad.Trigger':
                    view_type_class = app.editor.TriggerView;
                    break;
                case 'qad.Question':
                    view_type_class = app.editor.StateView;
                    break;
                case 'qad.Modifier':
                    view_type_class = app.editor.ModifierView;
            }

            if (view_type_class) {
                //Cleanup parent view if required
                if (this.parent_view) this.parent_view.remove();
                this.parent_view = new view_type_class({
                    model: collection.first()
                })
            };

        } else {
            this.status('Selection emptied.');
        }
    },

    initializePaper: function() {

        this.graph = new joint.dia.Graph;

        this.paper = new joint.dia.Paper({
            el: this.$('#paper'),
            model: this.graph,
            width: 800,
            height: 600,
            gridSize: 10,
            snapLinks: {
                radius: 50
            },
            validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
                if (magnetS.getAttribute('port-group') !== magnetT.getAttribute('port-group')) return true;
                return false;
            },
            validateMagnet: function(cellView, magnet) {
                if (magnet.getAttribute('port-group') == 'out') return true;
                return false;
            },
            defaultLink: new joint.dia.Link({
                router: {
                    name: 'metro'
                },
                connector: {
                    name: 'rounded'
                },
                attrs: {
                    '.marker-target': {
                        d: 'M 10 0 L 0 5 L 10 10 z',
                        fill: '#6a6c8a',
                        stroke: '#6a6c8a'
                    },
                    '.connection': {
                        stroke: '#6a6c8a',
                        'stroke-width': 2
                    }
                }
            })
        });
    },


    // Show a message in the statusbar.
    status: function(m) {
        this.$('#statusbar .message').text(m);
    },

    addState: function() {
        var q = app.Factory.createQuestion('Question');
        this.graph.addCell(q);
        this.status('Question added.');
    },

    saveScenario: function() {
        var graph = this.graph;
        var csrf = document.querySelector("meta[name=csrf]").content;
        var scenario_data = {
            scenario: {
                name: "ux designed scenario",
                data: JSON.stringify(app.helpers.export_to_scenario_json(graph)),
                rappid_data: JSON.stringify(graph.toJSON())
            }
        }

        $.ajax({
            url: "/scenarios",
            type: "post",
            data: scenario_data,
            headers: {
                "X-CSRF-TOKEN": csrf
            },
            dataType: "json",
            success: function(data) {
                console.log(data);
            }
        });
    },

    clear: function() {
        this.graph.clear();
    },

});

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
        markup: require('templates/trigger')(),
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
        markup: require('templates/modifier')(),
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

        markup: require('templates/question.jade')(),
        optionMarkup: require('templates/trigger.jade')(),
        triggerMarkup: require('templates/modifier.jade')(),

        initialize: function() {
            joint.dia.Element.prototype.initialize.apply(this, arguments);
            this.listenTo(this, 'change:options', this.onChangeModifiers, this);
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

        onChangeModifiers: function(e, f, g, h) {
            var modifiers = this.get("options");
            _.each(modifiers, function(modifier) {}, this);
            this.autoresize();
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
            var modifier_model = app.Factory.createModifier(_.uniqueId(), "Modifier " + this.get('options').length);
            this.addElementToStore('options', modifier_model.id);
            var modifier_view = new joint.shapes.qad.Modifier(modifier_model);
            this.graph.addCell(modifier_view);
            this.embed(modifier_view);
        },
        addTrigger: function() {
            var trigger_model = app.Factory.createTrigger(_.uniqueId(), "Trigger " + this.get('triggers').length);
            this.addElementToStore('triggers', trigger_model.id);
            var trigger_view = new joint.shapes.qad.Trigger(trigger_model);
            this.graph.addCell(trigger_view);
            this.embed(trigger_view);
        },
        removeElementById: function(id, storage_key) {
            var data_store = this.get(storage_key);
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
