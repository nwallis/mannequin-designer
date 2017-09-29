var app = app || {};

app.Factory = {

    createStateFromParams: function(name, params) {
        if (name == undefined || name == '') throw new Error("State name cannot be empty");
        var state = {};
        state[name] = {
            obs: {
                heart_rate: 200
            }
        }
        return state;
    },

    createTriggerFromParams: function(name, type, params) {
        if (name == undefined || name == '') throw new Error("Trigger name cannot be empty");
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
        return this.createTriggerFromParams(name, "GiveDrug", {
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
