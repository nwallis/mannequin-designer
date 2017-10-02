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

        var graph_cells = graph.getCells();
        for (var cell_count = 0; cell_count < graph_cells.length; cell_count++) {

            var state = graph_cells[cell_count];
            if (state.get('type') == 'qad.Question') {
                export_data.states[state.id] = {
                    "obs": state.getStateParams().state_data.obs,
                    "triggers": {},
                    "modifiers": {}
                };

                var state_triggers = state.get('triggers');
                for (var trigger_count = 0; trigger_count < state_triggers.length; trigger_count++) {
                    var trigger = state_triggers[trigger_count];
                    var trigger_data = trigger.getTriggerParams().trigger_data;
                    if (link_lookup[trigger.id]) trigger_data.params["linked_state"] = link_lookup[trigger.id];
                    export_data.states[state.id].triggers[trigger.id] = trigger_data;
                }

                var state_modifiers = state.get('options');
                //iterate the modifiers and add them to the modifiers object

            }
        }

        console.log(export_data);

    }
}
