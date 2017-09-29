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

app.AppView = Backbone.View.extend({

    el: '#app',

    events: {
        'click #add-state': 'addState',
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
            triggers: {}
        };

        app.editor.StateView = Backbone.View.extend({
            el: "#element-type",
            initialize: function() {
                this.template = _.template($('#state-parameters-template').html());
                this.render();
            },
            render: function() {
                console.log(this.model);
                this.$el.html(this.template({
                    model: this.model
                }));
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
                this.$el.html(this.template({
                    model: this.model.getTriggerParams(),
                }));

                //instantiate child view if the type of trigger is set
                if (this.model.getTriggerParams().type != '') this.createParametersView();
            },
            createParametersView: function(type) {
                if (this.parameterView) this.parameterView.remove();
                this.parameterView = new window["app"]["editor"]["triggers"][this.model.getTriggerParams().type + "View"]({
                    model: this.model.getTriggerParams()
                });
            },
            onTriggerTypeChange: function(evt) {
                //When the trigger type is changed, the scenario data is overwritten with default values
                var currentData = this.model.get('scenario_data');
                var new_data = window["app"]["Factory"]["createTriggerType" + evt.currentTarget.value](Object.keys(currentData)[0]);
                this.model.set('scenario_data', new_data);

                //Create view for trigger type passing through details for the trigger and clean up any existing view
                this.createParametersView();
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

        app.editor.EditableElementView = Backbone.View.extend({
            storeChangedValue: function(evt) {
                this.model.params[evt.currentTarget.id] = evt.currentTarget.value;
            },
        });

        //convention over configuration
        //all ids in json must match the ids of the elements responsible for gathering data

        app.editor.triggers.TimeLimitView = app.editor.EditableElementView.extend({
            el: "#trigger-parameters",
            events: {
                "keyup #time_limit": "storeChangedValue",
            },
            initialize: function() {
                this.template = _.template($('#trigger-type-time-limit-template').html());
                this.render();
            },
            render: function() {
                this.$el.html(this.template({
                    model: this.model
                }));
            },
            remove: function() {
                this.$el.empty().off();
                this.stopListening();
                return this;
            }
        });

        app.editor.triggers.GiveDrugView = app.editor.EditableElementView.extend({
            el: "#trigger-parameters",
            events: {
                "change #drug": "storeChangedValue",
                "change #dose_unit": "storeChangedValue",
                "change #comparison": "storeChangedValue",
                "keyup #dose": "storeChangedValue",
            },
            initialize: function() {
                this.template = _.template($('#trigger-type-give-drug-template').html());
                this.render();
            },
            render: function() {
                this.$el.html(this.template({
                    model: this.model
                }));
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
                if (magnetS.getAttribute('port-group') !== magnetT.getAttribute('port-group')) {
                    cellViewS.linkTriggerToState(cellViewT.model);
                    return true;
                }
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

    clear: function() {
        this.graph.clear();
    },

});
