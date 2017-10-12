// @import jquery.js
// @import lodash.js
// @import backbone.js
// @import geometry.js
// @import vectorizer.js
// @import joint.clean.js
// @import joint.shapes.qad.js
// @import selection.js
// @import factory.js
// @import snippet.js

var app = app || {};
var qad = window.qad || {};

app.dictionary = {
    "ob_names": {
        "heart_rate": "Heart rate",
        "foot_smell": "Foot smell",
        "hair_loss": "Hair loss",
    }
}

app.AppView = Backbone.View.extend({

    el: '#app',

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
                state_cells = app.helpers.get_states(this.model.graph);
                state_cells.forEach(function(state) {
                    state.disableInitialState();
                });
                if ($(evt.currentTarget).is(':checked')) this.model.enableInitialState();
            },
            onObValueChange: function(evt) {
                var current_obs = this.model.getStateParams().state_data.obs;
                var edited_ob_key = $(evt.currentTarget).data('obKey');
                current_obs[edited_ob_key] = evt.currentTarget.value;
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
            },
            onModifierTypeChange: function(evt) {
                if (evt.currentTarget.value != '') {
                    var new_data = window["app"]["Factory"]["createModifierType" + evt.currentTarget.value]();
                    this.model.set('modifier_data', new_data);
                    this.createParametersView();
                }
            },
            createParametersView: function(type) {
                if (this.parameterView) this.parameterView.remove();
                this.parameterView = new window["app"]["editor"]["modifiers"][this.model.getModifierParams().modifier_data.type + "View"]({
                    model: this.model.getModifierParams()
                });
            },
            initialize: function() {
                this.template = _.template($('#modifier-type-template').html());
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
                this.model.modifier_data.params[evt.currentTarget.id] = evt.currentTarget.value;
            },
        });

        app.editor.modifiers.ObView = app.editor.EditableModifierView.extend({
            el: "#modifier-parameters",
            events: {
                "change .select-value-change": "storeChangedValue",
                "keyup .keypress-value-change": "storeChangedValue",
            },
            initialize: function() {
                this.template = _.template($('#modifier-type-ob-template').html());
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
                this.template = _.template($('#trigger-type-template').html());
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
                this.model.trigger_data.params[evt.currentTarget.id] = evt.currentTarget.value;
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
                this.template = require('templates/trigger_type_give_drug.jade')();
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
        console.log(app.helpers.export_to_scenario_json(this.graph));
    },

    clear: function() {
        this.graph.clear();
    },

});
