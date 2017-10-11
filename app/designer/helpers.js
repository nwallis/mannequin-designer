var app = app || {};

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
                var trigger = state_triggers[trigger_count];
                var trigger_data = trigger.getTriggerParams().trigger_data;
                if (link_lookup[trigger.id]) trigger_data.params["linked_state"] = link_lookup[trigger.id];
                export_data.states[state.id].triggers[trigger.id] = trigger_data;
            }

            var state_modifiers = state.get('options');
            for (var modifier_count = 0; modifier_count < state_modifiers.length; modifier_count++) {
                var modifier = state_modifiers[modifier_count];
                var modifier_data = modifier.getModifierParams().modifier_data;
                export_data.states[state.id].modifiers[modifier.id] = modifier_data;
            }

        }

        console.log(export_data);

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
