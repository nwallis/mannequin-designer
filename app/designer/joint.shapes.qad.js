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

joint.shapes.qad.TriggerView = joint.dia.ElementView.extend({
    events: {
        'click .btn-remove-trigger': 'onRemoveTrigger',
    },
    initialize: function(e) {
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);
        this.listenTo(this.model, 'change:parent', this.autoresize, this);
    },
    autoresize: function() {
        if (this.getParent()) {
            var parentBounds = this.getParent().getBBox();
            this.model.resize(parentBounds.width, 30);
        }
    },
    getParent: function() {
        return this.model.graph.getCell(this.model.attributes.parent);
    },
    onRemoveTrigger: function(evt) {
        evt.stopPropagation();
        this.getParent().removeTrigger(this.model.id);
        this.getParent().unembed(this.model);
        this.remove();
    }
});

joint.shapes.qad.ModifierView = joint.dia.ElementView.extend({
    events: {
        'click .btn-remove-modifier': 'onRemoveModifier',
    },
    initialize: function(e) {
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);
        this.listenTo(this.model, 'change:parent', this.autoresize, this);
    },
    autoresize: function() {
        if (this.getParent()) {
            var parentBounds = this.getParent().getBBox();
            this.model.resize(parentBounds.width, 30);
        }
    },
    getParent: function() {
        return this.model.graph.getCell(this.model.attributes.parent);
    },
    onRemoveModifier: function(evt) {
        this.getParent().removeModifier(this.model.id);
        this.getParent().unembed(this.model);
        this.remove();
    }
});

joint.shapes.qad.QuestionView = joint.dia.ElementView.extend({

    events: {
        'click .btn-add-modifier': 'onAddModifier',
        'click .btn-add-trigger': 'onAddTrigger',
    },

    initialize: function() {
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);
        this.listenTo(this.model, 'change:embeds', this.layoutChildren, this);
    },

    layoutChildren: function() {
        this.layoutModifiers();
        this.layoutTriggers();
    },

    layoutTriggers: function() {
        var triggers = this.model.get('triggers');
        var optionHeight = this.model.get('optionHeight');
        var offsetY = 70 + (this.model.get('options').length * optionHeight);
        _.each(triggers, function(trigger) {
            var cell = this.model.graph.getCell(trigger);
            cell.position(0, offsetY, {
                parentRelative: true
            });
            offsetY += optionHeight;
        }, this);
    },

    layoutModifiers: function() {
        var options = this.model.get('options');
        var optionHeight = this.model.get('optionHeight');
        var offsetY = 50;
        _.each(options, function(option) {
            var cell = this.model.graph.getCell(option);
            cell.position(0, offsetY, {
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

});
