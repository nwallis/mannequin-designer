var app = app || {};

app.Factory = {

    createTriggerFromParams: function(name, type, params) {
        if (name == '') throw new Error("Trigger name cannot be empty");
        var trigger = {};
        trigger[name] = {
            type: type || '',
            params: params || {}
        }
        return trigger;
    },

    createTriggerTypeTimeLimit: function(name, time_limit, linked_state) {
        return this.createTriggerFromParams(name, "TimeLimit", {
            "time_limit": time_limit || 10,
            "linked_state": linked_state || ''
        });
    },

    createTriggerTypeGiveDrug: function(name, comparison, drug, dose, dose_unit, linked_state) {
        return this.createTriggerFromParams(name, "TimeLimit", {
            "comparison": comparison || '',
            "drug": drug || '',
            "dose": dose || 0,
            "dose_unit": dose_unit || '',
            "linked_state": linked_state || ''
        });
    },

    createTrigger: function(id, name) {

        var q = new joint.shapes.qad.Trigger({
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
            scenario_data: app.Factory.createTriggerFromParams(name)

        });
        return q;
    },

    createModifier: function(id, name) {
        var q = new joint.shapes.qad.Modifier({
            id: 'option-' + id,
            attrs: {
                '.option-text': {
                    text: name
                }
            }
        });
        return q;
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
            triggers: []
        });
        return q;
    },

    createAnswer: function(text) {

        var a = new joint.shapes.qad.Answer({
            position: {
                x: 400 - 50,
                y: 30
            },
            size: {
                width: 100,
                height: 70
            },
            answer: text
        });
        return a;
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

    // Example:
    /*
        {
           root: '1',
           nodes: [
              { id: '1', type: 'qad.Question', question: 'Are you sure?', options: [{ id: 'yes', text: 'Yes' }, { id: 'no', text: 'No' }] },
              { id: '2', type: 'qad.Answer', answer: 'That was good.' },
              { id: '3', type: 'qad.Answer', answer: 'That was bad.' }
           ],
           links: [
              { type: 'qad.Link', source: { id: '1', port: 'yes' }, target: { id: '2' } },
              { type: 'qad.Link', source: { id: '1', port: 'no' }, target: { id: '3' } }
           ]
        }
        */
    createDialogJSON: function(graph, rootCell) {

        var dialog = {
            root: undefined,
            nodes: [],
            links: []
        };

        _.each(graph.get('cells').models, function(cell) {

            var o = {
                id: cell.id,
                type: cell.get('type')
            };

            switch (cell.get('type')) {
                case 'qad.Question':
                    o.question = cell.get('question');
                    o.options = cell.get('options');
                    dialog.nodes.push(o);
                    break;
                case 'qad.Answer':
                    o.answer = cell.get('answer');
                    dialog.nodes.push(o);
                    break;
                default: // qad.Link
                    o.source = cell.get('source');
                    o.target = cell.get('target');
                    dialog.links.push(o);
                    break;
            }

            if (!cell.isLink() && !graph.getConnectedLinks(cell, {
                    inbound: true
                }).length) {
                dialog.root = cell.id;
            }
        });

        if (rootCell) {
            dialog.root = rootCell.id;
        }

        return dialog;
    }
};
