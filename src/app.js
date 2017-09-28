/*! Rappid v2.1.0 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2015 client IO

 2017-09-14 


This Source Code Form is subject to the terms of the Rappid Trial License
, v. 2.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_v2.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


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
        'click #toolbar .add-question': 'addQuestion',
        'click #toolbar .add-answer': 'addAnswer',
        'click #toolbar .preview-dialog': 'previewDialog',
        'click #toolbar .code-snippet': 'showCodeSnippet',
        'click #toolbar .load-example': 'loadExample',
        'click #toolbar .clear': 'clear',
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

    /*initializeInlineTextEditor: function() {

          var cellViewUnderEdit;

          var closeEditor = _.bind(function() {

              if (this.textEditor) {
                  this.textEditor.remove();
                  // Re-enable dragging after inline editing.
                  cellViewUnderEdit.options.interactive = true;
                  this.textEditor = cellViewUnderEdit = undefined;
              }
          }, this);

          this.paper.on('cell:pointerdblclick', function(cellView, evt) {

              // Clean up the old text editor if there was one.
              closeEditor();

              var vTarget = V(evt.target);
              var text;
              var cell = cellView.model;

              switch (cell.get('type')) {

                  case 'qad.Question':

                      text = joint.ui.TextEditor.getTextElement(evt.target);
                      if (!text) {
                          break;
                      }
                      if (vTarget.hasClass('body') || V(text).hasClass('question-text')) {

                          text = cellView.$('.question-text')[0];
                          cellView.textEditPath = 'question';

                      } else if (V(text).hasClass('option-text')) {

                          cellView.textEditPath = 'options/' + _.findIndex(cell.get('options'), {
                              id: V(text.parentNode).attr('option-id')
                          }) + '/text';
                          cellView.optionId = V(text.parentNode).attr('option-id');

                      } else if (vTarget.hasClass('option-rect')) {

                          text = V(vTarget.node.parentNode).find('.option-text');
                          cellView.textEditPath = 'options/' + _.findIndex(cell.get('options'), {
                              id: V(vTarget.node.parentNode).attr('option-id')
                          }) + '/text';
                      }
                      break;

                  case 'qad.Answer':
                      text = joint.ui.TextEditor.getTextElement(evt.target);
                      cellView.textEditPath = 'answer';
                      break;
              }

              if (text) {

                  this.textEditor = new joint.ui.TextEditor({
                      text: text
                  });
                  this.textEditor.render(this.paper.el);

                  this.textEditor.on('text:change', function(newText) {

                      var cell = cellViewUnderEdit.model;
                      // TODO: prop() changes options and so options are re-rendered
                      // (they are rendered dynamically).
                      // This means that the `text` SVG element passed to the ui.TextEditor
                      // no longer exists! An exception is thrown subsequently.
                      // What do we do here?
                      cell.prop(cellViewUnderEdit.textEditPath, newText);

                      // A temporary solution or the right one? We just
                      // replace the SVG text element of the textEditor options object with the new one
                      // that was dynamically created as a reaction on the `prop` change.
                      if (cellViewUnderEdit.optionId) {
                          this.textEditor.options.text = cellViewUnderEdit.$('.option.option-' + cellViewUnderEdit.optionId + ' .option-text')[0];
                      }

                  }, this);

                  cellViewUnderEdit = cellView;
                  // Prevent dragging during inline editing.
                  cellViewUnderEdit.options.interactive = false;
              }
          }, this);

          $(document.body).on('click', _.bind(function(evt) {

              var text = joint.ui.TextEditor.getTextElement(evt.target);
              if (this.textEditor && !text) {

                  closeEditor();
              }
          }, this));
      },*/

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
                    model: this.getTriggerParams(),
                }));

                //instantiate child view if the type of trigger is set
                if (this.getTriggerParams().type != '') this.createParametersView();
            },
            getTriggerParams: function() {
                //helper function to return the first item in the settings object - array is not used as to maintain convention with backend format 
                var currentData = this.model.get('scenario_data');
                return currentData[Object.keys(currentData)[0]]
            },
            createParametersView: function(type) {
                if (this.parameterView) this.parameterView.remove();
                this.parameterView = new window["app"]["editor"]["triggers"][this.getTriggerParams().type + "View"]({
                    model: this.getTriggerParams()
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

        app.editor.triggers.TimeLimitView = Backbone.View.extend({
            el: "#trigger-parameters",
            events: {
                "keyup #time_limit": "onTimeLimitChange",
            },
            onTimeLimitChange: function(evt) {
                this.storeDropDownValue('time_limit', evt);
            },
            storeDropDownValue: function(param_key, evt) {
                this.model.params[param_key] = evt.currentTarget.value;
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

        app.editor.triggers.GiveDrugView = Backbone.View.extend({
            el: "#trigger-parameters",
            events: {
                "change #drug": "onDrugChange",
                "change #dose_unit": "onDoseUnitChange",
                "change #comparison": "onComparisonChange",
                "keyup #dose": "onDoseChange",
            },
            onDoseUnitChange: function(evt) {
                this.storeDropDownValue('dose_unit', evt);
            },
            onComparisonChange: function(evt) {
                this.storeDropDownValue('comparison', evt);
            },
            onDrugChange: function(evt) {
                this.storeDropDownValue('drug', evt);
            },
            onDoseChange: function(evt) {
                this.storeDropDownValue('dose', evt);
            },
            //pull to common class for triggers and modifiers
            storeDropDownValue: function(param_key, evt) {
                this.model.params[param_key] = evt.currentTarget.value;
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
                    view_type_class = app.editor.TriggerView
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
                //refactor - stop ports on same state being linked
                //if (cellViewS === cellViewT) return false;
                if (magnetS.getAttribute('port-group') !== magnetT.getAttribute('port-group')) return true;
                return false;
            },
            validateMagnet: function(cellView, magnet) {
                return true;
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

    addQuestion: function() {

        var q = app.Factory.createQuestion('Question');
        this.graph.addCell(q);
        this.status('Question added.');
    },

    addAnswer: function() {

        var a = app.Factory.createAnswer('Answer');
        this.graph.addCell(a);
        this.status('Answer added.');
    },

    previewDialog: function() {

        var cell = this.selection.first();
        var el = qad.renderDialog(app.Factory.createDialogJSON(this.graph, cell));

        $('#preview').empty();
        $('#preview').append($('<div>', {
            'class': 'background'
        }));
        $('#preview').append(el).show();

        $('#preview .background').on('click', function() {

            $('#preview').empty();
        });
    },

    clear: function() {
        this.graph.clear();
    },

    showCodeSnippet: function() {

        var cell = this.selection.first();
        var dialogJSON = app.Factory.createDialogJSON(this.graph, cell);

        var id = _.uniqueId('qad-dialog-');

        var snippet = '';
        snippet += '<div id="' + id + '"></div>';
        snippet += '<link rel="stylesheet" type="text/css" href="http://qad.client.io/css/snippet.css"></script>';
        snippet += '<script type="text/javascript" src="http://qad.client.io/src/snippet.js"></script>';
        snippet += '<script type="text/javascript">';
        snippet += 'document.getElementById("' + id + '").appendChild(qad.renderDialog(' + JSON.stringify(dialogJSON) + '))';
        snippet += '</script>';

        var content = '<textarea>' + snippet + '</textarea>';

        var dialog = new joint.ui.Dialog({
            width: '50%',
            height: 200,
            draggable: true,
            title: 'Copy-paste this snippet to your HTML page.',
            content: content
        });

        dialog.open();
    }
});
