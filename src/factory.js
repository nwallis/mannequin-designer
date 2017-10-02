var app = app || {};

app.Factory = {

    createStateFromParams: function(params) {
        var state = {
            obs: {}
        }
        return state;
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
            trigger_data: app.Factory.createTriggerFromParams()
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
            triggers: [],
            scenario_data: app.Factory.createStateFromParams(text)
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
