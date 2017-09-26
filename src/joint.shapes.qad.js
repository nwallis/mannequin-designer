/*! Rappid v2.1.0 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2015 client IO

 2017-09-14 


This Source Code Form is subject to the terms of the Rappid Trial License
, v. 2.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_v2.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


joint.shapes.qad = {};

joint.util.measureText = function(text, attrs) {

    var fontSize = parseInt(attrs.fontSize, 10) || 10;

    var svgDocument = V('svg').node;
    var textElement = V('<text><tspan></tspan></text>').node;
    var textSpan = textElement.firstChild;
    var textNode = document.createTextNode('');

    textSpan.appendChild(textNode);
    svgDocument.appendChild(textElement);
    document.body.appendChild(svgDocument);

    var lines = text.split('\n');
    var width = 0;

    // Find the longest line width.
    _.each(lines, function(line) {

        textNode.data = line;
        var lineWidth = textSpan.getComputedTextLength();

        width = Math.max(width, lineWidth);
    });

    var height = lines.length * (fontSize * 1.2);

    V(svgDocument).remove();

    return {
        width: width,
        height: height
    };
};

joint.shapes.qad.ModifierView = joint.dia.ElementView.extend({

    events: {
        'click .btn-remove-modifier': 'onRemoveModifier',
    },
    initialize: function(e) {
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);
        this.listenTo(this.model, 'change:parent', this.autoresize, this);
    },
    autoresize: function() {
        var parentBounds = this.model.graph.getCell(this.model.attributes.parent).getBBox();
        console.log(parentBounds);
        this.model.resize(parentBounds.width, 20);
    }
});

joint.shapes.qad.AnswerView = joint.dia.ElementView.extend({
    initialize: function() {

        joint.dia.ElementView.prototype.initialize.apply(this, arguments);
        this.autoresize();
        this.listenTo(this.model, 'change:answer', this.autoresize, this);
    },
    autoresize: function() {
        var dim = joint.util.measureText(this.model.get('answer'), {
            fontSize: this.model.attr('text/font-size')
        });
        this.model.resize(dim.width + 50, dim.height + 50);
    }
});


joint.shapes.qad.QuestionView = joint.dia.ElementView.extend({

    events: {
        'click .btn-add-modifier': 'onAddModifier',
        'click .btn-add-trigger': 'onAddTrigger',
        'click .btn-remove-trigger': 'onRemoveTrigger'
    },

    initialize: function() {
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);
        this.listenTo(this.model, 'change:embeds', this.renderOptions, this);
        //this.listenTo(this.model, 'change:options', this.renderOptions, this);
        //this.listenTo(this.model, 'change:triggers', this.renderTriggers, this);
    },

    renderMarkup: function() {
        joint.dia.ElementView.prototype.renderMarkup.apply(this, arguments);
        this.renderOptions();
        this.renderTriggers();
    },

    renderTriggers: function() {
        var $triggerContainer = this.$('.triggers');
        $triggerContainer.empty();
        _.each(this.model.get('triggers'), function(trigger, index) {
            var triggerHelper = V(this.model.triggerMarkup).addClass('trigger-' + trigger.id);
            triggerHelper.attr('trigger-id', trigger.id);
            $triggerContainer.append(triggerHelper.node);
        }, this);
        this.update();
    },

    renderOptions: function() {
        var options = this.model.get('options');
        var optionHeight = this.model.get('optionHeight');
        var offsetY = (options.length * optionHeight) + ((options.length > 0) ? 70 : 50);
        _.each(options, function(option) {
            option.position(0, offsetY, {
                parentRelative: true
            });
            offsetY += optionHeight;
        }, this);
    },

    onAddTrigger: function() {
        this.model.addTrigger()
    },
    onAddModifier: function() {
        this.model.addModifier();
    },
    onRemoveModifier: function(evt) {
        this.model.removeModifier(V(evt.target.parentNode).attr('option-id'));
    },
    onRemoveTrigger: function(evt) {
        this.model.removeTrigger(V(evt.target.parentNode).attr('trigger-id'));
    }

});
